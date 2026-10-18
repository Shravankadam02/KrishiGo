# KrishiGo Backend

## Setup & Run

1. `npm install`
2. Create `.env` file with the following required environment variables:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/krishigo
CLIENT_URL=http://localhost:5173
JWT_SECRET=your_jwt_secret

# Demo & Admin
DEMO_MODE=true
ADMIN_PHONE=9999999999
ADMIN_PASSWORD_HASH=$2a$10$... (bcrypt hash of admin password)

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Encryption
BANK_ENCRYPTION_KEY=a_32_byte_hex_string

# Razorpay (Required for Payments)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# SMS (Optional in Demo Mode)
MSG91_AUTH_KEY=your_msg91_key
```

3. `npm run dev:seed` (Starts dev server and runs seed script for admin user)
