# 🧠 FitMate Backend

FitMate is a personalized health and wellness application that helps users track their **fitness** and **nutrition goals** through AI-powered recommendations and smart planning. This repository contains the **backend code**, including authentication, user management, meal and workout recommendations, and integrations with external services.

---

## 📁 Project Structure

backend/
|

├── config/ # OAuth2, Passport.js, and other configs

├── controllers/ # Logic for routes: user, auth, workout, etc.

├── emails/ # Reusable email templates

├── jobs/ # Background jobs (e.g., cleanup)

├── middlewares/ # Auth, validation, file upload, etc.

├── models/ # MongoDB schemas

├── routes/ # Express routes

├── services/ # Services like Redis, email

├── utils/ # Helper functions (JWT, pagination, etc.)

├── app.js # Express app entry point

├── swagger.json # API documentation (OpenAPI)

└── vercel.json # Vercel deployment config


---

## 🚀 Features

- 🛡️ JWT & Google OAuth Authentication
- 👤 Role-based Access Control (User/Admin)
- 📝 Profile & Diary Management
- 🍽️ Meal Recommendation Engine
- 🏋️ AI-Powered Workout Suggestions
- 📬 Email Notifications (Register, Reset, Update)
- 🗑️ Scheduled Cleanup for Old Users
- 🌐 Swagger API Documentation
- ⚡ Rate Limiting & Token Blacklisting
- ☁️ Cloudinary File Uploads
- ⚙️ Redis Caching Support

---

## 📦 Technologies Used

- **Node.js** / **Express.js**
- **MongoDB** with **Mongoose**
- **Passport.js** & **Google OAuth2**
- **JWT** for session management
- **Cloudinary** for media storage
- **Redis** for token and session caching
- **Nodemailer** for email communication
- **Vercel** for deployment

---

## 🔐 Authentication

- **Local Auth** (Email + Password)
- **Google OAuth** (via Passport)
- Refresh Token & Blacklist logic via Redis
- Protected routes using `verifyToken` and `allowedTo` middleware

---

## 🛠️ Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/fitmate.git
   cd fitmate/backend
2. **Install dependencies**
   ```bash
   npm install
3. **create .env file
   ```bash
   PORT=5000
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_secret
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_secret
   REDIS_URL=your_redis_url
   CLOUDINARY_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
4. **Run the server**
   ```bash
   npm start

---

## 📚 API Documentation

Open swagger.json in Swagger Editor or import into Postman to explore endpoints.

---

## 📤 Deployment

FitMate backend is ready for Vercel deployment. See vercel.json for route setup.

---

## 👥 Contributors

**Sohaila Hesham** 
**Samer Yousry**

---

## 📄 License

MIT License – feel free to use and contribute!

---
