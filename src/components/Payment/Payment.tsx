import React, { useEffect, useState } from "react";
// import { loadStripe } from "@stripe/stripe-js";
import { Button } from 'react-bootstrap';

//TODO remove
const stripePromise = loadStripe(
  "pk_test_51I6N5ZIIRKr1p7dQOGhRRigwIMqgZ3XnoBdbfezFNFgLiR9iaW2YzkRP9kAADCzxSOnqLeqKDVxglDh5uxvY28Dn00vAZR7wQ9"
);

interface Props {
  googleId: string
}
const PAYMENT_METHOD = "https://play.google.com/billing";


function Payment(props: Props) {

  let [message, _setMessage] = useState('');

  let [productListJsx, setProductListJsx] = useState([]);

  const setMessage = (newMessage: string) => {
    if (message !== newMessage) {
      message = newMessage;
      _setMessage(message);
    }
  }

  const log = (msg: string) => {
    let newString = message + '\n' + msg;
    setMessage(newString);
  }

  const googleId = () => {
    return localStorage.getItem('googleId');
  }

  const getDigitalGoodsService = async () => {
    if (!('getDigitalGoodsService' in window)) {
      throw 'getDigitalGoodsService not found';
    }
    return (window as any).getDigitalGoodsService(PAYMENT_METHOD);
  }

  const getProducts = async () => {
    try {
      const service = await getDigitalGoodsService();
      if (service) {
        return await service.getDetails(['premium_30', 'premium_1']);
      }
    } catch (e) {
      log(e);
      return [];
    }
  }

  const getProductsJsx = async () => {
    const products = await getProducts();
    log('rendering list');
    log(`got a list with ${products.length} items`)
    setProductListJsx(products.map(product => {
      log(JSON.stringify(product));
      return <li>{product.title}</li>;
    }))
  }

  const checkPaymentPossible = (): boolean => {
    if (!window.PaymentRequest) {
      log("No PaymentRequest object.");
      return false;
    }
    if (!('getDigitalGoodsService' in window)) {
      log('DigitalGoodsService not found');
      return false;
    }
    return true;
  }

  const paymentMethod = () => {
    return [{
      supportedMethods: "https://play.google.com/billing",
      data: {
        sku: 'premium_1',
      }
    }];
  }

  const paymentDetails = () => {
    return {
      total: {
        label: `Total`,
        amount: { currency: `USD`, value: `3` }
      }
    }
  }

  const pay = async () => {
    log('going to pay..')
    const request = new PaymentRequest(paymentMethod(), paymentDetails());
    try {
      log('showing payment request')
      const paymentResponse = await request.show();
      log('got payment response')
      log(JSON.stringify(paymentResponse))
      const { token } = paymentResponse.details;
      log(`purchaseToken: ${token}`)

      const service = await getDigitalGoodsService();

      // Call backend to validate the purchase.
      // if (validatePurchaseOnBackend(purchaseToken)) {
      if (true) {
        // Acknowledge using the Digital Goods API. Use ‘onetime’ for items
        // that can only be purchased once and ‘repeatable for items
        // that can be purchased multiple times.
        await service.acknowledge(token, 'onetime');

        // Optional: tell the PaymentRequest API the validation was
        // successful. The user-agent may show a "payment successful"
        // message to the user.
        log('completing payment..')
        const paymentComplete = await paymentResponse.complete('success');
        log('payment completed')
      } else {
        // Optional: tell the PaymentRequest API the validation failed. The
        // user agent may show a message to the user.
        log('payent failed due to validation reasons')
        const paymentComplete = await paymentResponse.complete('fail');
      }
    } catch (e) {
      // The purchase failed, and we can handle the failure here. AbortError
      // usually means a user cancellation
      log('error occured')
      log(JSON.stringify(e));
    }
  }

  const onPay = () => {

    let paymentPossible = checkPaymentPossible()

    if (paymentPossible) {
      log('payment is possible')
      pay()
    } else {
      log('dont know how to pay..')
    }
    api.pay(stripePromise, props.googleId)

  }

  const clearMessages = () => {
    setMessage('');
  }

  useEffect(() => { getProductsJsx() }, []);

  return (
    <div>
      <Button className="btn-success" onClick={onPay}>
        Buy Premium
    </Button>
      <Button className="btn-success" onClick={clearMessages}>
        Clear Messages
    </Button>
      <li>
        {productListJsx}
      </li>
      <pre>
        {message}
      </pre>
    </div>
  )
}

export default Payment;