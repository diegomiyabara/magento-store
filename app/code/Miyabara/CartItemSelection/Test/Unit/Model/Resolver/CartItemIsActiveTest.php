<?php
/**
 * Miyabara_CartItemSelection
 *
 * @vendor    Miyabara
 * @package   CartItemSelection
 *
 * @copyright © 2026 Diego M. Miyabara. All rights reserved.
 * @author    Diego M. Miyabara <diego.miyabara@gmail.com>
 */

declare(strict_types=1);

namespace Miyabara\CartItemSelection\Test\Unit\Model\Resolver;

use Magento\Framework\GraphQl\Config\Element\Field;
use Magento\Framework\GraphQl\Exception\GraphQlInputException;
use Magento\Framework\GraphQl\Schema\Type\ResolveInfo;
use Magento\Quote\Model\Quote\Item;
use Miyabara\CartItemSelection\Model\Resolver\CartItemIsActive;
use PHPUnit\Framework\TestCase;

class CartItemIsActiveTest extends TestCase
{
    private CartItemIsActive $resolver;
    private Field $fieldMock;
    private ResolveInfo $resolveInfoMock;

    protected function setUp(): void
    {
        $this->resolver = new CartItemIsActive();
        $this->fieldMock = $this->createMock(Field::class);
        $this->resolveInfoMock = $this->createMock(ResolveInfo::class);
    }

    public function testItResolvesIsActiveAsTrueWhenItemHasIsActive1(): void
    {
        $itemMock = $this->createMock(Item::class);
        $itemMock->method('getData')
            ->with('is_active')
            ->willReturn(1);

        $result = $this->resolver->resolve(
            $this->fieldMock,
            null,
            $this->resolveInfoMock,
            ['model' => $itemMock],
            [],
        );

        $this->assertTrue($result);
    }

    public function testItResolvesIsActiveAsFalseWhenItemHasIsActive0(): void
    {
        $itemMock = $this->createMock(Item::class);
        $itemMock->method('getData')
            ->with('is_active')
            ->willReturn(0);

        $result = $this->resolver->resolve(
            $this->fieldMock,
            null,
            $this->resolveInfoMock,
            ['model' => $itemMock],
            [],
        );

        $this->assertFalse($result);
    }

    public function testItResolvesIsActiveAsTrueWhenItemHasIsActiveNullBackwardCompat(): void
    {
        $itemMock = $this->createMock(Item::class);
        $itemMock->method('getData')
            ->with('is_active')
            ->willReturn(null);

        $result = $this->resolver->resolve(
            $this->fieldMock,
            null,
            $this->resolveInfoMock,
            ['model' => $itemMock],
            [],
        );

        $this->assertTrue($result);
    }

    public function testItThrowsGraphQlInputExceptionWhenModelIsMissingFromResolverContext(): void
    {
        $this->expectException(GraphQlInputException::class);

        $this->resolver->resolve(
            $this->fieldMock,
            null,
            $this->resolveInfoMock,
            [],
            [],
        );
    }
}
