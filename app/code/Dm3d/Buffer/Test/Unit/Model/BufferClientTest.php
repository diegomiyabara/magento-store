<?php

declare(strict_types=1);

namespace Dm3d\Buffer\Test\Unit\Model;

use Dm3d\Buffer\Model\BufferClient;
use Dm3d\Buffer\Model\Config;
use Magento\Framework\Exception\LocalizedException;
use Magento\Framework\HTTP\Client\Curl;
use Magento\Framework\Serialize\Serializer\Json;
use PHPUnit\Framework\TestCase;

class BufferClientTest extends TestCase
{
    private Config $config;
    private Curl $curl;
    private Json $json;
    private BufferClient $client;

    protected function setUp(): void
    {
        $this->config = $this->createMock(Config::class);
        $this->curl   = $this->createMock(Curl::class);
        $this->json   = $this->createMock(Json::class);
        $this->client = new BufferClient($this->config, $this->curl, $this->json);
    }

    // -----------------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------------

    /**
     * Set up config and curl/json mocks for a successful HTTP call.
     *
     * @param array<string, mixed> $responseData Decoded response array
     */
    private function stubSuccessfulQuery(array $responseData): void
    {
        $this->config->method('isConfigured')->willReturn(true);
        $this->config->method('getApiKey')->willReturn('test_api_key');

        $serialized = '{"mocked":"json"}';
        $this->json->method('serialize')->willReturn($serialized);

        $this->curl->method('getStatus')->willReturn(200);
        $this->curl->method('getBody')->willReturn($serialized);

        $this->json->method('unserialize')->willReturn($responseData);
    }

    // -----------------------------------------------------------------------
    // getOrganizationId
    // -----------------------------------------------------------------------

    public function testGetOrganizationIdReturnsFirstOrgId(): void
    {
        $this->stubSuccessfulQuery([
            'data' => [
                'account' => [
                    'organizations' => [
                        ['id' => 'org_abc', 'name' => 'Test Org'],
                    ],
                ],
            ],
        ]);

        $this->assertSame('org_abc', $this->client->getOrganizationId());
    }

    public function testGetOrganizationIdThrowsWhenNoOrgsFound(): void
    {
        $this->stubSuccessfulQuery([
            'data' => [
                'account' => [
                    'organizations' => [],
                ],
            ],
        ]);

        $this->expectException(LocalizedException::class);
        $this->client->getOrganizationId();
    }

    // -----------------------------------------------------------------------
    // getChannels
    // -----------------------------------------------------------------------

    public function testGetChannelsReturnsChannelArray(): void
    {
        $channels = [
            ['id' => 'ch1', 'name' => 'twitter', 'displayName' => 'Twitter', 'service' => 'twitter'],
            ['id' => 'ch2', 'name' => 'instagram', 'displayName' => 'Instagram', 'service' => 'instagram'],
        ];

        $this->stubSuccessfulQuery([
            'data' => ['channels' => $channels],
        ]);

        $this->assertSame($channels, $this->client->getChannels('org_abc'));
    }

    // -----------------------------------------------------------------------
    // createPost
    // -----------------------------------------------------------------------

    public function testCreatePostQueuesPostSuccessfully(): void
    {
        $post = ['id' => 'post_1', 'text' => 'Hello', 'dueAt' => null, 'status' => 'queued'];

        $this->stubSuccessfulQuery([
            'data' => [
                'createPost' => [
                    'post' => $post,
                ],
            ],
        ]);

        $result = $this->client->createPost('ch1', 'Hello', null, 'addToQueue', null);
        $this->assertSame($post, $result);
    }

    public function testCreatePostThrowsOnMutationError(): void
    {
        $this->stubSuccessfulQuery([
            'data' => [
                'createPost' => [
                    'message' => 'Channel not found',
                ],
            ],
        ]);

        $this->expectException(LocalizedException::class);
        $this->client->createPost('bad_ch', 'Hello', null, 'addToQueue', null);
    }

    // -----------------------------------------------------------------------
    // query() — indirect via getOrganizationId / createPost
    // -----------------------------------------------------------------------

    public function testQueryThrowsWhenNotConfigured(): void
    {
        $this->config->method('isConfigured')->willReturn(false);

        $this->expectException(LocalizedException::class);
        $this->client->getOrganizationId();
    }

    public function testQueryThrowsWhenCurlStatusNot200(): void
    {
        $this->config->method('isConfigured')->willReturn(true);
        $this->config->method('getApiKey')->willReturn('test_api_key');

        $this->json->method('serialize')->willReturn('{"query":"...","variables":{}}');
        $this->curl->method('getStatus')->willReturn(401);

        $this->expectException(LocalizedException::class);
        $this->client->getOrganizationId();
    }
}
