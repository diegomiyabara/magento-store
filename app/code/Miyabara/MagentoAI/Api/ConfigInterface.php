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

declare(strict_types=1);

namespace Miyabara\MagentoAI\Api;

use Miyabara\MagentoAI\Model\Service\Exception\AiServiceException;

/**
 * Full configuration contract consumed by service classes that dispatch across all three AI providers.
 * Presenters and plugins should inject the narrower GeneralConfigInterface, TextConfigInterface,
 * or ImageConfigInterface to keep their dependency surface small.
 */
interface ConfigInterface extends TextConfigInterface, ImageConfigInterface
{
    // ── OpenAI ──────────────────────────────────────────────────────────────

    /**
     * Returns the decrypted OpenAI API key.
     *
     * @return string
     */
    public function getApiSecret(): string;

    /**
     * Returns the OpenAI API base URL.
     *
     * @return string
     */
    public function getApiBaseUrl(): string;

    /**
     * Returns the configured OpenAI text model identifier.
     *
     * @return string
     */
    public function getModel(): string;

    // ── Anthropic ───────────────────────────────────────────────────────────

    /**
     * Returns the decrypted Anthropic API key.
     *
     * @return string
     */
    public function getAnthropicApiSecret(): string;

    /**
     * Returns the Anthropic API base URL.
     *
     * @return string
     */
    public function getAnthropicBaseUrl(): string;

    /**
     * Returns the configured Anthropic model identifier.
     *
     * @return string
     */
    public function getAnthropicModel(): string;

    // ── Gemini ───────────────────────────────────────────────────────────────

    /**
     * Returns the decrypted Gemini API key.
     *
     * @return string
     */
    public function getGeminiApiSecret(): string;

    /**
     * Returns the Gemini API base URL.
     *
     * @return string
     */
    public function getGeminiBaseUrl(): string;

    /**
     * Returns the configured Gemini text model identifier.
     *
     * @return string
     */
    public function getGeminiModel(): string;
}
