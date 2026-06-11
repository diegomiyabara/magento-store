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

class GeminiModel implements OptionSourceInterface
{
    /**
     * Returns available Google Gemini text model options.
     *
     * @return array<int, array<string, string>>
     */
    public function toOptionArray(): array
    {
        return [
            ['value' => 'gemini-2.5-pro',        'label' => 'gemini-2.5-pro'],
            ['value' => 'gemini-2.5-flash',       'label' => 'gemini-2.5-flash'],
            ['value' => 'gemini-2.0-flash',       'label' => 'gemini-2.0-flash'],
            ['value' => 'gemini-2.0-flash-lite',  'label' => 'gemini-2.0-flash-lite'],
            ['value' => 'gemini-1.5-pro',         'label' => 'gemini-1.5-pro'],
            ['value' => 'gemini-1.5-flash',       'label' => 'gemini-1.5-flash'],
            ['value' => 'gemini-1.5-flash-8b',    'label' => 'gemini-1.5-flash-8b'],
        ];
    }
}
