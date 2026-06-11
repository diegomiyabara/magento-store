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

namespace Miyabara\MagentoAI\Model\AttributeData;

use Magento\Eav\Model\Config as EavConfig;

/**
 * Builds human-readable "Label: Value" text from raw product attribute form data.
 * Shared by the description and image generation prompt builders.
 */
class Formatter
{
    /**
     * @param EavConfig $eavConfig
     */
    public function __construct(
        private readonly EavConfig $eavConfig
    ) {}

    /**
     * Build a comma-separated "Label: Value" string from a code => value map.
     * Entries with an empty or null value are skipped.
     *
     * @param array<string, string> $data ['attributeCode' => 'displayValue', ...]
     * @return string
     */
    public function buildLabelValueText(array $data): string
    {
        $parts = [];
        foreach ($data as $code => $value) {
            if ($value === null || $value === '') {
                continue;
            }
            $parts[] = $this->resolveAttributeLabel((string) $code) . ': ' . $value;
        }
        return implode(', ', $parts);
    }

    /**
     * Resolve a catalog_product attribute code to its frontend label.
     * Falls back to a humanised version of the code when not found.
     *
     * @param string $code
     * @return string
     */
    public function resolveAttributeLabel(string $code): string
    {
        try {
            $attribute = $this->eavConfig->getAttribute('catalog_product', $code);
            if ($attribute && $attribute->getAttributeId()) {
                return $attribute->getDefaultFrontendLabel() ?: $this->humanizeCode($code);
            }
        } catch (\Exception $e) {
            return $this->humanizeCode($code);
        }
        return $this->humanizeCode($code);
    }

    /**
     * Convert an attribute code to a human-readable label (e.g. short_description → Short Description).
     *
     * @param string $code
     * @return string
     */
    private function humanizeCode(string $code): string
    {
        return ucwords(str_replace('_', ' ', $code));
    }
}
