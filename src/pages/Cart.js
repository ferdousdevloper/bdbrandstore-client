import React, { useEffect, useState } from "react";
import SummaryApi from "../common/API";
import { useSelector } from "react-redux";
import cartImg from "../assest/Images/Cart.webp";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { FaPlus, FaMinus, FaTruck, FaShieldAlt, FaTrashAlt, FaStore } from "react-icons/fa";
import displayBDTCurrency from "../helpers/displayCurrency";
import { toast } from "react-toastify";
import { loadStripe } from "@stripe/stripe-js";
import Swal from "sweetalert2"; // SweetAlert ইম্পোর্ট করা হয়েছে

const Cart = () => {
  const user = useSelector((state) => state?.user?.user);
  const { countCartProducts } = useCart();
  const [cartData, setCartData] = useState([]);
  const [showShipping, setShowShipping] = useState(false);
  const [shippingData, setShippingData] = useState({ fullName: "", address: "", phone: "" });
  
  // শিপিং ফি স্টেট
  const [shippingFee, setShippingFee] = useState(60); // ডিফল্ট Dhaka City (60)
  const [shippingLocation, setShippingLocation] = useState("Dhaka City");

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

  // Item Remove with SweetAlert
  const deleteProduct = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to remove this item from the cart?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, delete it!",
      borderRadius: "1.5rem"
    }).then(async (result) => {
      if (result.isConfirmed) {
        const res = await fetch(SummaryApi.deleteCartProduct.url, {
          method: SummaryApi.deleteCartProduct.method,
          credentials: "include",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ cartProductId: id }),
        });
        const data = await res.json();
        if (data.success) {
          Swal.fire({
            title: "Deleted!",
            text: "Item has been removed.",
            icon: "success",
            timer: 1500,
            showConfirmButton: false
          });
          fetchCartData();
          countCartProducts();
        }
      }
    });
  };

  const totalQty = cartData.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartData.reduce((sum, item) => sum + item.quantity * item?.productId?.sellingPrice, 0);

  // শিপিং ফি হ্যান্ডেলার
  const handleShippingChange = (location, fee) => {
    setShippingLocation(location);
    setShippingFee(fee);
  };

  const validateShipping = () => {
    // In Shop হলে অ্যাড্রেস ম্যান্ডেটরি না ও হতে পারে, তবে আপনার রিকোয়েস্ট অনুযায়ী সাধারণ ভ্যালিডেশন
    if (!shippingData.fullName || !shippingData.phone || (shippingLocation !== "In Shop" && !shippingData.address)) {
      toast.error("Please provide complete details");
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
      body: JSON.stringify({ 
        cartItems: cartData, 
        shippingDetails: shippingData,
        shippingFee: shippingFee, // শিপিং ফি পাঠানো হচ্ছে
        totalAmount: totalPrice + shippingFee 
      }),
    });
    const data = await res.json();
    if (data.success) {
      Swal.fire("Success!", "Order placed successfully (COD)", "success");
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
      body: JSON.stringify({ 
        cartItems: cartData, 
        shippingDetails: shippingData,
        shippingFee: shippingFee 
      }),
    });
    const data = await res.json();
    if (data?.id) stripe.redirectToCheckout({ sessionId: data.id });
    else toast.error("Checkout failed");
  };

  return (
    <div className="w-full min-h-screen bg-slate-50/50 p-2 sm:p-4 md:p-6 lg:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Shopping Cart</h1>
          <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-xs font-bold">{totalQty} Items</span>
        </div>

        {cartData.length === 0 ? (
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl p-10 text-center max-w-2xl mx-auto mt-10">
            <img src={cartImg} className="mx-auto w-40 h-40 object-contain mb-8 mix-blend-multiply opacity-80" alt="Empty" />
            <h2 className="text-2xl font-bold text-slate-800">Your cart is empty</h2>
            <Link to="/" className="inline-block mt-8 px-10 py-4 rounded-full font-bold text-white bg-primary-600 active:scale-95 transition-all">Back to Shop</Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            
            {/* Left: Items List */}
            <div className="w-full lg:w-[65%] space-y-4">
              {cartData.map((item) => (
                <div key={item._id} className="group bg-white rounded-2xl md:rounded-3xl border border-slate-100 shadow-sm p-3 sm:p-5 flex gap-4 sm:gap-6 items-center overflow-hidden">
                  <div className="w-20 h-20 sm:w-32 sm:h-32 bg-slate-50 rounded-xl overflow-hidden flex-shrink-0 p-2 border border-slate-50">
                    <img src={item?.productId?.productImage?.[0]} alt={item?.productId?.productName} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-all duration-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 text-sm sm:text-base md:text-lg truncate">{item?.productId?.productName}</h3>
                    <p className="text-slate-400 text-xs sm:text-sm mt-1 mb-2">Price: {displayBDTCurrency(item?.productId?.sellingPrice)}</p>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1">
                        <button onClick={() => updateQuantity(item._id, item.quantity, false)} className="w-7 h-7 flex items-center justify-center"><FaMinus size={10} /></button>
                        <span className="w-8 text-center font-bold text-sm text-slate-800">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item._id, item.quantity, true)} className="w-7 h-7 flex items-center justify-center"><FaPlus size={10} /></button>
                      </div>
                      <span className="text-primary-600 font-black text-sm">{displayBDTCurrency(item?.productId?.sellingPrice * item.quantity)}</span>
                    </div>
                  </div>
                  <button onClick={() => deleteProduct(item._id)} className="p-3 rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all"><FaTrashAlt /></button>
                </div>
              ))}
            </div>

            {/* Right: Order Summary */}
            <div className="w-full lg:w-[35%] lg:sticky lg:top-24">
              <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 p-5 md:p-8">
                <h3 className="text-lg md:text-xl font-black text-slate-800 mb-6 border-b pb-4">Order Summary</h3>
                
                {/* Shipping Fee Options */}
                <div className="mb-6 space-y-3">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select Shipping Area</p>
                  <div className="grid grid-cols-1 gap-2">
                    <button 
                      onClick={() => handleShippingChange("Dhaka City", 60)}
                      className={`flex justify-between items-center px-4 py-3 rounded-xl border-2 transition-all ${shippingLocation === "Dhaka City" ? "border-primary-600 bg-primary-50/50" : "border-slate-100 hover:border-slate-200"}`}
                    >
                      <div className="flex items-center gap-2 font-bold text-sm text-slate-700">Dhaka City (60)</div>
                      <span className={`w-4 h-4 rounded-full border-2 ${shippingLocation === "Dhaka City" ? "bg-primary-600 border-primary-600" : "border-slate-300"}`}></span>
                    </button>
                    <button 
                      onClick={() => handleShippingChange("Outside City", 120)}
                      className={`flex justify-between items-center px-4 py-3 rounded-xl border-2 transition-all ${shippingLocation === "Outside City" ? "border-primary-600 bg-primary-50/50" : "border-slate-100 hover:border-slate-200"}`}
                    >
                      <div className="flex items-center gap-2 font-bold text-sm text-slate-700">Outside City (120)</div>
                      <span className={`w-4 h-4 rounded-full border-2 ${shippingLocation === "Outside City" ? "bg-primary-600 border-primary-600" : "border-slate-300"}`}></span>
                    </button>
                    <button 
                      onClick={() => handleShippingChange("In Shop", 0)}
                      className={`flex justify-between items-center px-4 py-3 rounded-xl border-2 transition-all ${shippingLocation === "In Shop" ? "border-primary-600 bg-primary-50/50" : "border-slate-100 hover:border-slate-200"}`}
                    >
                      <div className="flex items-center gap-2 font-bold text-sm text-slate-700"><FaStore /> In Shop (Free)</div>
                      <span className={`w-4 h-4 rounded-full border-2 ${shippingLocation === "In Shop" ? "bg-primary-600 border-primary-600" : "border-slate-300"}`}></span>
                    </button>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm text-slate-500 font-medium">
                    <span>Subtotal</span>
                    <span>{displayBDTCurrency(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-500 font-medium">
                    <span>Shipping Fee ({shippingLocation})</span>
                    <span className="text-slate-800 font-bold">+{displayBDTCurrency(shippingFee)}</span>
                  </div>
                  <div className="h-px bg-slate-100 my-2"></div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-800 font-bold">Grand Total</span>
                    <span className="text-xl md:text-2xl font-black text-primary-600">{displayBDTCurrency(totalPrice + shippingFee)}</span>
                  </div>
                </div>

                {/* Shipping Details */}
                <div className="mb-6">
                  <button
                    onClick={() => setShowShipping(!showShipping)}
                    className="w-full flex items-center justify-between px-5 py-3 rounded-xl bg-slate-100 font-bold text-xs"
                  >
                    <span className="flex items-center gap-2"><FaTruck /> Shipping Details</span>
                    <span>{showShipping ? "−" : "+"}</span>
                  </button>
                  {showShipping && (
                    <div className="mt-4 space-y-3 animate-in fade-in slide-in-from-top-2">
                      <input className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm" placeholder="Receiver Name" value={shippingData.fullName} onChange={(e) => setShippingData({ ...shippingData, fullName: e.target.value })} />
                      {shippingLocation !== "In Shop" && (
                        <textarea className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm resize-none" placeholder="Delivery Address" value={shippingData.address} onChange={(e) => setShippingData({ ...shippingData, address: e.target.value })} />
                      )}
                      <input className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm" placeholder="Phone Number" value={shippingData.phone} onChange={(e) => setShippingData({ ...shippingData, phone: e.target.value })} />
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  <button onClick={handlePayment} className="w-full py-4 rounded-2xl font-black text-white bg-primary-600 hover:shadow-lg transition-all active:scale-95 uppercase tracking-wide">Pay Online</button>
                  <button onClick={handleCOD} className="w-full py-4 rounded-2xl font-black text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-all active:scale-95 uppercase tracking-wide">Cash on Delivery</button>
                </div>

                <div className="mt-6 flex flex-col items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                  <div className="flex items-center gap-2"><FaShieldAlt className="text-emerald-500" /> Secure Checkout</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;