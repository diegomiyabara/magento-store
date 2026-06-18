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

use Magento\Framework\App\ResourceConnection;
use Magento\Framework\DB\Adapter\AdapterInterface;
use Magento\Framework\GraphQl\Config\Element\Field;
use Magento\Framework\GraphQl\Exception\GraphQlAuthorizationException;
use Magento\Framework\GraphQl\Exception\GraphQlInputException;
use Magento\Framework\GraphQl\Query\Uid;
use Magento\Framework\GraphQl\Schema\Type\ResolveInfo;
use Magento\GraphQl\Model\Query\ContextExtensionInterface;
use Magento\GraphQl\Model\Query\ContextInterface;
use Magento\Quote\Model\Quote;
use Magento\Quote\Model\Quote\Address;
use Magento\Quote\Model\Quote\Item;
use Magento\Quote\Model\ResourceModel\Quote as QuoteResource;
use Magento\QuoteGraphQl\Model\Cart\GetCartForUser;
use Magento\Store\Api\Data\StoreInterface;
use Miyabara\CartItemSelection\Model\Resolver\SetCartItemSelected;
use PHPUnit\Framework\TestCase;

class SetCartItemSelectedTest extends TestCase
{
    private GetCartForUser $getCartForUserMock;
    private QuoteResource $quoteResourceMock;
    private Uid $uidEncoderMock;
    private ResourceConnection $resourceConnectionMock;
    private AdapterInterface $connectionMock;
    private SetCartItemSelected $resolver;
    private Field $fieldMock;
    private ResolveInfo $resolveInfoMock;
    private ContextInterface $contextMock;
    private Quote $quoteMock;

