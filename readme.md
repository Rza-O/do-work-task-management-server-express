# 🚀 Do-Work Task Management API

A **backend API** for the Do-Work Task Management application, built using **Express.js, MongoDB, and Node.js**. This API allows users to **create, update, delete, and manage tasks**, ensuring **smooth task organization and user authentication**.

---

## 📌 Live API URL

> 🌐 **[Live API](https://do-work-task-management-server-express.vercel.app/)**

---

## 📦 Dependencies

```json
"dependencies": {
  "cors": "^2.8.5",
  "dotenv": "^16.4.7",
  "express": "^4.21.2",
  "mongodb": "^6.13.1",
  "morgan": "^1.10.0",
}
```

## 🛠 Technologies Used

-  Backend: Express.js, Node.js
-  Database: MongoDB (Atlas)
-  Middleware: CORS, Morgan

## 📥 Installation & Setup

### 🔹 Prerequisites

-  Node.js installed (>= v16 recommended)
-  MongoDB Atlas Cluster (or local MongoDB instance)

### 🔹 1. Clone the Repository

```sh
git clone https://github.com/Rza-O/do-work-task-management-server-express
cd do-work-task-manager-api
```

### 🔹 2. Install Dependencies

```sh
npm install
```

### 🔹 3. Set Up Environment Variables

Create a .env file in the root of your project and add:

```ini

DB_USER=your_mongodb_username
DB_PASS=your_mongodb_password
```

### 🔹 4. Start the Server

```sh
npm run dev
```

This will start the API at `http://localhost:5000`.

## 🚀 API Endpoints

`POST /users`

`POST /tasks`

`GET /tasks?userEmail=user@example.com`

`PUT /tasks/:id`

`DELETE /tasks/:id`

## 🛠 Future Improvements

-  Real-time Task Updates via WebSockets (Planned)
-  User Authentication & Authorization
-  Advanced Filtering & Sorting for Tasks
