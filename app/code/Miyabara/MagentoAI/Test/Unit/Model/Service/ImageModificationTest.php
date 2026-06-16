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

namespace Miyabara\MagentoAI\Test\Unit\Model\Service;

use Magento\Framework\Serialize\Serializer\Json;
use Miyabara\MagentoAI\Api\ConfigInterface;
use Miyabara\MagentoAI\Api\Http\HttpClientInterface;
use Miyabara\MagentoAI\Model\Service\Exception\AiServiceException;
use Miyabara\MagentoAI\Model\Service\ImageModification;
use Miyabara\MagentoAI\Model\Service\ImageStorage;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use Psr\Log\LoggerInterface;

class ImageModificationTest extends TestCase
{
    private ConfigInterface&MockObject     $config;
    private ImageStorage&MockObject        $imageStorage;
    private HttpClientInterface&MockObject $httpClient;
    private LoggerInterface&MockObject     $logger;
    private ImageModification              $service;

    protected function setUp(): void
    {
        $this->config       = $this->createMock(ConfigInterface::class);
        $this->imageStorage = $this->createMock(ImageStorage::class);
        $this->httpClient   = $this->createMock(HttpClientInterface::class);
        $this->logger       = $this->createMock(LoggerInterface::class);

        $this->service = new ImageModification(
            new Json(),
            $this->config,
            $this->imageStorage,
            $this->httpClient,
            $this->logger,
        );
    }

    public function testModifyWithOpenAiReturnsGalleryData(): void
    {
        $this->config->method('getProvider')->willReturn('openai');
        $this->config->method('getApiSecret')->willReturn('sk-test');
        $this->config->method('getApiBaseUrl')->willReturn('https://api.openai.com');
        $this->config->method('getImageModel')->willReturn('gpt-image-1');
        $this->config->method('getImageSize')->willReturn('1024x1024');
        $this->config->method('getImageQuality')->willReturn('standard');

        $original = ['data' => 'binary', 'mimeType' => 'image/jpeg', 'ext' => 'jpg'];
        $this->imageStorage->method('readOriginal')->willReturn($original);
        $this->imageStorage->method('writeTempFile')->willReturn([
            'path'         => 'tmp/mageai_src_abc.jpg',
            'absolutePath' => '/var/www/html/pub/media/tmp/mageai_src_abc.jpg',
        ]);
        $this->imageStorage->expects($this->once())->method('removeTempFile');

        $fakeBase64 = base64_encode('modified-image');
        $this->httpClient->method('postMultipart')->willReturn([
            'status' => 200,
            'body'   => json_encode(['data' => [['b64_json' => $fakeBase64]]]),
        ]);

        $expected = ['file' => '/m/a/modified.jpg.tmp', 'url' => 'http://...', 'name' => 'modified.jpg', 'size' => 14, 'type' => 'image/jpeg'];
        $this->imageStorage->method('persist')->willReturn($expected);

        $result = $this->service->modify('Add white background', '/m/a/product.jpg');

        $this->assertSame($expected, $result);
    }

    public function testModifyWithOpenAiRemovesTempFileOnException(): void
    {
        $this->config->method('getProvider')->willReturn('openai');
        $this->config->method('getApiSecret')->willReturn('sk-test');
        $this->config->method('getApiBaseUrl')->willReturn('https://api.openai.com');
        $this->config->method('getImageModel')->willReturn('gpt-image-1');
        $this->config->method('getImageSize')->willReturn('1024x1024');
        $this->config->method('getImageQuality')->willReturn('standard');

        $original = ['data' => 'binary', 'mimeType' => 'image/jpeg', 'ext' => 'jpg'];
        $this->imageStorage->method('readOriginal')->willReturn($original);
        $this->imageStorage->method('writeTempFile')->willReturn([
            'path'         => 'tmp/mageai_src.jpg',
            'absolutePath' => '/path/tmp/mageai_src.jpg',
        ]);
        // The finally block must run even when the HTTP call throws
        $this->imageStorage->expects($this->once())->method('removeTempFile');
        $this->httpClient->method('postMultipart')->willThrowException(new AiServiceException(__('HTTP error')));

        $this->expectException(AiServiceException::class);

        $this->service->modify('Remove background', '/m/a/product.jpg');
    }

    public function testModifyWithGeminiReturnsGalleryData(): void
    {
        $this->config->method('getProvider')->willReturn('gemini');
        $this->config->method('getGeminiApiSecret')->willReturn('gem-key');
        $this->config->method('getGeminiBaseUrl')->willReturn('https://generativelanguage.googleapis.com');
        $this->config->method('getGeminiImageModel')->willReturn('gemini-image');

        $original = ['data' => 'binary', 'mimeType' => 'image/png', 'ext' => 'png'];
        $this->imageStorage->method('readOriginal')->willReturn($original);

        $fakeBase64 = base64_encode('modified-img');
        $this->httpClient->method('postJson')->willReturn([
            'status' => 200,
            'body'   => json_encode([
                'candidates' => [[
                    'finishReason' => 'STOP',
                    'content'      => ['parts' => [
                        ['inline_data' => ['mime_type' => 'image/png', 'data' => $fakeBase64]],
                    ]],
                ]],
            ]),
        ]);

        $expected = ['file' => '/m/a/mod.png.tmp', 'url' => 'http://...', 'name' => 'mod.png', 'size' => 12, 'type' => 'image/png'];
        $this->imageStorage->method('persist')->willReturn($expected);

        $result = $this->service->modify('Change background', '/m/a/original.png');

        $this->assertSame($expected, $result);
    }

    public function testThrowsWhenAnthropicIsSelectedForImageModification(): void
    {
        $this->config->method('getProvider')->willReturn('anthropic');
        $this->imageStorage->method('readOriginal')->willReturn([
            'data' => 'bin', 'mimeType' => 'image/jpeg', 'ext' => 'jpg',
        ]);

        $this->expectException(AiServiceException::class);
        $this->expectExceptionMessageMatches('/Anthropic provider/');

        $this->service->modify('test', '/m/a/img.jpg');
    }
}
