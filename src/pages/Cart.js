import React, { useEffect, useState } from "react";
import SummaryApi from "../common/API";
import { useSelector } from "react-redux";
import cartImg from "../assest/Images/Cart.webp";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { FaPlusCircle, FaMinusCircle } from "react-icons/fa";
import displayBDTCurrency from "../helpers/displayCurrency";
import { MdDelete } from "react-icons/md";
import { toast } from "react-toastify";
import { loadStripe } from "@stripe/stripe-js";

const Cart = () => {
  const user = useSelector((state) => state?.user?.user);
  const { countCartProducts } = useCart();
  const [cartData, setCartData] = useState([]);
  const [showShipping, setShowShipping] = useState(false);
  const [shippingData, setShippingData] = useState({ fullName: "", address: "", phone: "" });

  const fetchCartData = async () => {
    if (!user?._id) return;
    const res = await fetch(`${SummaryApi.countCart.url}/${user._id}`, {
      method: SummaryApi.countCart.method,
      credentials: "include",
      headers: { "content-type": "application/json" },
    });
    const data = await res.json();
    if (data.success) setCartData(data.data);
  };

  useEffect(() => {
    fetchCartData();
  }, [user]);

  const updateQuantity = async (id, qty, increase) => {
    const newQty = increase ? qty + 1 : qty - 1;
    if (newQty < 1) return;
    await fetch(SummaryApi.updateProductQuantity.url, {
      method: SummaryApi.updateProductQuantity.method,
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ productId: id, quantity: newQty }),
    });
    fetchCartData();
  };

  const deleteProduct = async (id) => {
    const res = await fetch(SummaryApi.deleteCartProduct.url, {
      method: SummaryApi.deleteCartProduct.method,
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ cartProductId: id }),
    });
    const data = await res.json();
    if (data.success) {
      toast.success("Item removed");
      fetchCartData();
      countCartProducts();
    }
  };

  const totalQty = cartData.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartData.reduce((sum, item) => sum + item.quantity * item?.productId?.sellingPrice, 0);

  const validateShipping = () => {
    if (!shippingData.fullName || !shippingData.address || !shippingData.phone) {
      toast.error("Please fill all shipping fields");
      return false;
    }
    return true;
  };

  const handleCOD = async () => {
    if (!validateShipping()) return;
    const res = await fetch(SummaryApi.codOrder.url, {
      method: SummaryApi.codOrder.method,
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ cartItems: cartData, shippingDetails: shippingData }),
    });
    const data = await res.json();
    if (data.success) {
      toast.success("COD Order placed successfully");
      setShippingData({ fullName: "", address: "", phone: "" });
      fetchCartData();
      countCartProducts();
    } else toast.error(data.message);
  };

  const handlePayment = async () => {
    if (!validateShipping()) return;
    const stripe = await loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);
    const res = await fetch(SummaryApi.checkout.url, {
      method: SummaryApi.checkout.method,
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ cartItems: cartData, shippingDetails: shippingData }),
    });
    const data = await res.json();
    if (data?.id) stripe.redirectToCheckout({ sessionId: data.id });
    else toast.error("Payment failed");
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-6">My Cart</h1>

      {cartData.length === 0 ? (
        <div className="bg-white rounded-2xl border border-surface-100 shadow-soft p-12 text-center">
          <img src={cartImg} className="mx-auto w-36 h-36 object-contain opacity-80" alt="Empty cart" />
          <p className="mt-4 text-slate-600">Your cart is empty</p>
          <Link
            to="/"
            className="inline-block mt-4 px-6 py-3 rounded-xl font-semibold text-white bg-primary-500 hover:bg-primary-600 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cartData.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-2xl border border-surface-100 shadow-card p-4 flex gap-4 items-center"
              >
                <img
                  src={item?.productId?.productImage?.[0]}
                  alt=""
                  className="w-24 h-24 md:w-28 md:h-28 object-cover rounded-xl"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-800 line-clamp-1">{item?.productId?.productName}</h3>
                  <p className="text-slate-500 text-sm">
                    {displayBDTCurrency(item?.productId?.sellingPrice)} x {item.quantity}
                  </p>
                  
                  {/* এখানে প্রতিটি প্রোডাক্টের সাব-টোটাল দেখানো হচ্ছে */}
                  <p className="text-primary-600 font-bold mt-0.5">
                    Total: {displayBDTCurrency(item?.productId?.sellingPrice * item.quantity)}
                  </p>

                  <div className="flex items-center gap-2 mt-2">
                    <button
                      type="button"
                      className="w-8 h-8 rounded-lg bg-surface-100 flex items-center justify-center text-slate-600 hover:bg-primary-100 hover:text-primary-600 transition-colors"
                      onClick={() => updateQuantity(item._id, item.quantity, false)}
                    >
                      <FaMinusCircle className="text-sm" />
                    </button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <button
                      type="button"
                      className="w-8 h-8 rounded-lg bg-surface-100 flex items-center justify-center text-slate-600 hover:bg-primary-100 hover:text-primary-600 transition-colors"
                      onClick={() => updateQuantity(item._id, item.quantity, true)}
                    >
                      <FaPlusCircle className="text-sm" />
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  className="p-2 rounded-xl text-slate-400 hover:bg-red-50 hover:text-accent-coral transition-colors"
                  onClick={() => deleteProduct(item._id)}
                >
                  <MdDelete className="text-xl" />
                </button>
              </div>
            ))}
          </div>
          {/* বাকি অংশ আগের মতোই থাকবে... */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-surface-100 shadow-soft p-6 sticky top-24">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Order Summary</h3>
              <p className="text-slate-600">Items: {totalQty}</p>
              <p className="text-xl font-bold text-primary-600 mt-2">{displayBDTCurrency(totalPrice)}</p>

              <button
                type="button"
                onClick={() => setShowShipping(!showShipping)}
                className="w-full mt-4 py-3 rounded-xl font-semibold text-slate-700 bg-surface-100 hover:bg-surface-200 transition-colors"
              >
                {showShipping ? "Hide" : "Add"} Shipping Details
              </button>

              {showShipping && (
                <div className="mt-4 space-y-3">
                  <input
                    className="w-full px-4 py-2.5 rounded-xl border border-surface-200 bg-surface-50 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                    placeholder="Full Name"
                    value={shippingData.fullName}
                    onChange={(e) => setShippingData({ ...shippingData, fullName: e.target.value })}
                  />
                  <input
                    className="w-full px-4 py-2.5 rounded-xl border border-surface-200 bg-surface-50 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                    placeholder="Address"
                    value={shippingData.address}
                    onChange={(e) => setShippingData({ ...shippingData, address: e.target.value })}
                  />
                  <input
                    className="w-full px-4 py-2.5 rounded-xl border border-surface-200 bg-surface-50 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                    placeholder="Mobile Number"
                    value={shippingData.phone}
                    onChange={(e) => setShippingData({ ...shippingData, phone: e.target.value })}
                  />
                </div>
              )}

              <button
                type="button"
                onClick={handlePayment}
                className="w-full mt-4 py-3 rounded-xl font-semibold text-white bg-primary-500 hover:bg-primary-600 transition-colors"
              >
                Pay Online
              </button>
              <button
                type="button"
                onClick={handleCOD}
                className="w-full mt-2 py-3 rounded-xl font-semibold text-white bg-emerald-500 hover:bg-emerald-600 transition-colors"
              >
                Cash on Delivery
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;