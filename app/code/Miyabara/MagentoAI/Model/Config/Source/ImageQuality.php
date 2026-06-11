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

class ImageQuality implements OptionSourceInterface
{
    /**
     * Returns OpenAI image quality level options.
     *
     * @return array<int, array<string, string>>
     */
    public function toOptionArray(): array
    {
        return [
            ['value' => 'low',    'label' => __('Low (fastest)')],
            ['value' => 'medium', 'label' => __('Medium (balanced)')],
            ['value' => 'high',   'label' => __('High (best quality, slowest)')],
            ['value' => 'auto',   'label' => __('Auto (model decides)')],
        ];
    }
}
