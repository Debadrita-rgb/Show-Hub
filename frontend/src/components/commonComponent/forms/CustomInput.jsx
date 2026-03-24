import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Import Eye Icons

const CustomInput = ({ label, type, name, value, onChange, placeholder, icon: Icon, location }) => {
  const [showPassword, setShowPassword] = useState(false);

  // Email Validation Regex
  const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

  // Password Validation (Min 8 Chars, Uppercase, Number, Symbol)
  const isValidPassword = (password) => {
    if(location === "login") {
      return (
        password.length >= 8
      );
    } else if(location === "signup") {
      return (
        password.length >= 8 &&
        /[A-Z]/.test(password) &&
        /\d/.test(password) &&
        /[\W]/.test(password)
      );
    }
  }

  return (
    <div className="relative">
      <label className="block text-gray-700 font-medium">{label}</label>

      <div className="relative">
        {/* Input Field */}
        <input
          type={type === "password" && showPassword ? "text" : type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full rounded-md py-1.5 pl-10 pr-3 outline-1 -outline-offset-1 outline-grey-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600"
        />

        {/* Left-side Icon */}
        {Icon && <Icon className="absolute left-3 top-3 text-gray-500" />}

        {/* Eye Icon for Password Toggle */}
        {type === "password" && (
          <button
            type="button"
            className="absolute right-3 top-3 text-gray-500"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        )}
      </div>

      {/* Email & Password Validation Messages */}
      {type === "email" && value && !isValidEmail(value) && (
        <p className="text-red-500 text-sm mt-1">Invalid email format</p>
      )}
      {type === "password" && value && !isValidPassword(value) && (
        <p className="text-red-500 text-sm mt-1">
          {location === "login"
            ? "Password must be atleast 8 letters"
            : "Password must be at least 8 characters, contain an uppercase letter, a number, and a special character"}
        </p>
      )}
    </div>
  );
};

export default CustomInput;
