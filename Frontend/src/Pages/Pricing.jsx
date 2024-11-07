import React from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Check } from "lucide-react";
import axios from "axios";
import { useToast } from "../Context/ToastContext";

const Pricing = ({ loggedIn }) => {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubscribe = async (plan) => {
    const userData = JSON.parse(localStorage.getItem("userData"));
    if (!userData) {
      navigate("/loginrequired");
      return;
    }

    const amount = plan === "Free" ? 0 : 999;

    try {
      const orderResponse = await axios.post(
        "http://localhost:4000/api/payment/razorpay/order",
        {
          amount: plan === "Free" ? 0 : 999,
          userId: userData._id,
        }
      );

      const { id: order_id, currency } = orderResponse.data;

      const options = {
        key: "rzp_test_byaETqKXP2gHMM",
        amount: amount,
        currency,
        name: "Midland Real-Estate",
        description: "Test Transaction",
        order_id,
        handler: async function (response) {
          const paymentData = {
            order_id,
            payment_id: response.razorpay_payment_id,
            signature: response.razorpay_signature,
            userId: userData._id,
          };

          await axios.post(
            "http://localhost:4000/api/payment/razorpay/verify",
            paymentData
          );
          console.log("Payment Successful!");
        },
        prefill: {
          name: userData.name,
          email: userData.email,
          contact: "1234567890",
        },
        notes: {
          address: "Your Address",
        },
        theme: {
          color: "#F37254",
        },
      };

      if (typeof window.Razorpay === "function") {
        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
      } else {
        console.error("Razorpay SDK not loaded.");
      }
    } catch (error) {
      showToast(
        error.response?.data?.message || "Error processing subscription"
      );
    }
  };

  const plans = [
    {
      name: "Pro",
      price: "999",
      duration: "month",
      features: [
        "All Free features",
        "View property overview",
        "View amenities",
        "Priority support",
        "Detailed analytics",
        "Virtual tours",
        "Custom branding",
        "API access",
        "Advanced analytics",
        "Unlimited listings",
      ],
    },
  ];

  return (
    <div className="flex justify-center mt-12 items-center min-h-screen">
      <div className="max-w-7xl w-full px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-lg text-gray-600">
            Get access to exclusive property details and features
          </p>
        </div>

        <div className="grid grid-cols-1  md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-bold text-gray-900">{plan.name}</h2>
                <Shield className="text-red-500" size={20} />
              </div>
              <div className="mb-4">
                <span className="text-3xl font-bold">₹{plan.price}</span>
                <span className="text-gray-600">/{plan.duration}</span>
              </div>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center">
                    <Check className="text-green-500 mr-2" size={16} />
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleSubscribe(plan.name)}
                className="w-full py-2 px-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-300 text-sm"
              >
                {plan.price === "0" ? "Get Started" : "Subscribe Now"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Pricing;
