import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import {
  GiWheat,
  GiFarmer,
  GiSeedling,
  GiSpray,
  GiGears,
  GiScythe,
  GiCorn,
} from "react-icons/gi";
import {
  MdVerified,
  MdLocationOn,
  MdPayments,
  MdStar,
  MdPhone,
  MdSecurity,
  MdAgriculture,
} from "react-icons/md";
import { HiArrowRight, HiMenuAlt3, HiX } from "react-icons/hi";
import { RiPlantLine } from "react-icons/ri";
import { FaTractor } from "react-icons/fa";
import logo from "../assets/logo.png";
import tractorVideo from "../assets/hero_vid.mp4";

// ── Google Fonts ──────────────────────────────────────
// Add to index.html <head>:
// <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">

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
  { key: "sprayer", Icon: GiSpray, en: "Sprayer", mr: "फवारणी यंत्र" },
  { key: "seed_drill", Icon: GiSeedling, en: "Seed Drill", mr: "बियाणे ड्रिल" },
  {
    key: "harvester_paddy",
    Icon: GiWheat,
    en: "Paddy Harvester",
    mr: "भात कापणी",
  },
  { key: "farmer", Icon: GiFarmer, en: "Cultivator", mr: "कल्टिव्हेटर" },
  { key: "other", Icon: RiPlantLine, en: "Other", mr: "इतर" },
];

const steps = [
  {
    number: "01",
    Icon: MdLocationOn,
    en: {
      title: "Search Nearby",
      desc: "Find verified equipment within 20km of your village. Filter by type, date and price.",
    },
    mr: {
      title: "जवळचे शोधा",
      desc: "तुमच्या गावापासून २० किमी आत सत्यापित उपकरणे शोधा. प्रकार, तारीख आणि किंमतीनुसार फिल्टर करा.",
    },
  },
  {
    number: "02",
    Icon: MdPayments,
    en: {
      title: "Book Instantly",
      desc: "Select your date and land size. Get owner confirmation within 6 hours.",
    },
    mr: {
      title: "लगेच बुक करा",
      desc: "तुमची तारीख आणि जमीन आकार निवडा. ६ तासांत मालकाची पुष्टी मिळवा.",
    },
  },
  {
    number: "03",
    Icon: FaTractor,
    en: {
      title: "Get Work Done",
      desc: "Owner arrives on time. Service completed. Pay cash or online — your choice.",
    },
    mr: {
      title: "काम पूर्ण करा",
      desc: "मालक वेळेवर येतो. सेवा पूर्ण होते. रोख किंवा ऑनलाइन द्या — तुमची निवड.",
    },
  },
];

const features = [
  {
    Icon: MdVerified,
    en: "Verified Equipment",
    mr: "सत्यापित उपकरणे",
    desc: "Every listing verified by our team",
  },
  {
    Icon: MdLocationOn,
    en: "Nearby Availability",
    mr: "जवळची उपलब्धता",
    desc: "Equipment within 20km of your farm",
  },
  {
    Icon: MdPayments,
    en: "Transparent Pricing",
    mr: "पारदर्शक किंमत",
    desc: "No hidden charges, fixed rates",
  },
  {
    Icon: MdStar,
    en: "Trusted Owners",
    mr: "विश्वासू मालक",
    desc: "KYC verified equipment owners",
  },
  {
    Icon: MdPhone,
    en: "Easy Booking",
    mr: "सहज बुकिंग",
    desc: "Book in under 10 minutes",
  },
  {
    Icon: MdSecurity,
    en: "Secure Platform",
    mr: "सुरक्षित प्लॅटफॉर्म",
    desc: "Your data and payments protected",
  },
];

