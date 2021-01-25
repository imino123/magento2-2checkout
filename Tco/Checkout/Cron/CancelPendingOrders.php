<?php

namespace Tco\Checkout\Cron;
 
class CancelPendingOrders
{
    const PAYMENT_METHOD = 'tco_checkout';

    protected $_orderCollectionFactory;
    protected $_stdTimezone;
    protected $_scopeConfig;
    protected $_logger;

    public function __construct(
        \Magento\Sales\Model\ResourceModel\Order\CollectionFactory $orderCollectionFactory,
        \Magento\Framework\Stdlib\DateTime\Timezone $stdTimezone,
        \Magento\Framework\App\Config\ScopeConfigInterface $scopeConfig,
        \Psr\Log\LoggerInterface $logger
    ) {
        $this->_orderCollectionFactory = $orderCollectionFactory;
        $this->_stdTimezone = $stdTimezone;
        $this->_scopeConfig = $scopeConfig;
        $this->_logger = $logger;
    }

    public function execute() {
        $this->_logger->info("Cancel pending orders - starting cron");
        if (!$this->_scopeConfig->getValue('payment/tco_checkout/cancel_pending_orders', \Magento\Store\Model\ScopeInterface::SCOPE_STORE)) {
            $this->_logger->info("Cancel pending orders is disabled - stopping cron");
            return;
        }
        $durationInSec = 3600; // 1h
        $currentTime = $this->_stdTimezone->date(time() - $durationInSec)
            ->format('Y-m-d H:i:s');

        $orders = $this->_orderCollectionFactory
            ->create()
            ->addAttributeToSelect('*')
            ->addFieldToFilter('created_at', ['lt' => $currentTime])
            ->addFieldToFilter('status', ['eq'=> 'pending']);

        $orders->getSelect();

        foreach($orders as $order){
            if ($order->getPayment()->getMethod() == $this::PAYMENT_METHOD) {
                $order->addStatusHistoryComment('Order has been canceled automatically', \Magento\Sales\Model\Order::STATE_CANCELED)
                    ->setIsVisibleOnFront(true)
                    ->setIsCustomerNotified(false);
                $order->cancel();
                $order->save();
            }
        }

        $this->_logger->info("Cancel pending orders completed - stopping cron");

        return $this;
    }
}
