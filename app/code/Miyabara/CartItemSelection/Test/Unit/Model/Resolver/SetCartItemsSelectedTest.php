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
use Magento\Framework\GraphQl\Query\Uid;
use Magento\Framework\GraphQl\Schema\Type\ResolveInfo;
use Magento\GraphQl\Model\Query\ContextExtensionInterface;
use Magento\GraphQl\Model\Query\ContextInterface;
use Magento\Quote\Api\CartRepositoryInterface;
use Magento\Quote\Model\Quote;
use Magento\Quote\Model\Quote\Address;
use Magento\Quote\Model\Quote\Item;
use Magento\QuoteGraphQl\Model\Cart\GetCartForUser;
use Magento\Store\Api\Data\StoreInterface;
use Miyabara\CartItemSelection\Model\Resolver\SetCartItemsSelected;
use PHPUnit\Framework\TestCase;

class SetCartItemsSelectedTest extends TestCase
{
    private GetCartForUser $getCartForUserMock;
    private CartRepositoryInterface $cartRepositoryMock;
    private Uid $uidEncoderMock;
    private SetCartItemsSelected $resolver;
    private Field $fieldMock;
    private ResolveInfo $resolveInfoMock;
    private ContextInterface $contextMock;
    private Quote $quoteMock;

    protected function setUp(): void
    {
        $this->getCartForUserMock = $this->createMock(GetCartForUser::class);
        $this->cartRepositoryMock = $this->createMock(CartRepositoryInterface::class);
        $this->uidEncoderMock = $this->createMock(Uid::class);

        $this->resolver = new SetCartItemsSelected(
            $this->getCartForUserMock,
            $this->cartRepositoryMock,
            $this->uidEncoderMock,
        );

        $this->fieldMock = $this->createMock(Field::class);
        $this->resolveInfoMock = $this->createMock(ResolveInfo::class);
        $this->quoteMock = $this->createMock(Quote::class);

        $storeMock = $this->createMock(StoreInterface::class);
        $storeMock->method('getId')->willReturn(1);

        $extensionMock = $this->createMock(ContextExtensionInterface::class);
        $extensionMock->method('getStore')->willReturn($storeMock);

        $this->contextMock = $this->createMock(ContextInterface::class);
        $this->contextMock->method('getUserId')->willReturn(1);
        $this->contextMock->method('getExtensionAttributes')->willReturn($extensionMock);
    }

    private function makeItem(int $itemId, ?int $parentItemId = null): Item
    {
        $item = $this->getMockBuilder(Item::class)
            ->disableOriginalConstructor()
            ->addMethods(['getParentItemId'])
            ->onlyMethods(['getItemId', 'setData'])
            ->getMock();
        $item->method('getItemId')->willReturn($itemId);
        $item->method('getParentItemId')->willReturn($parentItemId);

        return $item;
    }

    private function makeAddress(): Address
    {
        return $this->getMockBuilder(Address::class)
            ->disableOriginalConstructor()
            ->addMethods(['setCollectShippingRates', 'setShippingMethod'])
            ->onlyMethods(['unsetData'])
            ->getMock();
    }

    public function testItBulkUpdatesMultipleItemsIsActiveInOneOperation(): void
    {
        $uid1 = base64_encode('10');
        $uid2 = base64_encode('20');

        $item1 = $this->makeItem(10);
        $item2 = $this->makeItem(20);

        $item1->expects($this->once())->method('setData')->with('is_active', false);
        $item2->expects($this->once())->method('setData')->with('is_active', true);

        $this->uidEncoderMock->method('decode')
            ->willReturnCallback(fn(string $uid) => base64_decode($uid));

        $this->getCartForUserMock->method('execute')->willReturn($this->quoteMock);
        $this->quoteMock->method('getItemById')
            ->willReturnCallback(fn(int $id) => match ($id) {
                10 => $item1,
                20 => $item2,
                default => null,
            });
        $this->quoteMock->method('getAllAddresses')->willReturn([]);
        $this->quoteMock->method('collectTotals');
        $this->cartRepositoryMock->method('save');

        $result = $this->resolver->resolve(
            $this->fieldMock,
            $this->contextMock,
            $this->resolveInfoMock,
            null,
            [
                'input' => [
                    'cart_id' => 'abc',
                    'items' => [
                        ['cart_item_uid' => $uid1, 'is_active' => false],
                        ['cart_item_uid' => $uid2, 'is_active' => true],
                    ],
                ],
            ],
        );

        $this->assertSame(['cart' => ['model' => $this->quoteMock]], $result);
    }

