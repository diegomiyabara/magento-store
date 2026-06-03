<?php

declare(strict_types=1);

namespace Dm3d\Buffer\Test\Unit\Controller\Adminhtml\Product;

use Dm3d\Buffer\Controller\Adminhtml\Product\Search;
use Magento\Backend\App\Action\Context;
use Magento\Backend\Model\Auth;
use Magento\Backend\Model\Session;
use Magento\Backend\Model\UrlInterface as BackendUrlInterface;
use Magento\Catalog\Helper\Image as ImageHelper;
use Magento\Catalog\Model\Product;
use Magento\Catalog\Model\ResourceModel\Product\Collection;
use Magento\Catalog\Model\ResourceModel\Product\CollectionFactory;
use Magento\Framework\App\ActionFlag;
use Magento\Framework\App\Request\Http as HttpRequest;
use Magento\Framework\App\Response\RedirectInterface;
use Magento\Framework\App\ResponseInterface;
use Magento\Framework\App\ViewInterface;
use Magento\Framework\AuthorizationInterface;
use Magento\Framework\Controller\Result\Json;
use Magento\Framework\Controller\Result\JsonFactory;
use Magento\Framework\Controller\Result\RedirectFactory as FrameworkRedirectFactory;
use Magento\Framework\Controller\ResultFactory;
use Magento\Framework\Data\Form\FormKey\Validator as FormKeyValidator;
use Magento\Framework\Event\ManagerInterface as EventManagerInterface;
use Magento\Framework\Locale\ResolverInterface;
use Magento\Framework\Message\ManagerInterface as MessageManagerInterface;
use Magento\Framework\ObjectManagerInterface;
use Magento\Framework\UrlInterface;
use Magento\Store\Model\App\Emulation;
use Magento\Store\Model\StoreManagerInterface;
use Magento\Store\Api\Data\StoreInterface;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;

class SearchTest extends TestCase
{
    private Context&MockObject $context;
    private HttpRequest&MockObject $request;
    private CollectionFactory&MockObject $collectionFactory;
    private ImageHelper&MockObject $imageHelper;
    private JsonFactory&MockObject $jsonFactory;
    private Emulation&MockObject $emulation;
    private StoreManagerInterface&MockObject $storeManager;
    private Json&MockObject $jsonResult;
    private Search $controller;

    protected function setUp(): void
    {
        $this->request          = $this->createMock(HttpRequest::class);
        $this->collectionFactory = $this->createMock(CollectionFactory::class);
        $this->imageHelper      = $this->createMock(ImageHelper::class);
        $this->jsonFactory      = $this->createMock(JsonFactory::class);
        $this->emulation        = $this->createMock(Emulation::class);
        $this->storeManager     = $this->createMock(StoreManagerInterface::class);
        $this->jsonResult       = $this->createMock(Json::class);

        $this->jsonFactory->method('create')->willReturn($this->jsonResult);

        $storeMock = $this->createMock(StoreInterface::class);
        $storeMock->method('getId')->willReturn(1);
        $this->storeManager->method('getDefaultStoreView')->willReturn($storeMock);

        $this->context = $this->buildContextMock();

        $this->controller = new Search(
            $this->context,
            $this->collectionFactory,
            $this->imageHelper,
            $this->jsonFactory,
            $this->emulation,
            $this->storeManager
        );
    }

    // -----------------------------------------------------------------------
    // Context builder
    // -----------------------------------------------------------------------

