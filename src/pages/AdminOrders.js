import React, { useEffect, useMemo, useState } from "react";
import { FaBoxOpen, FaSearch, FaCalendarAlt, FaTrash, FaCheckCircle, FaTruck, FaClock, FaTimesCircle, FaWallet, FaChartLine } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import Swal from "sweetalert2"; // --- SweetAlert2 Import ---

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
      const res = await fetch("http://localhost:8080/api/get-order-details", {
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
      const res = await fetch("http://localhost:8080/api/update-order-status", {
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

  // 🔥 UPDATED DELETE FUNCTION WITH SWEETALERT2
  const handleDelete = async (orderId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      customClass: {
        popup: 'rounded-[2rem]'
      }
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`http://localhost:8080/api/delete-order/${orderId}`, {
          method: "DELETE",
          credentials: "include",
        });
        const data = await res.json();

        if (data.success) {
          // Success Alert: Auto closes after 1.5 seconds
          await Swal.fire({
            title: 'Deleted!',
            text: 'The order record has been removed.',
            icon: 'success',
            showConfirmButton: false,
            timer: 1500,
            customClass: {
                popup: 'rounded-[2rem]'
            }
          });
          fetchOrders();
        } else {
          toast.error(data.message || "Delete failed");
        }
      } catch (err) {
        toast.error("An error occurred");
      }
    }
  };

  const handlePrintInvoice = (order) => {
  const subtotal = order.cartItems.reduce((a, b) => a + (b.price * b.quantity), 0);
  const tax = subtotal * 0.00; // ৫% ভ্যাট
  const total = subtotal + tax;
  
  const printWindow = window.open('', '_blank');
  
  printWindow.document.write(`
    <html>
      <head>
        <title>Invoice - ${order._id}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
          body { font-family: 'Plus Jakarta Sans', sans-serif; color: #1e293b; }
          .theme-text { color: #2563eb; } /* আপনার থিম ব্লু */
          .theme-bg { background: linear-gradient(to right, #1d4ed8, #2563eb); } /* থিম গ্রেডিয়েন্ট */
          .accent-red { color: #dc2626; } /* ডিসকাউন্ট/অ্যাকসেন্ট রেড */
          @media print {
            .no-print { display: none; }
            body { padding: 0; margin: 0; }
          }
        </style>
      </head>
      <body class="bg-white p-10">
        <div class="max-w-4xl mx-auto border border-slate-50 p-8 shadow-sm">
          
          <div class="flex justify-between items-start mb-16">
            <div>
              <div class="flex items-center gap-2 mb-4">
                <div class="w-10 h-10 theme-bg rounded-xl flex items-center justify-center text-white font-black text-xl">L</div>
                <h2 class="text-2xl font-black tracking-tighter text-slate-900">YOUR STORE</h2>
              </div>
              <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Store Information</p>
              <p class="text-sm text-slate-500 font-medium">Dhaka, Bangladesh</p>
              <p class="text-sm text-slate-500 font-medium">support@yourwebsite.com</p>
            </div>
            <div class="text-right">
               <h1 class="theme-text text-5xl font-black uppercase tracking-tighter leading-none mb-2">INVOICE</h1>
               <p class="text-slate-400 font-bold text-sm">#${order._id.slice(-8).toUpperCase()}</p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-12 mb-12 py-8 border-y border-slate-100">
            <div>
              <h4 class="accent-red font-black uppercase text-[10px] mb-3 tracking-[0.2em]">Bill To</h4>
              <h1 class="text-xl font-extrabold text-slate-800 mb-1">${order.shippingDetails?.fullName}</h1>
              <p class="text-sm text-slate-500 leading-relaxed font-medium">${order.shippingDetails?.address}</p>
              <p class="text-sm font-bold theme-text mt-2">📞 ${order.shippingDetails?.phone}</p>
            </div>
            <div class="flex flex-col items-end justify-center space-y-2">
              <div class="text-right">
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Order Date</p>
                <p class="text-sm font-bold text-slate-700">${new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
              <div class="text-right mt-4">
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment Method</p>
                <p class="text-sm font-black theme-text uppercase">${order.paymentMethod}</p>
              </div>
            </div>
          </div>

          <div class="rounded-[1.5rem] overflow-hidden border border-slate-100 mb-8">
            <table class="w-full">
              <thead>
                <tr class="theme-bg text-white text-[11px] uppercase tracking-widest">
                  <th class="py-4 px-6 text-left">Item Details</th>
                  <th class="py-4 px-6 text-center w-24">Qty</th>
                  <th class="py-4 px-6 text-right w-32">Price</th>
                  <th class="py-4 px-6 text-right w-32">Total</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${order.cartItems.map(item => `
                  <tr class="hover:bg-slate-50/50 transition-colors">
                    <td class="py-5 px-6">
                      <p class="font-bold text-slate-800 text-sm">${item.productName}</p>
                      <p class="text-[10px] text-slate-400 font-bold uppercase mt-0.5">${order.category || 'Product'}</p>
                    </td>
                    <td class="py-5 px-6 text-center font-bold text-slate-600 text-sm underline decoration-blue-200 underline-offset-4">${item.quantity}</td>
                    <td class="py-5 px-6 text-right font-medium text-slate-500 text-sm">৳${item.price.toLocaleString()}</td>
                    <td class="py-5 px-6 text-right font-black text-slate-900 text-sm">৳${(item.price * item.quantity).toLocaleString()}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="flex justify-between items-start">
            <div class="max-w-[300px]">
               <h4 class="text-slate-800 font-bold text-xs mb-2">Important Note:</h4>
               <p class="text-[10px] text-slate-400 leading-relaxed italic">Please keep this invoice for any future warranty claims or returns. The goods remain the property of Your Store until paid in full.</p>
            </div>
            <div class="w-72 bg-slate-50 rounded-3xl p-6 space-y-3">
              <div class="flex justify-between text-xs font-bold text-slate-500 px-2">
                <span>Subtotal Amount</span>
                <span>৳${subtotal.toLocaleString()}</span>
              </div>
              <div class="flex justify-between text-xs font-bold accent-red px-2">
                <span>Tax & VAT (5%)</span>
                <span>+ ৳${tax.toLocaleString()}</span>
              </div>
              <div class="flex justify-between theme-text text-xl font-black border-t border-slate-200 pt-4 px-2 mt-2">
                <span class="tracking-tighter">GRAND TOTAL</span>
                <span>৳${total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div class="mt-20 text-center">
            <div class="inline-block px-6 py-2 rounded-full bg-blue-50 text-primary-600 text-[10px] font-black uppercase tracking-widest">
               Thank you for your order!
            </div>
            <p class="text-[9px] text-slate-300 mt-4 uppercase font-bold tracking-tighter">Generated by Your Store Admin Dashboard</p>
          </div>
        </div>
      </body>
    </html>
  `);
  
  printWindow.document.close();
  printWindow.focus();
  
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 500);
};
  return (
    <div className="min-h-screen p-4 md:p-8 bg-slate-50 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Order Management</h1>
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
            className="w-full pl-14 pr-6 py-4 rounded-[1.5rem] border border-slate-200 focus:bg-white focus:ring-4 focus:ring-primary-100 outline-none transition-all shadow-sm font-medium"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          className="lg:w-60 px-6 py-4 rounded-[1.5rem] border border-slate-200 bg-white font-bold text-slate-700 cursor-pointer shadow-sm transition-all"
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
        ) : paginatedOrders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[2rem] shadow-sm border border-slate-100">
            <p className="text-slate-400 font-medium">No matches found for your criteria.</p>
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
                    className="bg-white rounded-[2rem] shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all border border-slate-100 overflow-hidden"
                  >
                    <div className="px-8 py-5 border-b border-slate-50 flex flex-wrap items-center justify-between gap-4 bg-slate-50/30">
                      <div className="flex items-center gap-3">
                        <div className="bg-white p-2.5 rounded-xl shadow-sm border border-slate-100 text-slate-400 font-mono text-xs font-bold">
                          #{order._id.slice(-8).toUpperCase()}
                        </div>
                        <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                          <FaCalendarAlt /> {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                           <span className="text-[10px] font-black text-slate-400 uppercase">Status:</span>
                           <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order._id, e.target.value)}
                            className={`pl-4 pr-10 py-2 rounded-full text-xs font-black uppercase tracking-wider border transition-all cursor-pointer outline-none appearance-none bg-no-repeat bg-[right_1rem_center] ${config.bg}`}
                            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`, backgroundSize: '1rem' }}
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="delivered">Delivered</option>
                            <option value="canceled">Canceled</option>
                          </select>
                        </div>
                        {/* 🔥 DELETE BUTTON CONNECTED TO handleDelete */}
                        <button onClick={() => handleDelete(order._id)} className="p-2.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                          <FaTrash size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="p-8 grid md:grid-cols-12 gap-8">
                      <div className="md:col-span-4 space-y-4">
                        <div className="bg-blue-50/30 p-4 rounded-2xl border border-blue-50">
                          <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Customer Details</p>
                          <h3 className="text-lg font-bold text-slate-800">{order.shippingDetails?.fullName}</h3>
                          <p className="text-slate-500 font-medium text-sm leading-relaxed">{order.shippingDetails?.address}</p>
                          <p className="text-primary-600 font-bold text-sm mt-1">📞 {order.shippingDetails?.phone}</p>
                        </div>
                        <div className="p-4 rounded-2xl border border-slate-50">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Payment Method</p>
                          <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold uppercase tracking-wider">{order.paymentMethod}</span>
                        </div>
                      </div>

                      <div className="md:col-span-5 space-y-3">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Items ({order.cartItems?.length})</p>
                        <div className="max-h-48 overflow-y-auto pr-2 space-y-3 scrollbar-thin scrollbar-thumb-slate-100">
                          {order.cartItems.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-100 group/item">
                              <img src={item.image} className="w-12 h-12 rounded-xl object-cover bg-white border border-slate-100" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-700 truncate">{item.productName}</p>
                                <p className="text-xs text-slate-500 font-medium">{item.quantity} x ৳{item.price}</p>
                              </div>
                              <p className="text-sm font-black text-slate-700">৳{item.quantity * item.price}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="md:col-span-3 bg-slate-900 rounded-[2rem] p-6 flex flex-col justify-center items-center text-center shadow-lg shadow-slate-200">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Grand Total</p>
                        <h2 className="text-3xl font-black text-white leading-none">৳{orderTotal.toLocaleString()}</h2>
                        <div className="mt-6 w-full">
                           <button 
  onClick={() => handlePrintInvoice(order)}
  className="w-full py-3 bg-primary-600 hover:bg-primary-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all active:scale-95"
>
  PRINT INVOICE
</button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 py-8">
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => { setCurrentPage(i + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className={`w-12 h-12 rounded-2xl font-bold transition-all ${
                currentPage === i + 1 
                ? "bg-primary-600 text-white shadow-lg shadow-primary-200 scale-110" 
                : "bg-white text-slate-400 hover:bg-slate-100 border border-slate-100"
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
    blue: "text-blue-600 bg-blue-50 border-blue-100 ring-blue-50",
    amber: "text-amber-600 bg-amber-50 border-amber-100 ring-amber-50",
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-100 ring-emerald-50",
    violet: "text-violet-600 bg-violet-50 border-violet-100 ring-violet-50",
  };
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-start gap-4">
      <div className={`p-4 rounded-2xl ${themes[color].split(' ')[1]} ${themes[color].split(' ')[0]}`}>
        {icon}
      </div>
      <div>
        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{title}</p>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-none">{value}</h2>
        <p className="text-xs text-slate-400 font-medium mt-1.5">{subtitle}</p>
      </div>
    </div>
  );
};

export default AdminOrders;