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

use Miyabara\MagentoAI\Model\Service\Exception\AiServiceException;

interface ImageGenerationServiceInterface
{
    /**
     * Generate a product image from the given prompt using the configured AI provider.
     *
     * Returns file data compatible with the Magento product gallery upload format.
     *
     * @param string $prompt
     * @return array{file: string, url: string, name: string, size: int, type: string}
     * @throws AiServiceException
     */
    public function generate(string $prompt): array;
}
