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

use Magento\Framework\App\Config\ScopeConfigInterface;
use Magento\Framework\Encryption\EncryptorInterface;

class Config
{
    /**
     * @param string
     */
    private const XML_PATH_API_KEY = 'miyabara_buffer/general/api_key';

    /**
     * @param string
     */
    private const XML_PATH_CHANNELS_DATA = 'miyabara_buffer/channels/data';

    /**
     * @param ScopeConfigInterface $scopeConfig
     * @param EncryptorInterface   $encryptor
     */
    public function __construct(
        private readonly ScopeConfigInterface $scopeConfig,
        private readonly EncryptorInterface $encryptor
    ) {}

    /**
     * Returns the decrypted Buffer API key from Magento configuration.
     *
     * @return string
     */
    public function getApiKey(): string
    {
        $encrypted = (string) $this->scopeConfig->getValue(self::XML_PATH_API_KEY);
        return $encrypted ? $this->encryptor->decrypt($encrypted) : '';
    }

    /**
     * Returns true if the Buffer API key is set and non-empty.
     *
     * @return bool
     */
    public function isConfigured(): bool
    {
        return $this->getApiKey() !== '';
    }

    /**
     * Returns the raw JSON string of saved channel data from Magento configuration.
     *
     * @return string
     */
    public function getChannelsData(): string
    {
        return (string) $this->scopeConfig->getValue(self::XML_PATH_CHANNELS_DATA);
    }
}
