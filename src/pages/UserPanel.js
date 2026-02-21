import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  FaHeart,
  FaBars,
  FaShoppingCart,
  FaPowerOff,
  FaUserCircle,
} from "react-icons/fa";
import { RiFolderUploadFill } from "react-icons/ri";
import { BsPersonCircle } from "react-icons/bs";
import SummaryApi from "../common/API";
import { toast } from "react-toastify";
import { setUserDetails } from "../store/userSlice";
import { motion, AnimatePresence } from "framer-motion";

const UserPanel = () => {
  const user = useSelector((state) => state?.user?.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isSidebarVisible, setSidebarVisible] = useState(false);

  const toggleSidebar = () => setSidebarVisible(!isSidebarVisible);

  const handleLogout = async () => {
    const fetchDate = await fetch(SummaryApi.userLogout.url, {
      method: SummaryApi.userLogout.method,
      credentials: "include",
    });
    const data = await fetchDate.json();

    if (data.success) {
      toast.success(data.message);
      dispatch(setUserDetails(null));
      navigate("/");
    } else {
      toast.error(data.message);
    }
  };

  const navStyle = "flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-300";

  return (
    // এই ডিভটি ফিক্সড হাইট (Screen Height) নিশ্চিত করবে
    <div className="flex h-[calc(100vh-70px)] bg-surface-50 overflow-hidden relative md:z-0">

      {/* Mobile Menu Icon */}
      <div
        className="fixed top-4 left-4 z-50 md:hidden cursor-pointer text-primary-600 bg-white p-2 rounded-lg shadow-md"
        onClick={toggleSidebar}
      >
        <FaBars size={24} />
      </div>

      {/* Sidebar - এই অংশটিই Sticky থাকবে */}
      <aside
        className={`fixed md:relative top-0 left-0 h-full w-64 bg-gradient-to-b from-primary-800 via-primary-700 to-primary-600 text-white p-6 shadow-soft z-40 transform transition-transform duration-300 flex-shrink-0 ${
          isSidebarVisible ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Close button mobile */}
        <div className="absolute top-4 right-4 md:hidden cursor-pointer" onClick={toggleSidebar}>✕</div>

        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            {user?.profilepic ? (
              <img src={user.profilepic} className="w-24 h-24 rounded-full border-4 border-white/20 shadow-xl object-cover" alt={user?.name} />
            ) : (
              <FaUserCircle size={80} className="text-white/40" />
            )}
          </div>
          <h2 className="capitalize font-bold text-lg mt-3 text-center line-clamp-1">{user?.name || "User"}</h2>
          <p className="text-primary-100 text-[10px] opacity-70 break-all">{user?.email}</p>
        </div>

        <nav className="flex flex-col gap-2">
          <NavLink to="my-account" onClick={() => setSidebarVisible(false)} className={({ isActive }) => `${navStyle} ${isActive ? "bg-white text-primary-700 shadow-lg" : "hover:bg-white/10 text-white"}`}>
            <BsPersonCircle size={18} /> Profile
          </NavLink>
          <NavLink to="wishlist" onClick={() => setSidebarVisible(false)} className={({ isActive }) => `${navStyle} ${isActive ? "bg-white text-primary-700 shadow-lg" : "hover:bg-white/10 text-white"}`}>
            <FaHeart size={18} /> Wishlist
          </NavLink>
          <NavLink to="cart" onClick={() => setSidebarVisible(false)} className={({ isActive }) => `${navStyle} ${isActive ? "bg-white text-primary-700 shadow-lg" : "hover:bg-white/10 text-white"}`}>
            <FaShoppingCart size={18} /> My Cart
          </NavLink>
          <NavLink to="my-orders" onClick={() => setSidebarVisible(false)} className={({ isActive }) => `${navStyle} ${isActive ? "bg-white text-primary-700 shadow-lg" : "hover:bg-white/10 text-white"}`}>
            <RiFolderUploadFill size={18} /> My Orders
          </NavLink>
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/20 hover:bg-red-500 text-white font-bold text-sm transition-all mt-6 group">
            <FaPowerOff className="group-hover:rotate-90 transition-transform" /> Sign Out
          </button>
        </nav>
      </aside>

      {/* Main Content Area - এটা স্ক্রল হবে */}
      <main className="flex-1 h-full overflow-y-auto bg-slate-50 scroll-smooth">
        <div className="p-4 md:p-8 min-h-full">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-4 md:p-8 min-h-[90vh]"
            >
              <Outlet />
            </motion.div>
        </div>
      </main>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isSidebarVisible && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-30 md:hidden"
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserPanel;