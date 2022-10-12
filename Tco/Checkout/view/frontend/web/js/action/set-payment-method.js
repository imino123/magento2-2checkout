define(
    [
        'jquery',
        'Magento_Checkout/js/model/quote',
        'Magento_Customer/js/customer-data',
        'Magento_Checkout/js/model/url-builder',
        'mage/storage',
        'Magento_Checkout/js/model/error-processor',
        'Magento_Customer/js/model/customer',
        'Magento_Checkout/js/model/full-screen-loader',
        'TwoCoInlineCart'
    ],
    function ($, quote, customerData, urlBuilder, storage, errorProcessor, customer, fullScreenLoader, TwoCoInlineCart) {
        'use strict';

        return function (messageContainer) {

            var serviceUrl,
                email;

            if (!customer.isLoggedIn()) {
                email = quote.guestEmail;
            } else {
                email = customer.customerData.email;
            }

            serviceUrl = window.checkoutConfig.payment.tco_checkout.redirectUrl+'?email='+email;
            fullScreenLoader.startLoader();

            $.ajax({
                url: serviceUrl,
                type: 'post',
                context: this,
                data: {isAjax: 1},
                dataType: 'json',
                success: function (response) {
                    if ($.type(response) === 'object' && !$.isEmptyObject(response)) {
                        $('#tco_payment_form').remove();
                        var data = response.fields;
                        if(response.inline && response.inline == 1) {
                            TwoCoInlineCart.setup.setConfig('cart', {'host': response.url, 'customization': data.customization});
                            TwoCoInlineCart.setup.setMerchant(data.merchant);
                            TwoCoInlineCart.setup.setMode(data.mode);
                            TwoCoInlineCart.register();

                            TwoCoInlineCart.cart.setAutoAdvance(true);
                            TwoCoInlineCart.cart.setLanguage(data.language);
                            TwoCoInlineCart.cart.setCurrency(data.currency);
                            TwoCoInlineCart.cart.setTest(data.test);
                            TwoCoInlineCart.cart.setOrderExternalRef(data['order-ext-ref']);
                            TwoCoInlineCart.cart.setExternalCustomerReference(data['customer-ext-ref']);
                            TwoCoInlineCart.cart.setSource(data.src);
                            TwoCoInlineCart.cart.setReturnMethod(data['return-method']);
                            TwoCoInlineCart.products.removeAll();
                            TwoCoInlineCart.products.addMany(data.products);
                            TwoCoInlineCart.billing.setData(data.billing_address);
                            TwoCoInlineCart.billing.setCompanyName(data['company-name']);
                            TwoCoInlineCart.shipping.setData(data.shipping_address);
                            TwoCoInlineCart.cart.setSignature(data.signature);
                            fullScreenLoader.stopLoader();
                            TwoCoInlineCart.cart.checkout();
                        }
                        else {
                            if (response.method == "GET") {
                                window.location.replace(response.url + $.param(data));
                            }
                            fullScreenLoader.stopLoader();
                        }
                    } else {
                        fullScreenLoader.stopLoader();
                        alert($.mage.__('Sorry, something went wrong. Please try again.'));
                    }
                },
                error: function (response) {
                    fullScreenLoader.stopLoader();
                    alert($.mage.__('Sorry, something went wrong. Please try again later.'));
                }
            });
        };
    }
);