const testimonials = [
  {
    name: "Ramesh Patil",
    village: "Niphad, Nashik",
    en: "Found a tractor within 5km of my farm. Saved ₹3000 compared to the local middleman. Booking took less than 5 minutes.",
    mr: "माझ्या शेतापासून ५ किमी आत ट्रॅक्टर मिळाला. स्थानिक दलालापेक्षा ₹३००० वाचले.",
    rating: 5,
    role: "Farmer · 3 acres",
  },
  {
    name: "Suresh Jadhav",
    village: "Sinnar, Nashik",
    en: "Listed my harvester on KrishiGo. Now it earns money even in off-season. Platform handles everything.",
    mr: "KrishiGo वर माझे हार्वेस्टर नोंदवले. आता ऑफ-सीझनमध्येही पैसे मिळतात.",
    rating: 5,
    role: "Equipment Owner",
  },
  {
    name: "Anita Shinde",
    village: "Dindori, Nashik",
    en: "Booking was so easy. Got confirmation in under 10 minutes. The owner was professional and on time.",
    mr: "बुकिंग खूप सोपे होते. १० मिनिटांत पुष्टी मिळाली.",
    rating: 5,
    role: "Farmer · 5 acres",
  },
];

const marqueeItems = [
  "500+ Farmers Registered",
  "Nashik District Pilot",
  "20+ Equipment Owners",
  "Free to Join",
  "Marathi Support",
  "KYC Verified Listings",
  "Cash & Online Payments",
];

// ── Helpers ───────────────────────────────────────────

function useScrolled() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return scrolled;
}

function AnimatedSection({ children, className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

// ── Main ──────────────────────────────────────────────

export default function Landing() {
  const navigate = useNavigate();
  const [lang, setLang] = useState(localStorage.getItem("language") || "en");
  const [menuOpen, setMenuOpen] = useState(false);
  const scrolled = useScrolled();

  const toggleLang = () => {
    const next = lang === "en" ? "mr" : "en";
    setLang(next);
    localStorage.setItem("language", next);
  };

  return (
    <div
      className="min-h-screen bg-[#F7F5F0]"
      style={{ fontFamily: "'Outfit', sans-serif" }}
    >
      {/* ── Navbar ── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-white shadow-md py-3" : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <img
            src={logo}
            alt="KrishiGo"
            className="h-10 w-auto transition-all duration-300"
            style={{
              filter: scrolled
                ? "none"
                : "brightness(0) invert(1) drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
            }}
          />

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={toggleLang}
              className={`px-3 py-1.5 rounded-lg border-2 text-sm font-semibold transition-all ${
                scrolled
                  ? "border-neutral-300 text-neutral-600 hover:border-[#2D6A4F] hover:text-[#2D6A4F]"
                  : "border-white/50 text-white hover:border-white"
              }`}
            >
              {lang === "en" ? "मराठी" : "English"}
            </button>
            <button
              onClick={() => navigate("/login")}
              className={`text-sm font-semibold transition-all ${
                scrolled
                  ? "text-neutral-700 hover:text-[#2D6A4F]"
                  : "text-white/90 hover:text-white"
              }`}
            >
              {lang === "en" ? "Login" : "लॉगिन"}
            </button>
            <button
              onClick={() => navigate("/login")}
              className="px-5 py-2.5 bg-[#E76F51] text-white text-sm font-bold rounded-xl hover:bg-[#F4A261] transition-all shadow-lg"
            >
              {lang === "en" ? "Get Started" : "सुरू करा"}
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            className={`md:hidden transition-colors ${
              scrolled ? "text-neutral-800" : "text-white"
            }`}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <HiX size={24} /> : <HiMenuAlt3 size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-white px-6 py-4 flex flex-col gap-3 shadow-lg"
          >
            <button
              onClick={() => {
                navigate("/login");
                setMenuOpen(false);
              }}
              className="text-left text-neutral-700 font-semibold py-2 border-b border-neutral-100"
            >
              {lang === "en" ? "Login" : "लॉगिन"}
            </button>
            <button
              onClick={() => {
                navigate("/login");
                setMenuOpen(false);
              }}
              className="text-left text-neutral-700 font-semibold py-2 border-b border-neutral-100"
            >
              {lang === "en" ? "Register" : "नोंदणी"}
            </button>
            <button
              onClick={toggleLang}
              className="text-left text-[#2D6A4F] font-semibold py-2"
            >
              {lang === "en" ? "मराठी मध्ये पहा" : "View in English"}
            </button>
          </motion.div>
        )}
      </nav>

      {/* ── Hero with Video ── */}
      <section className="relative min-h-screen flex items-center overflow-hidden py-24">
        {/* Fallback image behind video */}
        <img
          src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1920&q=80"
          alt="farm"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Video background */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          {/*<source src={tractorVideo} type="video/mp4" />*/}
        </video>

        {/* Dark green gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#1B4332]/90 via-[#2D6A4F]/75 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        <div className="absolute top-32 left-10 w-72 h-72 bg-[#95D5B2]/20 blur-3xl rounded-full" />
<div className="absolute bottom-20 left-40 w-56 h-56 bg-[#E76F51]/10 blur-3xl rounded-full" />

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/15 backdrop-blur-sm text-white text-sm font-semibold rounded-full mb-6 border border-white/20">
                <span className="w-2 h-2 bg-[#E76F51] rounded-full animate-pulse" />
                {lang === "en"
                  ? "Now live in Nashik District"
                  : "आता नाशिक जिल्ह्यात सुरू"}
              </span>

              <h1
                style={{ fontFamily: "'Playfair Display', serif" }}
                className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-tight mb-6"
              >
                {lang === "en" ? (
                  <>
                    Find Farm
                    <br />
                    <span className="text-[#95D5B2]">Equipment </span>
                    <br />
                    Near Your
                    <span className="text-[#95D5B2]"> Village</span>
                  </>
                ) : (
                  <>
                    शेती उपकरणे
                    <br />
                    <span className="text-[#95D5B2]">सहज</span>
                    <br />
                    भाड्याने घ्या
                  </>
                )}
              </h1>

              <p className="text-lg text-white/80 mb-10 leading-relaxed max-w-lg">
                {lang === "en"
                  ? "Connect with verified equipment owners near your village. Book tractors, harvesters, sprayers — affordable, reliable, on-demand."
                  : "तुमच्या गावाजवळील सत्यापित उपकरण मालकांशी जोडा. ट्रॅक्टर, हार्वेस्टर, फवारणी यंत्र बुक करा."}
              </p>

              <div className="flex flex-wrap gap-4">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate("/login")}
                  className="flex items-center gap-2 px-7 py-4 bg-[#E76F51] text-white font-bold rounded-2xl text-base hover:bg-[#F4A261] transition-all shadow-xl"
                >
                  <FaTractor size={20} />
                  {lang === "en" ? "Find Equipment" : "उपकरण शोधा"}
                  <HiArrowRight size={18} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate("/login")}
                  className="flex items-center gap-2 px-7 py-4 bg-white/15 backdrop-blur-sm text-white font-bold rounded-2xl text-base hover:bg-white/25 transition-all border-2 border-white/30"
                >
                  {lang === "en" ? "List Your Equipment" : "उपकरण नोंदवा"}
                </motion.button>
              </div>
            </motion.div>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-14 flex flex-wrap gap-4"
            >
              {[
                { value: "500+", en: "Farmers", mr: "शेतकरी" },
                { value: "20+", en: "Owners", mr: "मालक" },
                { value: "3", en: "Talukas", mr: "तालुके" },
                { value: "₹0", en: "Join Fee", mr: "नोंदणी शुल्क" },
              ].map((s, i) => (
                <div
                  key={i}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-5 py-3 text-center"
                >
                  <div className="text-2xl font-black text-white">
                    {s.value}
                  </div>
                  <div className="text-xs text-white/60 font-medium">
                    {lang === "en" ? s.en : s.mr}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
        >
          <div className="w-6 h-10 rounded-full border-2 border-white/40 flex items-start justify-center pt-2">
            <div className="w-1 h-2 bg-white/60 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* ── Marquee Strip ── */}
      <div className="bg-[#2D6A4F] py-3 overflow-hidden">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="flex gap-12 whitespace-nowrap"
        >
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span
              key={i}
              className="text-white/90 text-sm font-semibold flex items-center gap-3"
            >
              <span className="w-1.5 h-1.5 bg-[#E76F51] rounded-full" />
              {item}
            </span>
          ))}
        </motion.div>
      </div>

      {/* ── Categories ── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <motion.div variants={fadeUp} className="mb-12">
              <p className="text-[#E76F51] font-bold text-sm uppercase tracking-widest mb-2">
                {lang === "en" ? "Browse by Type" : "प्रकारानुसार शोधा"}
              </p>
              <h2
                style={{ fontFamily: "'Playfair Display', serif" }}
                className="text-3xl md:text-4xl font-black text-neutral-900"
              >
                {lang === "en" ? "Equipment Categories" : "उपकरण प्रकार"}
              </h2>
            </motion.div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-4">
              {categories.map((cat) => (
                <motion.div
                  key={cat.key}
                  variants={fadeUp}
                  whileHover={{
                    y: -6,
                    scale: 1.03,
                    boxShadow: "0 12px 40px rgba(45,106,79,0.15)",
                  }}
                  onClick={() => navigate("/login")}
                  className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-[#F7F5F0] hover:bg-[#2D6A4F] cursor-pointer transition-all group border-2 border-transparent hover:border-[#2D6A4F]"
                >
                  <cat.Icon
                    size={32}
                    className="text-[#2D6A4F] group-hover:text-white group-hover:scale-110 transition-all duration-300"
                  />
                  <span className="text-xs font-bold text-neutral-600 group-hover:text-white text-center transition-colors leading-tight">
                    {lang === "en" ? cat.en : cat.mr}
                  </span>
                </motion.div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-20 px-6 bg-[#F7F5F0]">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <motion.div variants={fadeUp} className="text-center mb-16">
              <p className="text-[#E76F51] font-bold text-sm uppercase tracking-widest mb-2">
                {lang === "en" ? "Simple Process" : "सोपी प्रक्रिया"}
              </p>
              <h2
                style={{ fontFamily: "'Playfair Display', serif" }}
                className="text-3xl md:text-4xl font-black text-neutral-900"
              >
                {lang === "en" ? "How KrishiGo Works" : "KrishiGo कसे काम करते"}
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {steps.map((step, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className="relative bg-white rounded-3xl p-8 shadow-sm border border-neutral-100 overflow-hidden group hover:border-[#2D6A4F] transition-all"
                >
                  {/* Big number background */}
                  <div
                    style={{ fontFamily: "'Playfair Display', serif" }}
                    className="absolute -top-4 -right-2 text-[120px] font-black text-neutral-50 group-hover:text-[#2D6A4F]/5 transition-colors leading-none select-none"
                  >
                    {step.number}
                  </div>

                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-[#2D6A4F]/10 flex items-center justify-center mb-6 group-hover:bg-[#2D6A4F] transition-colors">
                      <step.Icon
                        size={28}
                        className="text-[#2D6A4F] group-hover:text-white transition-colors"
                      />
                    </div>
                    <h3 className="text-xl font-bold text-neutral-900 mb-3">
                      {lang === "en" ? step.en.title : step.mr.title}
                    </h3>
                    <p className="text-neutral-500 leading-relaxed text-sm">
                      {lang === "en" ? step.en.desc : step.mr.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ── Why KrishiGo ── */}
      <section className="py-20 px-6 bg-[#1B4332]">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <motion.div variants={fadeUp} className="text-center mb-16">
              <p className="text-[#95D5B2] font-bold text-sm uppercase tracking-widest mb-2">
                {lang === "en" ? "Our Promise" : "आमचे वचन"}
              </p>
              <h2
                style={{ fontFamily: "'Playfair Display', serif" }}
                className="text-3xl md:text-4xl font-black text-white"
              >
                {lang === "en" ? "Why Choose KrishiGo?" : "KrishiGo का निवडा?"}
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {features.map((f, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  whileHover={{ y: -4 }}
                  className="bg-white/5 border border-white/10 rounded-3xl p-7 hover:bg-white/10 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#2D6A4F] flex items-center justify-center mb-5">
                    <f.Icon size={24} className="text-[#95D5B2]" />
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2">
                    {lang === "en" ? f.en : f.mr}
                  </h3>
                  <p className="text-white/50 text-sm leading-relaxed">
                    {f.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <motion.div variants={fadeUp} className="text-center mb-16">
              <p className="text-[#E76F51] font-bold text-sm uppercase tracking-widest mb-2">
                {lang === "en" ? "Real Stories" : "खऱ्या कहाण्या"}
              </p>
              <h2
                style={{ fontFamily: "'Playfair Display', serif" }}
                className="text-3xl md:text-4xl font-black text-neutral-900"
              >
                {lang === "en" ? "What Farmers Say" : "शेतकरी काय म्हणतात"}
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((t, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  whileHover={{ y: -4 }}
                  className="bg-[#F7F5F0] rounded-3xl p-8 border-2 border-transparent hover:border-[#2D6A4F]/20 transition-all"
                >
                  {/* Stars */}
                  <div className="flex gap-1 mb-5">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <MdStar key={j} size={18} className="text-[#E76F51]" />
                    ))}
                  </div>

                  <p className="text-neutral-700 leading-relaxed mb-6 text-sm">
                    "{lang === "en" ? t.en : t.mr}"
                  </p>

                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-[#2D6A4F] text-white flex items-center justify-center font-black text-lg">
                      {t.name[0]}
                    </div>
                    <div>
                      <div className="font-bold text-neutral-900 text-sm">
                        {t.name}
                      </div>
                      <div className="text-xs text-neutral-400">
                        {t.village} · {t.role}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-20 px-6 bg-[#F7F5F0]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="bg-gradient-to-br from-[#2D6A4F] to-[#1B4332] rounded-3xl p-12 md:p-16 text-center relative overflow-hidden"
          >
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative">
              <h2
                style={{ fontFamily: "'Playfair Display', serif" }}
                className="text-3xl md:text-4xl font-black text-white mb-4"
              >
                {lang === "en"
                  ? "Ready to Get Started?"
                  : "सुरुवात करण्यास तयार?"}
              </h2>
              <p className="text-white/70 mb-10 max-w-lg mx-auto">
                {lang === "en"
                  ? "Join hundreds of farmers already saving money with KrishiGo in Nashik."
                  : "नाशिकमध्ये KrishiGo सोबत पैसे वाचवणाऱ्या शेकडो शेतकऱ्यांमध्ये सामील व्हा."}
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate("/login")}
                  className="flex items-center gap-2 px-8 py-4 bg-[#E76F51] text-white font-bold rounded-2xl text-lg hover:bg-[#F4A261] transition-all shadow-xl"
                >
                  {lang === "en" ? "Get Started Free" : "मोफत सुरू करा"}
                  <HiArrowRight size={20} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-neutral-900 text-white py-14 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-10 border-b border-neutral-800">
            <div className="md:col-span-2">
              <img src={logo} alt="KrishiGo" className="h-9 w-auto mb-4" />
              <p className="text-neutral-400 text-sm leading-relaxed max-w-xs">
                {lang === "en"
                  ? "Making farm equipment accessible to every farmer in rural Maharashtra. Built for Bharat."
                  : "महाराष्ट्रातील प्रत्येक शेतकऱ्याला शेती उपकरणे उपलब्ध करून देणे."}
              </p>
              <div className="mt-4 flex items-center gap-2 text-sm text-[#95D5B2]">
                <MdLocationOn size={16} />
                <span>Nashik, Maharashtra</span>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-sm mb-4 text-neutral-300 uppercase tracking-wider">
                {lang === "en" ? "Platform" : "प्लॅटफॉर्म"}
              </h4>
              <ul className="flex flex-col gap-3 text-sm text-neutral-400">
                {[
                  { en: "Find Equipment", mr: "उपकरण शोधा" },
                  { en: "List Equipment", mr: "उपकरण नोंदवा" },
                  { en: "How it Works", mr: "कसे काम करते" },
                ].map((item, i) => (
                  <li
                    key={i}
                    onClick={() => navigate("/login")}
                    className="hover:text-white cursor-pointer transition-colors"
                  >
                    {lang === "en" ? item.en : item.mr}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-sm mb-4 text-neutral-300 uppercase tracking-wider">
                {lang === "en" ? "Support" : "मदत"}
              </h4>
              <ul className="flex flex-col gap-3 text-sm text-neutral-400">
                {[
                  { en: "Contact Us", mr: "संपर्क करा" },
                  { en: "Privacy Policy", mr: "गोपनीयता धोरण" },
                  { en: "Terms of Service", mr: "सेवा अटी" },
                ].map((item, i) => (
                  <li
                    key={i}
                    className="hover:text-white cursor-pointer transition-colors"
                  >
                    {lang === "en" ? item.en : item.mr}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-6 flex flex-col md:flex-row justify-between items-center gap-3 text-sm text-neutral-500">
            <span>
              © 2026 KrishiGo.{" "}
              {lang === "en" ? "All rights reserved." : "सर्व हक्क राखीव."}
            </span>
            <span className="text-neutral-600">
              Made with ❤️ for farmers of Maharashtra
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
