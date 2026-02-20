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
    "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 relative";

  // Framer Motion Variants
  const sidebarVariants = {
    hidden: { x: "-100%" },
    visible: { x: 0, transition: { type: "spring", stiffness: 250, damping: 30 } },
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
  };

  return (
    <div className="flex min-h-[calc(100vh-70px)] bg-gray-100 relative">

      {/* Mobile Toggle */}
      <div
        className="absolute top-4 left-4 z-50 md:hidden cursor-pointer text-blue-700"
        onClick={toggleSidebar}
      >
        <FaBars size={24} />
      </div>

      {/* Overlay */}
      <AnimatePresence>
        {isSidebarVisible && (
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden"
            onClick={toggleSidebar}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={overlayVariants}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {(isSidebarVisible || window.innerWidth >= 768) && (
          <motion.aside
            className="fixed md:static top-0 left-0 h-full md:h-auto w-64 bg-white shadow-2xl p-6 z-40"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={sidebarVariants}
          >
            {/* Close mobile */}
            <div
              className="absolute top-3 right-3 md:hidden cursor-pointer text-gray-600"
              onClick={toggleSidebar}
            >
              ✕
            </div>

            {/* Profile */}
            <div className="flex flex-col items-center mb-10 mt-6 md:mt-0">
              {user?.profilepic ? (
                <img
                  src={user?.profilepic}
                  className="w-24 h-24 rounded-full border-4 border-blue-600 shadow-md"
                  alt={user?.name}
                />
              ) : (
                <FaUserCircle size={90} className="text-gray-400" />
              )}
              <h2 className="capitalize font-semibold text-xl mt-4 text-gray-800">
                {user?.name || "Admin"}
              </h2>
              <p className="text-sm text-gray-500">
                Role: {user?.role || "USER"}
              </p>
            </div>

            {/* Navigation */}
            <nav className="flex flex-col gap-2">
              <NavLink
                to="all-users"
                onClick={() => setSidebarVisible(false)}
                className={({ isActive }) =>
                  `${navStyle} ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                  }`
                }
              >
                <FaUsers size={18} />
                All Users
              </NavLink>

              <NavLink
                to="all-products"
                onClick={() => setSidebarVisible(false)}
                className={({ isActive }) =>
                  `${navStyle} ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                  }`
                }
              >
                <FaBoxOpen size={18} />
                Products
              </NavLink>

              <NavLink
                to="all-orders"
                onClick={() => setSidebarVisible(false)}
                className={({ isActive }) =>
                  `${navStyle} ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                  }`
                }
              >
                <FaShoppingCart size={18} />
                All Orders
              </NavLink>
            </nav>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 min-h-[80vh]">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;