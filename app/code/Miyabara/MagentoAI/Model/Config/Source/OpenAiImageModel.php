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
            ['value' => 'gpt-image-1-mini', 'label' => 'GPT Image 1 Mini — mais barato'],
            ['value' => 'gpt-image-1',      'label' => 'GPT Image 1'],
            ['value' => 'gpt-image-1.5',    'label' => 'GPT Image 1.5'],
            ['value' => 'gpt-image-2',      'label' => 'GPT Image 2 — mais recente'],
        ];
    }
}
