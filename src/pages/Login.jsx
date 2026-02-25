import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../instance/TokenInstance";


import loginImage from "../assets/images/login image 1.jpg";
import Image from "../assets/images/mychits.png";

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();


  const [showLoginPass, setShowLoginPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);


  const [isModalOpen, setIsModalOpen] = useState(false);
  const [resetStep, setResetStep] = useState(1); 
  const [resetPhone, setResetPhone] = useState("");
  const [resetOtp, setResetOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [resetError, setResetError] = useState("");
  const [isResetLoading, setIsResetLoading] = useState(false);

  const [isLoginLoading, setIsLoginLoading] = useState(false);


  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoginLoading(true); 

    try {
      const response = await api.post(`/admin/login`, {
        phoneNumber,
        password,
      });
      const { token } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(response?.data?.admin));
      
      navigate("/dashboard");
    } catch (error) {
      setIsLoginLoading(false); 
      setError("Invalid phone number or password.");
      console.error("Login error:", error);
    }
  };


  const handleSendOtp = async (e) => {
    e.preventDefault();
    setResetError("");
    setResetMessage("");
    setIsResetLoading(true);

    try {
      await api.post("/admin/send-otp", { phoneNumber: resetPhone });
      setResetMessage("OTP sent to your phone.");
      setResetStep(2); 
    } catch (err) {
      setResetError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setIsResetLoading(false);
    }
  };


  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetError("");
    setResetMessage("");
    setIsResetLoading(true);

    try {
      await api.post("/admin/verify-otp-reset", {
        phoneNumber: resetPhone,
        otp: resetOtp,
        newPassword: newPassword,
      });

      setResetMessage("Password reset! Redirecting to login...");
      

      setTimeout(() => {
        setIsModalOpen(false);

        setResetStep(1);
        setResetPhone("");
        setResetOtp("");
        setNewPassword("");
        setResetMessage("");
        setResetError("");
      }, 2000);

    } catch (err) {
      setResetError(err.response?.data?.message || "Invalid or expired OTP");
    } finally {
      setIsResetLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setResetStep(1);
    setResetPhone("");
    setResetOtp("");
    setNewPassword("");
    setResetError("");
    setResetMessage("");
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-slate-900">
      

      <img
        className="absolute inset-0 h-full w-full object-cover opacity-60"
        src={loginImage}
        alt="Login Background"
      />
      <div className="absolute inset-0 bg-slate-900/40 z-0"></div>


      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 md:p-10">
          

          <div className="flex justify-center mb-6">
             <div className="relative">
                <img className="size-20" src={Image} alt="MyChits Logo" />
             </div>
          </div>

          <h2 className="text-center text-3xl font-bold leading-9 tracking-tight text-gray-900 mb-2">
            Login to your account
          </h2>

          <p className="text-center text-sm text-gray-600 mb-8">
            Don't have an account?{" "}
            <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-800 transition-colors">
              Register here
            </Link>
          </p>

 
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium leading-6 text-gray-900 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-gray-500 sm:text-sm">+91</span>
                </div>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="text"
                  required
                  autoComplete="phoneNumber"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="block w-full rounded-md border-0 py-2.5 pl-10 pr-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6"
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                  Password
                </label>
                <div className="text-sm">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
              </div>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showLoginPass ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-md border-0 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6 px-3 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPass(!showLoginPass)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showLoginPass ? (
  
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

            {error && (
              <div className="rounded-md bg-red-50 p-3 border border-red-100">
                <p className="text-sm text-red-800 text-center">{error}</p>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoginLoading}
                className="flex w-full justify-center items-center gap-2 rounded-md bg-blue-600 px-3 py-3 text-lg font-semibold leading-6 text-white shadow-sm hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoginLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>


      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 relative animate-in fade-in zoom-in duration-200">
            

            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="text-xl font-bold text-gray-900 mb-1">Reset Password</h3>
            <p className="text-sm text-gray-500 mb-4">
              {resetStep === 1 ? "Enter your phone to receive an OTP." : "Enter the OTP and your new password."}
            </p>

            {/* Alerts */}
            {resetMessage && (
              <div className="mb-4 p-3 bg-green-50 text-green-800 text-sm rounded-md border border-green-100">
                {resetMessage}
              </div>
            )}
            {resetError && (
              <div className="mb-4 p-3 bg-red-50 text-red-800 text-sm rounded-md border border-red-100">
                {resetError}
              </div>
            )}

            {/* STEP 1: ENTER PHONE (Hides OTP & Password) */}
            {resetStep === 1 && (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <span className="text-gray-500 sm:text-sm">+91</span>
                    </div>
                    <input
                      type="text"
                      required
                      value={resetPhone}
                      onChange={(e) => setResetPhone(e.target.value)}
                      className="w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Enter registered phone number"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isResetLoading}
                  className="w-full bg-blue-600 text-white py-2 rounded-md font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isResetLoading ? "Sending..." : "Get OTP"}
                </button>
              </form>
            )}

            {/* STEP 2: ENTER OTP & NEW PASSWORD (Hides Phone Input) */}
            {resetStep === 2 && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                {/* Helper Text to confirm phone number */}
                <div className="text-xs text-center text-gray-500 bg-gray-50 py-1 rounded">
                    Resetting for: <span className="font-bold text-gray-800">+91 {resetPhone}</span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Enter OTP
                  </label>
                  <input
                    type="text"
                    required
                    maxLength="6"
                    value={resetOtp}
                    onChange={(e) => setResetOtp(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none text-center tracking-widest text-lg font-bold"
                    placeholder="000000"
                  />
                  <p className="text-xs text-gray-400 mt-1 text-center">Check console for OTP (Simulation)</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPass ? "text" : "password"}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none pr-10"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showNewPass ? (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setResetStep(1)}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-md font-semibold hover:bg-gray-200 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isResetLoading}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-md font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {isResetLoading ? "Resetting..." : "Reset Password"}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}
    </div>
  );
};

export default Login;