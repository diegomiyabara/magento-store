<?php

declare(strict_types=1);

namespace Miyabara\CartItemSelection\Test\Unit;

use PHPUnit\Framework\TestCase;

class ModuleScaffoldTest extends TestCase
{
    private string $moduleDir = __DIR__ . '/../../';

    public function testItRegistersTheModuleWithTheCorrectModuleNameMiyabaraCartItemSelection(): void
    {
        $registrationFile = $this->moduleDir . 'registration.php';

        $this->assertFileExists($registrationFile);

        $content = file_get_contents($registrationFile);

        $this->assertStringContainsString(
            "ComponentRegistrar::register(ComponentRegistrar::MODULE, 'Miyabara_CartItemSelection', __DIR__)",
            $content,
        );
    }

    public function testItAddsIsActiveColumnAsTinyint1NotNullDefault1ToQuoteItemTableInDbSchema(): void
    {
        $dbSchemaFile = $this->moduleDir . 'db_schema.xml';

        $this->assertFileExists($dbSchemaFile);

        $xml = simplexml_load_file($dbSchemaFile);

        $this->assertNotFalse($xml, 'db_schema.xml must be valid XML');

        $tableNode = null;

        foreach ($xml->table as $table) {
            if ((string) $table['name'] === 'quote_item') {
                $tableNode = $table;
                break;
            }
        }

        $this->assertNotNull($tableNode, 'quote_item table must be declared in db_schema.xml');

        $columnNode = null;

        foreach ($tableNode->column as $column) {
            if ((string) $column['name'] === 'is_active') {
                $columnNode = $column;
                break;
            }
        }

        $this->assertNotNull($columnNode, 'is_active column must exist in quote_item table');

        $xsiAttrs = $columnNode->attributes('http://www.w3.org/2001/XMLSchema-instance');

        $this->assertEquals('tinyint', (string) $xsiAttrs['type']);
        $this->assertEquals('false', (string) $columnNode['nullable']);
        $this->assertEquals('1', (string) $columnNode['default']);
    }

    public function testItCreatesDbSchemaWhitelistEntryForTheIsActiveColumn(): void
    {
        $whitelistFile = $this->moduleDir . 'etc/db_schema_whitelist.json';

        $this->assertFileExists($whitelistFile);

        $content = file_get_contents($whitelistFile);
        $whitelist = json_decode($content, true);

        $this->assertIsArray($whitelist, 'db_schema_whitelist.json must be valid JSON');
        $this->assertArrayHasKey('quote_item', $whitelist, 'quote_item key must exist in whitelist');
        $this->assertArrayHasKey('column', $whitelist['quote_item'], 'column key must exist under quote_item');
        $this->assertArrayHasKey('is_active', $whitelist['quote_item']['column'], 'is_active must exist in column');
        $this->assertTrue($whitelist['quote_item']['column']['is_active'], 'is_active value must be true');
    }

    public function testItDeclaresModuleWithSequenceDependenciesOnMagentoQuoteMagentoGraphQlAndMagentoQuoteGraphQl(): void
    {
        $moduleXml = $this->moduleDir . 'etc/module.xml';

        $this->assertFileExists($moduleXml);

        $xml = simplexml_load_file($moduleXml);

        $this->assertNotFalse($xml, 'module.xml must be valid XML');

        $moduleNode = $xml->module;

        $this->assertEquals('Miyabara_CartItemSelection', (string) $moduleNode['name']);

        $sequenceModules = [];

        foreach ($moduleNode->sequence->module as $mod) {
            $sequenceModules[] = (string) $mod['name'];
        }

        $this->assertContains('Magento_Quote', $sequenceModules);
        $this->assertContains('Magento_GraphQl', $sequenceModules);
        $this->assertContains('Magento_QuoteGraphQl', $sequenceModules);
    }
}
