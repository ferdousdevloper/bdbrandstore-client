import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import successimg from "../assest/success.gif";
import { FaArrowRight } from "react-icons/fa";
import { Link } from "react-router-dom";
import SummaryApi from "../common/API";
import { useCart } from "../context/CartContext";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

const Success = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { countCartProducts } = useCart();
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      return;
    }
    const confirmOrder = async () => {
      try {
        const res = await fetch(SummaryApi.confirmStripeOrder.url, {
          method: SummaryApi.confirmStripeOrder.method,
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id: sessionId }),
        });
        const data = await res.json();
        if (data.success) {
          setStatus("success");
          countCartProducts();
        } else {
          setStatus("error");
          toast.error(data.message || "Order confirmation failed");
        }
      } catch (err) {
        setStatus("error");
        toast.error("Failed to confirm order");
      }
    };
    confirmOrder();
  }, [sessionId, countCartProducts]);

  if (status === "loading") {
    return (
      <div className="min-h-[50vh] flex items-center justify-center px-4">
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-slate-600 font-medium">
          Confirming your order...
        </motion.p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto mt-16 px-4 py-8 bg-white rounded-2xl border border-surface-100 shadow-soft text-center"
      >
        <p className="text-xl font-bold text-slate-700">Something went wrong</p>
        <p className="text-slate-500 mt-2 text-sm">Order may not have been saved. Check My Orders or contact support.</p>
        <Link
          to="/user-panel/my-orders"
          className="inline-block mt-6 px-6 py-3 rounded-xl font-semibold text-white bg-primary-500 hover:bg-primary-600"
        >
          My Orders
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-md mx-auto mt-16 px-4 py-8 bg-white rounded-2xl border border-surface-100 shadow-soft text-center"
    >
      <img src={successimg} alt="Success" className="mx-auto w-32 h-32 object-contain" />
      <p className="text-2xl font-bold text-primary-600 mt-4">Payment Successful!</p>
      <Link
        to="/user-panel/my-orders"
        className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-primary-500 hover:bg-primary-600 transition-colors"
      >
        View Orders <FaArrowRight />
      </Link>
    </motion.div>
  );
};

export default Success;
