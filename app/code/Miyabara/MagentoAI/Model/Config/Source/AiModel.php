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
            ['value' => 'gpt-4o',                 'label' => 'gpt-4o'],
            ['value' => 'gpt-4o-mini',             'label' => 'gpt-4o-mini'],
            ['value' => 'gpt-4-turbo',             'label' => 'gpt-4-turbo'],
            ['value' => 'gpt-4',                   'label' => 'gpt-4'],
            ['value' => 'gpt-3.5-turbo',           'label' => 'gpt-3.5-turbo'],
            ['value' => 'gpt-3.5-turbo-instruct',  'label' => 'gpt-3.5-turbo-instruct'],
        ];
    }
}
