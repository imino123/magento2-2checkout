define(
    [
        'jquery',
        'Magento_Checkout/js/view/payment/default',
        'Tco_Checkout/js/action/set-billing-address',
        'Tco_Checkout/js/action/set-payment-method',
        'Magento_Checkout/js/action/select-payment-method',
        'Magento_Checkout/js/model/payment/additional-validators',
        'Magento_Checkout/js/model/quote'
    ],
    function ($, Component, setBillingAddressAction, setPaymentMethodAction, selectPaymentMethodAction, additionalValidators, quote) {
        'use strict';
        return Component.extend({
            defaults: {
                template: 'Tco_Checkout/payment/tco'
            },

            continueTo2Checkout: function () {
                if (this.validate() && additionalValidators.validate()) {
                    this.selectPaymentMethod();
                    var setBillingInfo = setBillingAddressAction();
                    setBillingInfo.done(function() {
                        setPaymentMethodAction();
                    });
                    return false;
                }
            }
        });
    }
);
