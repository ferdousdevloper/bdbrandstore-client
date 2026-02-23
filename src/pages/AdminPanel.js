import React, { useEffect, useState } from "react";
import {
  FaUserCircle,
  FaUsers,
  FaBoxOpen,
  FaShoppingCart,
  FaBars,
  FaPowerOff, // logout আইকনের জন্য
} from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux"; // useDispatch যোগ করা হয়েছে
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ROLE from "../common/Role";
import { FaChartBar } from "react-icons/fa6";
import SummaryApi from "../common/API"; // API কল করার জন্য
import { toast } from "react-toastify";
import { setUserDetails } from "../store/userSlice"; // রিডাক্স স্টেট ক্লিয়ার করার জন্য

const AdminPanel = () => {
  const user = useSelector((state) => state?.user?.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isSidebarVisible, setSidebarVisible] = useState(false);

  useEffect(() => {
    if (user?.role !== ROLE.ADMIN) {
      navigate("/");
    }
  }, [user, navigate]);

  const toggleSidebar = () => setSidebarVisible(!isSidebarVisible);

  // Logout Handler
  const handleLogout = async () => {
    try {
      const response = await fetch(SummaryApi.userLogout.url, {
        method: SummaryApi.userLogout.method,
        credentials: "include",
      });
      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        dispatch(setUserDetails(null)); // রিডাক্স থেকে ইউজার ডাটা মুছে ফেলা
        navigate("/"); // হোম পেজে পাঠিয়ে দেওয়া
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Logout failed. Please try again.");
    }
  };

  const navStyle =
    "flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-300";

  return (
    <div className="flex min-h-[calc(100vh-70px)] bg-surface-50 relative">
      
      {/* Mobile Toggle Button */}
      <AnimatePresence>
        {!isSidebarVisible && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="fixed top-20 right-4 z-50 md:hidden cursor-pointer text-primary-600 bg-white p-2.5 rounded-xl shadow-lg border border-slate-100"
            onClick={toggleSidebar}
          >
            <FaBars size={22} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay for Mobile */}
      <AnimatePresence>
        {isSidebarVisible && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] md:hidden"
            onClick={toggleSidebar}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 md:top-16 left-0 h-screen md:h-[calc(100vh-64px)] w-64 bg-gradient-to-b from-primary-800 via-primary-700 to-primary-600 text-white p-6 shadow-2xl z-[70] transform transition-transform duration-300 overflow-y-auto flex flex-col ${
          isSidebarVisible ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="absolute top-5 right-5 md:hidden w-8 h-8 flex items-center justify-center bg-white/10 rounded-full cursor-pointer hover:bg-white/20 transition-all" onClick={toggleSidebar}>
          <span className="text-xl">✕</span>
        </div>

        {/* Profile Section */}
        <div className="flex flex-col items-center mb-8 mt-10 md:mt-0">
          {user?.profilepic ? (
            <img src={user?.profilepic} className="w-20 h-20 rounded-full border-4 border-white/20 shadow-xl object-cover" alt={user?.name} />
          ) : (
            <FaUserCircle size={80} className="text-white/50" />
          )}
          <h2 className="capitalize font-bold text-lg mt-3 text-center line-clamp-1">{user?.name || "Admin"}</h2>
          <div className="bg-white/10 px-3 py-1 rounded-full mt-2">
             <p className="text-primary-100 text-[9px] font-bold uppercase tracking-widest">Admin Portal</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-2 flex-1">
          <NavLink to="all-users" onClick={() => setSidebarVisible(false)} className={({ isActive }) => `${navStyle} ${isActive ? "bg-white text-primary-700 shadow-lg" : "text-white hover:bg-white/10"}`}>
            <FaUsers size={18} /> All Users
          </NavLink>

          <NavLink to="all-products" onClick={() => setSidebarVisible(false)} className={({ isActive }) => `${navStyle} ${isActive ? "bg-white text-primary-700 shadow-lg" : "text-white hover:bg-white/10"}`}>
            <FaBoxOpen size={18} /> All Products
          </NavLink>

          <NavLink to="all-orders" onClick={() => setSidebarVisible(false)} className={({ isActive }) => `${navStyle} ${isActive ? "bg-white text-primary-700 shadow-lg" : "text-white hover:bg-white/10"}`}>
            <FaShoppingCart size={18} /> All Orders
          </NavLink>
          
          <NavLink to="statistics" onClick={() => setSidebarVisible(false)} className={({ isActive }) => `${navStyle} ${isActive ? "bg-white text-primary-700 shadow-lg" : "text-white hover:bg-white/10"}`}>
            <FaChartBar size={18} /> Statistics
          </NavLink>
        </nav>

        {/* --- Logout Button Added Here --- */}
        <div className="mt-auto pt-6 border-t border-white/10">
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/20 hover:bg-red-500 text-white font-bold text-sm transition-all group"
          >
            <FaPowerOff className="group-hover:rotate-90 transition-transform" /> 
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-h-[calc(100vh-64px)] overflow-x-hidden">
        <div className="p-4 md:p-8">
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-4 md:p-8 min-h-[calc(100vh-130px)]"
            >
              <Outlet />
            </motion.div>
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;