import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { MdArrowBack, MdArrowForward } from "react-icons/md";
import useAuthStore from "../../store/authStore";
import logo from "../../assets/logo.png";

export default function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  const phone = location.state?.phone;

  const { verifyOtp, sendOtp, isLoading, error, clearError } = useAuthStore();
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  // Redirect if no phone
  useEffect(() => {
    if (!phone) navigate("/login");
  }, [phone]);

  // Countdown timer
  useEffect(() => {
    if (timer === 0) {
      setCanResend(true);
      return;
    }
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    clearError();

    // Auto focus next
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto submit when all filled
    {/*if (newOtp.every((d) => d !== "") && value) {
      handleVerify(newOtp.join(""));
    }*/}
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (otpString) => {
    const otpValue = otpString || otp.join("");
    if (otpValue.length !== 6) return;

    // Validate name
    if (!name.trim()) {
      setNameError("Please enter your full name");
      return;
    }

    const result = await verifyOtp(phone, otpValue);
    if (result.success) {
      // Update name in store
      useAuthStore.getState().updateUser({ name: name.trim() });
      if (result.isNewUser || !result.user?.isProfileComplete) {
        navigate("/role-select");
      } else {
        navigate("/dashboard");
      }
    }
  };

  const handleResend = async () => {
    setOtp(["", "", "", "", "", ""]);
    setTimer(30);
    setCanResend(false);
    clearError();
    await sendOtp(phone);
    inputRefs.current[0]?.focus();
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-[#F7F5F0] p-6"
      style={{ fontFamily: "'Outfit', sans-serif" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <img src={logo} alt="KrishiGo" className="h-12 w-auto mx-auto mb-6" />
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-neutral-100">
          <button
            onClick={() => navigate("/login")}
            className="flex items-center gap-2 text-neutral-400 hover:text-neutral-600 text-sm mb-6 transition-colors"
          >
            <MdArrowBack size={18} />
            Change number
          </button>

          <div className="mb-8">
            <h1
              style={{ fontFamily: "'Playfair Display', serif" }}
              className="text-2xl font-black text-neutral-900 mb-2"
            >
              Verify your number
            </h1>
            <p className="text-neutral-500 text-sm">
              OTP sent to{" "}
              <span className="font-bold text-neutral-700">+91 {phone}</span>
            </p>
          </div>

          {/* OTP inputs */}
          <div className="flex gap-3 justify-between mb-6">
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => (inputRefs.current[i] = el)}
                type="tel"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className={`w-12 h-14 text-center text-xl font-black rounded-2xl border-2
                  focus:outline-none transition-all bg-[#F7F5F0]
                  ${digit ? "border-[#2D6A4F] bg-[#2D6A4F]/5 text-[#2D6A4F]" : "border-neutral-200"}
                  ${error ? "border-red-400" : ""}
                  focus:border-[#2D6A4F]`}
              />
            ))}
          </div>

          {error && (
            <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
          )}

          {/* Name input */}
          <div className="mb-2">
            <label className="text-sm font-semibold text-neutral-600 mb-2 block">
              Your Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setNameError("");
              }}
              placeholder="Enter your full name"
              className={`w-full px-4 py-3.5 rounded-2xl border-2 bg-[#F7F5F0]
      text-neutral-900 focus:outline-none transition-colors
      ${
        nameError
          ? "border-red-400"
          : "border-neutral-200 focus:border-[#2D6A4F]"
      }`}
            />
            {nameError && (
              <p className="text-red-500 text-xs mt-1">{nameError}</p>
            )}
          </div>

          {/* Verify button */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => handleVerify()}
            disabled={isLoading || otp.some((d) => d === "")}
            className="w-full flex items-center justify-center gap-2 py-4 bg-[#2D6A4F] text-white font-bold rounded-2xl text-base hover:bg-[#40916C] transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Verify OTP
                <MdArrowForward size={20} />
              </>
            )}
          </motion.button>

          {/* Resend */}
          <div className="text-center mt-5">
            {canResend ? (
              <button
                onClick={handleResend}
                className="text-[#2D6A4F] font-semibold text-sm hover:underline"
              >
                Resend OTP
              </button>
            ) : (
              <p className="text-neutral-400 text-sm">
                Resend OTP in{" "}
                <span className="font-bold text-neutral-600">{timer}s</span>
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
