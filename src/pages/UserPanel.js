import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, Outlet, useNavigate } from "react-router-dom";
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

  return (
    <div className="flex min-h-[calc(100vh-70px)] bg-gray-50 relative">

      {/* Mobile Toggle */}
      <div
        className="absolute top-4 left-4 z-50 md:hidden cursor-pointer text-blue-700"
        onClick={toggleSidebar}
      >
        <FaBars size={24} />
      </div>

      {/* Overlay (Mobile only) */}
      {isSidebarVisible && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static top-0 left-0 h-full md:h-auto w-64 bg-gradient-to-b from-blue-700 via-blue-600 to-blue-500 text-white p-6 shadow-lg z-40 transform transition-transform duration-300 ${
          isSidebarVisible
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Close button mobile */}
        <div
          className="absolute top-3 right-3 md:hidden cursor-pointer"
          onClick={toggleSidebar}
        >
          ✕
        </div>

        {/* Profile */}
        <div className="flex flex-col items-center mb-8 mt-6 md:mt-0">
          {user?.profilepic ? (
            <img
              src={user.profilepic}
              className="w-24 h-24 rounded-full border-4 border-white shadow-md"
              alt={user?.name}
            />
          ) : (
            <FaUserCircle size={96} />
          )}
          <h2 className="capitalize font-bold text-2xl mt-3">
            {user?.name || "User"}
          </h2>
          <p className="text-gray-200 mt-1 text-sm">{user?.email}</p>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-3">
          <Link
            to="my-account"
            onClick={() => setSidebarVisible(false)}
            className="flex items-center gap-3 px-4 py-2 rounded hover:bg-white/20 font-semibold text-lg transition-colors"
          >
            <BsPersonCircle /> Profile
          </Link>

          <Link
            to="wishlist"
            onClick={() => setSidebarVisible(false)}
            className="flex items-center gap-3 px-4 py-2 rounded hover:bg-white/20 font-semibold text-lg transition-colors"
          >
            <FaHeart /> Wishlist
          </Link>

          <Link
            to="cart"
            onClick={() => setSidebarVisible(false)}
            className="flex items-center gap-3 px-4 py-2 rounded hover:bg-white/20 font-semibold text-lg transition-colors"
          >
            <FaShoppingCart /> Cart
          </Link>

          <Link
            to="my-orders"
            onClick={() => setSidebarVisible(false)}
            className="flex items-center gap-3 px-4 py-2 rounded hover:bg-white/20 font-semibold text-lg transition-colors"
          >
            <RiFolderUploadFill /> Orders
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2 rounded hover:bg-red-600 font-semibold text-lg transition-colors mt-4 w-full"
          >
            <FaPowerOff /> Sign Out
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6">
        <div className="bg-white rounded-lg shadow-md p-6 min-h-[80vh]">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default UserPanel;