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

namespace Miyabara\MagentoAI\Model\Http;

use Magento\Framework\HTTP\Client\CurlFactory;
use Miyabara\MagentoAI\Api\Http\HttpClientInterface;
use Miyabara\MagentoAI\Model\Service\Exception\AiServiceException;

/**
 * Creates a fresh Curl instance per request to prevent auth-header bleeding across providers,
 * and retries on rate-limit (429) and service-unavailable (502/503) responses.
 */
class HttpClient implements HttpClientInterface
{
    /**
     * @param int
     */
    private const MAX_RETRIES = 2;

    /**
     * @param int[]
     */
    private const RETRYABLE_STATUS_CODES = [429, 502, 503];

    /**
     * @param CurlFactory $curlFactory
     */
    public function __construct(
        private readonly CurlFactory $curlFactory
    ) {}

    /**
     * Send a JSON POST request with automatic retry on transient failures.
     *
     * @param string               $url
     * @param string               $jsonPayload
     * @param array<string,string> $headers
     * @param int                  $timeout
     * @return array{status: int, body: string}
     * @throws AiServiceException
     */
    public function postJson(string $url, string $jsonPayload, array $headers, int $timeout = 30): array
    {
        return $this->executeWithRetry(function () use ($url, $jsonPayload, $headers, $timeout) {
            $curl = $this->curlFactory->create();
            $curl->setTimeout($timeout);
            $curl->setHeaders($headers);
            $curl->post($url, $jsonPayload);
            return ['status' => $curl->getStatus(), 'body' => $curl->getBody()];
        });
    }

    /**
     * Send a multipart POST request with automatic retry on transient failures.
     *
     * @param string               $url
     * @param array<string,mixed>  $fields
     * @param array<string,string> $headers
     * @param int                  $timeout
     * @return array{status: int, body: string}
     * @throws AiServiceException
     */
    public function postMultipart(string $url, array $fields, array $headers, int $timeout = 180): array
    {
        return $this->executeWithRetry(function () use ($url, $fields, $headers, $timeout) {
            $curl = $this->curlFactory->create();
            $curl->setTimeout($timeout);
            $curl->setHeaders($headers);
            $curl->setOption(CURLOPT_POSTFIELDS, $fields);
            $curl->post($url, '');
            return ['status' => $curl->getStatus(), 'body' => $curl->getBody()];
        });
    }

    /**
     * Execute $call up to MAX_RETRIES+1 times, sleeping with exponential backoff on retryable HTTP codes.
     *
     * @param callable $call Returns array{status: int, body: string}
     * @return array{status: int, body: string}
     * @throws AiServiceException
     */
    private function executeWithRetry(callable $call): array
    {
        $attempt = 0;

        do {
            try {
                $result = $call();
            } catch (\Exception $e) {
                throw new AiServiceException(__('HTTP request failed: %1', $e->getMessage()), $e);
            }

            if (!in_array($result['status'], self::RETRYABLE_STATUS_CODES, true) || $attempt >= self::MAX_RETRIES) {
                return $result;
            }

            // Exponential backoff: 1 s, 2 s
            // phpcs:ignore Magento2.Functions.DiscouragedFunction
            sleep(2 ** $attempt);
            $attempt++;
        } while (true);
    }
}
