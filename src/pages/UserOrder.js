import React, { useEffect, useState } from "react";
import SummaryApi from "../common/API";
import emptyBox from "../assest/empty_order.gif";
import { Link } from "react-router-dom";
import moment from "moment";
import displayBDTCurrency from "../helpers/displayCurrency";

const UserOrder = () => {
  const [orderData, setOrderData] = useState([]);

  const fetchOrders = async () => {
    try {
      const res = await fetch(SummaryApi.getOrderData.url, {
        method: SummaryApi.getOrderData.method,
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setOrderData(data.data);
      } else {
        console.error("Failed to fetch orders:", data.message);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="w-full h-full p-2 md:p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-800">
            My Orders
          </h1>
          <p className="text-sm text-slate-500">
            Track your past and current orders
          </p>
        </div>
        <div className="px-3 py-1.5 rounded-full bg-white border border-surface-200 text-sm text-slate-700">
          Total orders:{" "}
          <span className="font-semibold text-primary-600">
            {orderData.length}
          </span>
        </div>
      </div>

      {orderData.length === 0 && (
        <div className="bg-white rounded-2xl border border-surface-100 shadow-soft p-8 flex flex-col items-center text-center">
          <img
            src={emptyBox}
            width={260}
            height={260}
            className="rounded mix-blend-multiply mb-4"
            alt="No orders"
          />
          <p className="text-slate-600 font-medium">
            You haven&apos;t placed any orders yet.
          </p>
          <p className="text-sm text-slate-400 mt-1">
            Browse products and place your first order.
          </p>
          <Link to="/" className="mt-5">
            <button className="px-6 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-semibold text-sm">
              Continue Shopping
            </button>
          </Link>
        </div>
      )}

      <div className="mt-4 space-y-4 max-h-[60vh] overflow-y-auto scrollbar-thin pr-1">
        {orderData.map((order, index) => (
          <div
            key={order.user + index}
            className="bg-white rounded-2xl border border-surface-200 shadow-card p-4 md:p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <p className="font-semibold text-slate-700">
                {moment(order.createdAt).format("LL")}
              </p>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-surface-100 text-slate-600">
                {order.paymentDetails?.payment_status || "pending"}
              </span>
            </div>

            <div className="space-y-2">
              {order.cartItems.map((product, idx) => (
                <Link
                  to={`/product/${product.productId}`}
                  key={product.productId + idx}
                  className="flex gap-3 bg-surface-50 rounded-xl border border-surface-100 hover:border-primary-100 hover:bg-white transition-colors"
                >
                  <div className="w-24 h-24 md:w-28 md:h-28 bg-white rounded-l-xl overflow-hidden flex-shrink-0">
                    <img
                      src={product.image}
                      className="w-full h-full object-contain p-2 mix-blend-multiply"
                      alt={product.productName}
                    />
                  </div>
                  <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="font-semibold text-slate-800 text-sm md:text-base text-ellipsis line-clamp-1">
                        {product.productName}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm">
                        <div className="text-primary-600 font-semibold">
                          {displayBDTCurrency(product.price)}
                        </div>
                        <p className="text-slate-500">
                          Qty: {product.quantity}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-3 text-sm">
              <div>
                <div className="text-slate-800 font-semibold mb-1">
                  Payment
                </div>
                <p className="text-slate-600">
                  Method:{" "}
                  <span className="font-medium">
                    {order.paymentMethod || "N/A"}
                  </span>
                </p>
                <p className="text-slate-600">
                  Status:{" "}
                  <span className="font-medium">
                    {order.paymentDetails?.payment_status || "N/A"}
                  </span>
                </p>
              </div>
              <div>
                <div className="text-slate-800 font-semibold mb-1">
                  Shipping
                </div>
                <p className="text-slate-600">
                  Name:{" "}
                  <span className="font-medium">
                    {order.shippingDetails?.fullName || "N/A"}
                  </span>
                </p>
                <p className="text-slate-600">
                  Address:{" "}
                  <span className="font-medium">
                    {order.shippingDetails?.address || "N/A"}
                  </span>
                </p>
                <p className="text-slate-600">
                  Phone:{" "}
                  <span className="font-medium">
                    {order.shippingDetails?.phone || "N/A"}
                  </span>
                </p>
              </div>
              <div className="flex md:items-end">
                <div>
                  <div className="text-slate-800 font-semibold mb-1">
                    Total Amount
                  </div>
                  <p className="text-lg font-bold text-primary-600">
                    {displayBDTCurrency(order.total_amount || 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserOrder;