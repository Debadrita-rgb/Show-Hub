import React, { useState } from "react";
import DynamicForm from "../../../components/commonComponent/CrudComponent/DynamicFormComponent";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import BASE_URL from "../../../../config";

const AddTheater = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({});
  const [isMultiple, setIsMultiple] = useState(false);
  const [isPreMeal, setIsPreMeal] = useState(false);
  const [foodItems, setFoodItems] = useState([
    { title: "", imageUrl: "", foodPrice: "", foodCategory: "" },
  ]);
const foodCategories = ["Popcorn", "Snacks", "Combos", "Beverages"];

  const [isParkingFacility, setIsParkingFacility] = useState(false);
  const [isFoodCourt, setIsFoodCourt] = useState(false);
  const [isWheelChairFacility, setIsWheelChairFacility] = useState(false);

  const [halls, setHalls] = useState([
    {
      hall_name: "",
      seatCategories: [
        { seat_name: "", totalRows: "", seatsPerRow: "", price: "" },
      ],
    },
  ]);

  // Hall Handlers

  const handleHallChange = (index, field, value) => {
    const updated = [...halls];
    updated[index][field] = value;
    setHalls(updated);
  };

  const addHall = () => {
    setHalls([
      ...halls,
      {
        hall_name: "",
        seatCategories: [
          { seat_name: "", totalRows: "", seatsPerRow: "", price: "" },
        ],
      },
    ]);
  };

  const removeHall = (index) => {
    const updated = [...halls];
    updated.splice(index, 1);
    setHalls(updated);
  };

  // Seat Category Handlers

  const handleSeatChange = (hallIndex, seatIndex, field, value) => {
    const updated = [...halls];
    updated[hallIndex].seatCategories[seatIndex][field] = value;
    setHalls(updated);
  };

  const addSeatCategory = (hallIndex) => {
    const updated = [...halls];
    updated[hallIndex].seatCategories.push({
      seat_name: "",
      totalRows: "",
      seatsPerRow: "",
      price: "",
    });
    setHalls(updated);
  };

  const removeSeatCategory = (hallIndex, seatIndex) => {
    const updated = [...halls];
    updated[hallIndex].seatCategories.splice(seatIndex, 1);
    setHalls(updated);
  };

  // Food Handlers
  // handle food change
  const handleFoodChange = (index, field, value) => {
    const updated = [...foodItems];
    updated[index][field] = value;
    setFoodItems(updated);
  };

  // add food
  const addFoodItem = () => {
    setFoodItems([
      ...foodItems,
      { title: "", imageUrl: "", foodPrice: "", foodCategory: "" },
    ]);
  };

  // remove food
  const removeFoodItem = (index) => {
    const updated = [...foodItems];
    updated.splice(index, 1);
    setFoodItems(updated);
  };

  // Submit Handler

  const handleSubmit = async (data) => {
    try {
      const token = localStorage.getItem("token");

      const payload = {
        ...data,
        isMultiple,
        isPreMeal,
        isParkingFacility,
        isFoodCourt,
        isWheelChairFacility,

        halls: isMultiple ? halls : [halls[0]],
        foodItems: isPreMeal ? foodItems : [],
      };
      // console.log(payload);
      await axios.post(`${BASE_URL}/admin/add-theater`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Theater added successfully!");
      navigate("/admin/view-all-theater");
    } catch (error) {
      console.error(error);
      toast.error("Failed to add theater");
    }
  };

  // DynamicForm Fields

  const fields = [
    {
      name: "location_name",
      label: "Location Name",
      type: "select",
      required: true,
      options: [
        "Kolkata",
        "Mumbai",
        "Delhi",
        "Bangalore",
        "Hyderabad",
        "Ahmedabad",
        "Pune",
        "Chennai",
      ],
    },
    {
      name: "theater_name",
      label: "Theater Name",
      type: "text",
      required: true,
    },
  ];
  return (
    <div className="p-8">
      <ToastContainer position="top-right" autoClose={2000} />

      <DynamicForm
        fields={fields}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        submitText="Save Theater"
      />
      <div className="mt-4 bg-white p-6 rounded-xl shadow">
        <label className="flex items-center gap-2 text-gray-700 font-medium">
          <input
            type="checkbox"
            checked={isMultiple}
            onChange={(e) => {
              setIsMultiple(e.target.checked);
            }}
            className="w-4 h-4"
          />
          Multiple Halls
        </label>
        {/* Pre Meal */}
        <label className="flex items-center gap-2 text-gray-700 font-medium">
          <input
            type="checkbox"
            checked={isPreMeal}
            onChange={(e) => {
              setIsPreMeal(e.target.checked);
            }}
            className="w-4 h-4"
          />
          Pre Meal Order
        </label>

        <label className="flex items-center gap-2 text-gray-700 font-medium">
          <input
            type="checkbox"
            checked={isParkingFacility}
            onChange={(e) => {
              setIsParkingFacility(e.target.checked);
            }}
            className="w-4 h-4"
          />
          Parking Facility
        </label>

        <label className="flex items-center gap-2 text-gray-700 font-medium">
          <input
            type="checkbox"
            checked={isFoodCourt}
            onChange={(e) => {
              setIsFoodCourt(e.target.checked);
            }}
            className="w-4 h-4"
          />
          Food Court
        </label>

        <label className="flex items-center gap-2 text-gray-700 font-medium">
          <input
            type="checkbox"
            checked={isWheelChairFacility}
            onChange={(e) => {
              setIsWheelChairFacility(e.target.checked);
            }}
            className="w-4 h-4"
          />
          Wheel Chair Facility{" "}
        </label>
      </div>
      {/* Seat Arrangement Section */}
      <div className="mt-8 bg-white p-6 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">
          {isMultiple ? "Add Multiple Halls" : "Single Hall Seat Arrangement"}
        </h2>

        {halls
          .slice(0, isMultiple ? halls.length : 1)
          .map((hall, hallIndex) => (
            <div key={hallIndex} className="border p-5 mb-6 rounded-lg">
              {/* Hall Name only if multiple */}
              {isMultiple && (
                <input
                  type="text"
                  placeholder="Hall Name"
                  value={hall.hall_name}
                  onChange={(e) =>
                    handleHallChange(hallIndex, "hall_name", e.target.value)
                  }
                  className="border p-2 mb-4 w-full rounded text-black"
                />
              )}

              {/* Seat Categories */}
              {hall.seatCategories.map((seat, seatIndex) => (
                <div key={seatIndex} className="grid md:grid-cols-4 gap-4 mb-4">
                  {/* ✅ Seat Name Dropdown */}
                  <select
                    value={seat.seat_name}
                    onChange={(e) =>
                      handleSeatChange(
                        hallIndex,
                        seatIndex,
                        "seat_name",
                        e.target.value,
                      )
                    }
                    className="border p-2 rounded text-black"
                  >
                    <option value="">Select Seat Type</option>
                    <option value="Recliner Rows">Recliner Rows</option>
                    <option value="Prime">Prime Rows</option>
                    <option value="Prime Plus">Prime Plus Rows</option>
                    <option value="Classic Plus Rows">Classic Plus Rows</option>
                    <option value="Classic Rows">Classic Rows</option>
                    <option value="Premium Rows">Premium Rows</option>
                    <option value="Royal Gold Rows">Royal Gold Rows</option>
                    <option value="Royal Silver Rows">Royal silver Rows</option>
                    <option value="Executive Rows">Executive Rows</option>
                  </select>

                  <input
                    type="number"
                    placeholder="Total Rows"
                    value={seat.totalRows}
                    onChange={(e) =>
                      handleSeatChange(
                        hallIndex,
                        seatIndex,
                        "totalRows",
                        e.target.value,
                      )
                    }
                    className="border p-2 rounded text-black"
                  />

                  <input
                    type="number"
                    placeholder="Seats Per Row"
                    value={seat.seatsPerRow}
                    onChange={(e) =>
                      handleSeatChange(
                        hallIndex,
                        seatIndex,
                        "seatsPerRow",
                        e.target.value,
                      )
                    }
                    className="border p-2 rounded text-black"
                  />

                  <input
                    type="number"
                    placeholder="Price"
                    value={seat.price}
                    onChange={(e) =>
                      handleSeatChange(
                        hallIndex,
                        seatIndex,
                        "price",
                        e.target.value,
                      )
                    }
                    className="border p-2 rounded text-black"
                  />

                  {hall.seatCategories.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSeatCategory(hallIndex, seatIndex)}
                      className="bg-red-500 text-white px-3 py-1 rounded"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={() => addSeatCategory(hallIndex)}
                className="bg-green-500 text-white px-4 py-1 rounded"
              >
                + Add Seat Category
              </button>

              {isMultiple && halls.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeHall(hallIndex)}
                  className="ml-4 bg-red-600 text-white px-4 py-1 rounded"
                >
                  Remove Hall
                </button>
              )}
            </div>
          ))}

        {isMultiple && (
          <button
            type="button"
            onClick={addHall}
            className="bg-blue-600 text-white px-5 py-2 rounded"
          >
            + Add Hall
          </button>
        )}

        {isPreMeal && (
          <div className="mt-6 bg-white p-6 rounded-xl shadow">
            <h2 className="text-lg font-semibold mb-4 text-gray-700">
              Add Food Items
            </h2>

            {foodItems.map((food, index) => (
              <div
                key={index}
                className="grid grid-cols-12 gap-3 items-center mb-3"
              >
                {/* Category */}
                <select
                  onChange={(e) =>
                    handleFoodChange(index, "foodCategory", e.target.value)
                  }
                  className="col-span-3 border p-2 rounded text-black"
                >
                  <option value="">Select Category</option>
                  {foodCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>

                {/* Title */}
                <input
                  type="text"
                  placeholder="Food Title"
                  value={food.title}
                  onChange={(e) =>
                    handleFoodChange(index, "title", e.target.value)
                  }
                  className="col-span-3 border p-2 rounded text-black"
                />

                {/* Image */}
                <input
                  type="text"
                  placeholder="Image URL"
                  value={food.imageUrl}
                  onChange={(e) =>
                    handleFoodChange(index, "imageUrl", e.target.value)
                  }
                  className="col-span-3 border p-2 rounded text-black"
                />

                {/* Price */}
                <input
                  type="number"
                  placeholder="Price"
                  value={food.foodPrice}
                  onChange={(e) =>
                    handleFoodChange(index, "foodPrice", e.target.value)
                  }
                  className="col-span-1 border p-2 rounded text-black"
                />

                {/* Buttons */}
                <div className="col-span-2 flex gap-2">
                  <button
                    type="button"
                    onClick={addFoodItem}
                    className="bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center"
                  >
                    +
                  </button>

                  {foodItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFoodItem(index)}
                      className="bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center"
                    >
                      −
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddTheater;
