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
 * Configuration surface for text-generation consumers; narrows ConfigInterface for classes that do not need image config.
 */
interface TextConfigInterface extends GeneralConfigInterface
{
    /**
     * Returns the generation temperature (0.0 – 2.0).
     *
     * @return float
     */
    public function getTemperature(): float;

    /**
     * Returns the configured max token limit for the given description type.
     *
     * @param string $type 'full' or 'short'
     * @return int
     */
    public function getMaxTokens(string $type): int;

    /**
     * Returns the full description generation prompt template.
     *
     * @return string
     */
    public function getDescriptionPrompt(): string;

    /**
     * Returns the short description generation prompt template.
     *
     * @return string
     */
    public function getShortDescriptionPrompt(): string;

    /**
     * Returns configured product attribute codes for text generation as an array.
     *
     * @return string[]
     */
    public function getProductAttributes(): array;
}
