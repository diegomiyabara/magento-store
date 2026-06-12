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

namespace Miyabara\CartItemSelection\Test\Unit\Plugin;

use Magento\Framework\GraphQl\Config\Element\Field;
use Magento\Framework\GraphQl\Schema\Type\ResolveInfo;
use Magento\Quote\Model\Quote;
use Magento\Quote\Model\Quote\Item;
use Magento\QuoteGraphQl\Model\CartItem\GetItemsData;
use Magento\QuoteGraphQl\Model\Resolver\CartItems;
use Miyabara\CartItemSelection\Plugin\CartItemsGraphQlResolver;
use PHPUnit\Framework\TestCase;
use stdClass;

class CartItemsGraphQlResolverTest extends TestCase
{
    private CartItemsGraphQlResolver $plugin;
    private GetItemsData $getItemsDataMock;
    private CartItems $subjectMock;
    private Field $fieldMock;
    private ResolveInfo $resolveInfoMock;

    protected function setUp(): void
    {
        $this->getItemsDataMock = $this->createMock(GetItemsData::class);
        $this->plugin = new CartItemsGraphQlResolver($this->getItemsDataMock);
        $this->subjectMock = $this->createMock(CartItems::class);
        $this->fieldMock = $this->createMock(Field::class);
        $this->resolveInfoMock = $this->createMock(ResolveInfo::class);
    }

    private function makeItem(bool $deleted, ?int $parentItemId, ?Item $parentItem): Item
    {
        $item = $this->getMockBuilder(Item::class)
            ->disableOriginalConstructor()
            ->addMethods(['getParentItemId'])
            ->onlyMethods(['isDeleted', 'getParentItem'])
            ->getMock();
        $item->method('isDeleted')->willReturn($deleted);
        $item->method('getParentItemId')->willReturn($parentItemId);
        $item->method('getParentItem')->willReturn($parentItem);

        return $item;
    }

    private function makeCart(array $items): Quote
    {
        $cart = $this->createMock(Quote::class);
        $cart->method('getItemsCollection')->willReturn($items);

        return $cart;
    }

    public function testItDelegatesToProceedWhenValueModelIsMissing(): void
    {
        $proceedCalled = false;
        $proceedResult = [['id' => 99, 'uid' => 'xyz', 'quantity' => 1, 'product' => [], 'model' => new stdClass()]];
        $proceed = function () use (&$proceedCalled, $proceedResult) {
            $proceedCalled = true;

            return $proceedResult;
        };

        $this->getItemsDataMock
            ->expects($this->never())
            ->method('execute');

        $result = $this->plugin->aroundResolve(
            $this->subjectMock,
            $proceed,
            $this->fieldMock,
            null,
            $this->resolveInfoMock,
            ['no_model_key' => 'something'],
            null,
        );

        $this->assertTrue($proceedCalled);
        $this->assertSame($proceedResult, $result);
    }

    public function testItReturnsEmptyArrayWhenCartHasNoItems(): void
    {
        $cart = $this->makeCart([]);

        $this->getItemsDataMock
            ->expects($this->once())
            ->method('execute')
            ->with([])
            ->willReturn([]);

        $result = $this->plugin->aroundResolve(
            $this->subjectMock,
            fn () => [],
            $this->fieldMock,
            null,
            $this->resolveInfoMock,
            ['model' => $cart],
            null,
        );

        $this->assertSame([], $result);
    }

    public function testItDelegatesPayloadConstructionToGetItemsDataSoEachItemHasIdUidQuantityProductAndModel(): void
    {
        $cartItem = $this->makeItem(false, null, null);
        $cart = $this->makeCart([$cartItem]);

        $expectedPayload = [
            [
                'id' => 42,
                'uid' => 'NDI=',
                'quantity' => 3,
                'product' => ['sku' => 'TEST-SKU', 'model' => new stdClass()],
                'model' => $cartItem,
            ],
        ];

        $this->getItemsDataMock
            ->expects($this->once())
            ->method('execute')
            ->with([$cartItem])
            ->willReturn($expectedPayload);

        $result = $this->plugin->aroundResolve(
            $this->subjectMock,
            fn () => [],
            $this->fieldMock,
            null,
            $this->resolveInfoMock,
            ['model' => $cart],
            null,
        );

        $this->assertArrayHasKey('id', $result[0]);
        $this->assertArrayHasKey('uid', $result[0]);
        $this->assertArrayHasKey('quantity', $result[0]);
        $this->assertArrayHasKey('product', $result[0]);
        $this->assertArrayHasKey('model', $result[0]);
        $this->assertSame(42, $result[0]['id']);
        $this->assertSame('NDI=', $result[0]['uid']);
        $this->assertSame(3, $result[0]['quantity']);
    }

    public function testItExcludesChildItemsParentItemIdOrParentItemSetFromTheResult(): void
    {
        $parentItem = $this->makeItem(false, null, null);
        $childByParentItemId = $this->makeItem(false, 10, null);
        $childByParentItem = $this->makeItem(false, null, $parentItem);

        $cart = $this->makeCart([$parentItem, $childByParentItemId, $childByParentItem]);

        $this->getItemsDataMock
            ->expects($this->once())
            ->method('execute')
            ->with([$parentItem])
            ->willReturn([['id' => 1, 'uid' => 'abc', 'quantity' => 1, 'product' => [], 'model' => $parentItem]]);

        $result = $this->plugin->aroundResolve(
            $this->subjectMock,
            fn () => [],
            $this->fieldMock,
            null,
            $this->resolveInfoMock,
            ['model' => $cart],
            null,
        );

        $this->assertCount(1, $result);
    }

    public function testItExcludesDeletedItemsFromTheResult(): void
    {
        $normalItem = $this->makeItem(false, null, null);
        $deletedItem = $this->makeItem(true, null, null);

        $cart = $this->makeCart([$normalItem, $deletedItem]);

        $this->getItemsDataMock
            ->expects($this->once())
            ->method('execute')
            ->with([$normalItem])
            ->willReturn([['id' => 1, 'uid' => 'abc', 'quantity' => 1, 'product' => [], 'model' => $normalItem]]);

        $result = $this->plugin->aroundResolve(
            $this->subjectMock,
            fn () => [],
            $this->fieldMock,
            null,
            $this->resolveInfoMock,
            ['model' => $cart],
            null,
        );

        $this->assertCount(1, $result);
    }

    public function testItReturnsAllItemsIncludingInactiveOnesInGraphQlResponse(): void
    {
        $activeItem = $this->makeItem(false, null, null);
        $inactiveItem = $this->makeItem(false, null, null);

        $cart = $this->makeCart([$activeItem, $inactiveItem]);

        $expectedData = [
            ['id' => 1, 'uid' => 'abc', 'quantity' => 1, 'product' => [], 'model' => $activeItem],
            ['id' => 2, 'uid' => 'def', 'quantity' => 2, 'product' => [], 'model' => $inactiveItem],
        ];

        $this->getItemsDataMock
            ->expects($this->once())
            ->method('execute')
            ->with([$activeItem, $inactiveItem])
            ->willReturn($expectedData);

        $result = $this->plugin->aroundResolve(
            $this->subjectMock,
            fn () => [],
            $this->fieldMock,
            null,
            $this->resolveInfoMock,
            ['model' => $cart],
            null,
        );

        $this->assertSame($expectedData, $result);
    }
}
