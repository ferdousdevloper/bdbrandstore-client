import React, { useEffect, useState } from "react";
import SummaryApi from "../common/API";
import { useSelector } from "react-redux";
import cartImg from "../assest/Images/Cart.webp";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { FaPlusCircle, FaMinusCircle } from "react-icons/fa";
import displayINRCurrency from "../helpers/displayCurrency";
import { MdDelete } from "react-icons/md";
import { toast } from "react-toastify";
import { loadStripe } from "@stripe/stripe-js";

const Cart = () =>{ 
  const user = useSelector((state) => state?.user?.user);
  const { cartCount, countCartProducts } = useCart();
  const [cartData, setCartData] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ COD FORM STATE
  const [showCODForm, setShowCODForm] = useState(false);
  const [shippingData, setShippingData] = useState({
    fullName: "",
    address: "",
    phone: "",
  });

  const fetchCartData = async () => {
    const apiResponse = await fetch(
      `${SummaryApi.countCart.url}/${user?._id}`,
      {
        method: SummaryApi.countCart.method,
        credentials: "include",
        headers: {
          "content-type": "application/json",
        },
      }
    );

    const apiResponseData = await apiResponse.json();
    if (apiResponseData.success) {
      setCartData(apiResponseData.data);
    }
  };

  useEffect(() => {
    if (user?._id) {
      setLoading(true);
      fetchCartData();
      setLoading(false);
    }
  }, [user?._id]);

  // ✅ UPDATE QUANTITY
  const updateQuantity = async (productId, qty, increase = true) => {
    const newQty = increase ? qty + 1 : qty - 1;
    if (newQty < 1) return;

    await fetch(SummaryApi.updateProductQuantity.url, {
      method: SummaryApi.updateProductQuantity.method,
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ productId, quantity: newQty }),
    });

    fetchCartData();
  };

  // ✅ DELETE PRODUCT
  const deletedProduct = async (id) => {
    const apiResponse = await fetch(SummaryApi.deleteCartProduct.url, {
      method: SummaryApi.deleteCartProduct.method,
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ cartProductId: id }),
    });

    const apiData = await apiResponse.json();

    if (apiData.success) {
      toast.success(apiData.message);
      fetchCartData();
      countCartProducts();
    }
  };

  const totalQty = cartData.reduce(
    (prev, curr) => prev + curr.quantity,
    0
  );

  const totalPrice = cartData.reduce(
    (prev, curr) =>
      prev + curr.quantity * curr?.productId?.sellingPrice,
    0
  );

  // ✅ STRIPE PAYMENT
  const handlePayment = async () => {
    const stripePromise = await loadStripe(
      process.env.REACT_APP_STRIPE_PUBLIC_KEY
    );

    const response = await fetch(SummaryApi.checkout.url, {
      method: SummaryApi.checkout.method,
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ cartItems: cartData }),
    });

    const apiData = await response.json();

    if (apiData?.id) {
      stripePromise.redirectToCheckout({ sessionId: apiData.id });
    } else {
      toast.error("Payment failed");
    }
  };

  // ✅ COD ORDER
  const handleCODOrder = async () => {
  if (!shippingData.fullName || !shippingData.address || !shippingData.phone) {
    toast.error("Please fill all fields");
    return;
  }

  const payload = {
    cartItems: cartData,
    shippingDetails: shippingData,
    userId: user?._id // <--- add this
  };

  const response = await fetch(SummaryApi.codOrder.url, {
    method: SummaryApi.codOrder.method,
    credentials: "include",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });

  const apiData = await response.json();

  if (apiData.success) {
    toast.success("Order placed successfully (COD)");
    setShowCODForm(false);
    setShippingData({ fullName: "", address: "", phone: "" });
    fetchCartData();
  } else {
    toast.error(apiData.message);
  }
};

 return (
  <div className="min-h-screen bg-gray-50 py-10 px-4">
    <div className="max-w-7xl mx-auto">

      <h2 className="text-3xl font-bold mb-8 text-gray-800">
        🛒 My Shopping Cart
      </h2>

      {cartData.length === 0 ? (
        <div className="bg-white shadow-xl rounded-2xl p-10 text-center">
          <img src={cartImg} className="mx-auto w-48 mb-6" />
          <p className="text-gray-500 text-lg mb-4">
            Your cart is empty
          </p>
          <Link
            to="/"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-10">

          {/* LEFT SIDE - CART ITEMS */}
          <div className="lg:col-span-2 space-y-6">
            {cartData.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition p-5 flex gap-6 items-center"
              >
                <img
                  src={product?.productId?.productImage[0]}
                  className="w-28 h-28 object-contain"
                />

                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {product?.productId?.productName}
                  </h3>

                  <p className="text-blue-600 font-bold mt-2">
                    {displayINRCurrency(
                      product?.productId?.sellingPrice
                    )}
                  </p>

                  <div className="flex items-center gap-4 mt-4">
                    <button
                      className="bg-gray-200 p-2 rounded-full hover:bg-gray-300"
                      onClick={() =>
                        updateQuantity(
                          product._id,
                          product.quantity,
                          false
                        )
                      }
                    >
                      <FaMinusCircle />
                    </button>

                    <span className="text-lg font-semibold">
                      {product.quantity}
                    </span>

                    <button
                      className="bg-gray-200 p-2 rounded-full hover:bg-gray-300"
                      onClick={() =>
                        updateQuantity(
                          product._id,
                          product.quantity,
                          true
                        )
                      }
                    >
                      <FaPlusCircle />
                    </button>
                  </div>
                </div>

                <button
                  className="text-red-500 hover:text-red-700 text-2xl"
                  onClick={() => deletedProduct(product._id)}
                >
                  <MdDelete />
                </button>
              </div>
            ))}
          </div>

          {/* RIGHT SIDE - SUMMARY */}
          <div className="bg-white shadow-xl rounded-2xl p-6 h-fit sticky top-10">

            <h3 className="text-xl font-semibold mb-6 text-gray-800">
              Order Summary
            </h3>

            <div className="flex justify-between mb-3 text-gray-600">
              <span>Total Items</span>
              <span>{totalQty}</span>
            </div>

            <div className="flex justify-between mb-6 text-lg font-bold text-gray-800">
              <span>Total Price</span>
              <span>{displayINRCurrency(totalPrice)}</span>
            </div>

            <button
              className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white py-3 rounded-xl font-semibold shadow hover:scale-105 transition"
              onClick={handlePayment}
            >
              💳 Pay Online
            </button>

            <button
              className="w-full mt-3 bg-gradient-to-r from-green-500 to-green-700 text-white py-3 rounded-xl font-semibold shadow hover:scale-105 transition"
              onClick={() => setShowCODForm(true)}
            >
              🚚 Cash On Delivery
            </button>

            {showCODForm && (
              <div className="mt-6 bg-gray-50 p-4 rounded-xl border animate-fadeIn">
                <h4 className="font-semibold mb-4 text-gray-700">
                  Shipping Details
                </h4>

                <input
                  className="w-full border p-2 mb-3 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                  placeholder="Full Name"
                  value={shippingData.fullName}
                  onChange={(e) =>
                    setShippingData({
                      ...shippingData,
                      fullName: e.target.value,
                    })
                  }
                />

                <input
                  className="w-full border p-2 mb-3 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                  placeholder="Address"
                  value={shippingData.address}
                  onChange={(e) =>
                    setShippingData({
                      ...shippingData,
                      address: e.target.value,
                    })
                  }
                />

                <input
                  className="w-full border p-2 mb-4 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                  placeholder="Mobile Number"
                  value={shippingData.phone}
                  onChange={(e) =>
                    setShippingData({
                      ...shippingData,
                      phone: e.target.value,
                    })
                  }
                />

                <button
                  className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
                  onClick={handleCODOrder}
                >
                  Confirm Order
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  </div>
);
};

export default Cart;