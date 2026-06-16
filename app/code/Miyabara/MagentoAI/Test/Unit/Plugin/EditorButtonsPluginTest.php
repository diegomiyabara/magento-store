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

namespace Miyabara\MagentoAI\Test\Unit\Plugin;

use Magento\Framework\Data\Form\Element\Editor;
use Magento\Framework\Escaper;
use Miyabara\MagentoAI\Api\GeneralConfigInterface;
use Miyabara\MagentoAI\Plugin\EditorButtonsPlugin;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;

class EditorButtonsPluginTest extends TestCase
{
    private GeneralConfigInterface&MockObject $config;
    private Escaper                           $escaper;
    private EditorButtonsPlugin               $plugin;

    protected function setUp(): void
    {
        $this->config  = $this->createMock(GeneralConfigInterface::class);
        $this->escaper = new Escaper();
        $this->plugin  = new EditorButtonsPlugin($this->config, $this->escaper);
    }

    public function testButtonsAreAppendedForAllowedField(): void
    {
        $this->config->method('isEnabled')->willReturn(true);

        $editor = $this->createMock(Editor::class);
        $editor->method('getHtmlId')->willReturn('product_form_description');

        $result = $this->plugin->afterGetElementHtml($editor, '<textarea id="product_form_description"></textarea>');

        $this->assertStringContainsString('generate-mageai-btn', $result);
        $this->assertStringContainsString('advanced-generate-mageai-btn', $result);
        $this->assertStringContainsString('data-editor-id="product_form_description"', $result);
    }

    public function testButtonsAreNotAppendedWhenModuleIsDisabled(): void
    {
        $this->config->method('isEnabled')->willReturn(false);

        $editor = $this->createMock(Editor::class);
        $editor->method('getHtmlId')->willReturn('product_form_description');

        $original = '<textarea id="product_form_description"></textarea>';
        $result   = $this->plugin->afterGetElementHtml($editor, $original);

        $this->assertSame($original, $result);
    }

    public function testButtonsAreNotAppendedForNonAllowedField(): void
    {
        $this->config->method('isEnabled')->willReturn(true);

        $editor = $this->createMock(Editor::class);
        $editor->method('getHtmlId')->willReturn('some_other_field');

        $original = '<textarea id="some_other_field"></textarea>';
        $result   = $this->plugin->afterGetElementHtml($editor, $original);

        $this->assertSame($original, $result);
    }

    public function testCustomAllowedFieldsCanBeInjectedViaDi(): void
    {
        $this->config->method('isEnabled')->willReturn(true);

        $plugin = new EditorButtonsPlugin(
            $this->config,
            $this->escaper,
            ['product_form_description', 'product_form_custom_field']
        );

        $editor = $this->createMock(Editor::class);
        $editor->method('getHtmlId')->willReturn('product_form_custom_field');

        $result = $plugin->afterGetElementHtml($editor, '<textarea></textarea>');

        $this->assertStringContainsString('generate-mageai-btn', $result);
    }

    public function testEditorIdIsProperlyEscapedInButtonHtml(): void
    {
        $this->config->method('isEnabled')->willReturn(true);

        $editor = $this->createMock(Editor::class);
        $editor->method('getHtmlId')->willReturn('product_form_description');

        $result = $this->plugin->afterGetElementHtml($editor, '');

        $this->assertStringNotContainsString('">', $result);
        $this->assertStringContainsString('product_form_description_mageai', $result);
    }
}
