<?php
/**
 * Miyabara_MagentoAI
 *
 * @vendor    Miyabara
 * @package   MagentoAI
 *
 * @copyright © 2026 Diego M. Miyabara. All rights reserved.
 * @author    Diego M. Miyabara <diego.miyabara@hotmail.com>
 */

declare(strict_types=1);

namespace Miyabara\MagentoAI\Model;

use Magento\Framework\App\Config\ScopeConfigInterface;
use Magento\Framework\Encryption\EncryptorInterface;
use Magento\Store\Model\ScopeInterface;
use Miyabara\MagentoAI\Api\ConfigInterface;

class Config implements ConfigInterface
{
    /**
     * @param string
     */
    private const XML_ENABLED             = 'miyabara_mageai/general/enabled';
    /**
     * @param string
     */
    private const XML_BASELINE_PROMPT     = 'miyabara_mageai/general/baseline_prompt';

    /**
     * @param string
     */
    private const XML_PROVIDER            = 'miyabara_mageai/api/provider';
    /**
     * @param string
     */
    private const XML_OPENAI_KEY          = 'miyabara_mageai/api/openai_api_key';
    /**
     * @param string
     */
    private const XML_OPENAI_URL          = 'miyabara_mageai/api/openai_base_url';
    /**
     * @param string
     */
    private const XML_OPENAI_MODEL        = 'miyabara_mageai/api/openai_model';
    /**
     * @param string
     */
    private const XML_ANTHROPIC_KEY       = 'miyabara_mageai/api/anthropic_api_key';
    /**
     * @param string
     */
    private const XML_ANTHROPIC_URL       = 'miyabara_mageai/api/anthropic_base_url';
    /**
     * @param string
     */
    private const XML_ANTHROPIC_MODEL     = 'miyabara_mageai/api/anthropic_model';
    /**
     * @param string
     */
    private const XML_GEMINI_KEY          = 'miyabara_mageai/api/gemini_api_key';
    /**
     * @param string
     */
    private const XML_GEMINI_URL          = 'miyabara_mageai/api/gemini_base_url';
    /**
     * @param string
     */
    private const XML_GEMINI_MODEL        = 'miyabara_mageai/api/gemini_model';

    /**
     * @param string
     */
    private const XML_DESC_ATTRIBUTES     = 'miyabara_mageai/description/attributes';
    /**
     * @param string
     */
    private const XML_DESC_TEMPERATURE    = 'miyabara_mageai/description/temperature';
    /**
     * @param string
     */
    private const XML_DESC_FULL_PROMPT    = 'miyabara_mageai/description/full_prompt';
    /**
     * @param string
     */
    private const XML_DESC_FULL_TOKENS    = 'miyabara_mageai/description/full_max_tokens';
    /**
     * @param string
     */
    private const XML_DESC_SHORT_PROMPT   = 'miyabara_mageai/description/short_prompt';
    /**
     * @param string
     */
    private const XML_DESC_SHORT_TOKENS   = 'miyabara_mageai/description/short_max_tokens';

    /**
     * @param string
     */
    private const XML_IMG_ATTRIBUTES      = 'miyabara_mageai/image/attributes';
    /**
     * @param string
     */
    private const XML_IMG_OPENAI_MODEL    = 'miyabara_mageai/image/openai_model';
    /**
     * @param string
     */
    private const XML_IMG_OPENAI_SIZE     = 'miyabara_mageai/image/openai_size';
    /**
     * @param string
     */
    private const XML_IMG_OPENAI_QUALITY  = 'miyabara_mageai/image/openai_quality';
    /**
     * @param string
     */
    private const XML_IMG_GEMINI_MODEL    = 'miyabara_mageai/image/gemini_model';
    /**
     * @param string
     */
    private const XML_IMG_PROMPT          = 'miyabara_mageai/image/prompt';
    /**
     * @param string
     */
    private const XML_IMG_MODIFY_PROMPT   = 'miyabara_mageai/image/modify_prompt';

