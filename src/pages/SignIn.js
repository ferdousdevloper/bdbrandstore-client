import React, { useContext, useState } from "react";
import loginIcon from "../assest/signin.gif";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import SummaryApi from "../common/API";
import { toast } from "react-toastify";
import context from "../context/Context";
import { motion } from "framer-motion";

const SignIn = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [data, setData] = useState({ email: "guest@gmail.com", password: "guest" });
  const navigate = useNavigate();
  const { userDetail, fetchAddToWishListCount } = useContext(context);

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch(SummaryApi.signIn.url, {
      method: SummaryApi.signIn.method,
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data),
    });
    const apiRes = await res.json();
    if (apiRes.success) {
      toast.success(apiRes.message);
      userDetail();
      fetchAddToWishListCount();
      navigate("/");
    } else {
      toast.error(apiRes.message);
    }
  };

  return (
    <section className="py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto bg-white rounded-2xl shadow-soft border border-surface-100 p-8"
      >
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 text-center mb-2">Sign In</h1>
        <p className="text-slate-500 text-center text-sm mb-6">Welcome back to E-Store</p>
        <div className="flex justify-center mb-6">
          <img src={loginIcon} alt="Login" className="w-20 h-20 object-contain" />
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              name="email"
              value={data.email}
              onChange={handleOnChange}
              className="w-full px-4 py-3 rounded-xl border border-surface-200 bg-surface-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                name="password"
                value={data.password}
                onChange={handleOnChange}
                className="w-full px-4 py-3 pr-12 rounded-xl border border-surface-200 bg-surface-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                onClick={() => setShowPassword((p) => !p)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <Link to="/forgot-password" className="block text-sm text-primary-600 hover:text-primary-700 mt-1.5 text-right">
              Forgot password?
            </Link>
          </div>
          <button
            type="submit"
            className="w-full py-3 rounded-xl font-semibold text-white bg-primary-500 hover:bg-primary-600 transition-colors shadow-soft"
          >
            Sign In
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600">
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="font-semibold text-primary-600 hover:text-primary-700">
            Sign Up
          </Link>
        </p>
      </motion.div>
    </section>
  );
};

export default SignIn;
