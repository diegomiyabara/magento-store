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
use Miyabara\MagentoAI\Model\AttributeData\Formatter;
use Miyabara\MagentoAI\Model\Service\Exception\AiServiceException;
use Miyabara\MagentoAI\Model\Service\TextGeneration;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use Psr\Log\LoggerInterface;

class TextGenerationTest extends TestCase
{
    private HttpClientInterface&MockObject $httpClient;
    private ConfigInterface&MockObject     $config;
    private Formatter&MockObject           $formatter;
    private LoggerInterface&MockObject     $logger;
    private TextGeneration                 $service;

    protected function setUp(): void
    {
        $this->httpClient = $this->createMock(HttpClientInterface::class);
        $this->config     = $this->createMock(ConfigInterface::class);
        $this->formatter  = $this->createMock(Formatter::class);
        $this->logger     = $this->createMock(LoggerInterface::class);

        $this->service = new TextGeneration(
            $this->httpClient,
            new Json(),
            $this->config,
            $this->formatter,
            $this->logger,
        );
    }

    public function testGenerateFromAttributeDataWithOpenAiReturnsText(): void
    {
        $this->config->method('getProvider')->willReturn('openai');
        $this->config->method('getModel')->willReturn('gpt-4o');
        $this->config->method('getApiSecret')->willReturn('sk-test');
        $this->config->method('getApiBaseUrl')->willReturn('https://api.openai.com');
        $this->config->method('getTemperature')->willReturn(0.7);
        $this->config->method('getMaxTokens')->willReturn(500);
        $this->config->method('getDescriptionPrompt')->willReturn('Describe {{ product.name }}: {{ product.attributes }}');
        $this->config->method('getBaselinePrompt')->willReturn('');
        $this->formatter->method('buildLabelValueText')->willReturn('Color: Red');

        $this->httpClient->method('postJson')->willReturn([
            'status' => 200,
            'body'   => json_encode([
                'choices' => [['message' => ['content' => 'A red product.']]],
            ]),
        ]);

        $result = $this->service->generateFromAttributeData(['name' => 'Widget', 'color' => 'Red'], 'full');

        $this->assertSame('A red product.', $result);
    }

    public function testGenerateCustomContentWithAnthropicReturnsText(): void
    {
        $this->config->method('getProvider')->willReturn('anthropic');
        $this->config->method('getAnthropicModel')->willReturn('claude-sonnet-4-6');
        $this->config->method('getAnthropicApiSecret')->willReturn('sk-ant-test');
        $this->config->method('getAnthropicBaseUrl')->willReturn('https://api.anthropic.com');
        $this->config->method('getTemperature')->willReturn(0.5);
        $this->config->method('getBaselinePrompt')->willReturn('');

        $this->httpClient->method('postJson')->willReturn([
            'status' => 200,
            'body'   => json_encode([
                'content' => [['text' => 'Generated text from Anthropic.']],
            ]),
        ]);

        $result = $this->service->generateCustomContent('Write a poem.');

        $this->assertSame('Generated text from Anthropic.', $result);
    }

    public function testGenerateWithGeminiReturnsText(): void
    {
        $this->config->method('getProvider')->willReturn('gemini');
        $this->config->method('getGeminiModel')->willReturn('gemini-2.0-flash');
        $this->config->method('getGeminiApiSecret')->willReturn('gem-test');
        $this->config->method('getGeminiBaseUrl')->willReturn('https://generativelanguage.googleapis.com');
        $this->config->method('getTemperature')->willReturn(0.7);
        $this->config->method('getBaselinePrompt')->willReturn('');

        $this->httpClient->method('postJson')->willReturn([
            'status' => 200,
            'body'   => json_encode([
                'candidates' => [[
                    'finishReason' => 'STOP',
                    'content'      => ['parts' => [['text' => 'Gemini output.']]],
                ]],
            ]),
        ]);

        $result = $this->service->generateCustomContent('Hello');

        $this->assertSame('Gemini output.', $result);
    }

