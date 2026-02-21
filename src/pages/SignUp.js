import React, { useState } from "react";
import loginIcon from "../assest/signin.gif";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import imageToBase64 from "../helpers/imageToBase64";
import SummaryApi from "../common/API";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [data, setData] = useState({
    name: "",
    email: "",
    contact: "",
    password: "",
    confirmPwd: "",
    profilepic: "",
  });
  const navigate = useNavigate();

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUploadPic = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const image = await imageToBase64(file);
    setData((prev) => ({ ...prev, profilepic: image }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (data.password !== data.confirmPwd) {
      toast.error("Passwords do not match.");
      return;
    }
    const res = await fetch(SummaryApi.signUp.url, {
      method: SummaryApi.signUp.method,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data),
    });
    const apiRes = await res.json();
    if (apiRes.success) {
      toast.success(apiRes.message);
      navigate("/signin");
    }
    if (apiRes.error) toast.error(apiRes.message);
  };

  return (
    <section className="py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto bg-white rounded-2xl shadow-soft border border-surface-100 p-8"
      >
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 text-center mb-2">Sign Up</h1>
        <p className="text-slate-500 text-center text-sm mb-6">Create your E-Store account</p>
        <div className="w-24 h-24 mx-auto relative rounded-2xl overflow-hidden bg-surface-100 mb-6">
          <img src={data.profilepic || loginIcon} alt="Profile" className="w-full h-full object-cover" />
          <label className="absolute inset-x-0 bottom-0 py-2 text-center text-xs font-medium bg-black/50 text-white cursor-pointer hover:bg-black/60 transition-colors">
            Upload Photo
            <input type="file" className="hidden" accept="image/*" onChange={handleUploadPic} />
          </label>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {["name", "email", "contact"].map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium text-slate-700 mb-1 capitalize">
                {field === "contact" ? "Contact" : field}
              </label>
              <input
                type={field === "email" ? "email" : "text"}
                placeholder={`Enter your ${field}`}
                name={field}
                value={data[field]}
                onChange={handleOnChange}
                className="w-full px-4 py-3 rounded-xl border border-surface-200 bg-surface-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all"
              />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                name="password"
                value={data.password}
                onChange={handleOnChange}
                className="w-full px-4 py-3 pr-12 rounded-xl border border-surface-200 bg-surface-50 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
              />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" onClick={() => setShowPassword((p) => !p)}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPwd ? "text" : "password"}
                placeholder="Confirm password"
                name="confirmPwd"
                value={data.confirmPwd}
                onChange={handleOnChange}
                className="w-full px-4 py-3 pr-12 rounded-xl border border-surface-200 bg-surface-50 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
              />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" onClick={() => setShowConfirmPwd((p) => !p)}>
                {showConfirmPwd ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          <button type="submit" className="w-full py-3 rounded-xl font-semibold text-white bg-primary-500 hover:bg-primary-600 transition-colors shadow-soft">
            Sign Up
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link to="/signin" className="font-semibold text-primary-600 hover:text-primary-700">Sign In</Link>
        </p>
      </motion.div>
    </section>
  );
};

export default SignUp;
