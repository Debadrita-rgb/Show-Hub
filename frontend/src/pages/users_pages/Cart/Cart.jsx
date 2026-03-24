import React, { useEffect, useState } from "react";
import {
  useLocation,
  useSearchParams,
  useNavigate,
  Link,
} from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const TABS = ["Catering", "Stationary"];

const serviceToEndpoint = {
  Catering: {
    get: "my-catering",
    update: "update-catering-quantity",
    delete: "delete-item-catering",
    status: "update-status-catering",
  },
  Stationary: {
    get: "my-stationary",
    update: "update-quantity-stationary",
    delete: "delete-stationary-items",
    status: "update-stationary-status",
  },
};

const Cart = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const defaultTab =
    queryParams.get("tab")?.charAt(0).toUpperCase() +
      queryParams.get("tab")?.slice(1) || "Catering";

  const [selectedTab, setSelectedTab] = useState(defaultTab);
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const tab = searchParams.get("tab");

  const handleContinueShopping = () => {
    if (tab === "catering") {
      navigate("/services/catering");
    } else if (tab === "stationary") {
      navigate("/services/stationary");
    } else {
      navigate("/services"); // fallback
    }
  };

  const handleTabChange = (tab) => {
    setSelectedTab(tab); // Fix: use correct state setter
    navigate(`/cart?tab=${tab.toLowerCase()}`);
  };

  const fetchCartItems = async (tabName) => {
    try {
      const token = localStorage.getItem("token");
      const endpoint = serviceToEndpoint[tabName]?.get;
      if (!endpoint) return;
      const res = await axios.get(`http://localhost:5000/voyager/${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCartItems(res.data.items || []);
    } catch (error) {
      console.error("Failed to fetch cart items:", error);
    }
  };

  useEffect(() => {
    fetchCartItems(selectedTab);
  }, [selectedTab]);

  const updateQuantity = async (itemId, delta) => {
    const item = cartItems.find((i) => i._id === itemId);
    if (!item) return;
    const newQuantity = Math.max(1, item.quantity + delta);
    const endpoint = serviceToEndpoint[selectedTab]?.update;

    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `http://localhost:5000/voyager/${endpoint}`,
        {
          orderId: item.orderId,
          itemId: item._id,
          quantity: newQuantity,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Item is successfully updated from your cart!");
      setCartItems((prev) =>
        prev.map((i) =>
          i._id === itemId ? { ...i, quantity: newQuantity } : i
        )
      );
    } catch (err) {
      console.error("Error updating quantity:", err);
    }
  };

  const deleteItem = async (orderId, itemId) => {
    const endpoint = serviceToEndpoint[selectedTab]?.delete;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/voyager/${endpoint}`, {
        data: { orderId, itemId },
        headers: { Authorization: `Bearer ${token}` },
      });
      setCartItems((prev) => prev.filter((item) => item._id !== itemId));
      toast.success("Item is successfully removed from your cart!");
    } catch (error) {
      console.error("Failed to delete item:", error);
    }
  };

  const handleOrdered = async (orderId, newStatus) => {
    const endpoint = serviceToEndpoint[selectedTab]?.status;
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/voyager/${endpoint}`,
        { orderId, newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Order is successfully placed!");
      setTimeout(() => {
        navigate(`/order?tab=${selectedTab.toLowerCase()}`);        
      }, 2000);
      // fetchCartItems(selectedTab);
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const totalAmount = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const totalItems = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );
  return (
    <section className="py-8 antialiased md:py-16">
      <ToastContainer position="top-right" autoClose={2000} />
      <div className="mx-auto max-w-screen-xl px-4 2xl:px-0">
        <h2 className="text-xl font-semibold text-white sm:text-2xl">
          Shopping Cart
        </h2>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mt-4">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                selectedTab === tab
                  ? "bg-white text-black"
                  : "bg-gray-700 text-white hover:bg-gray-600"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        {cartItems.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            No items in this category
          </div>
        ) : (
          <>
            <div className="flex justify-end">
              <button
                onClick={handleContinueShopping}
                className="bg-cyan-400 hover:bg-cyan-500 text-black font-bold py-2 px-6 rounded-xl shadow-lg cursor-pointer"
              >
                Continue shopping
              </button>
            </div>
            <div className="mt-6 sm:mt-8 md:gap-6 lg:flex lg:items-start xl:gap-8">
              {/* Cart Items */}
              <div className="mx-auto w-full flex-none lg:max-w-2xl xl:max-w-4xl">
                <div className="space-y-6">
                  {cartItems.map((item) => (
                    <div
                      key={item._id}
                      className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 md:p-6"
                    >
                      <div className="space-y-4 md:flex md:items-center md:justify-between md:gap-6 md:space-y-0">
                        <Link to="#" className="shrink-0 md:order-1">
                          <img
                            className="h-20 w-20 dark:hidden"
                            src={item.image}
                            alt={item.name}
                          />
                        </Link>
                        <div className="w-full min-w-0 flex-1 space-y-4 md:order-2 md:max-w-md">
                          <p className="text-base font-medium text-gray-900 dark:text-white">
                            {item.name}
                          </p>
                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => deleteItem(item.orderId, item._id)}
                              className="text-sm font-medium text-red-600 hover:none cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between md:order-3 md:justify-end">
                          <div className="flex items-center">
                            <button
                              onClick={() => updateQuantity(item._id, -1)}
                              className="inline-flex h-5 w-5 items-center justify-center rounded-md text-black border border-gray-800 bg-gray-200"
                            >
                              -
                            </button>
                            <input
                              type="text"
                              value={item.quantity}
                              readOnly
                              className="w-10 text-center bg-transparent text-black"
                            />
                            <button
                              onClick={() => updateQuantity(item._id, 1)}
                              className="inline-flex h-5 w-5 items-center justify-center rounded-md text-black border border-gray-800 bg-gray-200"
                            >
                              +
                            </button>
                          </div>
                          <div className="text-end md:w-32">
                            <p className="text-base font-bold text-gray-900 dark:text-white">
                              ₹{item.price * item.quantity}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="mx-auto mt-6 max-w-4xl flex-1 space-y-6 lg:mt-0 lg:w-full">
                <div className="space-y-4 rounded-lg border border-gray-200 p-4 bg-gray-200 sm:p-6">
                  <p className="text-xl font-semibold text-gray-900 dark:text-white">
                    Order summary
                  </p>
                  <div className="space-y-2 text-black">
                    <dl className="flex justify-between">
                      <dt>Total Items</dt>
                      <dd>{totalItems}</dd>
                    </dl>
                    <dl className="flex justify-between border-t pt-2">
                      <dt>Total</dt>
                      <dd>₹{totalAmount.toFixed(2)}</dd>
                    </dl>
                  </div>
                  {cartItems.length > 0 && (
                    <button
                      onClick={() =>
                        handleOrdered(cartItems[0].orderId, "Ordered")
                      }
                      className="bg-cyan-400 hover:bg-cyan-500 text-black font-bold py-2 px-6 rounded-xl shadow-lg cursor-pointer"
                    >
                      Mark as Order
                    </button>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default Cart;
