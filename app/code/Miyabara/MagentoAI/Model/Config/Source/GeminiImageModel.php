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
            ['value' => 'gemini-2.0-flash-exp-image-generation', 'label' => 'gemini-2.0-flash-exp-image-generation'],
            ['value' => 'gemini-2.5-flash-preview-05-20',        'label' => 'gemini-2.5-flash-preview-05-20'],
            ['value' => 'gemini-2.5-pro-preview-06-05',          'label' => 'gemini-2.5-pro-preview-06-05'],
        ];
    }
}
