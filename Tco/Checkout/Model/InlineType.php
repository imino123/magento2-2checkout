<?php

namespace Tco\Checkout\Model;

/**
 * @api
 * @since 100.0.2
 */
class InlineType implements \Magento\Framework\Option\ArrayInterface
{
	/**
	 * @return array|array[]
	 */
	public function toOptionArray()
	{
		return [['value' => 'inline-one-step', 'label' => __('One step inline')], ['value' => 'inline', 'label' => __('Multi step inline')]];
	}

	/**
	 * @return array
	 */
	public function toArray()
	{
		return ['inline-one-step' => __('One step inline'), 'inline' => __('Multi step inline')];
	}
}
