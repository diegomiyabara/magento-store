<?php
/**
 * Miyabara_MagentoAI
 *
 * @vendor    Miyabara
 * @package   MagentoAI
 *
 * @copyright © 2026 Diego M. Miyabara. All rights reserved.
 * @author    Diego M. Miyabara <diego.miyabara@gmail.com>
 */

// phpcs:disable Generic.Files.LineLength

declare(strict_types=1);

namespace Miyabara\MagentoAI\Model\Service;

use Magento\Framework\Serialize\Serializer\Json;
use Miyabara\MagentoAI\Api\ConfigInterface;
use Miyabara\MagentoAI\Api\Http\HttpClientInterface;
use Miyabara\MagentoAI\Api\ImageModificationServiceInterface;
use Miyabara\MagentoAI\Model\Service\Exception\AiServiceException;
use Psr\Log\LoggerInterface;

/**
 * Modifies an existing product image from a text prompt using the configured AI provider.
 *
 * OpenAI uses the image-edits endpoint (multipart upload of the original image).
 * Gemini sends the original image inline alongside the prompt to generateContent.
 * Anthropic is not supported for image modification.
 */
class ImageModification implements ImageModificationServiceInterface
{
    /**
     * @param int
     */
    private const OPENAI_JPEG_QUALITY = 80;

    /**
     * @param Json                $json
     * @param ConfigInterface     $config
     * @param ImageStorage        $imageStorage
     * @param HttpClientInterface $httpClient
     * @param LoggerInterface     $logger
     */
    public function __construct(
        private readonly Json $json,
        private readonly ConfigInterface $config,
        private readonly ImageStorage $imageStorage,
        private readonly HttpClientInterface $httpClient,
        private readonly LoggerInterface $logger,
    ) {}

    /**
     * Modify an existing product image using the configured AI provider.
     *
     * @param string $prompt
     * @param string $sourceFile Gallery imageData.file value of the image to modify
     * @return array{file: string, url: string, name: string, size: int, type: string}
     * @throws AiServiceException
     */
    public function modify(string $prompt, string $sourceFile): array
    {
        $original = $this->imageStorage->readOriginal($sourceFile);

        return match ($this->config->getProvider()) {
            'openai' => $this->modifyWithOpenAi($prompt, $original),
            'gemini' => $this->modifyWithGemini($prompt, $original),
            default  => throw new AiServiceException(__(
                'Image modification is not supported by the Anthropic provider. Please switch to OpenAI or Gemini.'
            )),
        };
    }

    /**
     * Modify via OpenAI image edits endpoint (multipart/form-data upload).
     *
     * @param string                                             $prompt
     * @param array{data: string, mimeType: string, ext: string} $original
     * @return array
     * @throws AiServiceException
     */
    private function modifyWithOpenAi(string $prompt, array $original): array
    {
        $apiKey = $this->config->getApiSecret();
        if (!$apiKey) {
            throw new AiServiceException(__('OpenAI API Key not found. Please check configuration.'));
        }

        $temp = $this->imageStorage->writeTempFile($original['data'], $original['ext']);

        try {
            $fields = [
                'model'              => $this->config->getImageModel(),
                'prompt'             => $prompt,
                'n'                  => '1',
                'size'               => $this->config->getImageSize(),
                'quality'            => $this->config->getImageQuality(),
                'output_format'      => 'jpeg',
                'output_compression' => (string) self::OPENAI_JPEG_QUALITY,
                // phpcs:ignore Magento2.Functions.DiscouragedFunction
                'image'              => new \CURLFile($temp['absolutePath'], $original['mimeType'], 'image.' . $original['ext']),
            ];

            $result = $this->httpClient->postMultipart(
                $this->config->getApiBaseUrl() . '/v1/images/edits',
                $fields,
                ['Authorization' => 'Bearer ' . $apiKey]
            );
        } finally {
            $this->imageStorage->removeTempFile($temp['path']);
        }

        if ($result['status'] === 401) {
            throw new AiServiceException(__('Unauthorized response. Please check OpenAI API key.'));
        }
        if ($result['status'] >= 500) {
            throw new AiServiceException(__('OpenAI server error.'));
        }

        $response = $this->json->unserialize($result['body']);
        if (isset($response['error'])) {
            $message = $response['error']['message'] ?? 'Unknown OpenAI API error.';
            $this->logger->error('MagentoAI OpenAI modify error', ['message' => $message]);
            throw new AiServiceException(__($message));
        }
        if (empty($response['data'][0]['b64_json'])) {
            throw new AiServiceException(__('No modified image data returned from OpenAI API.'));
        }

        // phpcs:ignore Magento2.Functions.DiscouragedFunction
        $imageData = base64_decode($response['data'][0]['b64_json']);
        if ($imageData === false) {
            throw new AiServiceException(__('Failed to decode base64 image from OpenAI response.'));
        }

        return $this->imageStorage->persist($imageData, 'image/jpeg', 'jpg');
    }