    /**
     * @param ScopeConfigInterface $scopeConfig
     * @param EncryptorInterface   $encryptor
     */
    public function __construct(
        private readonly ScopeConfigInterface $scopeConfig,
        private readonly EncryptorInterface $encryptor
    ) {}

    /**
     * Returns true when the module is enabled in configuration.
     *
     * @return bool
     */
    public function isEnabled(): bool
    {
        return $this->scopeConfig->isSetFlag(self::XML_ENABLED, ScopeInterface::SCOPE_STORE);
    }

    /**
     * Returns the configured AI provider key ('openai', 'anthropic', 'gemini').
     *
     * @return string
     */
    public function getProvider(): string
    {
        return (string) $this->scopeConfig->getValue(self::XML_PROVIDER, ScopeInterface::SCOPE_STORE);
    }

    /**
     * Returns the merchant-configured baseline/system prompt applied to every request.
     *
     * @return string
     */
    public function getBaselinePrompt(): string
    {
        return (string) $this->scopeConfig->getValue(self::XML_BASELINE_PROMPT, ScopeInterface::SCOPE_STORE);
    }

    /**
     * Returns the decrypted OpenAI API key.
     *
     * @return string
     */
    public function getApiSecret(): string
    {
        return $this->decrypt(self::XML_OPENAI_KEY);
    }

    /**
     * Returns the OpenAI API base URL.
     *
     * @return string
     */
    public function getApiBaseUrl(): string
    {
        return rtrim(
            (string) $this->scopeConfig->getValue(self::XML_OPENAI_URL, ScopeInterface::SCOPE_STORE),
            '/'
        );
    }

    /**
     * Returns the configured OpenAI text model identifier.
     *
     * @return string
     */
    public function getModel(): string
    {
        return (string) $this->scopeConfig->getValue(self::XML_OPENAI_MODEL, ScopeInterface::SCOPE_STORE);
    }

    /**
     * Returns the decrypted Anthropic API key.
     *
     * @return string
     */
    public function getAnthropicApiSecret(): string
    {
        return $this->decrypt(self::XML_ANTHROPIC_KEY);
    }

    /**
     * Returns the Anthropic API base URL.
     *
     * @return string
     */
    public function getAnthropicBaseUrl(): string
    {
        return rtrim(
            (string) $this->scopeConfig->getValue(self::XML_ANTHROPIC_URL, ScopeInterface::SCOPE_STORE),
            '/'
        );
    }

    /**
     * Returns the configured Anthropic model identifier.
     *
     * @return string
     */
    public function getAnthropicModel(): string
    {
        return (string) $this->scopeConfig->getValue(self::XML_ANTHROPIC_MODEL, ScopeInterface::SCOPE_STORE);
    }

    /**
     * Returns the decrypted Gemini API key.
     *
     * @return string
     */
    public function getGeminiApiSecret(): string
    {
        return $this->decrypt(self::XML_GEMINI_KEY);
    }

    /**
     * Returns the Gemini API base URL.
     *
     * @return string
     */
    public function getGeminiBaseUrl(): string
    {
        return rtrim(
            (string) $this->scopeConfig->getValue(self::XML_GEMINI_URL, ScopeInterface::SCOPE_STORE),
            '/'
        );
    }

    /**
     * Returns the configured Gemini text model identifier.
     *
     * @return string
     */
    public function getGeminiModel(): string
    {
        return (string) $this->scopeConfig->getValue(self::XML_GEMINI_MODEL, ScopeInterface::SCOPE_STORE);
    }

    /**
     * Returns the generation temperature (0.0 – 2.0).
     *
     * @return float
     */
    public function getTemperature(): float
    {
        return (float) $this->scopeConfig->getValue(self::XML_DESC_TEMPERATURE, ScopeInterface::SCOPE_STORE);
    }

