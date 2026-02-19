import React, { useEffect, useState } from "react";
import SummaryApi from "../common/API";
import emptyBox from "../assest/empty_order.gif";
import { Link } from "react-router-dom";
import moment from "moment";
import displayINRCurrency from "../helpers/displayCurrency";

const UserOrder = () => {
  const [orderData, setOrderData] = useState([]);

  const fetchOrders = async () => {
    try {
      const res = await fetch(SummaryApi.getOrderData.url, {   // ✅ correct API
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
    <div className="p-4">
      <h1 className="text-xl font-bold text-slate-800 underline">My Order</h1>

      {orderData.length === 0 && (
        <div className="flex justify-center items-center gap-3 flex-col lg:mt-16 md:mt-24">
          <img
            src={emptyBox}
            width={300}
            height={300}
            className="rounded mix-blend-multiply"
          />
          <p className="lg:-mt-8 text-slate-500 font-semibold text-center">
            Looks like you have not ordered yet. Go ahead and explore top
            products.
          </p>
          <Link to={"/"} className="mt-5">
            <button className="bg-blue-600 rounded text-white font-semibold w-64 mx-auto h-8">
              Continue Shopping
            </button>
          </Link>
        </div>
      )}

      {orderData.map((order, index) => {
        return (
          <div key={order.user + index} className=" my-4 p-4">
            <p className="font-semibold text-lg text-slate-600 mb-2">
              {moment(order.createdAt).format("LL")}
            </p>
            <div className="border border-slate-600 rounded">
              <div className="grid gap-1 ">
                {order.cartItems.map((product, index) => (
                  <Link
                    to={`/product/${product.productId}`}
                    key={product.productId + index}
                    className="flex gap-3 bg-slate-100 m-1 rounded"
                  >
                    <div className="w-28 h-28 bg-white rounded-tl-lg rounded-bl-lg overflow-hidden">
                      <img
                        src={product.image}
                        className="w-full h-full object-contain p-1 mix-blend-multiply"
                        alt={product.productName}
                      />
                    </div>
                    <div>
                      <div className="font-bold text-lg text-ellipsis line-clamp-1 text-slate-800">
                        {product.productName}
                      </div>
                      <div className="flex items-center gap-5 mt-1">
                        <div className="text-lg text-red-500 ">
                          {displayINRCurrency(product.price)}
                        </div>
                        <p className="text-lg text-slate-500">
                          Quantity: {product.quantity}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="flex flex-col lg:flex-row gap-10 px-10 p-4">
                <div>
                  <div className="text-lg text-slate-800 font-bold">
                    Payment Details:
                  </div>
                  <p className="text-slate-600 font-semibold ml-1">
                    Payment Method:{" "}
                    {order.paymentMethod || "N/A"}
                  </p>
                  <p className="text-slate-600 font-semibold ml-1">
                    Payment Status: {order.paymentDetails?.payment_status || "N/A"}
                  </p>
                </div>
                <div>
                  <div className="text-lg text-slate-800 font-bold">
                    Shipping Details:
                  </div>
                  <div className="text-slate-600 font-semibold ml-1">
                    Full Name: {order.shippingDetails?.fullName || "N/A"}
                  </div>
                  <div className="text-slate-600 font-semibold ml-1">
                    Address: {order.shippingDetails?.address || "N/A"}
                  </div>
                  <div className="text-slate-600 font-semibold ml-1">
                    Phone: {order.shippingDetails?.phone || "N/A"}
                  </div>
                </div>
                <div className="text-lg text-slate-800 font-bold">
                  Total Amount: {displayINRCurrency(order.totalAmount || 0)}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default UserOrder;