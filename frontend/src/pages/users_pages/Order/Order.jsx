import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { Tab } from "@headlessui/react";
import { Disclosure } from "@headlessui/react";
import { ChevronUpIcon } from "@heroicons/react/20/solid";

const TABS = ["Catering", "Stationary"];
axios.defaults.withCredentials = true;

const API_BASE_URL = "http://localhost:5000/voyager";

const tabToEndpoints = {
  Catering: {
    ordered: `${API_BASE_URL}/get-ordered-catering`,
    accepted: `${API_BASE_URL}/get-accepted-catering`,
  },
  Stationary: {
    ordered: `${API_BASE_URL}/get-ordered-stationary`,
    accepted: `${API_BASE_URL}/get-accepted-stationary`,
  },
  // Repeat for other tabs
};
function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const Order = () => {
  const searchParams = new URLSearchParams(location.search);
  const tabParam = searchParams.get("tab") || "catering";

  const initialTab = tabParam.charAt(0).toUpperCase() + tabParam.slice(1);
  const initialIndex = TABS.findIndex((t) => t.toLowerCase() === tabParam);

  const [selectedTab, setSelectedTab] = useState(initialTab);
  const [tabIndex, setTabIndex] = useState(
    initialIndex !== -1 ? initialIndex : 0
  );
  const [orderedData, setOrderedData] = useState([]);
  const [acceptedData, setAcceptedData] = useState([]);
  const navigate = useNavigate();

  const handleTabChange = (tab) => {
    setSelectedTab(tab); // Fix: use correct state setter
    navigate(`/order?tab=${tab.toLowerCase()}`);
  };

  useEffect(() => {
    fetchTabOrders(TABS[tabIndex]);
  }, [tabIndex]);

  const fetchTabOrders = async (tabName) => {
    try {
      const token = localStorage.getItem("token");
      const endpoints = tabToEndpoints[tabName];
      // console.log(endpoints);
      if (!endpoints) return;

      const [orderedRes, acceptedRes] = await Promise.all([
        axios.get(endpoints.ordered, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(endpoints.accepted, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      // console.log("Stationary ordered:", orderedRes.data);
      // console.log("Stationary accepted:", acceptedRes.data);

      setOrderedData(orderedRes.data.orders || []);
      setAcceptedData(acceptedRes.data.orders || []);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  const groupByOrderId = (ordered = [], accepted = []) => {
    const grouped = {};

    // Combine all orders
    const allOrders = [...ordered, ...accepted];

    allOrders.forEach((order) => {
      const orderId = order._id;

      // Initialize group if not already
      if (!grouped[orderId]) {
        grouped[orderId] = {
          orderInfo: {
            createdAt: order.createdAt,
            status: "Ordered", // Default to Ordered
          },
          items: [],
        };
      }

      // Add items to the group
      grouped[orderId].items.push(...order.items);

      // If any item has status Accepted, upgrade order status
      const hasAccepted = order.items.some(
        (item) => item.status === "Accepted"
      );
      if (hasAccepted) {
        grouped[orderId].orderInfo.status = "Accepted";
      }
    });

    return grouped;
  };

  // const combinedData = [...orderedData, ...acceptedData];
  // const groupedOrders = groupByOrderId(combinedData);
  const groupedOrders = groupByOrderId(orderedData, acceptedData);

  const renderGroupedAccordion = (groupedOrders) => {

    const orderIds = Object.keys(groupedOrders);

    if (orderIds.length === 0) {
      return (
        <div className="text-center text-gray-400 py-8">
          No items in this category.
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {/* {Object.entries(groupedOrders).map(([orderId, orderData]) => {
          const items = orderData.items;
          const { createdAt } = orderData.orderInfo;

          const orderTotal = items.reduce(
            (total, item) => total + item.price * item.quantity,
            0
          ); */}
        {orderIds.map((orderId) => {
          const orderData = groupedOrders[orderId];
          const items = orderData.items;
          const { createdAt } = orderData.orderInfo;

          const orderTotal = items.reduce(
            (total, item) => total + item.price * item.quantity,
            0
          );

          return (
            <Disclosure key={orderId}>
              {({ open }) => (
                <>
                  <Disclosure.Button className="flex justify-between w-full bg-gray-100 px-4 py-5 text-left text-lg font-medium text-black rounded-lg hover:bg-gray-200">
                    <div>
                      <p className="text-sm text-black">Order ID: {orderId}</p>
                      <p className="text-sm text-black">
                        {new Date(createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex flex-col items-end justify-center">
                      <span
                        className={`text-xs font-semibold mb-1 px-2 py-1 rounded-full ${
                          orderData.orderInfo.status === "Accepted"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {orderData.orderInfo.status}
                      </span>
                      <ChevronUpIcon
                        className={`${
                          open ? "rotate-180 transform" : ""
                        } w-5 h-5 text-black self-center`}
                      />
                    </div>
                  </Disclosure.Button>
                  <Disclosure.Panel className="px-4 pt-4 pb-2 text-sm text-gray-700 bg-white rounded-lg shadow">
                    {items.map((item) => (
                      <div
                        key={item._id}
                        className="flex justify-between items-center border-b py-2"
                      >
                        <div className="flex gap-4 items-center">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-12 w-12 rounded object-cover"
                          />
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm">₹{item.price}</p>
                            <p className="text-xs text-gray-500">
                              Qty: {item.quantity}
                            </p>
                          </div>
                        </div>
                        <div className="font-bold text-right">
                          ₹{item.price * item.quantity}
                        </div>
                      </div>
                    ))}
                    <div className="text-right mt-3 font-semibold">
                      Total: ₹{orderTotal.toFixed(2)}
                    </div>
                  </Disclosure.Panel>
                </>
              )}
            </Disclosure>
          );
        })}
      </div>
    );
  };

  return (
    <section className="py-8 antialiased md:py-16">
      <div className="mx-auto max-w-screen-xl px-4 2xl:px-0">
        <h2 className="text-xl font-semibold text-white sm:text-2xl">
          My Orders
        </h2>

        {/* Tabs and Accordion */}
        <div className="mt-4">
          <Tab.Group selectedIndex={tabIndex} onChange={setTabIndex}>
            {/* Tab Buttons */}
            <Tab.List className="flex space-x-5 rounded-xl bg-blue-900/20 p-1 mb-6">
              {TABS.map((tab) => (
                <Tab
                  key={tab}
                  onClick={() => handleTabChange(tab)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    selectedTab === tab
                      ? "bg-white text-black"
                      : "bg-gray-700 text-white hover:bg-gray-600"
                  }`}
                >
                  {tab}
                </Tab>
              ))}
            </Tab.List>

            {/* Accordion Section */}
            <Tab.Panels>
              {TABS.map((tab, index) => (
                <Tab.Panel key={tab}>
                  {tabIndex === index && (
                    <div className="w-full">
                      {renderGroupedAccordion(groupedOrders)}
                    </div>
                  )}
                </Tab.Panel>
              ))}
            </Tab.Panels>
          </Tab.Group>
        </div>
      </div>
    </section>
  );
};

export default Order;
