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
 * Configuration surface for image-generation consumers; narrows ConfigInterface for classes that do not need text config.
 */
interface ImageConfigInterface extends GeneralConfigInterface
{
    /**
     * Returns the OpenAI image model identifier.
     *
     * @return string
     */
    public function getImageModel(): string;

    /**
     * Returns the OpenAI image size setting.
     *
     * @return string
     */
    public function getImageSize(): string;

    /**
     * Returns the OpenAI image quality setting.
     *
     * @return string
     */
    public function getImageQuality(): string;

    /**
     * Returns the Gemini image model identifier.
     *
     * @return string
     */
    public function getGeminiImageModel(): string;

    /**
     * Returns the default image generation prompt template.
     *
     * @return string
     */
    public function getImagePrompt(): string;

    /**
     * Returns the default image modification prompt template.
     *
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
