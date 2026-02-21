import { GrSearch } from "react-icons/gr";
import { FaCircleUser } from "react-icons/fa6";
import { FaShoppingCart } from "react-icons/fa";
import React, { useContext, useState, useRef, useEffect } from "react";
import Logo from "./Logo";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import SummaryApi from "../common/API";
import { toast } from "react-toastify";
import { setUserDetails } from "../store/userSlice";
import ROLE from "../common/Role";
import { useCart } from "../context/CartContext";
import { FaHeart } from "react-icons/fa";
import Context from "../context/Context";
import { motion, AnimatePresence } from "framer-motion";

const Header = () => {
  const user = useSelector((state) => state?.user?.user);
  const [menuDisplay, setMenuDisplay] = useState(false);
  const menuRef = useRef(null);
  const { cartCount } = useCart();
  const context = useContext(Context);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const urlSearch = new URLSearchParams(location?.search);
  const searchQuery = urlSearch.getAll("q");
  const [searchValue, setSearchValue] = useState(searchQuery);

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
    }
    if (data.error) toast.error(data.message);
  };

  const handleSearch = (e) => {
    const { value } = e.target;
    setSearchValue(value);
    if (value) navigate(`/search?q=${value}`);
    else navigate("/");
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuDisplay(false);
    };
    if (menuDisplay) document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [menuDisplay]);

  return (
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-surface-200/80 fixed w-full z-40 shadow-soft">
      <div className="h-full container mx-auto flex items-center px-4 md:px-6 justify-between gap-4">
        <Link to="/" className="flex-shrink-0">
          <Logo w={100} h={60} />
        </Link>

        <div className="hidden md:flex flex-1 max-w-xl mx-4">
          <div className="relative w-full group">
            <input
              type="text"
              placeholder="Search products, brands..."
              className="w-full py-2.5 pl-4 pr-12 rounded-2xl border border-surface-200 bg-surface-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all"
              value={searchValue}
              onChange={handleSearch}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl bg-primary-500 text-white flex items-center justify-center group-hover:bg-primary-600 transition-colors">
              <GrSearch className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-5">
          {user?._id && (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuDisplay((prev) => !prev)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-surface-100 transition-colors"
              >
                {user?.profilepic ? (
                  <img src={user?.profilepic} className="w-9 h-9 rounded-full object-cover ring-2 ring-surface-200" alt={user?.name} />
                ) : (
                  <span className="w-9 h-9 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center">
                    <FaCircleUser className="text-lg" />
                  </span>
                )}
              </button>
              <AnimatePresence>
                {menuDisplay && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute right-0 top-full mt-2 py-2 w-48 bg-white rounded-2xl shadow-card border border-surface-100 overflow-hidden"
                  >
                    {user?.role === ROLE.ADMIN ? (
                      <Link
                        to="/admin-panel/all-products"
                        className="block px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-primary-50 hover:text-primary-700 transition-colors"
                        onClick={() => setMenuDisplay(false)}
                      >
                        Admin Panel
                      </Link>
                    ) : (
                      <Link
                        to="/user-panel/my-account"
                        className="block px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-primary-50 hover:text-primary-700 transition-colors"
                        onClick={() => setMenuDisplay(false)}
                      >
                        My Account
                      </Link>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {user?._id && user?.role === ROLE.USER && (
            <Link
              to="/user-panel/wishlist"
              className="relative p-2 rounded-xl text-slate-600 hover:bg-surface-100 hover:text-accent-coral transition-colors"
            >
              <FaHeart className="text-xl" />
              {context.wishListProductCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-xs font-semibold text-white bg-accent-coral rounded-full">
                  {context.wishListProductCount}
                </span>
              )}
            </Link>
          )}

          {user?._id && user?.role === ROLE.USER && (
            <Link
              to="/user-panel/cart"
              className="relative p-2 rounded-xl text-slate-600 hover:bg-surface-100 hover:text-primary-600 transition-colors"
            >
              <FaShoppingCart className="text-xl" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-xs font-semibold text-white bg-primary-500 rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>
          )}

          {user?._id ? (
            <button
              className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 bg-surface-100 hover:bg-surface-200 transition-colors"
              onClick={handleLogout}
            >
              Logout
            </button>
          ) : (
            <Link to="/signin">
              <button className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-primary-500 hover:bg-primary-600 transition-colors shadow-soft">
                Sign In
              </button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
