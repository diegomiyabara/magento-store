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

namespace Miyabara\MagentoAI\Api;

interface ConfigInterface
{
    /**
     * Returns true when the module is enabled in configuration.
     *
     * @return bool
     */
    public function isEnabled(): bool;

    /**
     * Returns the configured AI provider key ('openai', 'anthropic', 'gemini').
     *
     * @return string
     */
    public function getProvider(): string;

    /**
     * Returns the merchant-configured baseline/system prompt applied to every request.
     *
     * @return string
     */
    public function getBaselinePrompt(): string;

    // ── OpenAI ──────────────────────────────────────────────────────────────

    /**
     * @return string
     */
    public function getApiSecret(): string;

    /**
     * @return string
     */
    public function getApiBaseUrl(): string;

    /**
     * @return string
     */
    public function getModel(): string;

    // ── Anthropic ───────────────────────────────────────────────────────────

    /**
     * @return string
     */
    public function getAnthropicApiSecret(): string;

    /**
     * @return string
     */
    public function getAnthropicBaseUrl(): string;

    /**
     * @return string
     */
    public function getAnthropicModel(): string;

    // ── Gemini ───────────────────────────────────────────────────────────────

    /**
     * @return string
     */
    public function getGeminiApiSecret(): string;

    /**
     * @return string
     */
    public function getGeminiBaseUrl(): string;

    /**
     * @return string
     */
    public function getGeminiModel(): string;

    // ── Text generation ──────────────────────────────────────────────────────

    /**
     * @return float
     */
    public function getTemperature(): float;

    /**
     * @param string $type 'full' or 'short'
     * @return int
     */
    public function getMaxTokens(string $type): int;

    /**
     * @return string
     */
    public function getDescriptionPrompt(): string;

    /**
     * @return string
     */
    public function getShortDescriptionPrompt(): string;

    /**
     * Returns configured product attribute codes for text generation as an array.
     *
     * @return string[]
     */
    public function getProductAttributes(): array;

    // ── Image generation ─────────────────────────────────────────────────────

    /**
     * @return string
     */
    public function getImageModel(): string;

    /**
     * @return string
     */
    public function getImageSize(): string;

    /**
     * @return string
     */
    public function getImageQuality(): string;

    /**
     * @return string
     */
    public function getGeminiImageModel(): string;

    /**
     * @return string
     */
    public function getImagePrompt(): string;

    /**
     * @return string
     */
    public function getModifyImagePrompt(): string;

    /**
     * Returns configured product attribute codes for image generation as an array.
     *
     * @return string[]
     */
    public function getImageAttributes(): array;
}
