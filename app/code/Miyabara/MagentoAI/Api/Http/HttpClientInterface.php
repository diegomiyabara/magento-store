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

namespace Miyabara\MagentoAI\Api\Http;

use Miyabara\MagentoAI\Model\Service\Exception\AiServiceException;

/**
 * Thin HTTP abstraction that creates a fresh Curl per call and retries on transient failures.
 */
interface HttpClientInterface
{
    /**
     * Send a JSON POST request and return ['status' => int, 'body' => string].
     * Retries automatically on 429 and 503 with exponential backoff.
     *
     * @param string               $url
     * @param string               $jsonPayload Serialized JSON string
     * @param array<string,string> $headers
     * @param int                  $timeout     Seconds
     * @return array{status: int, body: string}
     * @throws AiServiceException
     */
    public function postJson(string $url, string $jsonPayload, array $headers, int $timeout = 30): array;

    /**
     * Send a multipart/form-data POST request and return ['status' => int, 'body' => string].
     * Used for endpoints that require file uploads (e.g., OpenAI image edits).
     *
     * @param string               $url
     * @param array<string,mixed>  $fields CURLOPT_POSTFIELDS-compatible array (may include CURLFile)
     * @param array<string,string> $headers
     * @param int                  $timeout Seconds
     * @return array{status: int, body: string}
     * @throws AiServiceException
     */
    public function postMultipart(string $url, array $fields, array $headers, int $timeout = 180): array;
}
