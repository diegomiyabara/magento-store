<?php
/**
 * Miyabara_MagentoAI
 *
 * @vendor    Miyabara
 * @package   MagentoAI
 *
 * @copyright © 2026 Diego M. Miyabara. All rights reserved.
 * @author    Diego M. Miyabara <diego.miyabara@gmail.com>
 */

declare(strict_types=1);

namespace Miyabara\MagentoAI\Plugin;

use Magento\Framework\Data\Form\Element\Editor;
use Magento\Framework\Escaper;
use Miyabara\MagentoAI\Api\GeneralConfigInterface;

/**
 * Injects MagentoAI generate buttons into the TinyMCE editor element HTML.
 *
 * Uses an after plugin on getElementHtml() instead of a full class rewrite (preference),
 * which keeps the core Editor class untouched. The buttons carry a data-editor-id attribute
 * so the JS can locate the linked textarea/iframe by ID rather than fragile DOM traversal.
 * The allowed-fields list is injectable so third-party modules can extend it via virtual type.
 */
class EditorButtonsPlugin
{
    /**
     * @param GeneralConfigInterface $config
     * @param Escaper                $escaper
     * @param string[]               $allowedFields HTML element IDs of editor fields that should show MagentoAI buttons
     */
    public function __construct(
        private readonly GeneralConfigInterface $config,
        private readonly Escaper $escaper,
        private readonly array $allowedFields = [
            'product_form_description',
            'product_form_short_description',
        ],
    ) {}

    /**
     * Append MagentoAI generate buttons after the editor HTML for allowed product fields.
     *
     * @param Editor $subject
     * @param string $result
     * @return string
     */
    public function afterGetElementHtml(Editor $subject, string $result): string
    {
        if (!$this->config->isEnabled()) {
            return $result;
        }

        $htmlId = $subject->getHtmlId();
        if (!in_array($htmlId, $this->allowedFields, true)) {
            return $result;
        }

        $escapedId   = $this->escaper->escapeHtmlAttr($htmlId);
        $generateId  = $escapedId . '_mageai';
        $advancedId  = $escapedId . '_advanced_mageai';
        $generateLbl = $this->escaper->escapeHtml(__('Generate with MagentoAI'));
        $advancedLbl = $this->escaper->escapeHtml(__('Advanced Generate with MagentoAI'));

        $buttons  = '<button type="button"';
        $buttons .= ' id="' . $generateId . '"';
        $buttons .= ' class="scalable generate-mageai-btn"';
        $buttons .= ' data-editor-id="' . $escapedId . '">';
        $buttons .= '<span><span><span>' . $generateLbl . '</span></span></span>';
        $buttons .= '</button>';

        $buttons .= '<button type="button"';
        $buttons .= ' id="' . $advancedId . '"';
        $buttons .= ' class="scalable advanced-generate-mageai-btn"';
        $buttons .= ' data-editor-id="' . $escapedId . '">';
        $buttons .= '<span><span><span>' . $advancedLbl . '</span></span></span>';
        $buttons .= '</button>';

        return $result . $buttons;
    }
}
