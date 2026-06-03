<?php

declare(strict_types=1);

namespace Miyabara\Buffer\Api;

interface BufferClientInterface
{
    /**
     * Returns the first organization ID associated with the account.
     */
    public function getOrganizationId(): string;

    /**
     * Returns channels for the given organization.
     * Each item: ['id' => string, 'name' => string, 'displayName' => string, 'service' => string]
     *
     * @return array<int, array<string, string>>
     */
    public function getChannels(string $organizationId): array;

    /**
     * Creates a post in Buffer for the given channel.
     *
     * @param string      $channelId    Buffer channel ID
     * @param string      $text         Post body text
     * @param string|null $imageUrl     Publicly accessible image URL (optional)
     * @param string      $mode         'addToQueue' or 'customScheduled'
     * @param string|null $dueAt        ISO 8601 UTC datetime, required when mode is customScheduled
     * @return array{id: string, text: string, dueAt: string|null, status: string}
     */
    public function createPost(
        string $channelId,
        string $text,
        ?string $imageUrl,
        string $mode,
        ?string $dueAt
    ): array;
}
