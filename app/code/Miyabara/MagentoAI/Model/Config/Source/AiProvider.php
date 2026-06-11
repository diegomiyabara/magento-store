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

class AiProvider implements OptionSourceInterface
{
    /**
     * Returns available AI provider options.
     *
     * @return array<int, array<string, string>>
     */
    public function toOptionArray(): array
    {
        return [
            ['value' => 'openai',    'label' => __('OpenAI (ChatGPT)')],
            ['value' => 'anthropic', 'label' => __('Anthropic (Claude)')],
            ['value' => 'gemini',    'label' => __('Google (Gemini)')],
        ];
    }
}
