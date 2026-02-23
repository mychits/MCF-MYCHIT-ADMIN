// src/pages/Register.js

import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../instance/TokenInstance";

// --- 1. IMPORT YOUR IMAGES HERE ---
import loginImage from "../assets/images/login image 1.jpg";
import Image from "../assets/images/mychits.png";

const Register = () => {
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // --- PASSWORD VISIBILITY STATE ---
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      // --- NO CHANGE NEEDED HERE ---
      // We send the basic user info. The backend will find and attach 
      // the "none" designation ID automatically.
      const response = await api.post(`/admin/register`, {
        name,         // Matches backend 'name'
        phoneNumber,
        email,
        password,
        // We do NOT send admin_access_right_id here.
        // The backend controller handles it.
      });

      setSuccess("Registration successful! Redirecting to login...");

      setTimeout(() => {
        navigate("/");
      }, 2000);

      console.log("Registration successful:", response.data);
    } catch (error) {
      // --- ERROR HANDLING LOGIC ---
      let errorMessage = "Registration failed. Please try again.";

      // Check if backend returned a specific message
      if (error.response?.data?.message) {
        const rawMessage = error.response.data.message;

        // Handle Mongoose Duplicate Key Error (E11000)
        if (rawMessage.includes("E11000") || rawMessage.includes("duplicate key")) {
          if (rawMessage.includes("phoneNumber")) {
            errorMessage = "This phone number is already registered.";
          } else if (rawMessage.includes("email")) {
            errorMessage = "This email is already registered.";
          } else {
            errorMessage = "An account with these details already exists.";
          }
        } else {
          errorMessage = rawMessage;
        }
      }

      setError(errorMessage);
      console.error("Registration error:", error);
    }
  };

  return (
    // Main container: Full height, relative positioning (Matches Login.js)
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-slate-900">

      {/* 1. BACKGROUND IMAGE SECTION */}
      <img
        className="absolute inset-0 h-full w-full object-cover opacity-60"
        src={loginImage}
        alt="Login Background"
      />

      {/* Dark Overlay to ensure text readability */}
      <div className="absolute inset-0 bg-slate-900/40 z-0"></div>

      {/* 2. GLASSMORPHISM FORM CARD */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 md:p-10">
          
          {/* Logo Section */}
          <div className="flex justify-center mb-6">
             <div className="relative">
                <img
                  className="size-20"
                  src={Image}
                  alt="MyChits Logo"
                />
             </div>
          </div>

          {/* Header */}
          <h2 className="text-center text-3xl font-bold leading-9 tracking-tight text-gray-900 mb-2">
            Create an Admin Account
          </h2>

          {/* Login Link */}
          <p className="text-center text-sm text-gray-600 mb-8">
            Already have an account?{" "}
            <Link to="/" className="font-semibold text-blue-600 hover:text-blue-800 transition-colors">
              Login here
            </Link>
          </p>

          {/* Form Container */}
          <form onSubmit={handleRegister} className="space-y-5">

            {/* Name Input */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium leading-6 text-gray-900 mb-1"
              >
                Full Name
              </label>
              <div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full rounded-md border-0 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6 px-3"
                />
              </div>
            </div>

            {/* Phone Number Input */}
            <div>
              <label
                htmlFor="phoneNumber"
                className="block text-sm font-medium leading-6 text-gray-900 mb-1"
              >
                Phone Number
              </label>
              <div>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  required
                  autoComplete="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="block w-full rounded-md border-0 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6 px-3"
                />
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium leading-6 text-gray-900 mb-1"
              >
                Email Address
              </label>
              <div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-md border-0 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6 px-3"
                />
              </div>
            </div>

            {/* Password Input with Visibility Toggle */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium leading-6 text-gray-900 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-md border-0 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6 px-3 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? (
                    // Eye Slash Icon
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    // Eye Icon
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Success Message */}
            {success && (
              <div className="rounded-md bg-green-50 p-3 border border-green-100">
                <p className="text-sm text-green-800 text-center">{success}</p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="rounded-md bg-red-50 p-3 border border-red-100">
                <p className="text-sm text-red-800 text-center">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                className="flex w-full justify-center items-center gap-2 rounded-md bg-blue-600 px-3 py-3 text-lg font-semibold leading-6 text-white shadow-sm hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all duration-200"
              >
                Register
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  );
};

export default Register;