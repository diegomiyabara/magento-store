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
use Miyabara\MagentoAI\Api\TextGenerationServiceInterface;
use Miyabara\MagentoAI\Controller\Adminhtml\Ai\Generate;
use Miyabara\MagentoAI\Model\Service\Exception\AiServiceException;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use Psr\Log\LoggerInterface;

class GenerateTest extends TestCase
{
    private ConfigInterface&MockObject                $config;
    private TextGenerationServiceInterface&MockObject $textService;
    private JsonFactory&MockObject                    $jsonFactory;
    private Json&MockObject                           $jsonResult;
    private RequestInterface&MockObject               $request;
    private LoggerInterface&MockObject                $logger;
    private Generate                                  $controller;

    protected function setUp(): void
    {
        $this->config      = $this->createMock(ConfigInterface::class);
        $this->textService = $this->createMock(TextGenerationServiceInterface::class);
        $this->jsonResult  = $this->createMock(Json::class);
        $this->jsonFactory = $this->createMock(JsonFactory::class);
        $this->request     = $this->createMock(RequestInterface::class);
        $this->logger      = $this->createMock(LoggerInterface::class);

        $context = $this->createMock(Context::class);
        $context->method('getRequest')->willReturn($this->request);

        $this->jsonFactory->method('create')->willReturn($this->jsonResult);
        $this->jsonResult->method('setData')->willReturnSelf();

        $this->controller = new Generate(
            $context,
            $this->jsonFactory,
            $this->config,
            $this->textService,
            $this->logger,
        );
    }

    public function testExecuteGeneratesFromAttributeDataWhenCustomPromptIsFalse(): void
    {
        $this->config->method('isEnabled')->willReturn(true);
        $this->request->method('getParam')
            ->willReturnMap([
                ['custom_prompt', null, 'false'],
                ['attribute_data', [], ['name' => 'Widget']],
                ['type', 'full', 'full'],
            ]);

        $this->textService->expects($this->once())
            ->method('generateFromAttributeData')
            ->with(['name' => 'Widget'], 'full')
            ->willReturn('Generated description.');

        $this->jsonResult->expects($this->once())
            ->method('setData')
            ->with(['error' => false, 'data' => 'Generated description.']);

        $this->controller->execute();
    }

    public function testExecuteUsesCustomPromptWhenProvided(): void
    {
        $this->config->method('isEnabled')->willReturn(true);
        $this->request->method('getParam')
            ->willReturnMap([
                ['custom_prompt', null, 'Write about blue widgets'],
            ]);

        $this->textService->expects($this->once())
            ->method('generateCustomContent')
            ->with('Write about blue widgets')
            ->willReturn('Custom output.');

        $this->jsonResult->expects($this->once())
            ->method('setData')
            ->with(['error' => false, 'data' => 'Custom output.']);

        $this->controller->execute();
    }

    public function testExecuteReturnsErrorWhenModuleIsDisabled(): void
    {
        $this->config->method('isEnabled')->willReturn(false);
        $this->textService->expects($this->never())->method('generateFromAttributeData');
        $this->textService->expects($this->never())->method('generateCustomContent');

        $this->jsonResult->expects($this->once())
            ->method('setData')
            ->with($this->arrayHasKey('error'));

        $this->controller->execute();
    }

    public function testExecuteLogsAndReturnsErrorOnAiServiceException(): void
    {
        $this->config->method('isEnabled')->willReturn(true);
        $this->request->method('getParam')
            ->willReturnMap([['custom_prompt', null, 'fail']]);

        $this->textService->method('generateCustomContent')
            ->willThrowException(new AiServiceException(__('API down')));

        $this->logger->expects($this->once())->method('error');

        $this->jsonResult->expects($this->once())
            ->method('setData')
            ->with($this->callback(fn ($d) => $d['error'] === true));

        $this->controller->execute();
    }

    public function testExecuteReturnsValidationErrorWhenAttributeDataIsEmpty(): void
    {
        $this->config->method('isEnabled')->willReturn(true);
        $this->request->method('getParam')
            ->willReturnMap([
                ['custom_prompt', null, 'false'],
                ['attribute_data', [], []],
            ]);

        $this->jsonResult->expects($this->once())
            ->method('setData')
            ->with($this->callback(fn ($d) => $d['error'] === true));

        $this->controller->execute();
    }
}
