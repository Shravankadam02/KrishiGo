import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { HiArrowLeft } from "react-icons/hi";
import { MdCalendarToday, MdLocationOn, MdVerified } from "react-icons/md";
import { FaTractor } from "react-icons/fa";
import FarmerLayout from "../../components/layout/FarmerLayout";
import api from "../../services/api";
import { formatPrice, formatDate } from "../../utils/helpers";
import {
  MdWarning,
  MdCheckCircle,
  MdCheck,
  MdSchedule,
  MdPayment,
} from "react-icons/md";

const statusConfig = {
  pending: {
    label: "Pending",
    mr: "प्रलंबित",
    color: "bg-yellow-100 text-yellow-700",
  },
  confirmed: {
    label: "Confirmed",
    mr: "निश्चित",
    color: "bg-blue-100 text-blue-700",
  },
  in_progress: {
    label: "In Progress",
    mr: "सुरू आहे",
    color: "bg-purple-100 text-purple-700",
  },
  completed: {
    label: "Completed",
    mr: "पूर्ण झाले",
    color: "bg-green-100 text-green-700",
  },
  cancelled_farmer: {
    label: "Cancelled",
    mr: "रद्द केले",
    color: "bg-red-100 text-red-700",
  },
  cancelled_owner: {
    label: "Cancelled",
    mr: "रद्द केले",
    color: "bg-red-100 text-red-700",
  },
  disputed: {
    label: "Disputed",
    mr: "वादग्रस्त",
    color: "bg-orange-100 text-orange-700",
  },
  expired: {
    label: "Expired",
    mr: "कालबाह्य",
    color: "bg-gray-100 text-gray-600",
  },
};

