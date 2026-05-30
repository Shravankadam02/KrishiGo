import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { HiSearch, HiBell } from "react-icons/hi";
import { MdLocationOn, MdArrowForward, MdCalendarToday } from "react-icons/md";
import { FaTractor } from "react-icons/fa";
import {
  GiSeedling,
  GiSpray,
  GiGears,
  GiScythe,
  GiWheat,
  GiGrapes,
} from "react-icons/gi";
import { RiPlantLine } from "react-icons/ri";
import FarmerLayout from "../../components/layout/FarmerLayout";
import useAuthStore from "../../store/authStore";
import api from "../../services/api";
import { formatPrice } from "../../utils/helpers";

const categories = [
  { key: "tractor_plowing", Icon: FaTractor, en: "Tractor", mr: "ट्रॅक्टर" },
  {
    key: "tractor_rotavator",
    Icon: GiGears,
    en: "Rotavator",
    mr: "रोटाव्हेटर",
  },
  {
    key: "harvester_wheat",
    Icon: GiScythe,
    en: "Harvester",
    mr: "कापणी यंत्र",
  },
  { key: "sprayer", Icon: GiSpray, en: "Sprayer", mr: "फवारणी" },
  { key: "seed_drill", Icon: GiSeedling, en: "Seed Drill", mr: "बियाणे ड्रिल" },
  { key: "other", Icon: RiPlantLine, en: "Other", mr: "इतर" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const seasonTips = [
  {
    en: "Rabi season — wheat sowing time",
    mr: "रब्बी हंगाम — गहू पेरणी",
    Icon: GiWheat,
  },
  {
    en: "Rabi harvest — book harvesters early",
    mr: "रब्बी कापणी — आधीच बुक करा",
    Icon: GiScythe,
  },
  {
    en: "Grape harvest season in Nashik",
    mr: "नाशिकमध्ये द्राक्ष कापणी",
    Icon: GiGrapes,
  },
  {
    en: "Summer plowing — book tractors",
    mr: "उन्हाळी नांगरणी — ट्रॅक्टर बुक करा",
    Icon: FaTractor,
  },
  {
    en: "Pre-kharif — rotavators in demand",
    mr: "खरीफपूर्व — रोटाव्हेटरची मागणी",
    Icon: GiGears,
  },
  {
    en: "Kharif sowing — seed drills available",
    mr: "खरीफ पेरणी — बियाणे ड्रिल उपलब्ध",
    Icon: GiSeedling,
  },
  {
    en: "Kharif season — sprayers in demand",
    mr: "खरीफ हंगाम — फवारणी यंत्र हवे",
    Icon: GiSpray,
  },
  {
    en: "Pest control time — book sprayers",
    mr: "कीड नियंत्रण — आता फवारणी बुक करा",
    Icon: GiSpray,
  },
  {
    en: "Kharif harvest coming — check harvesters",
    mr: "खरीफ कापणी — हार्वेस्टर तपासा",
    Icon: GiScythe,
  },
  {
    en: "Paddy harvest season — book early",
    mr: "भात कापणी हंगाम — लवकर बुक करा",
    Icon: GiScythe,
  },
  {
    en: "Rabi sowing — tractors needed",
    mr: "रब्बी पेरणी — ट्रॅक्टरची गरज",
    Icon: FaTractor,
  },
  {
    en: "Winter crops — wheat and onion season",
    mr: "हिवाळी पिके — गहू आणि कांदा",
    Icon: GiWheat,
  },
];

export default function FarmerHome() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [lang, setLang] = useState(localStorage.getItem("language") || "en");
  const [nearbyEquipment, setNearbyEquipment] = useState([]);
  const [activeBooking, setActiveBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);

  const tip = seasonTips[new Date().getMonth()];
  const TipIcon = tip.Icon;

  const toggleLang = () => {
    const next = lang === "en" ? "mr" : "en";
    setLang(next);
    localStorage.setItem("language", next);
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setLocation({ lat: 20.0650, lng: 74.1077 }),
      );
    }
  }, []);

  useEffect(() => {
    if (!location) return;
    const fetchNearby = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/api/equipment", {
          params: { lat: location.lat, lng: location.lng },
        });
        setNearbyEquipment(data.equipment?.slice(0, 6) || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchNearby();
  }, [location]);

  useEffect(() => {
    const fetchActiveBooking = async () => {
      try {
        const { data } = await api.get("/api/bookings/farmer/mine", {
          params: { status: "confirmed" },
        });
        if (data.bookings?.length > 0) setActiveBooking(data.bookings[0]);
      } catch (err) {
        console.error(err);
      }
    };
    fetchActiveBooking();
  }, []);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return lang === "en" ? "Good Morning" : "सुप्रभात";
    if (hour < 17) return lang === "en" ? "Good Afternoon" : "नमस्कार";
    return lang === "en" ? "Good Evening" : "शुभ संध्या";
  };

  const formatBookingDate = (date) => {
    const d = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (d.toDateString() === today.toDateString())
      return lang === "en" ? "Today" : "आज";
    if (d.toDateString() === tomorrow.toDateString())
      return lang === "en" ? "Tomorrow" : "उद्या";
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

  return (
    <FarmerLayout>
      {/* ── Header ── */}
      <div className="bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] px-5 pt-12 pb-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        {/* Top row */}
        <div className="relative flex items-center justify-between mb-1">
          <div>
            <p className="text-white/60 text-xs font-medium">{greeting()}</p>
            <h1 className="text-white text-lg font-black">
              {user?.name || "Farmer"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={toggleLang}
              className="px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-xl border border-white/20 text-white text-xs font-bold"
            >
              {lang === "en" ? "मराठी" : "EN"}
            </motion.button>
            <button className="relative w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
              <HiBell size={18} className="text-white" />

              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#E76F51]" />
            </button>
          </div>
        </div>

        {/* Location + land size inline */}
        <div className="relative flex items-center gap-2 flex-wrap mb-4">
          <div className="flex items-center gap-1">
            <MdLocationOn size={13} className="text-[#95D5B2]" />
            <span className="text-white/50 text-xs">
              {user?.village
                ? `${user.village}, ${user.taluka}`
                : "Nashik District"}
            </span>
          </div>
          {user?.landSize && (
            <span className="px-2 py-0.5 rounded-full bg-white/10 text-white/60 text-[11px] font-semibold">
              {user.landSize} acres
            </span>
          )}
        </div>

        {/* Search bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => navigate("/farmer/explore")}
          className="relative flex items-center gap-3 bg-white rounded-2xl px-4 py-3 cursor-pointer shadow-lg"
        >
          <HiSearch size={18} className="text-neutral-400 flex-shrink-0" />
          <span className="text-neutral-400 text-sm flex-1">
            {lang === "en"
              ? "Search equipment near you..."
              : "जवळचे उपकरण शोधा..."}
          </span>
          <div className="w-8 h-8 rounded-xl bg-[#2D6A4F] flex items-center justify-center flex-shrink-0">
            <MdArrowForward size={16} className="text-white" />
          </div>
        </motion.div>
      </div>

      {/* ── Content ── */}
      <div className="px-4 -mt-10 relative z-10 flex flex-col gap-4">
        {/* Active booking */}
        <AnimatePresence>
          {activeBooking && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onClick={() => navigate(`/farmer/booking/${activeBooking._id}`)}
              className="bg-[#E76F51] rounded-3xl p-4 cursor-pointer shadow-lg shadow-[#E76F51]/20"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                    <MdCalendarToday size={18} className="text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-white/70 text-xs font-medium">
                        {lang === "en" ? "Upcoming Booking" : "येणारी बुकिंग"}
                      </p>
                      <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold">
                        CONFIRMED
                      </span>
                    </div>
                    <p className="text-white font-black text-sm">
                      {activeBooking.equipment?.type?.replace(/_/g, " ")} —{" "}
                      {formatBookingDate(activeBooking.serviceDate)}
                    </p>
                  </div>
                </div>
                <MdArrowForward size={20} className="text-white/70" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Season tip */}
        {/* Seasonal Alert */}
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  className='flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3'
>
  <div className='w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0'>
    <GiWheat size={16} className='text-amber-600' />
  </div>

  <div className='flex-1 min-w-0'>
    <p className='text-[11px] font-semibold text-amber-700 uppercase tracking-wide'>
      {lang === 'en' ? 'Season Alert' : 'हंगाम सूचना'}
    </p>

    <p className='text-xs font-medium text-neutral-700 truncate'>
      {lang === 'en' ? tip.en : tip.mr}
    </p>
  </div>
</motion.div>

        {/* Categories */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
          className="bg-white rounded-3xl p-4 shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-black text-neutral-900 text-sm">
              {lang === "en" ? "Categories" : "प्रकार"}
            </h2>
            <button
              onClick={() => navigate("/farmer/explore")}
              className="text-[#2D6A4F] text-xs font-bold flex items-center gap-1"
            >
              {lang === "en" ? "All" : "सर्व"}
              <MdArrowForward size={14} />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {categories.map((cat) => (
              <motion.div
                key={cat.key}
                variants={fadeUp}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(`/farmer/explore?type=${cat.key}`)}
                className="flex flex-col items-center justify-center gap-1.5 py-3 px-2 h-[72px] rounded-2xl bg-[#F7F5F0] border border-neutral-100 hover:border-[#2D6A4F]/20 hover:bg-[#2D6A4F]/10 cursor-pointer transition-all shadow-sm hover:shadow-md group"
              >
                <cat.Icon size={22} className="text-[#2D6A4F]" />
                <span className="text-xs font-semibold text-neutral-600 text-center leading-tight">
                  {lang === "en" ? cat.en : cat.mr}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Nearby Equipment */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-black text-neutral-900 text-sm">
              {lang === "en" ? "Nearby Equipment" : "जवळची उपकरणे"}
            </h2>
            <button
              onClick={() => navigate("/farmer/explore")}
              className="text-[#2D6A4F] text-xs font-bold flex items-center gap-1"
            >
              {lang === "en" ? "See All" : "सर्व पहा"}
              <MdArrowForward size={14} />
            </button>
          </div>

          {loading ? (
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="min-w-[160px] h-44 bg-white rounded-3xl animate-pulse flex-shrink-0"
                />
              ))}
            </div>
          ) : nearbyEquipment.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center">
              <FaTractor size={36} className="text-neutral-200 mx-auto mb-3" />
              <p className="text-neutral-400 text-sm font-medium">
                {lang === "en"
                  ? "No equipment found nearby"
                  : "जवळपास उपकरण सापडले नाही"}
              </p>
              <p className="text-neutral-300 text-xs mt-1">
                {lang === "en"
                  ? "Try increasing your search radius"
                  : "शोध त्रिज्या वाढवण्याचा प्रयत्न करा"}
              </p>
              <button
                onClick={() => navigate("/farmer/explore")}
                className="mt-3 text-[#2D6A4F] text-sm font-bold"
              >
                {lang === "en"
                  ? "Search all equipment →"
                  : "सर्व उपकरणे शोधा →"}
              </button>
            </div>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
              {nearbyEquipment.map((eq) => (
                <motion.div
                  key={eq._id}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate(`/farmer/equipment/${eq._id}`)}
                  className="min-w-[170px] bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer flex-shrink-0"
                >
                  {eq.photos?.[0] ? (
                    <img
                      src={eq.photos[0]}
                      alt={eq.type}
                      className="w-full h-24 object-cover"
                    />
                  ) : (
                    <div className="w-full h-24 bg-[#2D6A4F]/10 flex items-center justify-center">
                      <FaTractor size={28} className="text-[#2D6A4F]" />
                    </div>
                  )}
                  <div className="p-3">
                    <p className="font-bold text-neutral-900 text-xs capitalize leading-tight">
                      {eq.type.replace(/_/g, " ")}
                    </p>
                    <p className="text-[11px] text-neutral-400 mt-0.5 truncate">
                      {eq.owner?.name || "Verified Owner"}
                    </p>
                    <div className="flex items-center gap-1 text-neutral-400 text-xs mt-1">
                      <MdLocationOn size={12} />
                      <span>{eq.distanceKm} km away</span>
                    </div>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-[#2D6A4F] font-black text-xs">
                        {formatPrice(eq.pricePerAcre)}
                        <span className="text-[10px] font-normal text-neutral-400">
                          /ac
                        </span>
                      </span>
                      {eq.rating > 0 && (
                        <div className="flex items-center gap-1 text-amber-500">
                          <span className="text-xs">★</span>
                          <span className="text-xs font-semibold">
                            {eq.rating}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mb-2">
          <motion.div
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/farmer/bookings")}
            className="bg-white rounded-3xl p-4 shadow-sm cursor-pointer"
          >
            <div className="w-9 h-9 rounded-2xl bg-[#2D6A4F]/10 flex items-center justify-center mb-2">
              <MdCalendarToday size={18} className="text-[#2D6A4F]" />
            </div>
            <h3 className="font-black text-neutral-900 text-sm">
              {lang === "en" ? "My Bookings" : "माझ्या बुकिंग"}
            </h3>
            <p className="text-neutral-400 text-xs mt-0.5">
              {lang === "en" ? "Track status" : "स्थिती तपासा"}
            </p>
          </motion.div>

          <motion.div
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/farmer/explore")}
            className="bg-[#2D6A4F] rounded-3xl p-4 shadow-sm cursor-pointer"
          >
            <div className="w-9 h-9 rounded-2xl bg-white/20 flex items-center justify-center mb-2">
              <FaTractor size={18} className="text-white" />
            </div>
            <h3 className="font-black text-white text-sm">
              {lang === "en" ? "Find Equipment" : "उपकरण शोधा"}
            </h3>
            <p className="text-white/60 text-xs mt-0.5">
              {lang === "en" ? "Book now" : "आता बुक करा"}
            </p>
          </motion.div>
        </div>
      </div>
    </FarmerLayout>
  );
}
