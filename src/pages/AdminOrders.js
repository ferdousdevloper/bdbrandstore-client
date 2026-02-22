import React, { useEffect, useMemo, useState } from "react";
import { FaBoxOpen, FaSearch, FaCalendarAlt, FaTrash, FaCheckCircle, FaTruck, FaClock, FaTimesCircle, FaWallet, FaChartLine } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

import logo from "../assest/bdbrandstore.png"

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

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter((o) => o.status === "pending").length;
    const delivered = orders.filter((o) => o.status === "delivered").length;
    const revenue = orders.reduce((acc, order) => {
      const isOnlinePayment = order.paymentMethod !== "COD" && order.paymentMethod !== "Cash on Delivery";
      const isDelivered = order.status === "delivered";
      if (isOnlinePayment || isDelivered) {
        const orderTotal = order.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        return acc + orderTotal;
      }
      return acc;
    }, 0);
    return { total, pending, delivered, revenue };
  }, [orders]);

  const getStatusConfig = (status) => {
    switch (status) {
      case "pending": return { bg: "bg-amber-50 text-amber-600 border-amber-100", icon: <FaClock /> };
      case "confirmed": return { bg: "bg-blue-50 text-blue-600 border-blue-100", icon: <FaCheckCircle /> };
      case "delivered": return { bg: "bg-emerald-50 text-emerald-600 border-emerald-100", icon: <FaTruck /> };
      case "canceled": return { bg: "bg-rose-50 text-rose-600 border-rose-100", icon: <FaTimesCircle /> };
      default: return { bg: "bg-slate-50 text-slate-600 border-slate-100", icon: null };
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
          await Swal.fire({ title: 'Deleted!', icon: 'success', showConfirmButton: false, timer: 1500, customClass: { popup: 'rounded-[2rem]' } });
          fetchOrders();
        }
      } catch (err) {
        toast.error("An error occurred");
      }
    }
  };

  const handlePrintInvoice = (order) => {
    const subtotal = order.cartItems.reduce((a, b) => a + (b.price * b.quantity), 0);
    const tax = subtotal * 0.00;
    const total = subtotal + tax;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
  <head>
    <title>Invoice - ${order._id}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
      
      body { 
        font-family: 'Plus Jakarta Sans', sans-serif; 
        color: #1e293b; 
        margin: 0;
        padding: 0;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }

      /* ১ পেজে রাখার জন্য সাইজ কন্ট্রোল */
      @page {
        size: A4;
        margin: 10mm;
      }

      .watermark-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: -1;
        pointer-events: none;
      }

      .watermark-img {
        width: 400px;
        opacity: 0.07;
        transform: rotate(-35deg);
        filter: grayscale(100%);
      }

      @media print {
        .watermark-img { opacity: 0.1 !important; }
      }
    </style>
  </head>
  <body class="bg-white p-4">
    
    <div class="watermark-container">
      <img src="${logo}" class="watermark-img" alt="">
    </div>

    <div class="max-w-4xl mx-auto border border-slate-100 p-6 md:p-8 relative bg-transparent min-h-[95vh] flex flex-col justify-between">
      
      <div>
        <div class="flex justify-between items-center mb-8">
          <div class="flex items-center gap-3">
            <img src="${logo}" class="w-12 h-12 object-contain" alt="Logo">
            <div>
              <h2 class="text-xl font-black tracking-tighter text-slate-900 leading-none">BD BRAND STORE</h2>
              <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Official Invoice</p>
            </div>
          </div>
          <div class="text-right">
             <h1 class="text-[#14b8a6] text-3xl font-black uppercase tracking-tighter leading-none mb-1">INVOICE</h1>
             <p class="text-slate-400 font-bold text-xs">#${order._id.slice(-8).toUpperCase()}</p>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-8 mb-8 py-6 border-y border-slate-100">
          <div>
            <h4 class="text-[#f43f5e] font-black uppercase text-[9px] mb-2 tracking-[0.2em]">Bill To</h4>
            <h1 class="text-lg font-extrabold text-slate-800 mb-0.5">${order.shippingDetails?.fullName}</h1>
            <p class="text-xs text-slate-500 font-medium leading-snug max-w-[250px]">${order.shippingDetails?.address}</p>
            <p class="text-xs font-bold text-[#14b8a6] mt-1">📞 ${order.shippingDetails?.phone}</p>
          </div>
          <div class="text-right">
            <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Order Date</p>
            <p class="text-xs font-bold text-slate-700">${new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-3">Payment Method</p>
            <p class="text-xs font-black text-[#14b8a6] uppercase">${order.paymentMethod}</p>
          </div>
        </div>

        <div class="rounded-2xl overflow-hidden border border-slate-100 mb-6">
          <table class="w-full text-left text-xs">
            <thead>
              <tr class="bg-[#14b8a6] text-white text-[10px] uppercase tracking-widest font-bold">
                <th class="py-3 px-5">Item Details</th>
                <th class="py-3 px-5 text-center">Qty</th>
                <th class="py-3 px-5 text-right">Price</th>
                <th class="py-3 px-5 text-right">Total</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${order.cartItems.map(item => `
                <tr class="bg-white/40">
                  <td class="py-3 px-5 font-bold text-slate-800">${item.productName}</td>
                  <td class="py-3 px-5 text-center font-bold text-slate-600">${item.quantity}</td>
                  <td class="py-3 px-5 text-right text-slate-500">৳${item.price.toLocaleString()}</td>
                  <td class="py-3 px-5 text-right font-black text-slate-900">৳${(item.price * item.quantity).toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="flex justify-end mb-8">
          <div class="w-60 bg-slate-50 bg-opacity-15 rounded-2xl p-4 space-y-2 border border-slate-100">
            <div class="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
              <span>Subtotal</span>
              <span>৳${subtotal.toLocaleString()}</span>
            </div>
            <div class="flex justify-between text-[#14b8a6] text-lg font-black border-t border-slate-200 pt-2 mt-1">
              <span>TOTAL</span>
              <span>৳${total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div class="grid grid-cols-2 gap-8 mb-10">
          <div class="text-center">
            <div class="border-t border-slate-200 pt-2 w-40 mx-auto">
              <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Customer Signature</p>
            </div>
          </div>
          
          <div class="text-center relative">
            <div class="absolute -top-12 left-1/2 -translate-x-1/2 w-20 h-20 border-2 border-dashed border-slate-100 rounded-full flex items-center justify-center pointer-events-none">
              <p class="text-[7px] font-bold text-slate-200 uppercase rotate-12">Official Seal</p>
            </div>
            <div class="border-t border-[#14b8a6] pt-2 w-40 mx-auto">
              <p class="text-[9px] font-black text-[#14b8a6] uppercase tracking-widest">Authorized Signature</p>
              <p class="text-[8px] font-bold text-slate-400 mt-0.5 uppercase">BD Brand Store</p>
            </div>
          </div>
        </div>

        <div class="pt-6 border-t border-slate-50 flex justify-between items-end">
          <div class="space-y-0.5">
            <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Terms & Conditions</p>
            <p class="text-[8px] text-slate-400 font-medium italic">* This is a computer generated invoice.</p>
            <p class="text-[8px] text-slate-400 font-medium italic">* Goods once sold are not returnable.</p>
          </div>
          <div class="flex flex-col items-end gap-2">
            
          </div>
        </div>
      </div>

    </div>
  </body>
</html>
    `);
    printWindow.document.close();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 1000);
  };

  return (
    <div className="min-h-screen p-4 md:p-8 bg-surface-50 space-y-8 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Order Management</h1>
          <p className="text-slate-500 font-medium">Monitor and process your store's transactions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Volume" value={stats.total} color="blue" icon={<FaChartLine size={24} />} subtitle="Orders processed" />
        <StatCard title="Pending" value={stats.pending} color="amber" icon={<FaClock size={24} />} subtitle="Awaiting action" />
        <StatCard title="Delivered" value={stats.delivered} color="emerald" icon={<FaTruck size={24} />} subtitle="Successfully sent" />
        <StatCard title="Net Revenue" value={`৳${stats.revenue.toLocaleString()}`} color="violet" icon={<FaWallet size={24} />} subtitle="Paid & Delivered" />
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1 group">
          <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
          <input
            type="text"
            placeholder="Search by name, phone, or order ID..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full pl-14 pr-6 py-4 rounded-[1.5rem] border border-slate-200 focus:bg-white focus:ring-4 focus:ring-primary-100 outline-none transition-all shadow-soft font-medium"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          className="lg:w-60 px-6 py-4 rounded-[1.5rem] border border-slate-200 bg-white font-bold text-slate-700 cursor-pointer shadow-soft transition-all"
        >
          <option value="all">All Status</option>
          <option value="pending">⏳ Pending</option>
          <option value="confirmed">✅ Confirmed</option>
          <option value="delivered">🚚 Delivered</option>
          <option value="canceled">❌ Canceled</option>
        </select>
      </div>

      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-slate-300">
            <div className="animate-spin w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-slate-500 font-bold tracking-widest uppercase text-xs">Fetching Orders...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            <AnimatePresence>
              {paginatedOrders.map((order) => {
                const config = getStatusConfig(order.status);
                const orderTotal = order.cartItems.reduce((a, b) => a + (b.price * b.quantity), 0);
                return (
                  <motion.div
                    key={order._id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-[2rem] shadow-card border border-slate-100 overflow-hidden"
                  >
                    {/* Header: Responsive flex */}
                    <div className="px-5 md:px-8 py-5 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-50">
                      <div className="flex items-center gap-3">
                        <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-100 text-slate-400 font-mono text-[10px] md:text-xs font-bold">
                          #{order._id.slice(-8).toUpperCase()}
                        </div>
                        <div className="flex items-center gap-2 text-slate-400 text-[10px] md:text-xs font-bold">
                          <FaCalendarAlt /> {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between md:justify-end gap-3">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          className={`pl-4 pr-10 py-2 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all cursor-pointer appearance-none bg-no-repeat bg-[right_1rem_center] ${config.bg}`}
                          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`, backgroundSize: '1rem' }}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="delivered">Delivered</option>
                          <option value="canceled">Canceled</option>
                        </select>
                        <button onClick={() => handleDelete(order._id)} className="p-2 text-slate-300 hover:text-rose-500 rounded-xl transition-all">
                          <FaTrash size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Content: Responsive grid */}
                    <div className="p-5 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
                      <div className="md:col-span-4 space-y-4">
                        <div className="bg-primary-50/30 p-4 rounded-2xl border border-primary-50">
                          <p className="text-[10px] font-black text-primary-500 uppercase tracking-widest mb-2">Customer Details</p>
                          <h3 className="text-base font-bold text-slate-800">{order.shippingDetails?.fullName}</h3>
                          <p className="text-slate-500 font-medium text-xs md:text-sm">{order.shippingDetails?.address}</p>
                          <p className="text-primary-600 font-bold text-xs md:text-sm mt-1">📞 {order.shippingDetails?.phone}</p>
                        </div>
                        <div className="p-3 rounded-xl border border-surface-100 flex justify-between items-center">
                          <p className="text-[10px] font-black text-slate-400 uppercase">Payment</p>
                          <span className="px-2 py-0.5 bg-surface-100 text-slate-600 rounded text-[10px] font-bold uppercase">{order.paymentMethod}</span>
                        </div>
                      </div>

                      <div className="md:col-span-5 space-y-3">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Items ({order.cartItems?.length})</p>
                        <div className="max-h-48 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                          {order.cartItems.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3 bg-surface-50 p-2 rounded-xl border border-surface-100">
                              <img src={item.image} className="w-10 h-10 rounded-lg object-cover bg-white" alt="" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-slate-700 truncate">{item.productName}</p>
                                <p className="text-[10px] text-slate-500">{item.quantity} x ৳{item.price}</p>
                              </div>
                              <p className="text-xs font-black text-slate-700">৳{item.quantity * item.price}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="md:col-span-3 bg-slate-900 rounded-[2rem] p-6 flex flex-col justify-center items-center text-center shadow-lg">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Grand Total</p>
                        <h2 className="text-2xl font-black text-white">৳{orderTotal.toLocaleString()}</h2>
                        <button 
                          onClick={() => handlePrintInvoice(order)}
                          className="mt-6 w-full py-3 bg-primary-600 hover:bg-primary-500 text-white font-bold text-[10px] rounded-xl transition-all active:scale-95"
                        >
                          PRINT INVOICE
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 py-8 overflow-x-auto">
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => { setCurrentPage(i + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className={`min-w-[40px] h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl font-bold transition-all ${
                currentPage === i + 1 ? "bg-primary-600 text-white shadow-lg" : "bg-white text-slate-400 border border-surface-200"
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

const StatCard = ({ title, value, color, icon, subtitle }) => {
  const themes = {
    blue: "text-blue-600 bg-blue-50 border-blue-100",
    amber: "text-amber-600 bg-amber-50 border-amber-100",
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
    violet: "text-violet-600 bg-violet-50 border-violet-100",
  };
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-surface-200 shadow-soft flex items-center gap-4">
      <div className={`p-4 rounded-2xl ${themes[color]}`}>{icon}</div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
        <h2 className="text-xl font-black text-slate-800 leading-none mt-1">{value}</h2>
      </div>
    </div>
  );
};

export default AdminOrders;