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

namespace Miyabara\MagentoAI\Model\Config\Source;

use Magento\Framework\Data\OptionSourceInterface;

class GeminiImageModel implements OptionSourceInterface
{
    /**
     * Returns available Google Gemini image generation model options.
     *
     * @return array<int, array<string, string>>
     */
    public function toOptionArray(): array
    {
        return [
            ['value' => 'gemini-2.5-flash-image',         'label' => 'Gemini 2.5 Flash Image'],
            ['value' => 'gemini-3.1-flash-image',         'label' => 'Gemini 3.1 Flash Image'],
            ['value' => 'gemini-3.1-flash-image-preview', 'label' => 'Gemini 3.1 Flash Image Preview'],
            ['value' => 'gemini-3-pro-image',             'label' => 'Gemini 3 Pro Image'],
            ['value' => 'gemini-3-pro-image-preview',     'label' => 'Gemini 3 Pro Image Preview'],
        ];
    }
}
