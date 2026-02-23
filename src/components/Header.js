import { GrSearch } from "react-icons/gr";
import { FaCircleUser } from "react-icons/fa6";
import { FaShoppingCart, FaHeart } from "react-icons/fa";
import React, { useContext, useState, useRef, useEffect } from "react";
import Logo from "../assest/bdbrandstore2.png";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import SummaryApi from "../common/API";
import { toast } from "react-toastify";
import { setUserDetails } from "../store/userSlice";
import ROLE from "../common/Role";
import { useCart } from "../context/CartContext";
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
    <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-100 fixed w-full z-40 shadow-sm">
      <div className="h-full container mx-auto flex items-center px-4 md:px-6 justify-between gap-4">
        
        {/* --- Logo Section --- */}
        <Link to="/" className="flex items-center gap-1 group overflow-hidden">
          <div className="h-10 w-auto md:h-12 flex items-center">
            <img 
                src={Logo} 
                alt="BD Brand Store Logo" 
                className="h-full w-full object-contain"
            />
          </div>
        </Link>

        {/* --- Search Section --- */}
        <div className="hidden md:flex flex-1 max-w-xl mx-4">
          <div className="relative w-full group">
            <input
              type="text"
              placeholder="Search premium products..."
              className="w-full py-2.5 pl-5 pr-12 rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:bg-white focus:border-primary-400 transition-all font-medium"
              value={searchValue}
              onChange={handleSearch}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl bg-primary-600 text-white flex items-center justify-center group-hover:bg-primary-700 transition-colors shadow-lg shadow-primary-200">
              <GrSearch className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* --- Action Buttons --- */}
        <div className="flex items-center gap-2 md:gap-4">
          
          {/* User Profile Menu */}
          {user?._id && (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuDisplay((prev) => !prev)}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 transition-colors"
              >
                {user?.profilepic ? (
                  <img src={user?.profilepic} className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-100" alt={user?.name} />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center border border-primary-200">
                    <FaCircleUser className="text-xl" />
                  </div>
                )}
              </button>
              
              <AnimatePresence>
                {menuDisplay && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="absolute right-0 top-full mt-3 py-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden"
                  >
                    <div className="px-4 py-2 border-b border-slate-50 mb-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase">Signed in as</p>
                        <p className="text-xs font-bold text-slate-700 truncate">{user?.name || user?.email}</p>
                    </div>
                    {user?.role === ROLE.ADMIN ? (
                      <Link
                        to="/admin-panel/all-products"
                        className="block px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-primary-50 hover:text-primary-700 transition-colors"
                        onClick={() => setMenuDisplay(false)}
                      >
                        Admin Dashboard
                      </Link>
                    ) : (
                      <Link
                        to="/user-panel/my-account"
                        className="block px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-primary-50 hover:text-primary-700 transition-colors"
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

          {/* Wishlist Icon - Hidden only for ADMIN */}
          {user?.role !== ROLE.ADMIN && (
            <Link
              to="/user-panel/wishlist"
              className="relative p-2.5 rounded-xl text-slate-600 hover:bg-rose-50 hover:text-rose-500 transition-all active:scale-90"
            >
              <FaHeart className="text-xl" />
              {context.wishListProductCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-black text-white bg-rose-500 rounded-full border-2 border-white">
                  {context.wishListProductCount}
                </span>
              )}
            </Link>
          )}

          {/* Cart Icon - Hidden only for ADMIN */}
          {user?.role !== ROLE.ADMIN && (
            <Link
              to="/user-panel/cart"
              className="relative p-2.5 rounded-xl text-slate-600 hover:bg-primary-50 hover:text-primary-600 transition-all active:scale-90"
            >
              <FaShoppingCart className="text-xl" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-black text-white bg-primary-600 rounded-full border-2 border-white">
                  {cartCount}
                </span>
              )}
            </Link>
          )}

          {/* Login/Logout Button */}
          {user?._id ? (
            <button
              className="hidden sm:block px-5 py-2.5 rounded-xl text-xs font-black text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all active:scale-95 uppercase tracking-wider"
              onClick={handleLogout}
            >
              Logout
            </button>
          ) : (
            <Link to="/signin">
              <button className="px-6 py-2.5 rounded-xl text-xs font-black text-white bg-primary-600 hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 active:scale-95 uppercase tracking-wider">
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