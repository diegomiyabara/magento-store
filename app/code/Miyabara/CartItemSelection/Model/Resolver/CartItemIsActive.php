<?php

declare(strict_types=1);

namespace Miyabara\CartItemSelection\Model\Resolver;

use Magento\Framework\GraphQl\Config\Element\Field;
use Magento\Framework\GraphQl\Exception\GraphQlInputException;
use Magento\Framework\GraphQl\Query\ResolverInterface;
use Magento\Framework\GraphQl\Schema\Type\ResolveInfo;

class CartItemIsActive implements ResolverInterface
{
    /**
     * @param Field $field
     * @param mixed $context
     * @param ResolveInfo $info
     * @param array|null $value
     * @param array|null $args
     * @return bool
     * @throws GraphQlInputException
     */
    public function resolve(Field $field, $context, ResolveInfo $info, ?array $value = null, ?array $args = null): bool
    {
        if (!isset($value['model'])) {
            throw new GraphQlInputException(__('Missing cart item model in resolver value.'));
        }

        return (bool) ($value['model']->getData('is_active') ?? 1);
    }
}
