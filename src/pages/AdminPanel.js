import React, { useEffect, useState } from "react";
import {
  FaUserCircle,
  FaUsers,
  FaBoxOpen,
  FaShoppingCart,
  FaBars,
} from "react-icons/fa";
import { useSelector } from "react-redux";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ROLE from "../common/Role";

const AdminPanel = () => {
  const user = useSelector((state) => state?.user?.user);
  const navigate = useNavigate();
  const [isSidebarVisible, setSidebarVisible] = useState(false);

  useEffect(() => {
    if (user?.role !== ROLE.ADMIN) {
      navigate("/");
    }
  }, [user, navigate]);

  const toggleSidebar = () => setSidebarVisible(!isSidebarVisible);

  const navStyle =
    "flex items-center gap-3 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300";

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
  };

  return (
    // min-h-[calc(100vh-70px)] নিশ্চিত করে যে পুরো পেজটি ভিউপোর্টের সমান হবে
    <div className="flex min-h-[calc(100vh-70px)] bg-surface-50 relative overflow-hidden">
      
      {/* Mobile Toggle */}
      <div
        className="fixed top-4 left-4 z-50 md:hidden cursor-pointer text-primary-600 bg-white p-2 rounded-lg shadow-md"
        onClick={toggleSidebar}
      >
        <FaBars size={24} />
      </div>

      {/* Overlay for Mobile */}
      <AnimatePresence>
        {isSidebarVisible && (
          <motion.div
            className="fixed inset-0 bg-black/40 z-30 md:hidden"
            onClick={toggleSidebar}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={overlayVariants}
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Sticky করা হয়েছে */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen md:h-[calc(100vh-70px)] w-64 bg-gradient-to-b from-primary-800 via-primary-700 to-primary-600 text-white p-6 shadow-soft z-40 transform transition-transform duration-300 overflow-y-auto ${
          isSidebarVisible
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Close button mobile */}
        <div
          className="absolute top-4 right-4 md:hidden cursor-pointer hover:scale-110 transition-transform"
          onClick={toggleSidebar}
        >
          ✕
        </div>

        {/* Profile Section */}
        <div className="flex flex-col items-center mb-8 mt-6 md:mt-0">
          {user?.profilepic ? (
            <img
              src={user?.profilepic}
              className="w-24 h-24 rounded-full border-4 border-white/20 shadow-xl object-cover"
              alt={user?.name}
            />
          ) : (
            <FaUserCircle size={96} className="text-white/50" />
          )}
          <h2 className="capitalize font-bold text-xl mt-3 text-center line-clamp-1">
            {user?.name || "Admin"}
          </h2>
          <div className="bg-white/10 px-3 py-1 rounded-full mt-2">
             <p className="text-primary-100 text-[10px] font-bold uppercase tracking-widest">
                Admin Portal
             </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-2">
          <NavLink
            to="all-users"
            onClick={() => setSidebarVisible(false)}
            className={({ isActive }) =>
              `${navStyle} ${
                isActive
                  ? "bg-white text-primary-700 shadow-lg"
                  : "text-white hover:bg-white/10"
              }`
            }
          >
            <FaUsers size={18} /> All Users
          </NavLink>

          <NavLink
            to="all-products"
            onClick={() => setSidebarVisible(false)}
            className={({ isActive }) =>
              `${navStyle} ${
                isActive
                  ? "bg-white text-primary-700 shadow-lg"
                  : "text-white hover:bg-white/10"
              }`
            }
          >
            <FaBoxOpen size={18} /> All Products
          </NavLink>

          <NavLink
            to="all-orders"
            onClick={() => setSidebarVisible(false)}
            className={({ isActive }) =>
              `${navStyle} ${
                isActive
                  ? "bg-white text-primary-700 shadow-lg"
                  : "text-white hover:bg-white/10"
              }`
            }
          >
            <FaShoppingCart size={18} /> All Orders
          </NavLink>
        </nav>
      </aside>

      {/* Main Content Area - এটা এখন আলাদাভাবে স্ক্রল হবে */}
      <main className="flex-1 overflow-y-auto max-h-[calc(100vh-70px)] custom-scrollbar">
        <div className="p-4 md:p-8">
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-4 md:p-8 min-h-full"
            >
              <Outlet />
            </motion.div>
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;