<?php
/**
 * Miyabara_MagentoAI
 *
 * @vendor    Miyabara
 * @package   MagentoAI
 *
 * @copyright © 2026 Diego M. Miyabara. All rights reserved.
 * @author    Diego M. Miyabara <diego.miyabara@hotmail.com>
 */

declare(strict_types=1);

namespace Miyabara\MagentoAI\ViewModel;

use Magento\Framework\Serialize\Serializer\Json;
use Magento\Framework\UrlInterface;
use Magento\Framework\View\Element\Block\ArgumentInterface;
use Miyabara\MagentoAI\Api\ConfigInterface;

class GenerateModal implements ArgumentInterface
{
    /**
     * @param ConfigInterface $config
     * @param UrlInterface    $urlBuilder
     * @param Json            $json
     */
    public function __construct(
        private readonly ConfigInterface $config,
        private readonly UrlInterface $urlBuilder,
        private readonly Json $json
    ) {}

    /**
     * Returns true when the module is enabled.
     *
     * @return bool
     */
    public function isEnabled(): bool
    {
        return $this->config->isEnabled();
    }

    /**
     * Returns the AJAX URL for text generation.
     *
     * @return string
     */
    public function getGenerateUrl(): string
    {
        return $this->urlBuilder->getUrl('miyabara_mageai/ai/generate');
    }

    /**
     * Returns the AJAX URL for image generation.
     *
     * @return string
     */
    public function getGenerateImageUrl(): string
    {
        return $this->urlBuilder->getUrl('miyabara_mageai/ai/generateimage');
    }

    /**
     * Returns the AJAX URL for image modification.
     *
     * @return string
     */
    public function getModifyImageUrl(): string
    {
        return $this->urlBuilder->getUrl('miyabara_mageai/ai/modifyimage');
    }

    /**
     * Returns JSON-encoded array of product attribute codes for text generation.
     *
     * @return string
     */
    public function getProductAttributesJson(): string
    {
        return $this->json->serialize($this->config->getProductAttributes());
    }

    /**
     * Returns JSON-encoded array of product attribute codes for image generation.
     *
     * @return string
     */
    public function getImageAttributesJson(): string
    {
        return $this->json->serialize($this->config->getImageAttributes());
    }
}
