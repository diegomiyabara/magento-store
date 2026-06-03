<?php

declare(strict_types=1);

namespace Miyabara\Buffer\Model;

use Magento\Framework\App\Config\ScopeConfigInterface;
use Magento\Framework\Encryption\EncryptorInterface;

class Config
{
    private const XML_PATH_API_KEY       = 'miyabara_buffer/general/api_key';
    private const XML_PATH_CHANNELS_DATA = 'miyabara_buffer/channels/data';

    public function __construct(
        private readonly ScopeConfigInterface $scopeConfig,
        private readonly EncryptorInterface $encryptor
    ) {}

    public function getApiKey(): string
    {
        $encrypted = (string) $this->scopeConfig->getValue(self::XML_PATH_API_KEY);
        return $encrypted ? $this->encryptor->decrypt($encrypted) : '';
    }

    public function isConfigured(): bool
    {
        return $this->getApiKey() !== '';
    }

    public function getChannelsData(): string
    {
        return (string) $this->scopeConfig->getValue(self::XML_PATH_CHANNELS_DATA);
    }
}
