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
use Miyabara\MagentoAI\Api\TextGenerationServiceInterface;
use Miyabara\MagentoAI\Model\AttributeData\Formatter as AttributeFormatter;
use Miyabara\MagentoAI\Model\Service\Exception\AiServiceException;
use Psr\Log\LoggerInterface;

class TextGeneration implements TextGenerationServiceInterface
{
    /**
     * @param string
     */
    private const ANTHROPIC_VERSION       = '2023-06-01';
    /**
     * @param int
     */
    private const ANTHROPIC_DEFAULT_TOKENS = 2048;
    /**
     * @param int
     */
    private const GEMINI_DEFAULT_TOKENS    = 2048;
    /**
     * @param string
     */
    private const SYSTEM_PROMPT = 'You are a helpful assistant. Provide only the main generated content without any greetings, introductions, or explanations. Never wrap output in markdown code blocks or backticks.';

    /**
     * @param HttpClientInterface $httpClient
     * @param Json                $json
     * @param ConfigInterface     $config
     * @param AttributeFormatter  $attributeFormatter
     * @param LoggerInterface     $logger
     */
    public function __construct(
        private readonly HttpClientInterface $httpClient,
        private readonly Json $json,
        private readonly ConfigInterface $config,
        private readonly AttributeFormatter $attributeFormatter,
        private readonly LoggerInterface $logger,
    ) {}

    /**
     * Generate product description from raw attribute data collected from the product form.
     *
     * @param array<string, string> $data
     * @param string                $type 'full' or 'short'
     * @return string
     * @throws AiServiceException
     */
    public function generateFromAttributeData(array $data, string $type): string
    {
        $prompt = $this->buildPromptFromData($data, $type);
        return $this->generate($prompt, $this->config->getMaxTokens($type));
    }

    /**
     * Generate content from a free-form custom prompt.
     *
     * @param string $prompt
     * @return string
     * @throws AiServiceException
     */
    public function generateCustomContent(string $prompt): string
    {
        return $this->generate($prompt);
    }

    /**
     * Dispatch to the configured provider.
     *
     * @param string   $prompt
     * @param int|null $maxTokens
     * @return string
     * @throws AiServiceException
     */
    private function generate(string $prompt, ?int $maxTokens = null): string
    {
        return match ($this->config->getProvider()) {
            'anthropic' => $this->makeAnthropicRequest($this->buildAnthropicPayload($prompt, $maxTokens)),
            'gemini'    => $this->makeGeminiRequest($this->buildGeminiPayload($prompt, $maxTokens)),
            default     => $this->makeOpenAiRequest($this->buildOpenAiPayload($prompt, $maxTokens)),
        };
    }

    /**
     * Build the prompt string from raw form data using {{ product.name }} / {{ product.attributes }} variables.
     *
     * @param array<string, string> $data
     * @param string                $type
     * @return string
     */
    private function buildPromptFromData(array $data, string $type): string
    {
        $template    = $type === 'short'
            ? $this->config->getShortDescriptionPrompt()
            : $this->config->getDescriptionPrompt();
        $productName = $data['name'] ?? '';
        $prompt      = str_replace('{{ product.name }}', $productName, $template);

        return str_replace(
            '{{ product.attributes }}',
            $this->attributeFormatter->buildLabelValueText($data),
            $prompt
        );
    }

    /**
     * Build the combined system prompt (base rules + merchant baseline).
     *
     * @return string
     */
    private function buildSystemPrompt(): string
    {
        $baseline = $this->config->getBaselinePrompt();
        return $baseline === ''
            ? self::SYSTEM_PROMPT
            : self::SYSTEM_PROMPT . "\n\n" . $baseline;
    }

    // ── OpenAI ───────────────────────────────────────────────────────────────

    /**
     * @param string   $prompt
     * @param int|null $maxTokens
     * @return string
     * @throws AiServiceException
     */
    private function buildOpenAiPayload(string $prompt, ?int $maxTokens = null): string
    {
        $model   = $this->config->getModel();
        $payload = [
            'model'             => $model,
            'n'                 => 1,
            'temperature'       => $this->config->getTemperature(),
            'frequency_penalty' => 0,
            'presence_penalty'  => 0,
        ];

        if ($maxTokens !== null) {
            $payload['max_tokens'] = $maxTokens;
        }

        if (str_contains($model, 'gpt')) {
            $payload['messages'] = [
                ['role' => 'system', 'content' => $this->buildSystemPrompt()],
                ['role' => 'user',   'content' => $prompt],
            ];
        } else {
            $payload['prompt'] = $prompt;
        }

        return $this->json->serialize($payload);
    }