    protected function setUp(): void
    {
        $this->getCartForUserMock = $this->createMock(GetCartForUser::class);
        $this->quoteResourceMock = $this->createMock(QuoteResource::class);
        $this->uidEncoderMock = $this->createMock(Uid::class);

        $this->connectionMock = $this->createMock(AdapterInterface::class);
        $this->resourceConnectionMock = $this->createMock(ResourceConnection::class);
        $this->resourceConnectionMock->method('getConnection')->willReturn($this->connectionMock);
        $this->resourceConnectionMock->method('getTableName')->with('quote_item')->willReturn('quote_item');

        $this->resolver = new SetCartItemSelected(
            $this->getCartForUserMock,
            $this->quoteResourceMock,
            $this->uidEncoderMock,
            $this->resourceConnectionMock,
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
            ->onlyMethods(['getItemId', 'getId', 'setData'])
            ->getMock();
        $item->method('getItemId')->willReturn($itemId);
        $item->method('getId')->willReturn($itemId);
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

    public function testItSetsIsActiveToFalseForASingleItemAndReturnsUpdatedCart(): void
    {
        $maskedCartId = 'abc123';
        $uid = base64_encode('42');
        $item = $this->makeItem(42);

        $item->expects($this->once())
            ->method('setData')
            ->with('is_active', false);

        $address = $this->makeAddress();
        $address->expects($this->once())->method('setCollectShippingRates')->with(true);
        $address->expects($this->once())->method('unsetData')->with('cached_items_all');
        $address->expects($this->once())->method('setShippingMethod')->with(null);

        $this->uidEncoderMock->method('decode')->with($uid)->willReturn('42');
        $this->getCartForUserMock->method('execute')->with($maskedCartId, 1, 1)->willReturn($this->quoteMock);
        $this->quoteMock->method('getItemById')->with(42)->willReturn($item);
        $this->quoteMock->method('getAllAddresses')->willReturn([$address]);
        $this->quoteMock->expects($this->once())->method('collectTotals')->willReturnSelf();
        $this->quoteResourceMock->expects($this->once())->method('save')->with($this->quoteMock);

        $result = $this->resolver->resolve(
            $this->fieldMock,
            $this->contextMock,
            $this->resolveInfoMock,
            null,
            ['input' => ['cart_id' => $maskedCartId, 'cart_item_uid' => $uid, 'is_active' => false]],
        );

        $this->assertSame(['cart' => ['model' => $this->quoteMock]], $result);
    }

    public function testItSetsIsActiveToTrueForASingleItemAndReturnsUpdatedCart(): void
    {
        $maskedCartId = 'abc123';
        $uid = base64_encode('10');
        $item = $this->makeItem(10);

        $item->expects($this->once())
            ->method('setData')
            ->with('is_active', true);

        $address = $this->makeAddress();
        $address->method('setCollectShippingRates')->willReturnSelf();
        $address->method('unsetData')->willReturnSelf();
        $address->method('setShippingMethod')->willReturnSelf();

        $this->uidEncoderMock->method('decode')->with($uid)->willReturn('10');
        $this->getCartForUserMock->method('execute')->willReturn($this->quoteMock);
        $this->quoteMock->method('getItemById')->with(10)->willReturn($item);
        $this->quoteMock->method('getAllAddresses')->willReturn([$address]);
        $this->quoteMock->method('collectTotals')->willReturnSelf();
        $this->quoteResourceMock->method('save');

        $result = $this->resolver->resolve(
            $this->fieldMock,
            $this->contextMock,
            $this->resolveInfoMock,
            null,
            ['input' => ['cart_id' => $maskedCartId, 'cart_item_uid' => $uid, 'is_active' => true]],
        );

        $this->assertSame(['cart' => ['model' => $this->quoteMock]], $result);
    }

    public function testItPersistsIsActiveViaDirectDbUpdateBeforeCollectingTotals(): void
    {
        $maskedCartId = 'abc123';
        $uid = base64_encode('42');
        $item = $this->makeItem(42);

        $this->connectionMock->expects($this->once())
            ->method('update')
            ->with('quote_item', ['is_active' => 0], ['item_id = ?' => 42]);

        $this->uidEncoderMock->method('decode')->with($uid)->willReturn('42');
        $this->getCartForUserMock->method('execute')->willReturn($this->quoteMock);
        $this->quoteMock->method('getItemById')->willReturn($item);
        $this->quoteMock->method('getAllAddresses')->willReturn([]);
        $this->quoteMock->method('collectTotals')->willReturnSelf();
        $this->quoteResourceMock->method('save');

        $this->resolver->resolve(
            $this->fieldMock,
            $this->contextMock,
            $this->resolveInfoMock,
            null,
            ['input' => ['cart_id' => $maskedCartId, 'cart_item_uid' => $uid, 'is_active' => false]],
        );
    }

    public function testItResolvesTheMaskedCartIdViaGetCartForUserNotNumericGet(): void
    {
        $maskedCartId = 'masked-hash-xyz';
        $uid = base64_encode('5');
        $item = $this->makeItem(5);

        $this->uidEncoderMock->method('decode')->willReturn('5');
        $this->quoteMock->method('getItemById')->willReturn($item);
        $this->quoteMock->method('getAllAddresses')->willReturn([]);
        $this->quoteMock->method('collectTotals')->willReturnSelf();

        $this->getCartForUserMock->expects($this->once())
            ->method('execute')
            ->with($maskedCartId, 1, 1)
            ->willReturn($this->quoteMock);

        $this->quoteResourceMock->method('save');

        $this->resolver->resolve(
            $this->fieldMock,
            $this->contextMock,
            $this->resolveInfoMock,
            null,
            ['input' => ['cart_id' => $maskedCartId, 'cart_item_uid' => $uid, 'is_active' => true]],
        );
    }

    public function testItDecodesCartItemUidAsBase64OfTheNumericItemIdNoCartItemPrefix(): void
    {
        $numericId = 99;
        $uid = base64_encode((string) $numericId);

        $item = $this->makeItem($numericId);

        $this->uidEncoderMock->expects($this->once())
            ->method('decode')
            ->with($uid)
            ->willReturn((string) $numericId);

        $this->getCartForUserMock->method('execute')->willReturn($this->quoteMock);
        $this->quoteMock->expects($this->once())
            ->method('getItemById')
            ->with($numericId)
            ->willReturn($item);
        $this->quoteMock->method('getAllAddresses')->willReturn([]);
        $this->quoteMock->method('collectTotals')->willReturnSelf();
        $this->quoteResourceMock->method('save');

        $this->resolver->resolve(
            $this->fieldMock,
            $this->contextMock,
            $this->resolveInfoMock,
            null,
            ['input' => ['cart_id' => 'abc', 'cart_item_uid' => $uid, 'is_active' => true]],
        );
    }

    public function testItThrowsGraphQlAuthorizationExceptionWhenUserIsNotAuthenticatedDelegatedToGetCartForUser(): void
    {
        $maskedCartId = 'abc123';
        $uid = base64_encode('1');

        $this->uidEncoderMock->method('decode')->willReturn('1');
        $this->getCartForUserMock->method('execute')
            ->willThrowException(new GraphQlAuthorizationException(__('Not authorized')));

        $this->expectException(GraphQlAuthorizationException::class);

        $this->resolver->resolve(
            $this->fieldMock,
            $this->contextMock,
            $this->resolveInfoMock,
            null,
            ['input' => ['cart_id' => $maskedCartId, 'cart_item_uid' => $uid, 'is_active' => true]],
        );
    }

    public function testItThrowsWhenCartIdMaskedDoesNotResolveToACartForTheUser(): void
    {
        $uid = base64_encode('1');
        $this->uidEncoderMock->method('decode')->willReturn('1');
        $this->getCartForUserMock->method('execute')
            ->willThrowException(new GraphQlInputException(__('Cart not found')));

        $this->expectException(GraphQlInputException::class);

        $this->resolver->resolve(
            $this->fieldMock,
            $this->contextMock,
            $this->resolveInfoMock,
            null,
            ['input' => ['cart_id' => 'bad-masked-id', 'cart_item_uid' => $uid, 'is_active' => true]],
        );
    }

    public function testItThrowsGraphQlInputExceptionWhenCartItemUidDoesNotBelongToTheCart(): void
    {
        $uid = base64_encode('999');
        $this->uidEncoderMock->method('decode')->willReturn('999');
        $this->getCartForUserMock->method('execute')->willReturn($this->quoteMock);
        $this->quoteMock->method('getItemById')->with(999)->willReturn(false);

        $this->expectException(GraphQlInputException::class);

        $this->resolver->resolve(
            $this->fieldMock,
            $this->contextMock,
            $this->resolveInfoMock,
            null,
            ['input' => ['cart_id' => 'abc', 'cart_item_uid' => $uid, 'is_active' => true]],
        );
    }

    public function testItThrowsGraphQlInputExceptionWhenCartItemUidRefersToAChildItem(): void
    {
        $uid = base64_encode('50');
        $childItem = $this->makeItem(50, 49);

        $this->uidEncoderMock->method('decode')->willReturn('50');
        $this->getCartForUserMock->method('execute')->willReturn($this->quoteMock);
        $this->quoteMock->method('getItemById')->with(50)->willReturn($childItem);

        $this->expectException(GraphQlInputException::class);

        $this->resolver->resolve(
            $this->fieldMock,
            $this->contextMock,
            $this->resolveInfoMock,
            null,
            ['input' => ['cart_id' => 'abc', 'cart_item_uid' => $uid, 'is_active' => true]],
        );
    }

    public function testItResetsSelectedShippingMethodAndInvalidatesAddressItemCacheWhenToggling(): void
    {
        $uid = base64_encode('7');
        $item = $this->makeItem(7);

        $address1 = $this->makeAddress();
        $address2 = $this->makeAddress();

        $address1->expects($this->once())->method('setCollectShippingRates')->with(true);
        $address1->expects($this->once())->method('unsetData')->with('cached_items_all');
        $address1->expects($this->once())->method('setShippingMethod')->with(null);

        $address2->expects($this->once())->method('setCollectShippingRates')->with(true);
        $address2->expects($this->once())->method('unsetData')->with('cached_items_all');
        $address2->expects($this->once())->method('setShippingMethod')->with(null);

        $this->uidEncoderMock->method('decode')->willReturn('7');
        $this->getCartForUserMock->method('execute')->willReturn($this->quoteMock);
        $this->quoteMock->method('getItemById')->willReturn($item);
        $this->quoteMock->method('getAllAddresses')->willReturn([$address1, $address2]);
        $this->quoteMock->method('collectTotals')->willReturnSelf();
        $this->quoteResourceMock->method('save');

        $this->resolver->resolve(
            $this->fieldMock,
            $this->contextMock,
            $this->resolveInfoMock,
            null,
            ['input' => ['cart_id' => 'abc', 'cart_item_uid' => $uid, 'is_active' => false]],
        );
    }
}
