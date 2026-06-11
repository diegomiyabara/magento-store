<?php
/**
 * Miyabara_Buffer
 *
 * @vendor    Miyabara
 * @package   Buffer
 *
 * @copyright © 2026 Diego M. Miyabara. All rights reserved.
 * @author    Diego M. Miyabara <diego.miyabara@hotmail.com>
 */

declare(strict_types=1);

namespace Miyabara\Buffer\Model;

use Miyabara\Buffer\Api\BufferClientInterface;
use Magento\Framework\Exception\LocalizedException;
use Magento\Framework\HTTP\Client\Curl;
use Magento\Framework\Serialize\Serializer\Json;

class BufferClient implements BufferClientInterface
{
    /**
     * @param string
     */
    private const ENDPOINT = 'https://api.buffer.com';

    /**
     * @param Config $config
     * @param Curl   $curl
     * @param Json   $json
     */
    public function __construct(
        private readonly Config $config,
        private readonly Curl $curl,
        private readonly Json $json
    ) {}

    /**
     * Returns the first organization ID associated with the Buffer account.
     *
     * @return string
     */
    public function getOrganizationId(): string
    {
        $gql = 'query { account { organizations { id name } } }';
        $data = $this->query($gql, []);

        $orgs = $data['data']['account']['organizations'] ?? [];
        if (empty($orgs)) {
            throw new LocalizedException(__('No Buffer organizations found for this API key.'));
        }

        return (string) $orgs[0]['id'];
    }

    /**
     * Returns all channels for the given organization.
     *
     * @param string $organizationId
     * @return array<int, array<string, string>>
     */
    public function getChannels(string $organizationId): array
    {
        $gql = <<<'GQL'
query GetChannels($orgId: String!) {
  channels(input: { organizationId: $orgId }) {
    id
    name
    displayName
    service
    avatar
  }
}
GQL;
        $data = $this->query($gql, ['orgId' => $organizationId]);

        return $data['data']['channels'] ?? [];
    }

    /**
     * Creates a post in Buffer for the given channel.
     *
     * @param string      $channelId
     * @param string      $text
     * @param string|null $imageUrl
     * @param string      $mode
     * @param string|null $dueAt
     * @return array{id: string, text: string, dueAt: string|null, status: string}
     */
    public function createPost(
        string $channelId,
        string $text,
        ?string $imageUrl,
        string $mode,
        ?string $dueAt
    ): array {
        $gql = <<<'GQL'
mutation CreatePost($input: CreatePostInput!) {
  createPost(input: $input) {
    ... on PostActionSuccess {
      post { id text dueAt status }
    }
    ... on MutationError {
      message
    }
  }
}
GQL;
        $input = [
            'channelId'      => $channelId,
            'text'           => $text,
            'schedulingType' => 'automatic',
            'mode'           => $mode,
        ];

        if ($imageUrl !== null && $imageUrl !== '') {
            $input['assets'] = [['image' => ['url' => $imageUrl]]];
        }

        if ($mode === 'customScheduled' && $dueAt !== null) {
            $input['dueAt'] = $dueAt;
        }

        $data = $this->query($gql, ['input' => $input]);

        $result = $data['data']['createPost'] ?? [];

        if (isset($result['message'])) {
            throw new LocalizedException(__('Buffer API error: %1', $result['message']));
        }

        return $result['post'] ?? [];
    }

    /**
     * Execute a GraphQL request against the Buffer API and return the decoded response.
     *
     * @param string               $gql
     * @param array<string, mixed> $variables
     * @return array<string, mixed>
     */
    private function query(string $gql, array $variables): array
    {
        if (!$this->config->isConfigured()) {
            throw new LocalizedException(__('Buffer API key is not configured.'));
        }

        $this->curl->setHeaders([
            'Authorization' => 'Bearer ' . $this->config->getApiKey(),
            'Content-Type'  => 'application/json',
        ]);
        $this->curl->setTimeout(30);

        $body = $this->json->serialize(['query' => $gql, 'variables' => $variables]);
        $this->curl->post(self::ENDPOINT, $body);

        $status = $this->curl->getStatus();
        if ($status !== 200) {
            throw new LocalizedException(
                __('Buffer API returned HTTP %1. Check your API key.', $status)
            );
        }

        $response = $this->json->unserialize($this->curl->getBody());

        if (!empty($response['errors'])) {
            $message = $response['errors'][0]['message'] ?? 'Unknown error';
            throw new LocalizedException(__('Buffer API error: %1', $message));
        }

        return $response;
    }
}