    public function testItCallsCollectTotalsExactlyOnceForBulkUpdateRegardlessOfItemCount(): void
    {
        $uids = [base64_encode('1'), base64_encode('2'), base64_encode('3')];
        $items = [
            $this->makeItem(1),
            $this->makeItem(2),
            $this->makeItem(3),
        ];

        $this->uidEncoderMock->method('decode')
            ->willReturnCallback(fn(string $uid) => base64_decode($uid));

        $this->getCartForUserMock->method('execute')->willReturn($this->quoteMock);
        $this->quoteMock->method('getItemById')
            ->willReturnCallback(fn(int $id) => match ($id) {
                1 => $items[0],
                2 => $items[1],
                3 => $items[2],
                default => null,
            });
        $this->quoteMock->method('getAllAddresses')->willReturn([]);
        $this->quoteMock->expects($this->once())->method('collectTotals');
        $this->cartRepositoryMock->method('save');

        $this->resolver->resolve(
            $this->fieldMock,
            $this->contextMock,
            $this->resolveInfoMock,
            null,
            [
                'input' => [
                    'cart_id' => 'abc',
                    'items' => [
                        ['cart_item_uid' => $uids[0], 'is_active' => true],
                        ['cart_item_uid' => $uids[1], 'is_active' => false],
                        ['cart_item_uid' => $uids[2], 'is_active' => true],
                    ],
                ],
            ],
        );
    }

    public function testItResetsSelectedShippingMethodAndInvalidatesAddressItemCacheWhenToggling(): void
    {
        $uid = base64_encode('5');
        $item = $this->makeItem(5);

        $address = $this->makeAddress();
        $address->expects($this->once())->method('setCollectShippingRates')->with(true);
        $address->expects($this->once())->method('unsetData')->with('cached_items_all');
        $address->expects($this->once())->method('setShippingMethod')->with(null);

        $this->uidEncoderMock->method('decode')->willReturn('5');
        $this->getCartForUserMock->method('execute')->willReturn($this->quoteMock);
        $this->quoteMock->method('getItemById')->willReturn($item);
        $this->quoteMock->method('getAllAddresses')->willReturn([$address]);
        $this->quoteMock->method('collectTotals');
        $this->cartRepositoryMock->method('save');

        $this->resolver->resolve(
            $this->fieldMock,
            $this->contextMock,
            $this->resolveInfoMock,
            null,
            [
                'input' => [
                    'cart_id' => 'abc',
                    'items' => [
                        ['cart_item_uid' => $uid, 'is_active' => false],
                    ],
                ],
            ],
        );
    }

    public function testItThrowsGraphQlInputExceptionForBulkUpdateWhenAnyCartItemUidIsInvalidNoPartialWrite(): void
    {
        $validUid = base64_encode('10');
        $invalidUid = base64_encode('999');

        $validItem = $this->makeItem(10);

        $validItem->expects($this->never())->method('setData');

        $this->uidEncoderMock->method('decode')
            ->willReturnCallback(fn(string $uid) => base64_decode($uid));

        $this->getCartForUserMock->method('execute')->willReturn($this->quoteMock);
        $this->quoteMock->method('getItemById')
            ->willReturnCallback(fn(int $id) => match ($id) {
                10 => $validItem,
                999 => null,
                default => null,
            });

        $this->quoteMock->expects($this->never())->method('collectTotals');
        $this->cartRepositoryMock->expects($this->never())->method('save');

        $this->expectException(GraphQlInputException::class);

        $this->resolver->resolve(
            $this->fieldMock,
            $this->contextMock,
            $this->resolveInfoMock,
            null,
            [
                'input' => [
                    'cart_id' => 'abc',
                    'items' => [
                        ['cart_item_uid' => $validUid, 'is_active' => false],
                        ['cart_item_uid' => $invalidUid, 'is_active' => true],
                    ],
                ],
            ],
        );
    }
}
