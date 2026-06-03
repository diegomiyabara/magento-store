<?php

declare(strict_types=1);

namespace Miyabara\Buffer\Model;

use Miyabara\Buffer\Api\BufferClientInterface;
use Magento\Framework\Exception\LocalizedException;
use Magento\Framework\HTTP\Client\Curl;
use Magento\Framework\Serialize\Serializer\Json;

class BufferClient implements BufferClientInterface
{
    private const ENDPOINT = 'https://api.buffer.com';

    public function __construct(
        private readonly Config $config,
        private readonly Curl $curl,
        private readonly Json $json
    ) {}

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
