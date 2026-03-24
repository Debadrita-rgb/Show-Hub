import { useEffect, useState } from "react";
import BASE_URL from "../../../../config";

const ProfilePage = () => {
//   const [user, setUser] = useState({});
const [user, setUser] = useState({
  gender: "",
  married: "",
});
useEffect(() => {
  const fetchUser = async () => {
    const token = localStorage.getItem("token");

    const res = await fetch(`${BASE_URL}/user/get-user-profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    setUser(data);
  };

  fetchUser();
}, []);

const handleSave = async () => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/user/update-user-profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(user),
  });

  const data = await res.json();
  console.log(data);

  setUser(data);
};
  return (
    <div className="min-h-screen  py-10 px-6 md:px-20 text-white">
      <div className=" rounded-lg shadow-lg p-8">
        {/* PROFILE HEADER */}
        <div className="flex items-center gap-6 mb-8">
          <div className="flex items-center justify-center">
            {/* <span className="text-4xl text-gray-500"> */}
              <img src="https://cdn.pixabay.com/photo/2018/04/18/18/56/user-3331256_1280.png" className="rounded-full h-21 w-23"/>
            {/* </span> */}
          </div>

          <h1 className="text-3xl font-semibold">{user.name}</h1>
        </div>

        {/* ACCOUNT DETAILS */}
        <h2 className="text-xl font-semibold mb-4">Account Details</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* MOBILE */}
          <div>
            <label className="text-sm text-gray-150">Mobile Number</label>
            <input
              type="text"
              value={user.mobile || ""}
              maxLength={10}
              onChange={(e) => setUser({ ...user, mobile: e.target.value })}
              className="border rounded px-3 py-2 w-full"
            />
          </div>

          {/* EMAIL */}
          <div>
            <label className="text-sm text-gray-150">Email Address</label>
            <input
              type="text"
              value={user.email || ""}
              className="w-full border rounded-lg px-3 py-2 mt-1"
              readOnly
            />
          </div>
        </div>

        {/* PERSONAL DETAILS */}
        <h2 className="text-xl font-semibold mb-4">Personal Details</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* FIRST NAME */}
          <div>
            <label className="text-sm text-gray-150">Name</label>
            <input
              type="text"
              value={user.name || ""}
              onChange={(e) => setUser({ ...user, name: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 mt-1"
            />
          </div>

          {/* BIRTHDAY */}
          <div>
            <label className="text-sm text-gray-150">Birthday</label>
            <input
              type="date"
              value={user.birthday ? user.birthday.split("T")[0] : ""}
              onChange={(e) => setUser({ ...user, birthday: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 mt-1"
            />
          </div>

          {/* GENDER */}
          <div>
            <label className="text-sm text-gray-150">Identity</label>

            <div className="flex gap-4 mt-2">
              <button
                onClick={() => setUser({ ...user, gender: "Woman" })}
                className={`border px-4 py-2 rounded-lg ${
                  user.gender === "Woman"
                    ? "border-purple-950 text-black bg-purple-200"
                    : "border-gray-300"
                }`}
              >
                Woman
              </button>

              <button
                onClick={() => setUser({ ...user, gender: "Man" })}
                className={`border px-4 py-2 rounded-lg ${
                  user.gender === "Man"
                    ? "border-purple-950 text-black bg-purple-200"
                    : "border-gray-300"
                }`}
              >
                Man
              </button>
            </div>
          </div>

          {/* MARRIED */}
          <div>
            <label className="text-sm text-gray-150">Married?</label>

            <div className="flex gap-4 mt-2">
              <button
                onClick={() => setUser({ ...user, married: "Yes" })}
                className={`border px-4 py-2 rounded-lg ${
                  user.married === "Yes"
                    ? "border-purple-950 text-black bg-purple-200"
                    : "border-gray-300"
                }`}
              >
                Yes
              </button>

              <button
                onClick={() => setUser({ ...user, married: "No" })}
                className={`border px-4 py-2 rounded-lg ${
                  user.married === "No"
                    ? "border-purple-950 text-black bg-purple-200"
                    : "border-gray-300"
                }`}
              >
                No
              </button>
            </div>
          </div>

          {/* ANNIVERSARY */}
          <div>
            <label className="text-sm text-gray-150">Anniversary</label>
            <input
              type="date"
              value={user.anniversary ? user.anniversary.split("T")[0] : ""}
              onChange={(e) =>
                setUser({ ...user, anniversary: e.target.value })
              }
              className="w-full border rounded-lg px-3 py-2 mt-1"
            />
          </div>
        </div>

        {/* SAVE BUTTON */}
        <div className="mt-8">
          <button
            onClick={handleSave}
            className="bg-purple-700 text-white px-6 py-2 rounded-lg hover:bg-purple-800"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