    /**
     * @param string $payload
     * @return string
     * @throws AiServiceException
     */
    private function makeOpenAiRequest(string $payload): string
    {
        $token = $this->config->getApiSecret();
        if (!$token) {
            throw new AiServiceException(__('OpenAI API Key not found. Please check configuration.'));
        }

        $model    = $this->config->getModel();
        $endpoint = str_contains($model, 'gpt') ? '/v1/chat/completions' : '/v1/completions';

        $result = $this->httpClient->postJson(
            $this->config->getApiBaseUrl() . $endpoint,
            $payload,
            ['Content-Type' => 'application/json', 'Authorization' => 'Bearer ' . $token]
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
            $this->logger->error('MagentoAI OpenAI error', ['message' => $message]);
            throw new AiServiceException(__($message));
        }
        if (!isset($response['choices'])) {
            throw new AiServiceException(__('No results found from OpenAI API response.'));
        }

        return trim($response['choices'][0]['text'] ?? $response['choices'][0]['message']['content'] ?? '');
    }

    // ── Anthropic ────────────────────────────────────────────────────────────

    /**
     * @param string   $prompt
     * @param int|null $maxTokens
     * @return string
     */
    private function buildAnthropicPayload(string $prompt, ?int $maxTokens = null): string
    {
        return $this->json->serialize([
            'model'       => $this->config->getAnthropicModel(),
            'max_tokens'  => $maxTokens ?: self::ANTHROPIC_DEFAULT_TOKENS,
            'temperature' => min(1.0, $this->config->getTemperature()),
            'system'      => $this->buildSystemPrompt(),
            'messages'    => [['role' => 'user', 'content' => $prompt]],
        ]);
    }

    /**
     * @param string $payload
     * @return string
     * @throws AiServiceException
     */
    private function makeAnthropicRequest(string $payload): string
    {
        $token = $this->config->getAnthropicApiSecret();
        if (!$token) {
            throw new AiServiceException(__('Anthropic API Key not found. Please check configuration.'));
        }

        $result = $this->httpClient->postJson(
            $this->config->getAnthropicBaseUrl() . '/v1/messages',
            $payload,
            [
                'Content-Type'      => 'application/json',
                'x-api-key'         => $token,
                'anthropic-version' => self::ANTHROPIC_VERSION,
            ]
        );

        if ($result['status'] === 401) {
            throw new AiServiceException(__('Unauthorized response. Please check Anthropic API key.'));
        }
        if ($result['status'] >= 500) {
            throw new AiServiceException(__('Anthropic server error.'));
        }

        $response = $this->json->unserialize($result['body']);
        if (isset($response['error'])) {
            $message = $response['error']['message'] ?? 'Unknown Anthropic API error.';
            $this->logger->error('MagentoAI Anthropic error', ['message' => $message]);
            throw new AiServiceException(__($message));
        }
        if (empty($response['content'][0]['text'])) {
            throw new AiServiceException(__('No results found from Anthropic API response.'));
        }

        return $this->stripCodeFences($response['content'][0]['text']);
    }

    // ── Google Gemini ────────────────────────────────────────────────────────

    /**
     * @param string   $prompt
     * @param int|null $maxTokens
     * @return string
     */
    private function buildGeminiPayload(string $prompt, ?int $maxTokens = null): string
    {
        return $this->json->serialize([
            'system_instruction' => [
                'parts' => [['text' => $this->buildSystemPrompt()]],
            ],
            'contents' => [
                ['parts' => [['text' => $prompt]]],
            ],
            'generationConfig' => [
                'temperature'     => $this->config->getTemperature(),
                'maxOutputTokens' => $maxTokens ?: self::GEMINI_DEFAULT_TOKENS,
            ],
        ]);
    }

    /**
     * @param string $payload
     * @return string
     * @throws AiServiceException
     */
    private function makeGeminiRequest(string $payload): string
    {
        $token = $this->config->getGeminiApiSecret();
        if (!$token) {
            throw new AiServiceException(__('Gemini API Key not found. Please check configuration.'));
        }

        $model  = $this->config->getGeminiModel();
        $result = $this->httpClient->postJson(
            $this->config->getGeminiBaseUrl() . '/v1beta/models/' . $model . ':generateContent',
            $payload,
            ['Content-Type' => 'application/json', 'x-goog-api-key' => $token]
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
            $this->logger->error('MagentoAI Gemini error', ['message' => $message]);
            throw new AiServiceException(__($message));
        }
        if (($response['candidates'][0]['finishReason'] ?? '') === 'SAFETY') {
            throw new AiServiceException(__('Gemini blocked the response due to safety filters. Try adjusting the prompt.'));
        }

        $text = $response['candidates'][0]['content']['parts'][0]['text'] ?? '';
        if ($text === '') {
            throw new AiServiceException(__('No results found from Gemini API response.'));
        }

        return $this->stripCodeFences($text);
    }

    // ── Utilities ────────────────────────────────────────────────────────────

    /**
     * Strip markdown code fences that some models add despite being told not to.
     *
     * @param string $content
     * @return string
     */
    private function stripCodeFences(string $content): string
    {
        $content = trim($content);
        $content = (string) preg_replace('/^```[a-z]*\r?\n?/i', '', $content);
        $content = (string) preg_replace('/\r?\n?```\s*$/i', '', $content);
        return trim($content);
    }
}
