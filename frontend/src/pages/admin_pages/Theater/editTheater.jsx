import React, { useEffect, useState } from "react";
import DynamicForm from "../../../components/commonComponent/CrudComponent/DynamicFormComponent";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import BASE_URL from "../../../../config";

const EditTheater = () => {
  const { id } = useParams();
  const navigate = useNavigate();

const [formData, setFormData] = useState({
  location_name: "",
  theater_name: "",
});
  const [isMultiple, setIsMultiple] = useState(false);
  const [isPreMeal, setIsPreMeal] = useState(false);
  const [isParkingFacility, setIsParkingFacility] = useState(false);
  const [isFoodCourt, setIsFoodCourt] = useState(false);
  const [isWheelChairFacility, setIsWheelChairFacility] = useState(false);

  const [halls, setHalls] = useState([]);
  const [foodItems, setFoodItems] = useState([]);

const foodCategories = ["Popcorn", "Snacks", "Combos", "Beverages"];

  // Fetch theater data
  useEffect(() => {
    const fetchTheater = async () => {
      try {
              const token = localStorage.getItem("token");

        const res = await axios.get(
          `${BASE_URL}/admin/get-single-theater/${id}`,{
                    headers: { Authorization: `Bearer ${token}` },

          }
        );

        const data = res.data;

        setFormData({
          location_name: data.location_name,
          theater_name: data.theater_name,
        });

        setIsMultiple(data.isMultiple);
        setIsPreMeal(data.isPreMeal);
        setIsParkingFacility(data.isParkingFacility);
        setIsFoodCourt(data.isFoodCourt);
        setIsWheelChairFacility(data.isWheelChairFacility);

        setHalls(
          data.halls?.length
            ? data.halls
            : [
                {
                  hall_name: "",
                  seatCategories: [
                    {
                      seat_name: "",
                      totalRows: "",
                      seatsPerRow: "",
                      price: "",
                    },
                  ],
                },
              ],
        );

        setFoodItems(
          data.foodItems?.length
            ? data.foodItems
            : [{ title: "", imageUrl: "", foodPrice: "", foodCategory: "" }],
        );
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch theater");
      }
    };

    fetchTheater();
  }, [id]);

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

  const handleFoodChange = (index, field, value) => {
    const updated = [...foodItems];
    updated[index][field] = value;
    setFoodItems(updated);
  };

  const addFoodItem = () => {
    setFoodItems([
      ...foodItems,
      { title: "", imageUrl: "", foodPrice: "", foodCategory: "" },
    ]);
  };

  const removeFoodItem = (index) => {
    const updated = [...foodItems];
    updated.splice(index, 1);
    setFoodItems(updated);
  };

  // Submit Update

const handleSubmit = async (e) => {
  e.preventDefault(); 

  try {
    const token = localStorage.getItem("token");

    const payload = {
      ...formData,
      isMultiple,
      isPreMeal,
      isParkingFacility,
      isFoodCourt,
      isWheelChairFacility,
      halls: isMultiple ? halls : [halls[0]],
      foodItems: isPreMeal ? foodItems : [],
    };

    await axios.put(
      `${BASE_URL}/admin/update-theater/${id}`,
      payload,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    toast.success("Theater updated successfully!");
    navigate("/admin/view-all-theater");
  } catch (error) {
    console.error(error);
    toast.error("Update failed");
  }
};
  return (
    <div className="p-8">
      <ToastContainer />

      <form
        onSubmit={handleSubmit}
        className="w-full h-full bg-white p-10 border border-gray-200 rounded-xl shadow text-black"
      >
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-1 text-sm font-semibold text-gray-700">
              Location Name
            </label>
            <select
              value={formData.location_name}
              onChange={(e) =>
                setFormData({ ...formData, location_name: e.target.value })
              }
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring text-black"
            >
              <option value="Mumbai">Mumbai</option>
              <option value="Pune">Pune</option>
              <option value="Kolkata">Kolkata</option>
              <option value="Delhi">Delhi</option>
              <option value="Bangalore">Bangalore</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Ahmedabad">Ahmedabad</option>
              <option value="Chennai">Chennai</option>
            </select>
          </div>
          <div>
            <label className="block mb-1 text-sm font-semibold text-gray-700">
              Theater Name
            </label>
            <input
              type="text"
              value={formData.theater_name}
              onChange={(e) =>
                setFormData({ ...formData, theater_name: e.target.value })
              }
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring text-black"
            />
          </div>
        </div>
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
                  <div
                    key={seatIndex}
                    className="grid md:grid-cols-4 gap-4 mb-4"
                  >
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
                      <option value="Classic Plus Rows">
                        Classic Plus Rows
                      </option>
                      <option value="Classic Rows">Classic Rows</option>
                      <option value="Premium Rows">Premium Rows</option>
                      <option value="Royal Gold Rows">Royal Gold Rows</option>
                      <option value="Royal Silver Rows">
                        Royal silver Rows
                      </option>
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
                  {/* Food categories  */}
                  <select
                    value={food.foodCategory || ""}
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

                  {/* Food Title */}
                  <input
                    type="text"
                    placeholder="Food Title"
                    value={food.title}
                    onChange={(e) =>
                      handleFoodChange(index, "title", e.target.value)
                    }
                    className="col-span-3 border p-2 rounded text-black"
                  />

                  {/* Image URL */}
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
                  <div className="col-span-1 flex gap-2">
                    {/* Add */}
                    <button
                      type="button"
                      onClick={addFoodItem}
                      className="bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center"
                    >
                      +
                    </button>

                    {/* Remove */}
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
        <button type="submit" className="bg-blue-600 text-white px-6 py-3 mt-3">
          Update Show
        </button>
      </form>
    </div>
  );
};

export default EditTheater;
