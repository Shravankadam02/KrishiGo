import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaTractor } from "react-icons/fa";
import { MdBusiness, MdArrowForward } from "react-icons/md";
import useAuthStore from "../../store/authStore";
import logo from "../../assets/logo.png";

export default function RoleSelect() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);

  const handleContinue = () => {
    if (!selected) return;
    useAuthStore.getState().updateUser({ role: selected });
    navigate("/complete-profile");
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
          <h1
            style={{ fontFamily: "'Playfair Display', serif" }}
            className="text-2xl font-black text-neutral-900 mb-2"
          >
            How will you use KrishiGo?
          </h1>
          <p className="text-neutral-500 text-sm">
            Choose your role to get started
          </p>
        </div>

        <div className="flex flex-col gap-4 mb-6">
          {/* Farmer */}
          <motion.div
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelected("farmer")}
            className={`bg-white rounded-3xl p-6 border-2 cursor-pointer transition-all
              ${
                selected === "farmer"
                  ? "border-[#2D6A4F] shadow-lg shadow-[#2D6A4F]/10"
                  : "border-neutral-100 hover:border-neutral-200"
              }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors
                ${selected === "farmer" ? "bg-[#2D6A4F]" : "bg-[#F7F5F0]"}`}
              >
                <FaTractor
                  size={28}
                  className={
                    selected === "farmer" ? "text-white" : "text-[#2D6A4F]"
                  }
                />
              </div>
              <div className="flex-1">
                <h3 className="font-black text-neutral-900 text-lg">
                  I am a Farmer
                </h3>
                <p className="text-neutral-500 text-sm">
                  I want to rent equipment for my farm
                </p>
              </div>
              <div
                className={`w-5 h-5 rounded-full border-2 transition-all
                ${
                  selected === "farmer"
                    ? "border-[#2D6A4F] bg-[#2D6A4F]"
                    : "border-neutral-300"
                }`}
              >
                {selected === "farmer" && (
                  <div className="w-full h-full rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                )}
              </div>
            </div>
            {selected === "farmer" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-4 pt-4 border-t border-neutral-100"
              >
                <div className="flex flex-wrap gap-2">
                  {[
                    "Search nearby equipment",
                    "Book instantly",
                    "Pay cash or online",
                  ].map((f, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-[#2D6A4F]/10 text-[#2D6A4F] text-xs font-semibold rounded-full"
                    >
                      ✓ {f}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Owner */}
          <motion.div
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelected("owner")}
            className={`bg-white rounded-3xl p-6 border-2 cursor-pointer transition-all
              ${
                selected === "owner"
                  ? "border-[#E76F51] shadow-lg shadow-[#E76F51]/10"
                  : "border-neutral-100 hover:border-neutral-200"
              }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors
                ${selected === "owner" ? "bg-[#E76F51]" : "bg-[#F7F5F0]"}`}
              >
                <MdBusiness
                  size={28}
                  className={
                    selected === "owner" ? "text-white" : "text-[#E76F51]"
                  }
                />
              </div>
              <div className="flex-1">
                <h3 className="font-black text-neutral-900 text-lg">
                  I am an Equipment Owner
                </h3>
                <p className="text-neutral-500 text-sm">
                  I want to list and rent out my equipment
                </p>
              </div>
              <div
                className={`w-5 h-5 rounded-full border-2 transition-all
                ${
                  selected === "owner"
                    ? "border-[#E76F51] bg-[#E76F51]"
                    : "border-neutral-300"
                }`}
              >
                {selected === "owner" && (
                  <div className="w-full h-full rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                )}
              </div>
            </div>
            {selected === "owner" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-4 pt-4 border-t border-neutral-100"
              >
                <div className="flex flex-wrap gap-2">
                  {[
                    "List your equipment",
                    "Earn from idle machines",
                    "Weekly payouts",
                  ].map((f, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-[#E76F51]/10 text-[#E76F51] text-xs font-semibold rounded-full"
                    >
                      ✓ {f}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleContinue}
          disabled={!selected}
          className="w-full flex items-center justify-center gap-2 py-4 bg-[#2D6A4F] text-white font-bold rounded-2xl text-base hover:bg-[#40916C] transition-all disabled:opacity-50"
        >
          <>
            Continue
            <MdArrowForward size={20} />
          </>
        </motion.button>
      </motion.div>
    </div>
  );
}
