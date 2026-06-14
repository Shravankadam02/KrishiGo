# 🌾 KrishiGo — Smart Agricultural Equipment Sharing

KrishiGo is an on-demand, digital sharing marketplace connecting smallholder farmers with verified agricultural equipment owners. Think of it as **"Ola for Tractors"** — designed specifically for Tier 2, Tier 3, and rural regions of Bharat. 

By renting modern machinery (tractors, harvesters, rotavators, sprayers) near their village, farmers avoid heavy ownership costs while equipment owners monetize idle assets.

---

## 🚀 Key Product Features

* **Dual Language Localization**: Deeply localized interface in **Marathi** and **English** to facilitate rural adoption.
* **Geospatial Discovery**: Uses MongoDB geospatial `$nearSphere` indexing to suggest available machinery within a 20km radius of the farmer's village.
* **Verification & Trust System (KYC)**: Secure upload and admin review of Aadhaar, PAN, and Bank Account details for owners, and RC/Insurance checks for machinery.
* **Commitment Protection**:
  * Auto-triggers **Advance Payments** (₹200–₹500) for high-value bookings, peak seasons, or low-trust ratings to reduce no-shows.
  * **Cancellation Policies**: Timed penalty structures (25% to 75% booking values) to protect both parties' time and expenses.
* **Seamless Payment Options**: Support for both **Cash on Completion** and integrated **Razorpay Online Payments**.
* **Internal Trust Score**: Automatically adjusted based on cancellation history, payment promptness, and reviews.

---

## 📁 Repository Structure

```
KrishiGo/
├── Backend/          # Node.js + Express.js API Server
│   ├── src/
│   │   ├── config/   # DB connection, Cloudinary, Multer, Razorpay setup
│   │   ├── controllers/ # Business logic handlers
│   │   ├── middlewares/ # Auth & role restriction middleware
│   │   ├── models/   # Mongoose Database schemas (User, Booking, Equipment, Otp, Payout, Dispute)
│   │   ├── routes/   # REST API endpoint definitions
│   │   └── utils/    # Helper calculations (commission, penalties, distance)
│   └── index.js      # Server entry point
│
├── Frontend/         # React + Vite Single Page Application
│   ├── src/
│   │   ├── components/ # Shared UI and Layout structures (Farmer, Owner, Admin)
│   │   ├── i18n/     # English and Marathi translation dictionaries
│   │   ├── pages/    # Main role views (Landing, Farmer pages, Owner pages, Admin pages)
│   │   ├── services/ # Axios API client config
│   │   └── store/    # Zustand persistent global auth store
│   ├── index.html    # Client HTML entry point
│   └── tailwind.config.js # Custom colors and font themes (Outfit, Playfair Display)
│
└── Docs/             # Startup Business Plans & Policy frameworks (PRDs)
```

---

## 🛠️ Quick Start Guide

### Prerequisites
* [Node.js](https://nodejs.org/) (v18+ recommended)
* [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) or a running local instance

---

### 1. Backend Setup

1. Open a terminal and navigate to the backend folder:
   ```bash
   cd Backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `Backend` root directory using the following keys:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret
   CLIENT_URL=http://localhost:5173
   ```
4. Seed mock database profiles (KYC, users, equipment):
   ```bash
   npm run seed
   ```
5. Launch the backend server in development mode:
   ```bash
   npm run dev
   ```
   The backend will run on [http://localhost:5000](http://localhost:5000).

---

### 2. Frontend Setup

1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd Frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `Frontend` root directory:
   ```env
   VITE_API_BASE_URL=http://localhost:5000
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The client application will run on [http://localhost:5173](http://localhost:5173).

---

## 📈 Startup Business Policies (MVP)

### Commission Structure
* **Dynamic pricing fees**:
  * Bookings under ₹5,000 $\rightarrow$ **10% platform fee**
  * Bookings ₹5,000 and above $\rightarrow$ **15% platform fee**
  *(Deducted automatically from the Owner's weekly payout statement)*

### Farmer Cancellation Penalties
* **> 24 hours prior**: Free cancellation, full refund of advance.
* **12–24 hours prior**: **25% booking value** penalty.
* **6–12 hours prior**: **50% booking value** penalty + **0.2 rating drop**.
* **< 6 hours prior**: **75% booking value** penalty + **0.5 rating drop**.
* **No-Show**: **100% booking value** penalty + **1.0 rating drop**.

### Owner Cancellation Penalties
* **> 24 hours prior**: Free cancellation.
* **< 24 hours prior**: **₹500 penalty** + **0.3 rating drop**.
* **< 6 hours prior**: **₹1,000 penalty** + **0.5 rating drop**.
* **No-Show**: **₹2,000 penalty** + **1.0 rating drop** + temporary suspension.

---

## 🛡️ License

This project is licensed under the ISC License. Made with ❤️ for the farmers of Maharashtra.