    public function testThrowsWhenOpenAiApiKeyIsMissing(): void
    {
        $this->config->method('getProvider')->willReturn('openai');
        $this->config->method('getApiSecret')->willReturn('');

        $this->expectException(AiServiceException::class);
        $this->expectExceptionMessageMatches('/API Key not found/');

        $this->service->generateCustomContent('test');
    }

    public function testThrowsOn401FromOpenAi(): void
    {
        $this->config->method('getProvider')->willReturn('openai');
        $this->config->method('getModel')->willReturn('gpt-4o');
        $this->config->method('getApiSecret')->willReturn('sk-bad');
        $this->config->method('getApiBaseUrl')->willReturn('https://api.openai.com');
        $this->config->method('getTemperature')->willReturn(0.7);
        $this->config->method('getBaselinePrompt')->willReturn('');

        $this->httpClient->method('postJson')->willReturn(['status' => 401, 'body' => '{"error":{"message":"Unauthorized"}}']);

        $this->expectException(AiServiceException::class);
        $this->expectExceptionMessageMatches('/Unauthorized/');

        $this->service->generateCustomContent('test');
    }

    public function testStripCodeFencesFromAnthropicOutput(): void
    {
        $this->config->method('getProvider')->willReturn('anthropic');
        $this->config->method('getAnthropicModel')->willReturn('claude-sonnet-4-6');
        $this->config->method('getAnthropicApiSecret')->willReturn('sk-ant');
        $this->config->method('getAnthropicBaseUrl')->willReturn('https://api.anthropic.com');
        $this->config->method('getTemperature')->willReturn(0.7);
        $this->config->method('getBaselinePrompt')->willReturn('');

        $this->httpClient->method('postJson')->willReturn([
            'status' => 200,
            'body'   => json_encode([
                'content' => [['text' => "```html\n<p>Content</p>\n```"]],
            ]),
        ]);

        $result = $this->service->generateCustomContent('test');

        $this->assertSame('<p>Content</p>', $result);
    }

    public function testGeminiSafetyFilterThrowsAiServiceException(): void
    {
        $this->config->method('getProvider')->willReturn('gemini');
        $this->config->method('getGeminiModel')->willReturn('gemini-2.0-flash');
        $this->config->method('getGeminiApiSecret')->willReturn('gem-key');
        $this->config->method('getGeminiBaseUrl')->willReturn('https://generativelanguage.googleapis.com');
        $this->config->method('getTemperature')->willReturn(0.7);
        $this->config->method('getBaselinePrompt')->willReturn('');

        $this->httpClient->method('postJson')->willReturn([
            'status' => 200,
            'body'   => json_encode([
                'candidates' => [['finishReason' => 'SAFETY', 'content' => ['parts' => [['text' => '']]]]],
            ]),
        ]);

        $this->expectException(AiServiceException::class);
        $this->expectExceptionMessageMatches('/safety filters/');

        $this->service->generateCustomContent('test');
    }

    public function testMaxTokensIsIncludedInPayloadWhenNotNull(): void
    {
        $this->config->method('getProvider')->willReturn('openai');
        $this->config->method('getModel')->willReturn('gpt-4o');
        $this->config->method('getApiSecret')->willReturn('sk-test');
        $this->config->method('getApiBaseUrl')->willReturn('https://api.openai.com');
        $this->config->method('getTemperature')->willReturn(0.7);
        $this->config->method('getMaxTokens')->willReturn(1000);
        $this->config->method('getDescriptionPrompt')->willReturn('{{ product.name }}');
        $this->config->method('getBaselinePrompt')->willReturn('');
        $this->formatter->method('buildLabelValueText')->willReturn('');

        $capturedPayload = null;
        $this->httpClient->method('postJson')
            ->willReturnCallback(function (string $url, string $payload) use (&$capturedPayload) {
                $capturedPayload = json_decode($payload, true);
                return ['status' => 200, 'body' => json_encode(['choices' => [['message' => ['content' => 'ok']]]])];
            });

        $this->service->generateFromAttributeData(['name' => 'X'], 'full');

        $this->assertArrayHasKey('max_tokens', $capturedPayload);
        $this->assertSame(1000, $capturedPayload['max_tokens']);
    }
}
