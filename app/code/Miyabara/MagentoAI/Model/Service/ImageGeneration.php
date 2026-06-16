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
use Miyabara\MagentoAI\Api\ImageGenerationServiceInterface;
use Miyabara\MagentoAI\Model\Service\Exception\AiServiceException;
use Psr\Log\LoggerInterface;

class ImageGeneration implements ImageGenerationServiceInterface
{
    /**
     * @param int
     */
    private const OPENAI_JPEG_QUALITY = 80;

    /**
     * @param HttpClientInterface $httpClient
     * @param Json                $json
     * @param ConfigInterface     $config
     * @param ImageStorage        $imageStorage
     * @param LoggerInterface     $logger
     */
    public function __construct(
        private readonly HttpClientInterface $httpClient,
        private readonly Json $json,
        private readonly ConfigInterface $config,
        private readonly ImageStorage $imageStorage,
        private readonly LoggerInterface $logger,
    ) {}

    /**
     * Generate a product image from the given prompt using the configured AI provider.
     *
     * @param string $prompt
     * @return array{file: string, url: string, name: string, size: int, type: string}
     * @throws AiServiceException
     */
    public function generate(string $prompt): array
    {
        return match ($this->config->getProvider()) {
            'openai' => $this->generateWithOpenAi($prompt),
            'gemini' => $this->generateWithGemini($prompt),
            default  => throw new AiServiceException(__(
                'Image generation is not supported by the Anthropic provider. Please switch to OpenAI or Gemini.'
            )),
        };
    }

    /**
     * Generate image via OpenAI Images API.
     *
     * @param string $prompt
     * @return array
     * @throws AiServiceException
     */
    private function generateWithOpenAi(string $prompt): array
    {
        $apiKey = $this->config->getApiSecret();
        if (!$apiKey) {
            throw new AiServiceException(__('OpenAI API Key not found. Please check configuration.'));
        }

        $payload = $this->json->serialize([
            'model'              => $this->config->getImageModel(),
            'prompt'             => $prompt,
            'n'                  => 1,
            'size'               => $this->config->getImageSize(),
            'quality'            => $this->config->getImageQuality(),
            'output_format'      => 'jpeg',
            'output_compression' => self::OPENAI_JPEG_QUALITY,
        ]);

        $result = $this->httpClient->postJson(
            $this->config->getApiBaseUrl() . '/v1/images/generations',
            $payload,
            ['Content-Type' => 'application/json', 'Authorization' => 'Bearer ' . $apiKey]
        );

        if ($result['status'] === 401) {
            throw new AiServiceException(__('Unauthorized response. Please check OpenAI API key.'));
        }
        if ($result['status'] >= 500) {
            throw new AiServiceException(__('OpenAI server error.'));
        }

        $response = $this->json->unserialize($result['body']);
        if (isset($response['error'])) {
            $message = $response['error']['message'] ?? 'Unknown OpenAI API error.';
            $this->logger->error('MagentoAI OpenAI image error', ['message' => $message]);
            throw new AiServiceException(__($message));
        }
        if (empty($response['data'][0])) {
            throw new AiServiceException(__('No image data returned from OpenAI API.'));
        }

        $item = $response['data'][0];

        if (!empty($item['b64_json'])) {
            // phpcs:ignore Magento2.Functions.DiscouragedFunction
            $imageData = base64_decode($item['b64_json']);
            if ($imageData === false) {
                throw new AiServiceException(__('Failed to decode base64 image from OpenAI response.'));
            }
            return $this->imageStorage->persist($imageData, 'image/jpeg', 'jpg');
        }

        if (!empty($item['url'])) {
            return $this->imageStorage->persist(
                $this->imageStorage->download($item['url']),
                'image/jpeg',
                'jpg'
            );
        }

        throw new AiServiceException(__('No image URL or base64 data found in OpenAI response.'));
    }

    /**
     * Generate image via Google Gemini generateContent API.
     *
     * @param string $prompt
     * @return array
     * @throws AiServiceException
     */
    private function generateWithGemini(string $prompt): array
    {
        $apiKey = $this->config->getGeminiApiSecret();
        if (!$apiKey) {
            throw new AiServiceException(__('Gemini API Key not found. Please check configuration.'));
        }

        $payload = $this->json->serialize([
            'contents' => [
                ['parts' => [['text' => $prompt]]],
            ],
            'generationConfig' => [
                'responseModalities' => ['TEXT', 'IMAGE'],
            ],
        ]);

        $model  = $this->config->getGeminiImageModel();
        $result = $this->httpClient->postJson(
            $this->config->getGeminiBaseUrl() . '/v1beta/models/' . $model . ':generateContent',
            $payload,
            ['Content-Type' => 'application/json', 'x-goog-api-key' => $apiKey]
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
            $this->logger->error('MagentoAI Gemini image error', ['message' => $message]);
            throw new AiServiceException(__($message));
        }

        $finishReason = $response['candidates'][0]['finishReason'] ?? '';
        if ($finishReason === 'SAFETY' || $finishReason === 'IMAGE_SAFETY') {
            throw new AiServiceException(__('Gemini blocked the image due to safety filters. Try adjusting the prompt.'));
        }

        $imagePart = $this->findGeminiImagePart($response['candidates'][0]['content']['parts'] ?? []);
        if ($imagePart === null) {
            throw new AiServiceException(__('No image data returned from Gemini API. Ensure the selected model supports image generation.'));
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
