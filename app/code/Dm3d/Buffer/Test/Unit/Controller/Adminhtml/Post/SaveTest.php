<?php

declare(strict_types=1);

namespace Dm3d\Buffer\Test\Unit\Controller\Adminhtml\Post;

use Dm3d\Buffer\Api\BufferClientInterface;
use Dm3d\Buffer\Controller\Adminhtml\Post\Save;
use Dm3d\Buffer\Model\Config;
use Magento\Backend\App\Action\Context;
use Magento\Backend\Model\Auth;
use Magento\Backend\Model\Session;
use Magento\Backend\Model\UrlInterface as BackendUrlInterface;
use Magento\Backend\Model\View\Result\Redirect;
use Magento\Backend\Model\View\Result\RedirectFactory;
use Magento\Framework\App\ActionFlag;
use Magento\Framework\App\Request\Http as HttpRequest;
use Magento\Framework\App\Response\RedirectInterface;
use Magento\Framework\App\ResponseInterface;
use Magento\Framework\App\ViewInterface;
use Magento\Framework\AuthorizationInterface;
use Magento\Framework\Controller\Result\RedirectFactory as FrameworkRedirectFactory;
use Magento\Framework\Controller\ResultFactory;
use Magento\Framework\Data\Form\FormKey\Validator as FormKeyValidator;
use Magento\Framework\Event\ManagerInterface as EventManagerInterface;
use Magento\Framework\Exception\LocalizedException;
use Magento\Framework\Locale\ResolverInterface;
use Magento\Framework\Message\ManagerInterface as MessageManagerInterface;
use Magento\Framework\ObjectManagerInterface;
use Magento\Framework\UrlInterface;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;

class SaveTest extends TestCase
{
    private Context&MockObject $context;
    private HttpRequest&MockObject $request;
    private MessageManagerInterface&MockObject $messageManager;
    private BufferClientInterface&MockObject $bufferClient;
    private Config&MockObject $config;
    private RedirectFactory&MockObject $redirectFactory;
    private Redirect&MockObject $redirect;
    private Save $controller;

    protected function setUp(): void
    {
        $this->request        = $this->createMock(HttpRequest::class);
        $this->messageManager = $this->createMock(MessageManagerInterface::class);
        $this->bufferClient   = $this->createMock(BufferClientInterface::class);
        $this->config         = $this->createMock(Config::class);
        $this->redirectFactory = $this->createMock(RedirectFactory::class);
        $this->redirect       = $this->createMock(Redirect::class);

        $this->redirectFactory->method('create')->willReturn($this->redirect);
        $this->redirect->method('setPath')->willReturnSelf();

        $this->context = $this->buildContextMock();

        $this->controller = new Save(
            $this->context,
            $this->bufferClient,
            $this->config,
            $this->redirectFactory
        );
    }

    // -----------------------------------------------------------------------
    // Context builder
    // -----------------------------------------------------------------------

    private function buildContextMock(): Context&MockObject
    {
        $context = $this->createMock(Context::class);

        $context->method('getRequest')->willReturn($this->request);
        $context->method('getMessageManager')->willReturn($this->messageManager);

        // Stubs needed by Action::__construct chain
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

        // Backend-specific stubs
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

    public function testShouldRedirectWhenRequestIsNotPost(): void
    {
        $this->request->method('isPost')->willReturn(false);

        $result = $this->controller->execute();

        $this->assertSame($this->redirect, $result);
    }

    public function testShouldAddErrorWhenTextIsEmpty(): void
    {
        $this->request->method('isPost')->willReturn(true);
        $this->request->method('getParam')->willReturnMap([
            ['post_text', null, ''],
            ['image_url', null, null],
            ['channel_ids', [], ['ch1']],
            ['scheduling_mode', null, 'addToQueue'],
            ['due_at', null, null],
        ]);

        $this->messageManager
            ->expects($this->once())
            ->method('addErrorMessage');

        $this->controller->execute();
    }

    public function testShouldAddErrorWhenNoChannelsSelected(): void
    {
        $this->request->method('isPost')->willReturn(true);
        $this->request->method('getParam')->willReturnMap([
            ['post_text', null, 'Some text'],
            ['image_url', null, null],
            ['channel_ids', [], []],
            ['scheduling_mode', null, 'addToQueue'],
            ['due_at', null, null],
        ]);

        $this->messageManager
            ->expects($this->once())
            ->method('addErrorMessage');

        $this->controller->execute();
    }

    public function testShouldAddErrorWhenBufferNotConfigured(): void
    {
        $this->request->method('isPost')->willReturn(true);
        $this->request->method('getParam')->willReturnMap([
            ['post_text', null, 'Some text'],
            ['image_url', null, null],
            ['channel_ids', [], ['ch1']],
            ['scheduling_mode', null, 'addToQueue'],
            ['due_at', null, null],
        ]);

        $this->config->method('isConfigured')->willReturn(false);

        $this->messageManager
            ->expects($this->once())
            ->method('addErrorMessage');

        $this->controller->execute();
    }

    public function testShouldAddSuccessMessageWhenPostCreatedSuccessfully(): void
    {
        $this->request->method('isPost')->willReturn(true);
        $this->request->method('getParam')->willReturnMap([
            ['post_text', null, 'Hello World'],
            ['image_url', null, null],
            ['channel_ids', [], ['ch1']],
            ['scheduling_mode', null, 'addToQueue'],
            ['due_at', null, null],
        ]);

        $this->config->method('isConfigured')->willReturn(true);
        $this->bufferClient->method('createPost')->willReturn([
            'id'     => 'post_1',
            'text'   => 'Hello World',
            'dueAt'  => null,
            'status' => 'queued',
        ]);

        $this->messageManager
            ->expects($this->once())
            ->method('addSuccessMessage');

        $this->controller->execute();
    }

    public function testShouldAddErrorMessageWhenBufferClientThrows(): void
    {
        $this->request->method('isPost')->willReturn(true);
        $this->request->method('getParam')->willReturnMap([
            ['post_text', null, 'Hello World'],
            ['image_url', null, null],
            ['channel_ids', [], ['ch1']],
            ['scheduling_mode', null, 'addToQueue'],
            ['due_at', null, null],
        ]);

        $this->config->method('isConfigured')->willReturn(true);
        $this->bufferClient
            ->method('createPost')
            ->willThrowException(new LocalizedException(__('API error')));

        $this->messageManager
            ->expects($this->once())
            ->method('addErrorMessage');

        $this->controller->execute();
    }
}
