# 🚀 Online Resource Request System (ORRS)

## 🌟 Project Description

**Online Resource Request System (ORRS)** is a modern, web-based platform designed to simplify and digitize the process of requesting campus resources like libraries, seminar halls, and playgrounds.

With a clean interface and powerful backend, users can easily request resources, track their status in real time, and interact seamlessly with administrators.

---

## 🚀 Study & Practice Architecture (Dual Backends)

For **study purposes and real-time practice**, this project features **two parallel backend implementations** connected to the same database. This allows comparing Node.js/Express development with Java/Spring Boot development side-by-side.

1. **Node.js + Express Backend** (located in [`/Backend`](file:///p:/Online-Resource-Request-System/Backend)): Fast, asynchronous JavaScript-based REST API using Mongoose.
2. **Java + Spring Boot Backend** (located in [`/Backend-Java`](file:///p:/Online-Resource-Request-System/Backend-Java)): Enterprise-ready Java REST API using Spring Security, Spring Data MongoDB, and standard design patterns.

Both backends use the same MongoDB collections, JWT auth schemas, and Cloudinary uploads, so they are fully interchangeable.

---

## 🛠️ Technology Stack

✨ **Frontend:** React.js, HTML, CSS, JavaScript (Vite, Tailwind CSS, Lucide icons)
⚙️ **Backend Option A:** Node.js, Express, Mongoose, JWT, bcryptjs, Multer
⚙️ **Backend Option B:** Java 21, Spring Boot 3, Spring Security, Spring Data MongoDB, JJWT, Cloudinary Java SDK
🗄️ **Database:** MongoDB (Shared cluster, collections: `profiles`, `resources`, `requests`, `sites`)
☁️ **Cloud Storage:** Cloudinary (for secure image/PDF uploads)

---

## ✨ Core Features

✔️ **Google OAuth Sign-In** with automatic profile creation.
✔️ **JWT-Based Authentication** with secure token validation.
✔️ **Role-Based Access Control** (Admin & User dashboards).
✔️ **Resource Listing & Availability** tracking.
✔️ **Multi-Item Request Creation & Tracking** in real-time.
✔️ **Admin Approval / Rejection** with customizable reasons.

---

## 🔥 Advanced Features

### 👤 Smart Profile Management
* Edit and manage user profiles easily.
* Upload and securely store:
  * 🖼️ Profile Image
  * 🆔 Aadhar Card
  * 💳 PAN Card
* All files are stored securely using **Cloudinary**.

### 📊 Analytics Dashboard
* Gain valuable insights on system usage:
  * 📈 Total Request counts
  * ✅ Approved vs ❌ Rejected distribution
  * 📊 Resource popularity rankings
  * 💰 Cost and request trend lines

### 📧 Email Sharing System
* Instantly share resource needs via email.
* Connect with nearby shops or providers.
* Improves accessibility and quick resource fulfillment.

---

## 👥 User Roles

### 🛡️ Admin
* View all requests.
* Approve or reject requests with custom reasons.
* Manage available resources (CRUD).

### 🙋 User
* Sign in securely via Google OAuth.
* Browse resource lists.
* Submit multi-item requests.
* Track request status.
* Manage profile & upload verification documents.

---

## 🔄 Workflow
1️⃣ User submits a request.
2️⃣ Status is marked as ⏳ *Pending*.
3️⃣ Admin reviews the request.
4️⃣ Request is ✅ Approved or ❌ Rejected.
5️⃣ User receives and tracks the result.

---

## 📖 How to Run the Applications

### 1. Running the Frontend
Navigate to the `Frontend/` directory, install dependencies, and run:
```bash
cd Frontend
npm install
npm run dev
```
By default, the frontend runs on `http://localhost:5173`. 
Configure [`Frontend/.env.local`](file:///p:/Online-Resource-Request-System/Frontend/.env.local) to point to the backend port (default: `http://localhost:5000`).

---

### 2. Running the Node.js Backend
Navigate to the `Backend/` directory, set up your `.env` file, and run:
```bash
cd Backend
npm install
npm run dev
```
The Node.js server runs on port `5000`.

---

### 3. Running the Spring Boot Java Backend
Ensure the Node.js server is stopped (since both share port `5000` for frontend compatibility), navigate to `Backend-Java/`, and run:
```bash
cd Backend-Java
mvn clean compile
mvn spring-boot:run
```
The Spring Boot server runs on port `5000`.

---

## 📦 Deployment

### Frontend (Vercel)
The React frontend is optimized for zero-config deployments on [Vercel](https://vercel.com).

### Backend (Render / Railway)
The Java Spring Boot backend can be deployed to [Render](https://render.com) (see details in the [`Backend-Java/DEPLOY_RENDER.md`](file:///p:/Online-Resource-Request-System/Backend-Java/DEPLOY_RENDER.md) guide) or [Railway](https://railway.app).

---

## 🚀 Future Enhancements
✨ Automated Email Notifications
📅 Calendar Integration
📱 Mobile Application
💳 Payment Integration for premium resources
