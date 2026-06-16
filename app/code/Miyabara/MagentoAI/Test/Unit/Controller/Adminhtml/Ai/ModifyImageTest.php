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

namespace Miyabara\MagentoAI\Test\Unit\Controller\Adminhtml\Ai;

use Magento\Backend\App\Action\Context;
use Magento\Framework\App\RequestInterface;
use Magento\Framework\Controller\Result\Json;
use Magento\Framework\Controller\Result\JsonFactory;
use Miyabara\MagentoAI\Api\ConfigInterface;
use Miyabara\MagentoAI\Api\ImageModificationServiceInterface;
use Miyabara\MagentoAI\Controller\Adminhtml\Ai\ModifyImage;
use Miyabara\MagentoAI\Model\AttributeData\Formatter;
use Miyabara\MagentoAI\Model\Service\Exception\AiServiceException;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use Psr\Log\LoggerInterface;

class ModifyImageTest extends TestCase
{
    private ConfigInterface&MockObject                   $config;
    private ImageModificationServiceInterface&MockObject $modifyService;
    private Formatter&MockObject                         $formatter;
    private Json&MockObject                              $jsonResult;
    private JsonFactory&MockObject                       $jsonFactory;
    private RequestInterface&MockObject                  $request;
    private LoggerInterface&MockObject                   $logger;
    private ModifyImage                                  $controller;

    protected function setUp(): void
    {
        $this->config        = $this->createMock(ConfigInterface::class);
        $this->modifyService = $this->createMock(ImageModificationServiceInterface::class);
        $this->formatter     = $this->createMock(Formatter::class);
        $this->jsonResult    = $this->createMock(Json::class);
        $this->jsonFactory   = $this->createMock(JsonFactory::class);
        $this->request       = $this->createMock(RequestInterface::class);
        $this->logger        = $this->createMock(LoggerInterface::class);

        $context = $this->createMock(Context::class);
        $context->method('getRequest')->willReturn($this->request);

        $this->jsonFactory->method('create')->willReturn($this->jsonResult);
        $this->jsonResult->method('setData')->willReturnSelf();

        $this->controller = new ModifyImage(
            $context,
            $this->jsonFactory,
            $this->config,
            $this->modifyService,
            $this->formatter,
            $this->logger,
        );
    }

    public function testExecuteInterpolatesInstructionsIntoModifyPromptTemplate(): void
    {
        $this->config->method('isEnabled')->willReturn(true);
        $this->config->method('getModifyImagePrompt')
            ->willReturn('Modify {{ product.name }} image: {{ instructions }}');

        $this->request->method('getParam')
            ->willReturnMap([
                ['custom_prompt', null, 'Add white background'],
                ['image_file', null, '/m/a/product.jpg'],
                ['product_name', null, 'Blue Widget'],
                ['attribute_data', [], []],
            ]);

        $this->formatter->method('buildLabelValueText')->willReturn('');

        $expectedPrompt = 'Modify Blue Widget image: Add white background';
        $this->modifyService->expects($this->once())
            ->method('modify')
            ->with($expectedPrompt, '/m/a/product.jpg')
            ->willReturn(['file' => '/m/a/new.jpg.tmp', 'url' => 'http://...', 'name' => 'new.jpg', 'size' => 100, 'type' => 'image/jpeg']);

        $this->controller->execute();
    }

    public function testExecuteUsesConfigTemplateWhenNoInstructionsProvided(): void
    {
        $this->config->method('isEnabled')->willReturn(true);
        $this->config->method('getModifyImagePrompt')
            ->willReturn('Professional product photo with white background');

        $this->request->method('getParam')
            ->willReturnMap([
                ['custom_prompt', null, ''],
                ['image_file', null, '/m/a/product.jpg'],
                ['product_name', null, ''],
                ['attribute_data', [], []],
            ]);

        $this->formatter->method('buildLabelValueText')->willReturn('');

        $this->modifyService->expects($this->once())
            ->method('modify')
            ->with('Professional product photo with white background', '/m/a/product.jpg');

        $this->controller->execute();
    }

    public function testExecuteLogsAndReturnsErrorOnAiServiceException(): void
    {
        $this->config->method('isEnabled')->willReturn(true);
        $this->config->method('getModifyImagePrompt')->willReturn('{{ instructions }}');

        $this->request->method('getParam')
            ->willReturnMap([
                ['custom_prompt', null, 'test'],
                ['image_file', null, '/m/a/img.jpg'],
                ['product_name', null, ''],
                ['attribute_data', [], []],
            ]);

        $this->formatter->method('buildLabelValueText')->willReturn('');
        $this->modifyService->method('modify')
            ->willThrowException(new AiServiceException(__('Provider error')));

        $this->logger->expects($this->once())->method('error');

        $this->jsonResult->expects($this->once())
            ->method('setData')
            ->with($this->callback(fn ($d) => $d['error'] === true));

        $this->controller->execute();
    }
}
