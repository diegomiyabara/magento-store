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

namespace Miyabara\MagentoAI\Test\Unit\Model\Http;

use Magento\Framework\HTTP\Client\Curl;
use Magento\Framework\HTTP\Client\CurlFactory;
use Miyabara\MagentoAI\Model\Http\HttpClient;
use Miyabara\MagentoAI\Model\Service\Exception\AiServiceException;
use PHPUnit\Framework\TestCase;

class HttpClientTest extends TestCase
{
    private CurlFactory $curlFactory;
    private HttpClient $httpClient;

    protected function setUp(): void
    {
        $this->curlFactory = $this->createMock(CurlFactory::class);
        $this->httpClient  = new HttpClient($this->curlFactory);
    }

    public function testPostJsonReturnsStatusAndBody(): void
    {
        $curl = $this->createMock(Curl::class);
        $curl->method('getStatus')->willReturn(200);
        $curl->method('getBody')->willReturn('{"ok":true}');

        $this->curlFactory->method('create')->willReturn($curl);

        $result = $this->httpClient->postJson('https://api.test/v1', '{}', []);

        $this->assertSame(200, $result['status']);
        $this->assertSame('{"ok":true}', $result['body']);
    }

    public function testPostJsonRetriesOnRateLimitAndEventuallyReturnsSuccess(): void
    {
        $curlFail    = $this->createMock(Curl::class);
        $curlSuccess = $this->createMock(Curl::class);

        $curlFail->method('getStatus')->willReturn(429);
        $curlFail->method('getBody')->willReturn('{"error":"rate limit"}');

        $curlSuccess->method('getStatus')->willReturn(200);
        $curlSuccess->method('getBody')->willReturn('{"ok":true}');

        // First call returns 429, second returns 200
        $this->curlFactory->method('create')->willReturnOnConsecutiveCalls($curlFail, $curlSuccess);

        // Override sleep so the test does not actually wait
        $result = $this->httpClient->postJson('https://api.test/v1', '{}', []);

        $this->assertSame(200, $result['status']);
    }

    public function testPostJsonExhaustsRetriesAndReturnsLastResponse(): void
    {
        $curl = $this->createMock(Curl::class);
        $curl->method('getStatus')->willReturn(429);
        $curl->method('getBody')->willReturn('{"error":"rate limit"}');

        // MAX_RETRIES = 2, so 3 total attempts
        $this->curlFactory->method('create')->willReturn($curl);

        $result = $this->httpClient->postJson('https://api.test/v1', '{}', []);

        $this->assertSame(429, $result['status']);
    }

    public function testPostJsonThrowsOnCurlException(): void
    {
        $curl = $this->createMock(Curl::class);
        $curl->method('post')->willThrowException(new \Exception('Connection refused'));

        $this->curlFactory->method('create')->willReturn($curl);

        $this->expectException(AiServiceException::class);
        $this->expectExceptionMessageMatches('/Connection refused/');

        $this->httpClient->postJson('https://api.test/v1', '{}', []);
    }

    public function testPostMultipartReturnsStatusAndBody(): void
    {
        $curl = $this->createMock(Curl::class);
        $curl->method('getStatus')->willReturn(200);
        $curl->method('getBody')->willReturn('{"data":[]}');

        $this->curlFactory->method('create')->willReturn($curl);

        $result = $this->httpClient->postMultipart('https://api.test/upload', ['field' => 'value'], []);

        $this->assertSame(200, $result['status']);
        $this->assertSame('{"data":[]}', $result['body']);
    }
}
