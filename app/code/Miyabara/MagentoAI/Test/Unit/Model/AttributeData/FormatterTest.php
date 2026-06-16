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

namespace Miyabara\MagentoAI\Test\Unit\Model\AttributeData;

use Magento\Eav\Model\Config as EavConfig;
use Magento\Eav\Model\Entity\Attribute\AbstractAttribute;
use Miyabara\MagentoAI\Model\AttributeData\Formatter;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;

class FormatterTest extends TestCase
{
    private EavConfig&MockObject $eavConfig;
    private Formatter            $formatter;

    protected function setUp(): void
    {
        $this->eavConfig = $this->createMock(EavConfig::class);
        $this->formatter = new Formatter($this->eavConfig);
    }

    public function testBuildLabelValueTextCombinesAttributesWithResolvedLabels(): void
    {
        $colorAttr = $this->createMock(AbstractAttribute::class);
        $colorAttr->method('getAttributeId')->willReturn(12);
        $colorAttr->method('getDefaultFrontendLabel')->willReturn('Color');

        $this->eavConfig->method('getAttribute')
            ->willReturnMap([['catalog_product', 'color', $colorAttr]]);

        $result = $this->formatter->buildLabelValueText(['color' => 'Red']);

        $this->assertSame('Color: Red', $result);
    }

    public function testBuildLabelValueTextSkipsEmptyValues(): void
    {
        $result = $this->formatter->buildLabelValueText(['name' => 'Widget', 'color' => '', 'size' => null]);

        $this->assertStringNotContainsString('color', strtolower($result));
        $this->assertStringNotContainsString('size', strtolower($result));
    }

    public function testBuildLabelValueTextFallsBackToHumanizedCodeWhenAttributeNotFound(): void
    {
        $this->eavConfig->method('getAttribute')->willReturn(null);

        $result = $this->formatter->buildLabelValueText(['short_description' => 'Some text']);

        $this->assertSame('Short Description: Some text', $result);
    }

    public function testBuildLabelValueTextFallsBackToHumanizedCodeOnEavException(): void
    {
        $this->eavConfig->method('getAttribute')
            ->willThrowException(new \Exception('EAV config error'));

        $result = $this->formatter->buildLabelValueText(['product_type' => 'Simple']);

        $this->assertSame('Product Type: Simple', $result);
    }

    public function testBuildLabelValueTextJoinsMultipleAttributesWithComma(): void
    {
        $attr = $this->createMock(AbstractAttribute::class);
        $attr->method('getAttributeId')->willReturn(1);
        $attr->method('getDefaultFrontendLabel')->willReturn('');

        $this->eavConfig->method('getAttribute')->willReturn($attr);

        $result = $this->formatter->buildLabelValueText([
            'color'  => 'Red',
            'weight' => '1.5',
        ]);

        $this->assertStringContainsString(', ', $result);
        $this->assertStringContainsString('Red', $result);
        $this->assertStringContainsString('1.5', $result);
    }
}
