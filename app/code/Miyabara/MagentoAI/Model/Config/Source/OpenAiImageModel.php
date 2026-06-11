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

class OpenAiImageModel implements OptionSourceInterface
{
    /**
     * Returns available OpenAI image generation model options.
     *
     * @return array<int, array<string, string>>
     */
    public function toOptionArray(): array
    {
        return [
            ['value' => 'gpt-image-1',      'label' => 'gpt-image-1'],
            ['value' => 'dall-e-3',         'label' => 'dall-e-3'],
            ['value' => 'dall-e-2',         'label' => 'dall-e-2'],
        ];
    }
}
