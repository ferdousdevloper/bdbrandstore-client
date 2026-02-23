import { createBrowserRouter, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import App from "../App";
import Home from "../pages/Home";
import SignIn from "../pages/SignIn";
import ForgotPassword from "../pages/ForgotPassword";
import SignUp from "../pages/SignUp";
import AdminPanel from "../pages/AdminPanel";
import AllUsers from "../pages/AllUsers";
import Products from "../pages/Products";
import CategoryProduct from "../pages/CategoryProduct";
import ProductDetail from "../pages/ProductDetail";
import Cart from "../pages/Cart";
import SearchProduct from "../pages/SearchProduct";
import UserPanel from "../pages/UserPanel";
import UserAccount from "../pages/UserAccount";
import UserWishList from "../pages/UserWishList";
import UserOrder from "../pages/UserOrder";
import VerifyOtp from "../pages/verifyOtp";
import ResetPassword from "../pages/ResetPassword";
import Success from "../pages/Success";
import Cancel from "../pages/Cancel";
import AdminOrders from "../pages/AdminOrders";
import Statistics from "../pages/Statistics";
import SummaryApi from "../common/API";
import { setUserDetails } from "../store/userSlice";
import { toast } from "react-toastify";

// --- ১. লগইন থাকলে SignIn/SignUp পেজে যেতে বাধা দেওয়ার কম্পোনেন্ট ---
const AuthRedirect = ({ children }) => {
  const user = useSelector((state) => state?.user?.user);
  return user ? <Navigate to="/" replace /> : children;
};

// --- ২. প্রোটেকশন এবং অটো-লগআউট লজিক ---
const ProtectedRoute = ({ children, allowedRole }) => {
  const user = useSelector((state) => state?.user?.user);
  const dispatch = useDispatch();

  // ইউজার যদি লগইন না থাকে
  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  // যদি ইউজার ভুল রোলে ঢোকার চেষ্টা করে (যেমন: ইউজার অ্যাডমিন প্যানেলে)
  if (allowedRole && user.role !== allowedRole) {
    // অটো লগআউট ফাংশন
    const autoLogout = async () => {
      await fetch(SummaryApi.userLogout.url, {
        method: SummaryApi.userLogout.method,
        credentials: "include",
      });
      dispatch(setUserDetails(null));
      toast.error("Unauthorized access! Logging out...");
    };
    
    autoLogout();
    return <Navigate to="/signin" replace />;
  }

  return children;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "",
        element: <Home />,
      },
      {
        path: "signin",
        element: <AuthRedirect> <SignIn /> </AuthRedirect>,
      },
      {
        path: "signup",
        element: <AuthRedirect> <SignUp /> </AuthRedirect>,
      },
      {
        path: "forgot-password",
        element: <ForgotPassword />,
      },
      {
        path: "verify-otp",
        element: <VerifyOtp />,
      },
      {
        path: "reset-password",
        element: <ResetPassword />,
      },
      {
        path: "category-product",
        element: <CategoryProduct />,
      },
      {
        path: "product/:id",
        element: <ProductDetail />,
      },
      {
        path: "search",
        element: <SearchProduct />,
      },
      {
        path: "success",
        element: <Success />,
      },
      {
        path: "cancel",
        element: <Cancel />,
      },

      // --- অ্যাডমিন প্যানেল প্রোটেক্টেড ---
      {
        path: "admin-panel",
        element: (
          <ProtectedRoute allowedRole="ADMIN">
            <AdminPanel />
          </ProtectedRoute>
        ),
        children: [
          {
            path: "statistics",
            element: <Statistics />,
          },
          {
            path: "all-users",
            element: <AllUsers />,
          },
          {
            path: "all-products",
            element: <Products />,
          },
          {
            path: "all-orders",
            element: <AdminOrders />,
          },
        ],
      },

      // --- ইউজার প্যানেল প্রোটেক্টেড ---
      {
        path: "user-panel",
        element: (
          <ProtectedRoute allowedRole="USER">
            <UserPanel />
          </ProtectedRoute>
        ),
        children: [
          {
            path: "my-account",
            element: <UserAccount />,
          },
          {
            path: "wishlist",
            element: <UserWishList />,
          },
          {
            path: "my-orders",
            element: <UserOrder />,
          },
          {
            path: "cart",
            element: <Cart />,
          },
        ],
      },
    ],
  },
]);

export default router;