import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Pay() {
  const [currency, setCurrency] = useState("INR");
  const [receiptId, setReceiptId] = useState("order_receipt_123"); // Change to your actual receipt logic

  function loadRazorpayScript(src) {
    return new Promise((resolve) => {
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  }
// Handle payment process
  const handlePayment = async () => {
    console.log("Initiating payment ");
    
    const res = await loadRazorpayScript(
      "https://checkout.razorpay.com/v1/checkout.js"
    );

    try {
      // Create order on your server
      const response = await fetch("http://localhost:5001/order", {
        method: "POST",
        body: JSON.stringify({
          amount: 1000 * 100, // Convert to paisa
          currency,
          receipt: receiptId,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const order = await response.json();
      console.log("Order received from server:", order);

      // Razorpay payment options
      const options = {
        key: "rzp_test_RREPD8PGJzogfo",
        amount: 500,
        currency,
        name: "Acme Corp",
        description: "Wallet Recharge",
        image: "https://example.com/your_logo",
        order_id: order.id,
        handler: async function (response) {
          try {
            console.log("Hello")
            const validateRes = await fetch(
              "http://localhost:5001/order/validate",
              {
                method: "POST",
                body: JSON.stringify(response),
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );
            const validate = await validateRes.json();
            if (validate.msg === "Payment Successful") {
              //send success message to seller and initiate token transfer from seller
              console.log("Payment verified successfully");
            
              if (updateResponse.status === 200) {
                console.log("Amount paid successfully");
              } else {
                console.log("Error updating wallet.", "error");
              }
            } else {
              console.log("Payment verification failed.", "error");
            }
          } catch (error) {
            console.log("An error occurred while processing payment.", "error");
          }
        },
        prefill: {
          name: "John Doe",
          email: "wagvah",
          contact: "999999999",
        },
        theme: {
          color: "#4F46E5",
        },
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.on("payment.failed", function (response) {
        console.error("Payment failed:", response);
      });
      rzp1.open();
    } catch (error) {
      console.error("Error initiating payment:", error);
      console.log("An error occurred while processing the payment.", "error");
    }
  };

  return (
    <div className="container mt-20">
      <button className="btn btn-primary" onClick={handlePayment}>Pay</button>
    </div>
  );
}

export default Pay;
