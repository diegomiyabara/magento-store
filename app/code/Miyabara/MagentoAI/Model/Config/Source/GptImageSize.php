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

class GptImageSize implements OptionSourceInterface
{
    /**
     * Returns image size options supported by OpenAI image models.
     *
     * @return array<int, array<string, string>>
     */
    public function toOptionArray(): array
    {
        return [
            ['value' => 'auto',      'label' => __('Auto (model decides)')],
            ['value' => '1024x1024', 'label' => '1024×1024 (Square)'],
            ['value' => '1536x1024', 'label' => '1536×1024 (Landscape)'],
            ['value' => '1024x1536', 'label' => '1024×1536 (Portrait)'],
        ];
    }
}
