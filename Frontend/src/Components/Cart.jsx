import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { X, Trash2, ShoppingCart } from "lucide-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useToast } from "../Context/ToastContext";

const Cart = ({ isOpen, onClose }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const backdropRef = useRef(null);
  const panelRef = useRef(null);
  const headerRef = useRef(null);
  const itemsRef = useRef(null);
  const footerRef = useRef(null);

  const { showToast } = useToast();

  useGSAP(() => {
    if (isOpen) {
      // Opening animations
      gsap.fromTo(
        backdropRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3 }
      );

      gsap.fromTo(
        panelRef.current,
        { x: "100%" },
        { x: 0, duration: 0.3, ease: "power2.out" }
      );

      gsap.fromTo(
        headerRef.current,
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.3, delay: 0.1 }
      );

      gsap.fromTo(
        itemsRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, delay: 0.2 }
      );

      gsap.fromTo(
        footerRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.3, delay: 0.3 }
      );
    } else {
      // Closing animations
      gsap.to(backdropRef.current, {
        opacity: 0,
        duration: 0.3,
      });

      gsap.to(panelRef.current, {
        x: "100%",
        duration: 0.3,
        ease: "power2.in",
      });

      gsap.to(headerRef.current, {
        y: -20,
        opacity: 0,
        duration: 0.2,
      });

      gsap.to(itemsRef.current, {
        opacity: 0,
        duration: 0.2,
      });

      gsap.to(footerRef.current, {
        y: 20,
        opacity: 0,
        duration: 0.2,
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      fetchCartItems();
    }
  }, [isOpen]);

  const fetchCartItems = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("userData"));
      if (!userData) return;

      const response = await axios.get(
        `http://localhost:4000/api/properties/cart/${userData._id}`
      );
      setCartItems(response.data);
      calculateTotal(response.data);
    } catch (error) {
      console.error("Error fetching cart items:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = (items) => {
    const sum = items.reduce((acc, item) => acc + item.price, 0);
    setTotal(sum);
  };

  const handleRemoveItem = async (propertyId) => {
    try {
      const userData = JSON.parse(localStorage.getItem("userData"));
      await axios.post("http://localhost:4000/api/properties/cart/remove", {
        userId: userData._id,
        propertyId,
      });
      fetchCartItems();
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  const handleCheckout = async () => {
    const userData = JSON.parse(localStorage.getItem("userData"));
    if (!userData) return;

    try {
      const orderResponse = await axios.post(
        "http://localhost:4000/api/payment/razorpay/order",
        {
          amount: total,
          userId: userData._id,
        }
      );

      const { id: order_id, currency } = orderResponse.data;

      const options = {
        key: "rzp_test_byaETqKXP2gHMM",
        amount: total * 100,
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
      showToast(error.response?.data?.message || "Error processing checkout");
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        ref={backdropRef}
        onClick={onClose}
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
      />

      {/* Cart Panel */}
      <div
        ref={panelRef}
        className="fixed right-0 top-0 h-full w-full max-w-md bg-gray-100 shadow-lg z-50"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div
            ref={headerRef}
            className="p-4 flex justify-between items-center border-b"
          >
            <h2 className="text-xl font-bold">Your Cart</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X size={24} />
            </button>
          </div>

          {/* Cart Items */}
          <div ref={itemsRef} className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500"></div>
              </div>
            ) : cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <div className="empty-cart-icon">
                  <ShoppingCart size={48} className="mb-4" />
                </div>
                <p>Your cart is empty</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item._id}
                    className="cart-item flex items-center gap-4 p-4 bg-white border rounded-lg hover:shadow-md transition-shadow duration-300"
                  >
                    <img
                      src={item.images[0]}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-md"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-gray-600">{item.location}</p>
                      <p className="text-red-500 font-bold">
                        ₹{item.price.toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item._id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors duration-300"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div ref={footerRef} className="p-4 border-t bg-white">
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold">Total:</span>
              <span className="text-xl font-bold text-red-500">
                ₹{total.toLocaleString()}
              </span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={cartItems.length === 0}
              className="w-full py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Cart;
