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

/**
 * Minimum configuration surface consumed by classes that only need the module on/off state and provider.
 */
interface GeneralConfigInterface
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
}
