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

class AiModel implements OptionSourceInterface
{
    /**
     * Returns available OpenAI text model options.
     *
     * @return array<int, array<string, string>>
     */
    public function toOptionArray(): array
    {
        return [
            ['value' => 'gpt-4.1-nano',   'label' => 'GPT-4.1 Nano — mais barato'],
            ['value' => 'gpt-4.1-mini',   'label' => 'GPT-4.1 Mini — barato'],
            ['value' => 'gpt-4o-mini',    'label' => 'GPT-4o Mini — barato'],
            ['value' => 'gpt-4.1',        'label' => 'GPT-4.1'],
            ['value' => 'gpt-4o',         'label' => 'GPT-4o'],
            ['value' => 'gpt-5-mini',     'label' => 'GPT-5 Mini'],
            ['value' => 'gpt-5-nano',     'label' => 'GPT-5 Nano'],
            ['value' => 'gpt-5',          'label' => 'GPT-5'],
            ['value' => 'o4-mini',        'label' => 'o4-mini — raciocínio'],
            ['value' => 'o3-mini',        'label' => 'o3-mini — raciocínio'],
            ['value' => 'gpt-3.5-turbo',  'label' => 'GPT-3.5 Turbo — legado'],
        ];
    }
}