export default function BookingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const lang = localStorage.getItem("language") || "en";

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get(`/api/bookings/${id}`);
        setBooking(data.booking);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel?")) return;
    setCancelling(true);
    try {
      await api.put(`/api/bookings/${id}/cancel`, {
        reason: "Cancelled by farmer",
      });
      navigate("/farmer/bookings");
    } catch (err) {
      alert(err.response?.data?.message || "Cancel failed");
    } finally {
      setCancelling(false);
    }
  };

  if (loading)
    return (
      <FarmerLayout>
        <div className="flex flex-col gap-4 p-4 pt-12">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-3xl h-28 animate-pulse" />
          ))}
        </div>
      </FarmerLayout>
    );

  if (!booking)
    return (
      <FarmerLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <p className="text-neutral-400 font-semibold">Booking not found</p>
          <button
            onClick={() => navigate("/farmer/bookings")}
            className="text-[#2D6A4F] font-bold text-sm"
          >
            Go Back
          </button>
        </div>
      </FarmerLayout>
    );

  const status = statusConfig[booking.status] || statusConfig.pending;

  return (
    <FarmerLayout>
      {/* Header */}
      <div className="bg-white px-4 pt-12 pb-4 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/farmer/bookings")}
            className="w-9 h-9 rounded-xl bg-[#F7F5F0] flex items-center justify-center"
          >
            <HiArrowLeft size={18} className="text-neutral-600" />
          </button>
          <div className="flex-1">
            <h1 className="font-black text-neutral-900 text-base">
              {lang === "en" ? "Booking Details" : "बुकिंग तपशील"}
            </h1>
            <p className="text-xs text-neutral-400">
              #{booking._id.slice(-8).toUpperCase()}
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${status.color}`}
          >
            {lang === "en" ? status.label : status.mr}
          </span>
        </div>
      </div>

      <div className="px-4 py-4 flex flex-col gap-4">
        {/* Equipment card */}
        <div className="bg-white rounded-3xl p-4 shadow-sm flex gap-3 items-center">
          <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0">
            {booking.equipment?.photos?.[0] ? (
              <img
                src={booking.equipment.photos[0]}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[#2D6A4F]/10 flex items-center justify-center">
                <FaTractor size={24} className="text-[#2D6A4F]" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <p className="font-black text-neutral-900 capitalize">
              {booking.equipment?.type?.replace(/_/g, " ")}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <MdLocationOn size={12} className="text-neutral-400" />
              <span className="text-xs text-neutral-400">
                {booking.equipment?.village}, {booking.equipment?.taluka}
              </span>
            </div>
          </div>
        </div>

        {/* Booking info */}
        <div className="bg-white rounded-3xl p-4 shadow-sm">
          <h3 className="font-black text-neutral-900 text-sm mb-3">
            {lang === "en" ? "Booking Info" : "बुकिंग माहिती"}
          </h3>
          <div className="flex flex-col gap-2">
            {[
              {
                label: lang === "en" ? "Service Date" : "सेवा तारीख",
                value: formatDate(booking.serviceDate),
              },
              {
                label: lang === "en" ? "Land Size" : "जमीन आकार",
                value: `${booking.landSize?.toFixed(2)} acres`,
              },
              {
                label: lang === "en" ? "Price per Acre" : "प्रति एकर किंमत",
                value: formatPrice(booking.pricePerAcre),
              },
              {
                label: lang === "en" ? "Total Amount" : "एकूण रक्कम",
                value: formatPrice(booking.totalPrice),
                bold: true,
              },
              {
                label: lang === "en" ? "Payment Status" : "देयक स्थिती",
                value: booking.paymentStatus,
              },
            ].map((item, i) => (
              <div
                key={i}
                className="flex justify-between py-2 border-b border-neutral-50 last:border-0"
              >
                <span className="text-neutral-400 text-xs">{item.label}</span>
                <span
                  className={`text-xs ${item.bold ? "font-black text-[#2D6A4F]" : "font-semibold text-neutral-700"}`}
                >
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Owner info */}
        <div className="bg-white rounded-3xl p-4 shadow-sm">
          <h3 className="font-black text-neutral-900 text-sm mb-3">
            {lang === "en" ? "Owner Details" : "मालक तपशील"}
          </h3>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#2D6A4F] flex items-center justify-center">
              <span className="text-white font-black">
                {booking.owner?.name?.[0]}
              </span>
            </div>
            <div className="flex-1">
              <p className="font-black text-neutral-900 text-sm">
                {booking.owner?.name}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <MdVerified size={12} className="text-[#2D6A4F]" />
                <span className="text-xs text-neutral-400">
                  {lang === "en" ? "KYC Verified" : "KYC सत्यापित"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Advance payment info */}
        {booking.advance?.required && (
          <div
            className={`rounded-3xl p-4 ${
              booking.advance.collected
                ? "bg-green-50 border border-green-200"
                : "bg-amber-50 border border-amber-200"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              {booking.advance.collected ? (
                <MdCheckCircle size={16} className="text-green-600" />
              ) : (
                <MdWarning size={16} className="text-amber-600" />
              )}
              <p
                className={`font-black text-sm ${
                  booking.advance.collected
                    ? "text-green-700"
                    : "text-amber-700"
                }`}
              >
                {booking.advance.collected
                  ? lang === "en"
                    ? "Advance Paid"
                    : "आगाऊ दिले"
                  : lang === "en"
                    ? "Advance Required"
                    : "आगाऊ रक्कम आवश्यक"}
              </p>
            </div>
            <p
              className={`text-xs ${
                booking.advance.collected ? "text-green-600" : "text-amber-600"
              }`}
            >
              {formatPrice(booking.advance.amount)}
            </p>
          </div>
        )}

        {/* Booking timeline */}
        <div className="bg-white rounded-3xl p-4 shadow-sm">
          <h3 className="font-black text-neutral-900 text-sm mb-3">
            {lang === "en" ? "Timeline" : "टाइमलाइन"}
          </h3>
          <div className="flex flex-col gap-3">
            {[
              {
                label: lang === "en" ? "Booking Created" : "बुकिंग तयार केली",
                date: booking.createdAt,
                done: true,
              },
              {
                label: lang === "en" ? "Owner Confirmation" : "मालकाची पुष्टी",
                date:
                  booking.status === "pending"
                    ? booking.ownerResponseDeadline
                    : null,
                done: ["confirmed", "in_progress", "completed"].includes(
                  booking.status,
                ),
                pending: booking.status === "pending",
              },
              {
                label: lang === "en" ? "Service Completed" : "सेवा पूर्ण झाली",
                date: booking.completedAt,
                done: ["in_progress", "completed"].includes(booking.status),
              },
              {
                label:
                  lang === "en" ? "Payment Confirmed" : "देयक निश्चित झाले",
                date: booking.paymentConfirmedAt,
                done: booking.status === "completed",
              },
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    step.done
                      ? "bg-[#2D6A4F]"
                      : step.pending
                        ? "bg-amber-400"
                        : "bg-neutral-200"
                  }`}
                >
                  {step.done && <MdCheck size={12} className="text-white" />}
                  {step.pending && (
                    <MdSchedule size={12} className="text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <p
                    className={`text-xs font-bold ${
                      step.done ? "text-neutral-800" : "text-neutral-400"
                    }`}
                  >
                    {step.label}
                  </p>
                  {step.date && (
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      {formatDate(step.date)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pay Now button — online payment after service completed */}
        {booking.paymentMethod === "online" &&
          booking.status === "in_progress" &&
          booking.paymentStatus !== "collected" && (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={async () => {
                try {
                  const { data } = await api.post(
                    "/api/payments/create-order",
                    {
                      bookingId: booking._id,
                      paymentType: booking.advance?.collected
                        ? "remaining"
                        : "full",
                    },
                  );
                  const options = {
                    key: data.keyId,
                    amount: data.order.amount,
                    currency: "INR",
                    name: "KrishiGo",
                    description: `Payment for ${booking.equipment?.type?.replace(/_/g, " ")}`,
                    order_id: data.order.id,
                    handler: async (response) => {
                      await api.post("/api/payments/verify", {
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                        bookingId: booking._id,
                        paymentType: booking.advance?.collected
                          ? "remaining"
                          : "full",
                      });
                      navigate("/farmer/bookings");
                    },
                    theme: { color: "#2D6A4F" },
                  };
                  const rzp = new window.Razorpay(options);
                  rzp.open();
                } catch (err) {
                  alert(err.response?.data?.message || "Payment failed");
                }
              }}
              className="w-full flex items-center justify-center gap-2 py-4 bg-[#E76F51] text-white font-black rounded-2xl text-base shadow-lg"
            >
              <MdPayment size={20} />
              {lang === "en" ? "Pay Now" : "आता द्या"} —{" "}
              {formatPrice(
                booking.advance?.collected
                  ? booking.totalPrice - booking.advance.amount
                  : booking.totalPrice,
              )}
            </motion.button>
          )}

        {/* Cancel button */}
        {["pending", "confirmed"].includes(booking.status) && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleCancel}
            disabled={cancelling}
            className="w-full py-4 bg-red-50 text-red-500 font-black rounded-2xl text-sm border-2 border-red-100 disabled:opacity-60"
          >
            {cancelling ? (
              <span className="w-5 h-5 border-2 border-red-300 border-t-red-500 rounded-full animate-spin mx-auto block" />
            ) : lang === "en" ? (
              "Cancel Booking"
            ) : (
              "बुकिंग रद्द करा"
            )}
          </motion.button>
        )}

        <div className="h-4" />
      </div>
    </FarmerLayout>
  );
}
