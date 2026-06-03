<?php

declare(strict_types=1);

namespace Dm3d\Buffer\Test\Unit\Controller\Adminhtml\Channel;

use Dm3d\Buffer\Api\BufferClientInterface;
use Dm3d\Buffer\Controller\Adminhtml\Channel\Sync;
use Dm3d\Buffer\Model\Config;
use Magento\Backend\App\Action\Context;
use Magento\Backend\Model\Auth;
use Magento\Backend\Model\Session;
use Magento\Backend\Model\UrlInterface as BackendUrlInterface;
use Magento\Framework\App\ActionFlag;
use Magento\Framework\App\Config\Storage\WriterInterface;
use Magento\Framework\App\RequestInterface;
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
use Magento\Framework\Exception\LocalizedException;
use Magento\Framework\Locale\ResolverInterface;
use Magento\Framework\Message\ManagerInterface as MessageManagerInterface;
use Magento\Framework\ObjectManagerInterface;
use Magento\Framework\Serialize\Serializer\Json as JsonSerializer;
use Magento\Framework\UrlInterface;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;

class SyncTest extends TestCase
{
    private Context&MockObject $context;
    private BufferClientInterface&MockObject $bufferClient;
    private Config&MockObject $config;
    private JsonFactory&MockObject $jsonFactory;
    private JsonSerializer&MockObject $jsonSerializer;
    private WriterInterface&MockObject $configWriter;
    private Json&MockObject $jsonResult;
    private Sync $controller;

    protected function setUp(): void
    {
        $this->bufferClient  = $this->createMock(BufferClientInterface::class);
        $this->config        = $this->createMock(Config::class);
        $this->jsonFactory   = $this->createMock(JsonFactory::class);
        $this->jsonSerializer = $this->createMock(JsonSerializer::class);
        $this->configWriter  = $this->createMock(WriterInterface::class);
        $this->jsonResult    = $this->createMock(Json::class);

        $this->jsonFactory->method('create')->willReturn($this->jsonResult);

        $this->context = $this->buildContextMock();

        $this->controller = new Sync(
            $this->context,
            $this->bufferClient,
            $this->config,
            $this->jsonFactory,
            $this->jsonSerializer,
            $this->configWriter
        );
    }

    // -----------------------------------------------------------------------
    // Context builder
    // -----------------------------------------------------------------------

    private function buildContextMock(): Context&MockObject
    {
        $context = $this->createMock(Context::class);

        $context->method('getRequest')
            ->willReturn($this->createMock(RequestInterface::class));
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

    public function testShouldReturnSuccessJsonWithChannels(): void
    {
        $channels = [
            ['id' => 'ch1', 'name' => 'twitter', 'displayName' => 'Twitter', 'service' => 'twitter'],
            ['id' => 'ch2', 'name' => 'instagram', 'displayName' => 'Instagram', 'service' => 'instagram'],
        ];

        $this->config->method('isConfigured')->willReturn(true);
        $this->bufferClient->method('getOrganizationId')->willReturn('org_abc');
        $this->bufferClient->method('getChannels')->with('org_abc')->willReturn($channels);
        $this->jsonSerializer->method('serialize')->willReturn('[]');

        $this->jsonResult
            ->expects($this->once())
            ->method('setData')
            ->with(['success' => true, 'channels' => $channels])
            ->willReturnSelf();

        $result = $this->controller->execute();

        $this->assertSame($this->jsonResult, $result);
    }

    public function testShouldReturnErrorJsonWhenNotConfigured(): void
    {
        $this->config->method('isConfigured')->willReturn(false);

        $this->jsonResult
            ->expects($this->once())
            ->method('setData')
            ->with($this->callback(function (array $data): bool {
                return $data['success'] === false && isset($data['error']);
            }))
            ->willReturnSelf();

        $result = $this->controller->execute();

        $this->assertSame($this->jsonResult, $result);
    }

    public function testShouldReturnErrorJsonWhenClientThrows(): void
    {
        $this->config->method('isConfigured')->willReturn(true);
        $this->bufferClient
            ->method('getOrganizationId')
            ->willThrowException(new LocalizedException(__('Connection failed')));

        $this->jsonResult
            ->expects($this->once())
            ->method('setData')
            ->with($this->callback(function (array $data): bool {
                return $data['success'] === false && isset($data['error']);
            }))
            ->willReturnSelf();

        $result = $this->controller->execute();

        $this->assertSame($this->jsonResult, $result);
    }
}