    private function buildContextMock(): Context&MockObject
    {
        $context = $this->createMock(Context::class);

        $context->method('getRequest')->willReturn($this->request);
        $context->method('getMessageManager')
            ->willReturn($this->createMock(MessageManagerInterface::class));
        $context->method('getObjectManager')
            ->willReturn($this->createMock(ObjectManagerInterface::class));
        $context->method('getEventManager')
            ->willReturn($this->createMock(EventManagerInterface::class));
        $context->method('getUrl')
            ->willReturn($this->createMock(UrlInterface::class));
        $context->method('getActionFlag')
            ->willReturn($this->createMock(ActionFlag::class));
        $context->method('getRedirect')
            ->willReturn($this->createMock(RedirectInterface::class));
        $context->method('getView')
            ->willReturn($this->createMock(ViewInterface::class));
        $context->method('getResultRedirectFactory')
            ->willReturn($this->createMock(FrameworkRedirectFactory::class));
        $context->method('getResultFactory')
            ->willReturn($this->createMock(ResultFactory::class));
        $context->method('getResponse')
            ->willReturn($this->createMock(ResponseInterface::class));
        $context->method('getAuthorization')
            ->willReturn($this->createMock(AuthorizationInterface::class));
        $context->method('getAuth')
            ->willReturn($this->createMock(Auth::class));
        $context->method('getHelper')
            ->willReturn($this->createMock(\Magento\Backend\Helper\Data::class));
        $context->method('getBackendUrl')
            ->willReturn($this->createMock(BackendUrlInterface::class));
        $context->method('getFormKeyValidator')
            ->willReturn($this->createMock(FormKeyValidator::class));
        $context->method('getLocaleResolver')
            ->willReturn($this->createMock(ResolverInterface::class));
        $context->method('getSession')
            ->willReturn($this->createMock(Session::class));
        $context->method('getCanUseBaseUrl')->willReturn(false);

        return $context;
    }

    // -----------------------------------------------------------------------
    // Tests
    // -----------------------------------------------------------------------

    public function testShouldReturnEmptyArrayWhenQueryIsEmpty(): void
    {
        $this->request->method('getParam')->willReturnMap([
            ['q', '', ''],
        ]);

        $this->jsonResult
            ->expects($this->once())
            ->method('setData')
            ->with([])
            ->willReturnSelf();

        $result = $this->controller->execute();

        $this->assertSame($this->jsonResult, $result);
    }

    public function testShouldReturnProductArrayWithNameSkuAndImageUrl(): void
    {
        $this->request->method('getParam')->willReturnMap([
            ['q', '', 'shirt'],
        ]);

        // Product mock
        $product = $this->createMock(Product::class);
        $product->method('getId')->willReturn('42');
        $product->method('getSku')->willReturn('SKU-001');
        $product->method('getName')->willReturn('Blue Shirt');
        $product->method('getData')->with('thumbnail')->willReturn('/s/k/sku-001.jpg');

        // Collection mock — must be IteratorAggregate (Collection implements it)
        $collection = $this->createMock(Collection::class);
        $collection->method('addAttributeToSelect')->willReturnSelf();
        $collection->method('addAttributeToFilter')->willReturnSelf();
        $collection->method('setPageSize')->willReturnSelf();
        $collection->method('setCurPage')->willReturnSelf();
        $collection->method('getIterator')->willReturn(new \ArrayIterator([$product]));

        $this->collectionFactory->method('create')->willReturn($collection);

        // Image helper chain
        $this->imageHelper->method('init')->willReturnSelf();
        $this->imageHelper->method('setImageFile')->willReturnSelf();
        $this->imageHelper->method('getUrl')->willReturn('https://example.com/media/s/k/sku-001.jpg');

        $this->emulation->expects($this->once())->method('startEnvironmentEmulation');
        $this->emulation->expects($this->once())->method('stopEnvironmentEmulation');

        $expected = [
            [
                'id'       => '42',
                'sku'      => 'SKU-001',
                'name'     => 'Blue Shirt',
                'imageUrl' => 'https://example.com/media/s/k/sku-001.jpg',
            ],
        ];

        $this->jsonResult
            ->expects($this->once())
            ->method('setData')
            ->with($expected)
            ->willReturnSelf();

        $result = $this->controller->execute();

        $this->assertSame($this->jsonResult, $result);
    }
}
