import React, { useEffect, useMemo, useState } from "react";
import { 
  FaBoxOpen, FaSearch, FaCalendarAlt, FaTrash, FaCheckCircle, 
  FaTruck, FaClock, FaTimesCircle, FaWallet, FaChartLine, 
  FaCreditCard, FaEye, FaPrint, FaMoneyBillWave, FaGlobe 
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

import logo from "../assest/bdbrandstore.png";

const BACKEND_DOMAIN = process.env.REACT_APP_BACKEND_DOMAIN;

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BACKEND_DOMAIN}/api/get-order-details`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        const sorted = data.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrders(sorted);
      }
    } catch (err) {
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // --- Functions for Status Updates ---
  const handlePaymentStatusChange = async (orderId, newPaymentStatus) => {
    try {
      const res = await fetch(`${BACKEND_DOMAIN}/api/update-payment-status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ orderId, payment_status: newPaymentStatus }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Payment marked as ${newPaymentStatus}`);
        fetchOrders();
      }
    } catch (err) {
      toast.error("Payment update failed");
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await fetch(`${BACKEND_DOMAIN}/api/update-order-status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ orderId, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Order ${newStatus}`);
        fetchOrders();
      }
    } catch (err) {
      toast.error("Update failed");
    }
  };

  const handleDelete = async (orderId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#14b8a6',
      cancelButtonColor: '#f43f5e',
      confirmButtonText: 'Yes, delete it!',
      customClass: { popup: 'rounded-[2rem]' }
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`${BACKEND_DOMAIN}/api/delete-order/${orderId}`, {
          method: "DELETE",
          credentials: "include",
        });
        const data = await res.json();
        if (data.success) {
          Swal.fire({ title: 'Deleted!', icon: 'success', showConfirmButton: false, timer: 1500, customClass: { popup: 'rounded-[2rem]' } });
          fetchOrders();
        }
      } catch (err) {
        toast.error("An error occurred");
      }
    }
  };

  // --- Invoice Logic ---
  const getInvoiceHTML = (order) => {
    const subtotal = order.subTotal || order.cartItems.reduce((a, b) => a + (b.price * b.quantity), 0);
    const shipping = order.shippingFee || 0;
    const total = order.total_amount;

    return `
      <html>
        <head>
          <title>Invoice - ${order._id}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&display=swap');
            body { font-family: 'Plus Jakarta Sans', sans-serif; background: #f8fafc; padding: 20px; }
            .invoice-card { background: white; max-width: 800px; margin: 0 auto; padding: 40px; border-radius: 12px; position: relative; border: 1px solid #e2e8f0; }
            @media print { 
              body { background: white; padding: 0; }
              .invoice-card { border: none; padding: 20px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="invoice-card">
            <img src="${logo}" class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 opacity-10 -rotate-12" />
            <div class="flex justify-between items-start mb-10">
              <div class="flex items-center gap-4">
                <img src="${logo}" class="w-16 h-16 object-contain" />
                <div>
                  <h1 class="text-2xl font-black text-slate-900 leading-none uppercase">BD Brand Store</h1>
                  <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">The Ultimate Shopping Experience</p>
                </div>
              </div>
              <div class="text-right">
                <h2 class="text-4xl font-black text-emerald-500">INVOICE</h2>
                <p class="text-xs font-bold text-slate-400 mt-1">#${order._id.slice(-8).toUpperCase()}</p>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-8 mb-10 pb-8 border-b border-slate-100">
              <div>
                <p class="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-3">Bill To:</p>
                <h3 class="text-lg font-extrabold text-slate-800">${order.shippingDetails?.fullName}</h3>
                <p class="text-xs text-slate-500 leading-relaxed font-medium mt-1">${order.shippingDetails?.address}</p>
                <p class="text-xs font-bold text-slate-700 mt-2">📞 ${order.shippingDetails?.phone}</p>
              </div>
              <div class="text-right space-y-1">
                <p class="text-xs font-bold text-slate-500">Order Date: <span class="text-slate-800">${new Date(order.createdAt).toLocaleDateString('en-GB')}</span></p>
                <p class="text-xs font-bold text-slate-500">Payment: <span class="text-emerald-600 uppercase">${order.paymentMethod}</span></p>
                <p class="text-xs font-bold text-slate-500">Status: <span class="uppercase">${order.paymentDetails?.payment_status || 'Pending'}</span></p>
              </div>
            </div>
            <table class="w-full text-sm mb-8 border-collapse">
              <thead>
                <tr class="bg-slate-900 text-white text-[10px] uppercase tracking-widest">
                  <th class="py-4 px-4 text-left rounded-l-lg">Product Description</th>
                  <th class="py-4 px-4 text-center">Qty</th>
                  <th class="py-4 px-4 text-right">Unit Price</th>
                  <th class="py-4 px-4 text-right rounded-r-lg">Total</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${order.cartItems.map(item => `
                  <tr>
                    <td class="py-4 px-4 font-bold text-slate-800">${item.productName}</td>
                    <td class="py-4 px-4 text-center font-bold text-slate-600">${item.quantity}</td>
                    <td class="py-4 px-4 text-right text-slate-500">৳${item.price.toLocaleString()}</td>
                    <td class="py-4 px-4 text-right font-black text-slate-900">৳${(item.price * item.quantity).toLocaleString()}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div class="flex justify-end">
              <div class="w-64">
                <table class="w-full text-sm">
                  <tr class="text-slate-500 font-bold">
                    <td class="py-2 text-left">Subtotal</td>
                    <td class="py-2 text-right">৳${subtotal.toLocaleString()}</td>
                  </tr>
                  <tr class="text-emerald-600 font-bold">
                    <td class="py-2 text-left">Shipping Fee</td>
                    <td class="py-2 text-right">+৳${shipping.toLocaleString()}</td>
                  </tr>
                  <tr class="border-t-2 border-slate-900">
                    <td class="py-4 text-left font-black text-slate-900 uppercase">Grand Total</td>
                    <td class="py-4 text-right font-black text-2xl text-emerald-600">৳${total.toLocaleString()}</td>
                  </tr>
                </table>
              </div>
            </div>
            <div class="mt-20 flex justify-between items-end border-t border-slate-100 pt-8">
               <div class="text-[9px] text-slate-400 font-medium space-y-1">
                 <p>* Computer generated invoice. No signature required.</p>
                 <p>* Terms: Goods once sold are not returnable.</p>
               </div>
               <div class="text-center">
                 <div class="w-40 border-t-2 border-slate-800 mb-1"></div>
                 <p class="text-[10px] font-black uppercase tracking-widest text-slate-800">Authorized Seal</p>
               </div>
            </div>
          </div>
          <div class="no-print mt-6 text-center">
             <button onclick="window.print()" class="bg-emerald-500 text-white px-10 py-3 rounded-full font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 transition-all">Print Invoice</button>
          </div>
        </body>
      </html>
    `;
  };

  const handlePrintInvoice = (order) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(getInvoiceHTML(order));
    printWindow.document.close();
    setTimeout(() => { printWindow.print(); }, 500);
  };

  const handleViewInvoice = (order) => {
    const viewWindow = window.open('', '_blank');
    viewWindow.document.write(getInvoiceHTML(order));
    viewWindow.document.close();
  };

  // --- Statistics & Search Logic ---
  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter((o) => o.status === "pending").length;
    const paidCount = orders.filter((o) => o.paymentDetails?.payment_status === 'paid').length;
    const codCount = orders.filter((o) => o.paymentMethod?.toLowerCase() === 'cod').length;
    const onlineCount = orders.filter((o) => o.paymentMethod?.toLowerCase() !== 'cod').length;
    const revenue = orders.reduce((acc, order) => {
      if (order.paymentDetails?.payment_status === 'paid') return acc + (order.total_amount || 0);
      return acc;
    }, 0);
    return { total, pending, paidCount, codCount, onlineCount, revenue };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const searchText = search.toLowerCase();
      const matchSearch =
        order.shippingDetails?.fullName?.toLowerCase().includes(searchText) ||
        order.shippingDetails?.phone?.toLowerCase().includes(searchText) ||
        order._id?.toLowerCase().includes(searchText);
      const matchStatus = statusFilter === "all" || order.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [orders, search, statusFilter]);

  const paginatedOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const getStatusConfig = (status) => {
    switch (status) {
      case "pending": return { bg: "bg-amber-50 text-amber-600 border-amber-200", icon: <FaClock /> };
      case "confirmed": return { bg: "bg-blue-50 text-blue-600 border-blue-200", icon: <FaCheckCircle /> };
      case "delivered": return { bg: "bg-emerald-50 text-emerald-600 border-emerald-200", icon: <FaTruck /> };
      case "canceled": return { bg: "bg-rose-50 text-rose-600 border-rose-200", icon: <FaTimesCircle /> };
      default: return { bg: "bg-slate-50 text-slate-600 border-slate-100", icon: null };
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-10 bg-[#f8fafc] space-y-10">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Orders Center</h1>
        <p className="text-slate-500 font-medium">Control and track your store sales & logistics.</p>
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 max-w-7xl mx-auto">
        <StatCard title="Total Orders" value={stats.total} color="blue" icon={<FaChartLine />} />
        <StatCard title="Revenue" value={`৳${stats.revenue.toLocaleString()}`} color="violet" icon={<FaWallet />} />
        <StatCard title="Paid Orders" value={stats.paidCount} color="emerald" icon={<FaCheckCircle />} />
        <StatCard title="COD Orders" value={stats.codCount} color="amber" icon={<FaMoneyBillWave />} />
        <StatCard title="Online Paid" value={stats.onlineCount} color="indigo" icon={<FaGlobe />} />
        <StatCard title="Pending" value={stats.pending} color="rose" icon={<FaClock />} />
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col lg:flex-row gap-4 max-w-7xl mx-auto">
        <div className="relative flex-1">
          <FaSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by customer name, phone, or ID..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full pl-16 pr-6 py-5 rounded-[2rem] border-none shadow-sm focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium bg-white"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          className="lg:w-60 px-8 py-5 rounded-[2rem] border-none bg-white font-bold text-slate-700 shadow-sm outline-none appearance-none"
        >
          <option value="all">All Status</option>
          <option value="pending">⏳ Pending</option>
          <option value="confirmed">✅ Confirmed</option>
          <option value="delivered">🚚 Delivered</option>
          <option value="canceled">❌ Canceled</option>
        </select>
      </div>

      {/* Orders List */}
      <div className="max-w-7xl mx-auto space-y-8">
        {loading ? (
          <div className="text-center py-24 bg-white rounded-[3rem] border border-dashed border-slate-200">
            <div className="animate-spin w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-6"></div>
            <p className="text-slate-400 font-black uppercase text-xs tracking-widest">Loading Records...</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {paginatedOrders.map((order) => (
              <motion.div
                key={order._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all overflow-hidden"
              >
                {/* Order Header */}
                <div className="px-6 md:px-10 py-6 bg-slate-50/50 flex flex-wrap items-center justify-between gap-4 border-b border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="bg-white px-4 py-1.5 rounded-xl border border-slate-200 font-mono text-xs font-black text-slate-500">
                      #{order._id.slice(-8).toUpperCase()}
                    </div>
                    <span className="text-slate-400 text-xs font-bold flex items-center gap-2">
                      <FaCalendarAlt size={12} /> {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <select
                      value={order.paymentDetails?.payment_status || "pending"}
                      onChange={(e) => handlePaymentStatusChange(order._id, e.target.value)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all cursor-pointer ${
                        order.paymentDetails?.payment_status === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'
                      }`}
                    >
                      <option value="pending">Payment: Pending</option>
                      <option value="paid">Payment: Paid</option>
                    </select>

                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all cursor-pointer ${getStatusConfig(order.status).bg}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="delivered">Delivered</option>
                      <option value="canceled">Canceled</option>
                    </select>

                    <button onClick={() => handleDelete(order._id)} className="p-2.5 text-slate-300 hover:text-rose-500 bg-white rounded-xl shadow-sm border border-slate-100 transition-all">
                      <FaTrash size={14} />
                    </button>
                  </div>
                </div>

                {/* Order Details */}
                <div className="p-6 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
                  {/* Customer Info */}
                  <div className="lg:col-span-4 space-y-5">
                    <div className="bg-[#f0fdf4] p-6 rounded-[2rem] border border-emerald-100 relative group overflow-hidden">
                       <FaTruck className="absolute -right-6 -bottom-6 text-emerald-200/40 text-8xl rotate-12 transition-transform group-hover:scale-110" />
                       <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-4">Customer Details</p>
                       <h3 className="text-lg font-black text-slate-800">{order.shippingDetails?.fullName}</h3>
                       <p className="text-slate-500 font-medium text-xs leading-relaxed mt-1">{order.shippingDetails?.address}</p>
                       <div className="mt-5 flex items-center gap-2">
                         <span className="bg-white px-3 py-1.5 rounded-full text-emerald-600 font-black text-xs shadow-sm">
                           📞 {order.shippingDetails?.phone}
                         </span>
                       </div>
                    </div>
                    <div className="flex justify-between items-center px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gateway: {order.paymentMethod}</p>
                      <FaCreditCard className="text-slate-300" />
                    </div>
                  </div>

                  {/* Items Scrollable */}
                  <div className="lg:col-span-5 space-y-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <FaBoxOpen className="text-slate-300" /> Product Summary ({order.cartItems?.length})
                    </p>
                    <div className="max-h-[220px] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                      {order.cartItems.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-slate-50 hover:border-emerald-100 transition-all group shadow-sm">
                          <img src={item.image} className="w-14 h-14 rounded-xl object-contain bg-slate-50 p-1 transition-transform group-hover:scale-105" alt="" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-black text-slate-800 truncate">{item.productName}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{item.quantity} Unit x ৳{item.price.toLocaleString()}</p>
                          </div>
                          <p className="text-sm font-black text-slate-800">৳{(item.quantity * item.price).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pricing & Invoice Actions */}
                  <div className="lg:col-span-3 bg-slate-900 rounded-[2.5rem] p-8 flex flex-col justify-between items-center text-center shadow-2xl shadow-slate-200">
                    <div className="w-full">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Payable Amount</p>
                      <h2 className="text-4xl font-black text-white">৳{order.total_amount?.toLocaleString()}</h2>
                      <div className="mt-4 pt-4 border-t border-slate-800 space-y-1">
                         <p className="text-[10px] text-emerald-400 font-bold">Items: ৳{(order.subTotal || (order.total_amount - (order.shippingFee || 0))).toLocaleString()}</p>
                         <p className="text-[10px] text-slate-500 font-bold">Delivery: ৳{order.shippingFee || 0}</p>
                      </div>
                    </div>

                    <div className="w-full space-y-3 mt-8">
                      <button 
                        onClick={() => handleViewInvoice(order)}
                        className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-400 font-black text-[10px] uppercase tracking-widest rounded-2xl border border-slate-700 transition-all flex items-center justify-center gap-2"
                      >
                        <FaEye /> View Invoice
                      </button>
                      <button 
                        onClick={() => handlePrintInvoice(order)}
                        className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-black text-[11px] uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2"
                      >
                        <FaPrint /> Print Invoice
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 py-12 max-w-7xl mx-auto">
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => { setCurrentPage(i + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className={`w-12 h-12 rounded-2xl font-black text-xs transition-all shadow-sm ${
                currentPage === i + 1 ? "bg-emerald-500 text-white" : "bg-white text-slate-400 hover:bg-slate-50"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// --- Updated StatCard Helper ---
const StatCard = ({ title, value, color, icon }) => {
  const themes = {
    blue: "text-blue-600 bg-blue-50",
    amber: "text-amber-600 bg-amber-50",
    emerald: "text-emerald-600 bg-emerald-50",
    violet: "text-violet-600 bg-violet-50",
    rose: "text-rose-600 bg-rose-50",
    indigo: "text-indigo-600 bg-indigo-50",
  };
  return (
    <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-50 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={`p-4 rounded-[1.2rem] text-xl ${themes[color] || themes.blue}`}>{icon}</div>
      <div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">{title}</p>
        <h2 className="text-xl font-black text-slate-800 leading-tight mt-1">{value}</h2>
      </div>
    </div>
  );
};

export default AdminOrders;