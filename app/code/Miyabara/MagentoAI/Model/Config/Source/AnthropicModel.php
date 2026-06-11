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

class AnthropicModel implements OptionSourceInterface
{
    /**
     * Returns available Anthropic Claude model options.
     *
     * @return array<int, array<string, string>>
     */
    public function toOptionArray(): array
    {
        return [
            ['value' => 'claude-opus-4-8',             'label' => 'claude-opus-4-8'],
            ['value' => 'claude-sonnet-4-6',           'label' => 'claude-sonnet-4-6'],
            ['value' => 'claude-haiku-4-5-20251001',   'label' => 'claude-haiku-4-5-20251001'],
            ['value' => 'claude-3-5-sonnet-20241022',  'label' => 'claude-3-5-sonnet-20241022'],
            ['value' => 'claude-3-5-haiku-20241022',   'label' => 'claude-3-5-haiku-20241022'],
            ['value' => 'claude-3-opus-20240229',      'label' => 'claude-3-opus-20240229'],
            ['value' => 'claude-3-sonnet-20240229',    'label' => 'claude-3-sonnet-20240229'],
            ['value' => 'claude-3-haiku-20240307',     'label' => 'claude-3-haiku-20240307'],
        ];
    }
}
