<?php

declare(strict_types=1);

namespace Dm3d\Buffer\Test\Unit\Model;

use Dm3d\Buffer\Model\Config;
use Magento\Framework\App\Config\ScopeConfigInterface;
use Magento\Framework\Encryption\EncryptorInterface;
use PHPUnit\Framework\TestCase;

class ConfigTest extends TestCase
{
    private ScopeConfigInterface $scopeConfig;
    private EncryptorInterface $encryptor;
    private Config $config;

    protected function setUp(): void
    {
        $this->scopeConfig = $this->createMock(ScopeConfigInterface::class);
        $this->encryptor   = $this->createMock(EncryptorInterface::class);
        $this->config      = new Config($this->scopeConfig, $this->encryptor);
    }

    public function testShouldReturnDecryptedApiKeyWhenConfigured(): void
    {
        $this->scopeConfig
            ->method('getValue')
            ->with('dm3d_buffer/general/api_key')
            ->willReturn('encrypted_value');

        $this->encryptor
            ->method('decrypt')
            ->with('encrypted_value')
            ->willReturn('my_plain_api_key');

        $this->assertSame('my_plain_api_key', $this->config->getApiKey());
    }

    public function testShouldReturnEmptyStringWhenApiKeyNotSet(): void
    {
        $this->scopeConfig
            ->method('getValue')
            ->with('dm3d_buffer/general/api_key')
            ->willReturn(null);

        $this->assertSame('', $this->config->getApiKey());
    }

    public function testIsConfiguredReturnsTrueWhenApiKeyPresent(): void
    {
        $this->scopeConfig
            ->method('getValue')
            ->with('dm3d_buffer/general/api_key')
            ->willReturn('encrypted_value');

        $this->encryptor
            ->method('decrypt')
            ->willReturn('my_plain_api_key');

        $this->assertTrue($this->config->isConfigured());
    }

    public function testIsConfiguredReturnsFalseWhenApiKeyEmpty(): void
    {
        $this->scopeConfig
            ->method('getValue')
            ->with('dm3d_buffer/general/api_key')
            ->willReturn(null);

        $this->assertFalse($this->config->isConfigured());
    }

    public function testGetChannelsDataReturnsConfigValue(): void
    {
        $this->scopeConfig
            ->method('getValue')
            ->with('dm3d_buffer/channels/data')
            ->willReturn('{"channel1":"id1"}');

        $this->assertSame('{"channel1":"id1"}', $this->config->getChannelsData());
    }
}
