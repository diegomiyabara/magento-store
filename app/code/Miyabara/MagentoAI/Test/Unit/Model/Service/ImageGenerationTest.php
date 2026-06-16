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
use Miyabara\MagentoAI\Model\Service\ImageGeneration;
use Miyabara\MagentoAI\Model\Service\ImageStorage;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use Psr\Log\LoggerInterface;

class ImageGenerationTest extends TestCase
{
    private HttpClientInterface&MockObject $httpClient;
    private ConfigInterface&MockObject     $config;
    private ImageStorage&MockObject        $imageStorage;
    private LoggerInterface&MockObject     $logger;
    private ImageGeneration                $service;

    protected function setUp(): void
    {
        $this->httpClient   = $this->createMock(HttpClientInterface::class);
        $this->config       = $this->createMock(ConfigInterface::class);
        $this->imageStorage = $this->createMock(ImageStorage::class);
        $this->logger       = $this->createMock(LoggerInterface::class);

        $this->service = new ImageGeneration(
            $this->httpClient,
            new Json(),
            $this->config,
            $this->imageStorage,
            $this->logger,
        );
    }

    public function testGenerateWithOpenAiBase64ReturnsGalleryData(): void
    {
        $this->config->method('getProvider')->willReturn('openai');
        $this->config->method('getApiSecret')->willReturn('sk-test');
        $this->config->method('getApiBaseUrl')->willReturn('https://api.openai.com');
        $this->config->method('getImageModel')->willReturn('gpt-image-1');
        $this->config->method('getImageSize')->willReturn('1024x1024');
        $this->config->method('getImageQuality')->willReturn('standard');

        $fakeBase64 = base64_encode('fake-image-binary');

        $this->httpClient->method('postJson')->willReturn([
            'status' => 200,
            'body'   => json_encode(['data' => [['b64_json' => $fakeBase64]]]),
        ]);

        $expected = ['file' => '/m/a/mageai_abc.jpg.tmp', 'url' => 'http://...', 'name' => 'mageai_abc.jpg', 'size' => 17, 'type' => 'image/jpeg'];
        $this->imageStorage->method('persist')->willReturn($expected);

        $result = $this->service->generate('A red widget');

        $this->assertSame($expected, $result);
    }

    public function testGenerateWithOpenAiUrlFallbackDownloadsAndPersists(): void
    {
        $this->config->method('getProvider')->willReturn('openai');
        $this->config->method('getApiSecret')->willReturn('sk-test');
        $this->config->method('getApiBaseUrl')->willReturn('https://api.openai.com');
        $this->config->method('getImageModel')->willReturn('dall-e-3');
        $this->config->method('getImageSize')->willReturn('1024x1024');
        $this->config->method('getImageQuality')->willReturn('hd');

        $this->httpClient->method('postJson')->willReturn([
            'status' => 200,
            'body'   => json_encode(['data' => [['url' => 'https://cdn.openai.com/img.jpg']]]),
        ]);

        $this->imageStorage->method('download')->willReturn('binary-data');
        $expected = ['file' => '/m/a/img.jpg.tmp', 'url' => 'http://...', 'name' => 'img.jpg', 'size' => 11, 'type' => 'image/jpeg'];
        $this->imageStorage->method('persist')->willReturn($expected);

        $result = $this->service->generate('product photo');

        $this->assertSame($expected, $result);
    }

    public function testGenerateWithGeminiInlineDataReturnsGalleryData(): void
    {
        $this->config->method('getProvider')->willReturn('gemini');
        $this->config->method('getGeminiApiSecret')->willReturn('gem-key');
        $this->config->method('getGeminiBaseUrl')->willReturn('https://generativelanguage.googleapis.com');
        $this->config->method('getGeminiImageModel')->willReturn('gemini-2.0-flash-preview-image-generation');

        $fakeBase64 = base64_encode('img-data');

        $this->httpClient->method('postJson')->willReturn([
            'status' => 200,
            'body'   => json_encode([
                'candidates' => [[
                    'finishReason' => 'STOP',
                    'content'      => ['parts' => [
                        ['text' => 'Here is your image'],
                        ['inlineData' => ['mimeType' => 'image/png', 'data' => $fakeBase64]],
                    ]],
                ]],
            ]),
        ]);

        $expected = ['file' => '/m/a/out.png.tmp', 'url' => 'http://...', 'name' => 'out.png', 'size' => 8, 'type' => 'image/png'];
        $this->imageStorage->method('persist')->willReturn($expected);

        $result = $this->service->generate('Product image');

        $this->assertSame($expected, $result);
    }

    public function testThrowsWhenAnthropicIsSelectedForImageGeneration(): void
    {
        $this->config->method('getProvider')->willReturn('anthropic');

        $this->expectException(AiServiceException::class);
        $this->expectExceptionMessageMatches('/Anthropic provider/');

        $this->service->generate('test');
    }

    public function testThrowsWhenOpenAiApiKeyIsMissing(): void
    {
        $this->config->method('getProvider')->willReturn('openai');
        $this->config->method('getApiSecret')->willReturn('');

        $this->expectException(AiServiceException::class);
        $this->expectExceptionMessageMatches('/API Key not found/');

        $this->service->generate('test');
    }

    public function testThrowsWhenGeminiReturnsSafetyBlock(): void
    {
        $this->config->method('getProvider')->willReturn('gemini');
        $this->config->method('getGeminiApiSecret')->willReturn('gem-key');
        $this->config->method('getGeminiBaseUrl')->willReturn('https://generativelanguage.googleapis.com');
        $this->config->method('getGeminiImageModel')->willReturn('gemini-image');

        $this->httpClient->method('postJson')->willReturn([
            'status' => 200,
            'body'   => json_encode([
                'candidates' => [['finishReason' => 'IMAGE_SAFETY', 'content' => ['parts' => []]]],
            ]),
        ]);

        $this->expectException(AiServiceException::class);
        $this->expectExceptionMessageMatches('/safety filters/');

        $this->service->generate('test');
    }
}
