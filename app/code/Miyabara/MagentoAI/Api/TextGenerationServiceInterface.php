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

interface TextGenerationServiceInterface
{
    /**
     * Generate product description from raw attribute data collected from the product form.
     *
     * Works for both new (unsaved) and existing products.
     *
     * @param array<string, string> $data ['attributeCode' => 'displayValue', ...]
     * @param string                $type 'full' or 'short'
     * @return string
     * @throws AiServiceException
     */
    public function generateFromAttributeData(array $data, string $type): string;

    /**
     * Generate content from a free-form custom prompt.
     *
     * @param string $prompt
     * @return string
     * @throws AiServiceException
     */
    public function generateCustomContent(string $prompt): string;
}