    /**
     * Modify via Google Gemini — the original image is sent inline with the prompt.
     *
     * @param string                                             $prompt
     * @param array{data: string, mimeType: string, ext: string} $original
     * @return array
     * @throws AiServiceException
     */
    private function modifyWithGemini(string $prompt, array $original): array
    {
        $apiKey = $this->config->getGeminiApiSecret();
        if (!$apiKey) {
            throw new AiServiceException(__('Gemini API Key not found. Please check configuration.'));
        }

        $payload = $this->json->serialize([
            'contents' => [
                [
                    'parts' => [
                        ['text' => $prompt],
                        [
                            'inline_data' => [
                                'mime_type' => $original['mimeType'],
                                // phpcs:ignore Magento2.Functions.DiscouragedFunction
                                'data'      => base64_encode($original['data']),
                            ],
                        ],
                    ],
                ],
            ],
            'generationConfig' => [
                'responseModalities' => ['TEXT', 'IMAGE'],
            ],
        ]);

        $model  = $this->config->getGeminiImageModel();
        $result = $this->httpClient->postJson(
            $this->config->getGeminiBaseUrl() . '/v1beta/models/' . $model . ':generateContent',
            $payload,
            ['Content-Type' => 'application/json', 'x-goog-api-key' => $apiKey],
            180
        );

        if ($result['status'] === 401 || $result['status'] === 403) {
            throw new AiServiceException(__('Unauthorized response. Please check Gemini API key.'));
        }
        if ($result['status'] >= 500) {
            throw new AiServiceException(__('Gemini server error.'));
        }

        $response = $this->json->unserialize($result['body']);
        if (isset($response['error'])) {
            $message = $response['error']['message'] ?? 'Unknown Gemini API error.';
            $this->logger->error('MagentoAI Gemini modify error', ['message' => $message]);
            throw new AiServiceException(__($message));
        }

        $finishReason = $response['candidates'][0]['finishReason'] ?? '';
        if ($finishReason === 'SAFETY' || $finishReason === 'IMAGE_SAFETY') {
            throw new AiServiceException(__('Gemini blocked the image due to safety filters. Try adjusting the prompt.'));
        }

        $imagePart = $this->findGeminiImagePart($response['candidates'][0]['content']['parts'] ?? []);
        if ($imagePart === null) {
            throw new AiServiceException(__('No modified image data returned from Gemini API. Ensure the selected model supports image editing.'));
        }

        $mimeType = $imagePart['mimeType'] ?? $imagePart['mime_type'] ?? 'image/png';
        $ext      = $mimeType === 'image/jpeg' ? 'jpg' : 'png';

        // phpcs:ignore Magento2.Functions.DiscouragedFunction
        $imageData = base64_decode($imagePart['data']);
        if ($imageData === false) {
            throw new AiServiceException(__('Failed to decode image data returned by Gemini.'));
        }

        return $this->imageStorage->persist($imageData, $mimeType, $ext);
    }

    /**
     * Find the image part in a Gemini response parts array.
     * Handles both camelCase (inlineData) and snake_case (inline_data) for proxy compatibility.
     *
     * @param array<int, array<string, mixed>> $parts
     * @return array<string, mixed>|null
     */
    private function findGeminiImagePart(array $parts): ?array
    {
        foreach ($parts as $part) {
            if (!empty($part['inlineData']['data'])) {
                return $part['inlineData'];
            }
            if (!empty($part['inline_data']['data'])) {
                return $part['inline_data'];
            }
        }
        return null;
    }
}
