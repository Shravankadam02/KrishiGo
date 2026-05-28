import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MdPhone,
  MdArrowForward,
  MdSecurity,
  MdSupportAgent,
  MdVerified,
  MdLanguage,
} from "react-icons/md";
import { HiShieldCheck } from "react-icons/hi";
import useAuthStore from "../../store/authStore";
import logo from "../../assets/logo.png";

export default function Login() {
  const navigate = useNavigate();

  const { sendOtp, isLoading, error, clearError } = useAuthStore();

  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");

  const validatePhone = (value) => {
    if (!value) return "Mobile number is required";
    if (!/^[6-9]\d{9}$/.test(value)) {
      return "Please enter a valid mobile number";
    }
    return "";
  };

  const handleSubmit = async () => {
    clearError();

    const err = validatePhone(phone);

    if (err) {
      setPhoneError(err);
      return;
    }

    setPhoneError("");

    const result = await sendOtp(phone);

    if (result.success) {
      navigate("/verify-otp", {
        state: { phone },
      });
    }
  };

  return (
    <div
      className="min-h-screen flex bg-[#F7F5F0]"
      style={{ fontFamily: "'Outfit', sans-serif" }}
    >
      {/* Left */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-[#1B4332] via-[#24513F] to-[#2D6A4F] items-center justify-center p-12">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#95D5B2]/10 blur-3xl rounded-full" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#E76F51]/10 blur-3xl rounded-full" />

        <div className="relative z-10 max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[32px] p-10"
          >
            <img
              src={logo}
              alt="KrishiGo"
              className="h-14 w-auto mb-10"
              style={{ filter: "brightness(0) invert(1)" }}
            />

            <h1
              style={{ fontFamily: "'Playfair Display', serif" }}
              className="text-4xl font-black text-white leading-tight mb-5"
            >
              Farm Equipment
              <br />
              Near Your Village
            </h1>

            <p className="text-white/70 leading-relaxed mb-10">
              Connect with verified equipment owners and book tractors,
              harvesters, and sprayers in minutes.
            </p>

            <div className="space-y-5">
              {[
                {
                  icon: MdVerified,
                  text: "KYC Verified Equipment Owners",
                },
                {
                  icon: HiShieldCheck,
                  text: "Secure OTP Authentication",
                },
                {
                  icon: MdPhone,
                  text: "Book Equipment within 20km",
                },
                {
                  icon: MdLanguage,
                  text: "Marathi & English Support",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 text-white/80"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <item.icon size={20} className="text-[#95D5B2]" />
                  </div>

                  <span className="text-sm font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden mb-8 text-center">
            <img src={logo} alt="KrishiGo" className="h-12 mx-auto" />
          </div>

          <div className="bg-white border border-neutral-100 shadow-sm rounded-[32px] p-8 md:p-10">
            <div className="mb-8">
              <div className="w-14 h-14 rounded-2xl bg-[#2D6A4F]/10 flex items-center justify-center mb-5">
                <MdSecurity size={28} className="text-[#2D6A4F]" />
              </div>

              <h2
                style={{ fontFamily: "'Playfair Display', serif" }}
                className="text-3xl font-black text-neutral-900 mb-2"
              >
                Welcome to KrishiGo
              </h2>

              <p className="text-neutral-500 text-sm leading-relaxed">
                Enter your mobile number to continue securely.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Mobile Number
                </label>

                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <MdPhone
                      size={20}
                      className="text-neutral-400"
                    />

                    <span className="text-sm font-semibold text-neutral-500 border-r border-neutral-300 pr-2">
                      +91
                    </span>
                  </div>

                  <input
                    type="tel"
                    autoFocus
                    maxLength={10}
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value.replace(/\D/g, ""));
                      setPhoneError("");
                      clearError();
                    }}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleSubmit()
                    }
                    placeholder="Enter mobile number"
                    className={`w-full pl-24 pr-4 py-4 rounded-2xl border-2 bg-[#F7F5F0]
                    text-neutral-900 transition-all outline-none
                    ${
                      phoneError || error
                        ? "border-red-400"
                        : "border-neutral-200 focus:border-[#2D6A4F] focus:ring-4 focus:ring-[#2D6A4F]/10"
                    }`}
                  />
                </div>

                {phoneError && (
                  <p className="text-red-500 text-xs mt-2">
                    {phoneError}
                  </p>
                )}

                {error && (
                  <p className="text-red-500 text-xs mt-2">
                    {error}
                  </p>
                )}
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full h-14 rounded-2xl bg-[#2D6A4F] hover:bg-[#40916C]
                transition-all text-white font-bold flex items-center justify-center gap-2
                disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  <>
                    Continue
                    <MdArrowForward size={20} />
                  </>
                )}
              </motion.button>

              <div className="flex items-center justify-center gap-2 text-xs text-neutral-400 pt-1">
                <HiShieldCheck size={16} />
                <span>Secure OTP Login</span>
              </div>

              <p className="text-center text-xs text-neutral-400 leading-relaxed pt-2">
                By continuing, you agree to our{" "}
                <span className="text-[#2D6A4F] font-semibold cursor-pointer hover:underline">
                  Terms of Service
                </span>{" "}
                and{" "}
                <span className="text-[#2D6A4F] font-semibold cursor-pointer hover:underline">
                  Privacy Policy
                </span>
              </p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <button className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-[#2D6A4F] transition-colors">
              <MdSupportAgent size={18} />
              Contact Support
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}