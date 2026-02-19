import React, { useEffect, useState } from "react";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await fetch(
        "http://localhost:8080/api/get-order-details",
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await res.json();

      if (data.success) {
        // ✅ Newest First Sorting
        const sortedOrders = data.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setOrders(sortedOrders);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await fetch(
        "http://localhost:8080/api/update-order-status",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ orderId, status: newStatus }),
        }
      );

      const data = await res.json();
      if (data.success) fetchOrders();
    } catch (error) {
      console.log(error);
    }
  };

  const handleDelete = async (orderId) => {
    if (!window.confirm("Delete this order?")) return;

    try {
      const res = await fetch(
        `http://localhost:8080/api/delete-order/${orderId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await res.json();
      if (data.success) fetchOrders();
    } catch (error) {
      console.log(error);
    }
  };

  const getStatusColor = (status) => {
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

  const shortPaymentId = (id) => {
    if (!id) return "N/A";
    return id.slice(0, 6) + "..." + id.slice(-4);
  };

  // ✅ Date Format Function
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

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Admin Order Management
      </h1>

      {loading ? (
        <p>Loading...</p>
      ) : orders.length === 0 ? (
        <p>No orders found</p>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const calculatedTotal = order.cartItems.reduce(
              (acc, item) => acc + item.price * item.quantity,
              0
            );

            return (
              <div
                key={order._id}
                className="bg-white shadow-lg rounded-xl p-6 border"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-4 flex-wrap gap-2">
                  <div>
                    <p className="font-semibold text-lg">
                      {order.shippingDetails?.fullName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {order.shippingDetails?.address}
                    </p>
                    <p className="text-sm text-gray-500">
                      📞 {order.shippingDetails?.phone}
                    </p>

                    {/* ✅ Order Date Added */}
                    <p className="text-xs text-gray-400 mt-1">
                      Ordered on: {formatDateTime(order.createdAt)}
                    </p>
                  </div>

                  <div
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </div>
                </div>

                {/* Products */}
                <div className="grid md:grid-cols-2 gap-4">
                  {order.cartItems.map((item) => (
                    <div
                      key={item._id}
                      className="flex gap-4 border rounded-lg p-3"
                    >
                      <img
                        src={item.image}
                        alt=""
                        className="w-20 h-20 object-cover rounded"
                      />
                      <div>
                        <p className="font-medium">
                          {item.productName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {item.quantity} × {item.price} BDT
                        </p>
                        <p className="text-sm font-semibold text-gray-800">
                          = {item.quantity * item.price} BDT
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center mt-6 flex-wrap gap-4">
                  <div>
                    <p className="text-sm text-gray-600">
                      Payment: {order.paymentMethod}
                    </p>
                    <p className="text-sm text-gray-500">
                      ID: {shortPaymentId(order.paymentDetails?.paymentId)}
                    </p>
                  </div>

                  <div className="text-lg font-bold text-gray-800">
                    Total: {calculatedTotal} BDT
                  </div>

                  <div className="flex gap-2">
                    <select
                      value={order.status}
                      onChange={(e) =>
                        handleStatusChange(order._id, e.target.value)
                      }
                      className={`px-3 py-1 rounded border ${getStatusColor(
                        order.status
                      )}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="delivered">Delivered</option>
                      <option value="canceled">Canceled</option>
                    </select>

                    <button
                      onClick={() => handleDelete(order._id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-lg"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;