    /**
     * Returns the configured max token limit for the given description type.
     *
     * @param string $type 'full' or 'short'
     * @return int
     */
    public function getMaxTokens(string $type): int
    {
        $path = $type === 'short' ? self::XML_DESC_SHORT_TOKENS : self::XML_DESC_FULL_TOKENS;
        return (int) $this->scopeConfig->getValue($path, ScopeInterface::SCOPE_STORE);
    }

    /**
     * Returns the full description generation prompt template.
     *
     * @return string
     */
    public function getDescriptionPrompt(): string
    {
        return (string) $this->scopeConfig->getValue(self::XML_DESC_FULL_PROMPT, ScopeInterface::SCOPE_STORE);
    }

    /**
     * Returns the short description generation prompt template.
     *
     * @return string
     */
    public function getShortDescriptionPrompt(): string
    {
        return (string) $this->scopeConfig->getValue(self::XML_DESC_SHORT_PROMPT, ScopeInterface::SCOPE_STORE);
    }

    /**
     * Returns configured product attribute codes for text generation as an array.
     *
     * @return string[]
     */
    public function getProductAttributes(): array
    {
        return $this->csvToArray(self::XML_DESC_ATTRIBUTES);
    }

    /**
     * Returns the OpenAI image model identifier.
     *
     * @return string
     */
    public function getImageModel(): string
    {
        return (string) $this->scopeConfig->getValue(self::XML_IMG_OPENAI_MODEL, ScopeInterface::SCOPE_STORE);
    }

    /**
     * Returns the OpenAI image size setting.
     *
     * @return string
     */
    public function getImageSize(): string
    {
        return (string) $this->scopeConfig->getValue(self::XML_IMG_OPENAI_SIZE, ScopeInterface::SCOPE_STORE);
    }

    /**
     * Returns the OpenAI image quality setting.
     *
     * @return string
     */
    public function getImageQuality(): string
    {
        return (string) $this->scopeConfig->getValue(self::XML_IMG_OPENAI_QUALITY, ScopeInterface::SCOPE_STORE);
    }

    /**
     * Returns the Gemini image model identifier.
     *
     * @return string
     */
    public function getGeminiImageModel(): string
    {
        return (string) $this->scopeConfig->getValue(self::XML_IMG_GEMINI_MODEL, ScopeInterface::SCOPE_STORE);
    }

    /**
     * Returns the default image generation prompt template.
     *
     * @return string
     */
    public function getImagePrompt(): string
    {
        return (string) $this->scopeConfig->getValue(self::XML_IMG_PROMPT, ScopeInterface::SCOPE_STORE);
    }

    /**
     * Returns the default image modification prompt template.
     *
     * @return string
     */
    public function getModifyImagePrompt(): string
    {
        return (string) $this->scopeConfig->getValue(self::XML_IMG_MODIFY_PROMPT, ScopeInterface::SCOPE_STORE);
    }

    /**
     * Returns configured product attribute codes for image generation as an array.
     *
     * @return string[]
     */
    public function getImageAttributes(): array
    {
        return $this->csvToArray(self::XML_IMG_ATTRIBUTES);
    }

    /**
     * Decrypt an encrypted config value; returns empty string when not set.
     *
     * @param string $path
     * @return string
     */
    private function decrypt(string $path): string
    {
        $encrypted = (string) $this->scopeConfig->getValue($path, ScopeInterface::SCOPE_STORE);
        return $encrypted !== '' ? $this->encryptor->decrypt($encrypted) : '';
    }

    /**
     * Parse a comma-separated config value into a trimmed, non-empty string array.
     *
     * @param string $path
     * @return string[]
     */
    private function csvToArray(string $path): array
    {
        $value = (string) $this->scopeConfig->getValue($path, ScopeInterface::SCOPE_STORE);
        if ($value === '') {
            return [];
        }
        return array_filter(array_map('trim', explode(',', $value)));
    }
}
