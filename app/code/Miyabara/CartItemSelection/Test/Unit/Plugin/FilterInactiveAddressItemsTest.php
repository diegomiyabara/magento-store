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

use Magento\Quote\Model\Quote\Address;
use Magento\Quote\Model\Quote\Item;
use Miyabara\CartItemSelection\Plugin\FilterInactiveAddressItems;
use PHPUnit\Framework\TestCase;

class FilterInactiveAddressItemsTest extends TestCase
{
    private FilterInactiveAddressItems $plugin;
    private Address $addressMock;

    protected function setUp(): void
    {
        $this->plugin = new FilterInactiveAddressItems();
        $this->addressMock = $this->createMock(Address::class);
    }

    private function makeItem(?int $isActive): Item
    {
        $item = $this->createMock(Item::class);
        $item->method('getData')
            ->with('is_active')
            ->willReturn($isActive);

        return $item;
    }

    public function testItReturnsOnlyActiveItemsFromAddressGetAllItemsWhenQuoteHasMix(): void
    {
        $activeItem = $this->makeItem(1);
        $inactiveItem = $this->makeItem(0);

        $result = $this->plugin->afterGetAllItems(
            $this->addressMock,
            [$activeItem, $inactiveItem],
        );

        $this->assertCount(1, $result);
        $this->assertSame($activeItem, $result[0]);
    }

    public function testItReturnsAllItemsWhenAllItemsAreActiveEachMethod(): void
    {
        $item1 = $this->makeItem(1);
        $item2 = $this->makeItem(1);

        $result = $this->plugin->afterGetAllItems(
            $this->addressMock,
            [$item1, $item2],
        );

        $this->assertCount(2, $result);
    }

    public function testItReturnsEmptyArrayWhenAllItemsAreInactiveEachMethod(): void
    {
        $item1 = $this->makeItem(0);
        $item2 = $this->makeItem(0);

        $result = $this->plugin->afterGetAllItems(
            $this->addressMock,
            [$item1, $item2],
        );

        $this->assertSame([], $result);
    }

    public function testItTreatsItemsWithNullIsActiveAsActiveBackwardCompatibilityAddress(): void
    {
        $nullItem = $this->makeItem(null);

        $result = $this->plugin->afterGetAllItems(
            $this->addressMock,
            [$nullItem],
        );

        $this->assertCount(1, $result);
        $this->assertSame($nullItem, $result[0]);
    }

    public function testItPreservesArrayValuesReindexesSoCallersGetACleanArrayAddress(): void
    {
        $active1 = $this->makeItem(1);
        $inactive = $this->makeItem(0);
        $active2 = $this->makeItem(1);

        $result = $this->plugin->afterGetAllItems(
            $this->addressMock,
            [$active1, $inactive, $active2],
        );

        $this->assertSame([0 => $active1, 1 => $active2], $result);
    }

    public function testItNeverMutatesItemIsDeletedFlagWhileFilteringAddress(): void
    {
        $activeItem = $this->createMock(Item::class);
        $activeItem->method('getData')->with('is_active')->willReturn(1);
        $activeItem->expects($this->never())->method('isDeleted');

        $inactiveItem = $this->createMock(Item::class);
        $inactiveItem->method('getData')->with('is_active')->willReturn(0);
        $inactiveItem->expects($this->never())->method('isDeleted');

        $this->plugin->afterGetAllItems(
            $this->addressMock,
            [$activeItem, $inactiveItem],
        );
    }

    public function testItDoesNotIntroduceChildItemsThatTheOriginalMethodExcluded(): void
    {
        $item1 = $this->makeItem(1);
        $item2 = $this->makeItem(1);
        $extraItem = $this->makeItem(1);

        $originalResult = [$item1, $item2];

        $result = $this->plugin->afterGetAllItems(
            $this->addressMock,
            $originalResult,
        );

        $this->assertCount(2, $result);
        $this->assertNotContains($extraItem, $result);
        $this->assertSame($item1, $result[0]);
        $this->assertSame($item2, $result[1]);
    }
}
