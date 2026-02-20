import React, { useEffect, useMemo, useState } from "react";
import { FaBoxOpen, FaSearch, FaCalendarAlt, FaTrash } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion"; // ✅ Add Framer Motion

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchOrders = async () => {
    try {
      const res = await fetch(
        "http://localhost:8080/api/get-order-details",
        { method: "GET", credentials: "include" }
      );
      const data = await res.json();
      if (data.success) {
        const sorted = data.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setOrders(sorted);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // 🔎 Filtering
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const searchText = search.toLowerCase();
      const matchSearch =
        order.shippingDetails?.fullName
          ?.toLowerCase()
          .includes(searchText) ||
        order.shippingDetails?.phone
          ?.toLowerCase()
          .includes(searchText) ||
        order._id?.toLowerCase().includes(searchText);
      const matchStatus =
        statusFilter === "all" || order.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [orders, search, statusFilter]);

  // 📑 Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // 📊 Stats
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const deliveredOrders = orders.filter((o) => o.status === "delivered").length;
  const totalRevenue = orders.reduce((acc, order) => {
    const total = order.cartItems.reduce((a, item) => a + item.price * item.quantity, 0);
    return acc + total;
  }, 0);

  const getStatusStyle = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "confirmed":
        return "bg-blue-100 text-blue-700";
      case "delivered":
        return "bg-green-100 text-green-700";
      case "canceled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100";
    }
  };

  const formatDateTime = (date) => {
    const d = new Date(date);
    return d.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const shortPaymentId = (id) => {
    if (!id) return "N/A";
    return id.slice(0, 6) + "..." + id.slice(-4);
  };

  // 🔄 Status Change
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await fetch("http://localhost:8080/api/update-order-status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ orderId, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) fetchOrders();
    } catch (err) {
      console.log(err);
    }
  };

  const handleDelete = async (orderId) => {
    if (!window.confirm("Delete this order?")) return;
    try {
      const res = await fetch(`http://localhost:8080/api/delete-order/${orderId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) fetchOrders();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 space-y-8">

      {/* 📊 Stats Section */}
      <div className="grid md:grid-cols-4 gap-6">
        <StatCard title="Total Orders" value={totalOrders} />
        <StatCard title="Pending" value={pendingOrders} />
        <StatCard title="Delivered" value={deliveredOrders} />
        <StatCard title="Revenue (৳)" value={totalRevenue} />
      </div>

      {/* 🔎 Filters */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-lg flex flex-col md:flex-row gap-4 justify-between">
        <div className="relative w-full md:w-1/2">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, phone, order ID..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-12 pr-4 py-3 rounded-2xl border focus:ring-2 focus:ring-blue-400 outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="py-3 px-4 rounded-2xl border focus:ring-2 focus:ring-purple-400 outline-none"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="delivered">Delivered</option>
          <option value="canceled">Canceled</option>
        </select>
      </div>

      {/* 🧾 Orders */}
      {loading ? (
        <p>Loading...</p>
      ) : paginatedOrders.length === 0 ? (
        <p>No orders found</p>
      ) : (
        <AnimatePresence>
          {paginatedOrders.map((order) => {
            const calculatedTotal = order.cartItems.reduce(
              (a, item) => a + item.price * item.quantity,
              0
            );

            return (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-lg space-y-4"
              >
                {/* Header */}
                <div className="flex justify-between items-start flex-wrap gap-4">
                  <div>
                    <p className="font-semibold text-lg">{order.shippingDetails?.fullName}</p>
                    <p className="text-sm text-gray-500">{order.shippingDetails?.address}</p>
                    <p className="text-sm text-gray-500">📞 {order.shippingDetails?.phone}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                      <FaCalendarAlt size={12} />
                      {formatDateTime(order.createdAt)}
                    </p>
                  </div>

                  {/* ✅ Status Dropdown */}
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    className={`px-4 py-1 rounded-full text-sm font-medium ${getStatusStyle(order.status)}`}
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="delivered">Delivered</option>
                    <option value="canceled">Canceled</option>
                  </select>
                </div>

                {/* Products */}
                <div className="grid md:grid-cols-2 gap-4">
                  {order.cartItems.map((item) => (
                    <div key={item._id} className="flex gap-4 border rounded-lg p-3">
                      <img src={item.image} alt={item.productName} className="w-20 h-20 object-cover rounded" />
                      <div>
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-sm text-gray-600">{item.quantity} × {item.price} BDT</p>
                        <p className="text-sm font-semibold text-gray-800">= {item.quantity * item.price} BDT</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center flex-wrap gap-4 mt-4">
                  <div>
                    <p className="text-sm text-gray-600">Payment: {order.paymentMethod}</p>
                    <p className="text-sm text-gray-500">ID: {shortPaymentId(order.paymentDetails?.paymentId)}</p>
                  </div>

                  <div className="text-lg font-bold text-gray-800">Total: {calculatedTotal} BDT</div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDelete(order._id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-lg"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      )}

      {/* 📑 Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-4 py-2 rounded-xl ${
                currentPage === i + 1 ? "bg-blue-600 text-white" : "bg-white shadow"
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

// ✅ Stat Card Component
const StatCard = ({ title, value }) => (
  <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-lg text-center">
    <p className="text-gray-500 text-sm">{title}</p>
    <h2 className="text-2xl font-bold text-gray-800 mt-2">{value}</h2>
  </div>
);

export default AdminOrders;