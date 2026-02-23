import React, { useEffect, useState } from "react";
import SummaryApi from "../common/API";
import emptyBox from "../assest/empty_order.gif";
import { Link } from "react-router-dom";
import moment from "moment";
import displayBDTCurrency from "../helpers/displayCurrency";
import { FaBox, FaTruck, FaCheckCircle, FaTimesCircle, FaClock, FaReceipt } from "react-icons/fa";

const UserOrder = () => {
  const [orderData, setOrderData] = useState([]);

  // আলাদা বর্ডার কালারের জন্য অ্যারে
  const borderColors = [
    "border-l-[6px] border-blue-500",
    "border-l-[6px] border-indigo-500",
    "border-l-[6px] border-purple-500",
    "border-l-[6px] border-violet-500",
    "border-l-[6px] border-cyan-500"
  ];

  const fetchOrders = async () => {
    try {
      const res = await fetch(SummaryApi.getOrderData.url, {
        method: SummaryApi.getOrderData.method,
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setOrderData(data.data.reverse());
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusConfig = (status) => {
    const s = status?.toLowerCase();
    if (s === "delivered") return { color: "text-emerald-600 bg-emerald-50 border-emerald-100", icon: <FaCheckCircle /> };
    if (s === "cancelled") return { color: "text-rose-600 bg-rose-50 border-rose-100", icon: <FaTimesCircle /> };
    if (s === "processing") return { color: "text-blue-600 bg-blue-50 border-blue-100", icon: <FaTruck /> };
    return { color: "text-amber-600 bg-amber-50 border-amber-100", icon: <FaClock /> };
  };

  return (
    <div className="w-full min-h-screen p-3 sm:p-6 lg:p-10 bg-slate-50/50">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-4xl font-black text-slate-800 tracking-tight">Order History</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Tracking and managing your recent purchases.</p>
        </div>
      </div>

      {orderData.length === 0 ? (
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl p-10 flex flex-col items-center text-center max-w-lg mx-auto">
          <img src={emptyBox} className="w-40 h-40 mb-6 mix-blend-multiply" alt="No orders" />
          <h3 className="text-xl font-bold text-slate-800">No orders yet!</h3>
          <Link to="/" className="mt-6 px-8 py-3 rounded-full bg-primary-600 text-white font-bold transition-all active:scale-95 shadow-lg">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto space-y-6">
          {orderData.map((order, index) => (
            <div 
              key={order._id || index} 
              className={`bg-white rounded-3xl shadow-sm hover:shadow-md transition-all overflow-hidden border border-slate-200 ${borderColors[index % borderColors.length]}`}
            >
              {/* Order Header */}
              <div className="bg-slate-50/80 px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100">
                <div className="flex gap-4 sm:gap-8">
                  <div>
                    <p className="text-slate-400 uppercase text-[9px] font-black tracking-widest">Date</p>
                    <p className="text-slate-700 font-bold text-xs sm:text-sm">{moment(order.createdAt).format("DD MMM, YY")}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 uppercase text-[9px] font-black tracking-widest">Order ID</p>
                    <p className="text-primary-600 font-bold text-xs sm:text-sm truncate max-w-[80px] sm:max-w-none">
                      #{order._id?.slice(-8).toUpperCase()}
                    </p>
                  </div>
                </div>
                
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black border uppercase tracking-wider ${getStatusConfig(order.status).color}`}>
                  {getStatusConfig(order.status).icon}
                  {order.status || "Pending"}
                </div>
              </div>

              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  
                  {/* Items Summary (Left) */}
                  <div className="lg:col-span-7 space-y-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <FaBox className="text-slate-300" /> Items List
                    </h4>
                    <div className="space-y-3">
                      {order.cartItems.map((product, idx) => (
                        <div key={idx} className="flex gap-3 sm:gap-4 p-2 rounded-2xl border border-slate-50 hover:bg-slate-50 transition-colors">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-xl overflow-hidden flex-shrink-0 border border-slate-100 p-1.5">
                            <img src={product.image} className="w-full h-full object-contain mix-blend-multiply" alt={product.productName} />
                          </div>
                          <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <p className="font-bold text-slate-800 text-xs sm:text-base line-clamp-1">{product.productName}</p>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              <span className="text-primary-600 font-bold text-xs sm:text-sm">{displayBDTCurrency(product.price)}</span>
                              <span className="text-slate-400 text-[10px] font-bold">Qty: {product.quantity}</span>
                              <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-md ml-auto sm:ml-0">
                                Total: {displayBDTCurrency(product.price * product.quantity)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Billing & Shipping (Right) */}
                  <div className="lg:col-span-5 flex flex-col gap-4">
                    {/* Billing Details Card */}
                    <div className="bg-slate-50/50 rounded-2xl p-4 sm:p-5 border border-slate-100">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <FaReceipt /> Billing Info
                      </h4>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between text-slate-500 font-bold">
                          <span>Subtotal</span>
                          <span>{displayBDTCurrency(order.subTotal || (order.total_amount - (order.shippingFee || 0)))}</span>
                        </div>
                        <div className="flex justify-between text-slate-500 font-bold">
                          <span>Shipping</span>
                          <span className="text-emerald-600">+{displayBDTCurrency(order.shippingFee || 0)}</span>
                        </div>
                        <div className="h-px bg-slate-200 my-2 border-dashed"></div>
                        <div className="flex justify-between items-center pt-1">
                          <span className="text-slate-800 font-black">Grand Total</span>
                          <span className="text-lg font-black text-primary-600">{displayBDTCurrency(order.total_amount)}</span>
                        </div>
                        <div className="mt-2">
                           <span className={`inline-block px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-tighter ${order.paymentDetails?.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                            {order.paymentMethod || "Online"} — {order.paymentDetails?.payment_status || "Pending"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Shipping Address Card */}
                    <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <FaTruck /> Delivery To
                      </h4>
                      <p className="text-xs font-bold text-slate-800">{order.shippingDetails?.fullName}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1 italic">{order.shippingDetails?.address}</p>
                      <p className="text-[11px] font-bold text-slate-700 mt-1">📞 {order.shippingDetails?.phone}</p>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserOrder;