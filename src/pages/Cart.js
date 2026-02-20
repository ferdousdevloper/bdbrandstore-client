import React, { useEffect, useState } from "react";
import SummaryApi from "../common/API";
import { useSelector } from "react-redux";
import cartImg from "../assest/Images/Cart.webp";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { FaPlusCircle, FaMinusCircle } from "react-icons/fa";
import displayBDTCurrency from "../helpers/displayCurrency";
import { MdDelete } from "react-icons/md";
import { toast } from "react-toastify";
import { loadStripe } from "@stripe/stripe-js";

const Cart = () => {

  const user = useSelector((state) => state?.user?.user);
  const { countCartProducts } = useCart();

  const [cartData, setCartData] = useState([]);
  const [showShipping, setShowShipping] = useState(false);

  const [shippingData, setShippingData] = useState({
    fullName: "",
    address: "",
    phone: "",
  });

  // ---------------- FETCH CART ----------------
  const fetchCartData = async () => {
    if (!user?._id) return;

    const res = await fetch(
      `${SummaryApi.countCart.url}/${user._id}`,
      {
        method: SummaryApi.countCart.method,
        credentials: "include",
        headers: { "content-type": "application/json" },
      }
    );

    const data = await res.json();

    if (data.success) {
      setCartData(data.data);
    }
  };

  useEffect(() => {
    fetchCartData();
  }, [user]);

  // ---------------- UPDATE QTY ----------------
  const updateQuantity = async (id, qty, increase) => {
    const newQty = increase ? qty + 1 : qty - 1;
    if (newQty < 1) return;

    await fetch(SummaryApi.updateProductQuantity.url, {
      method: SummaryApi.updateProductQuantity.method,
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        productId: id,
        quantity: newQty,
      }),
    });

    fetchCartData();
  };

  // ---------------- DELETE ITEM ----------------
  const deleteProduct = async (id) => {
    const res = await fetch(SummaryApi.deleteCartProduct.url, {
      method: SummaryApi.deleteCartProduct.method,
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ cartProductId: id }),
    });

    const data = await res.json();

    if (data.success) {
      toast.success("Item removed");
      fetchCartData();
      countCartProducts();
    }
  };

  // ---------------- TOTALS ----------------
  const totalQty = cartData.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const totalPrice = cartData.reduce(
    (sum, item) =>
      sum + item.quantity * item?.productId?.sellingPrice,
    0
  );

  // ---------------- VALIDATE SHIPPING ----------------
  const validateShipping = () => {
    if (!shippingData.fullName || !shippingData.address || !shippingData.phone) {
      toast.error("Please fill all shipping fields");
      return false;
    }
    return true;
  };

  // ---------------- COD ORDER ----------------
  const handleCOD = async () => {

    if (!validateShipping()) return;

    const res = await fetch(SummaryApi.codOrder.url, {
      method: SummaryApi.codOrder.method,
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        cartItems: cartData,
        shippingDetails: shippingData,
      }),
    });

    const data = await res.json();

    if (data.success) {
      toast.success("COD Order placed successfully");
      setShippingData({ fullName: "", address: "", phone: "" });
      fetchCartData();
    } else {
      toast.error(data.message);
    }
  };

  // ---------------- STRIPE PAYMENT ----------------
  const handlePayment = async () => {

    if (!validateShipping()) return;

    const stripe = await loadStripe(
      process.env.REACT_APP_STRIPE_PUBLIC_KEY
    );

    const res = await fetch(SummaryApi.checkout.url, {
      method: SummaryApi.checkout.method,
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        cartItems: cartData,
        shippingDetails: shippingData,
      }),
    });

    const data = await res.json();

    if (data?.id) {
      stripe.redirectToCheckout({ sessionId: data.id });
    } else {
      toast.error("Payment failed");
    }
  };

  // ---------------- UI ----------------
  return (
    <div className="container mx-auto p-6">

      <h2 className="text-2xl font-bold mb-6">My Cart</h2>

      {cartData.length === 0 ? (
        <div className="text-center">
          <img src={cartImg} className="mx-auto w-40" alt="cart" />
          <p className="mt-4 text-gray-600">No items in cart</p>
          <Link
            to="/"
            className="text-blue-600 font-semibold mt-2 inline-block"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">

          {/* CART ITEMS */}
          <div className="lg:col-span-2 space-y-4">
            {cartData.map((item) => (
              <div
                key={item._id}
                className="border p-4 rounded-lg flex gap-4 shadow-sm"
              >
                <img
                  src={item?.productId?.productImage[0]}
                  className="w-24 h-24 object-cover rounded"
                  alt="product"
                />

                <div className="flex-1">
                  <h3 className="font-semibold">
                    {item?.productId?.productName}
                  </h3>

                  <p className="text-green-600 font-bold">
                    {displayBDTCurrency(
                      item?.productId?.sellingPrice
                    )}
                  </p>

                  <div className="flex items-center gap-3 mt-2">
                    <FaMinusCircle
                      className="cursor-pointer"
                      onClick={() =>
                        updateQuantity(
                          item._id,
                          item.quantity,
                          false
                        )
                      }
                    />
                    <span>{item.quantity}</span>
                    <FaPlusCircle
                      className="cursor-pointer"
                      onClick={() =>
                        updateQuantity(
                          item._id,
                          item.quantity,
                          true
                        )
                      }
                    />
                  </div>
                </div>

                <MdDelete
                  className="text-red-500 text-xl cursor-pointer"
                  onClick={() => deleteProduct(item._id)}
                />
              </div>
            ))}
          </div>

          {/* SUMMARY + SHIPPING */}
          <div className="border p-5 rounded-lg shadow-md h-fit">

            <h3 className="text-lg font-semibold mb-4">
              Order Summary
            </h3>

            <p>Total Quantity: {totalQty}</p>
            <p className="font-bold text-lg">
              Total: {displayBDTCurrency(totalPrice)}
            </p>

            <button
              onClick={() => setShowShipping(!showShipping)}
              className="w-full bg-gray-800 text-white py-2 mt-4 rounded"
            >
              Add Shipping Details
            </button>

            {showShipping && (
              <div className="mt-4 space-y-3">
                <input
                  className="border w-full p-2 rounded"
                  placeholder="Full Name"
                  value={shippingData.fullName}
                  onChange={(e) =>
                    setShippingData({
                      ...shippingData,
                      fullName: e.target.value,
                    })
                  }
                />

                <input
                  className="border w-full p-2 rounded"
                  placeholder="Address"
                  value={shippingData.address}
                  onChange={(e) =>
                    setShippingData({
                      ...shippingData,
                      address: e.target.value,
                    })
                  }
                />

                <input
                  className="border w-full p-2 rounded"
                  placeholder="Mobile Number"
                  value={shippingData.phone}
                  onChange={(e) =>
                    setShippingData({
                      ...shippingData,
                      phone: e.target.value,
                    })
                  }
                />
              </div>
            )}

            <button
              onClick={handlePayment}
              className="w-full bg-blue-600 text-white py-2 mt-4 rounded"
            >
              Pay Online
            </button>

            <button
              onClick={handleCOD}
              className="w-full bg-green-600 text-white py-2 mt-2 rounded"
            >
              Cash On Delivery
            </button>

          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;