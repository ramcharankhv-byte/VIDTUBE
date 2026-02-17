🎬 VidTube – Backend API

VidTube is a scalable backend API for a video-sharing platform built with Node.js, Express, and MongoDB.
It implements authentication, media uploads, subscriptions, playlists, tweets, and aggregation-heavy channel features.

This project focuses purely on backend architecture, security, and clean API design.

🚀 Tech Stack

Node.js

Express 5

MongoDB + Mongoose

JWT Authentication (Access + Refresh Token)

Bcrypt (Password Hashing)

Cloudinary (Media Storage)

Multer (File Uploads)

Express Validator

Winston (Logging)

Morgan (HTTP Logging)


📂 Project Structure

src/
│
├── controllers/
├── models/
│   ├── user.model.js
│   ├── video.model.js
│   ├── like.model.js
│   ├── comment.model.js
│   ├── subscription.model.js
│   ├── playlist.model.js
│   └── tweet.model.js
│
├── routes/
│   ├── auth.routes.js
│   ├── user.routes.js
│   ├── video.routes.js
│   ├── comment.routes.js
│   ├── subscription.routes.js
│   ├── playlist.routes.js
│   ├── tweet.routes.js
│   └── healthcheck.routes.js
│
├── middlewares/
│   ├── auth.middleware.js
│   ├── error.middleware.js
│   └── multer.middleware.js
│
├── utils/
│   ├── asyncHandler.js
│   ├── ApiResponse.js
│   ├── ApiError.js
│   └── cloudinary.js
│
└── index.js

🔥 Features Implemented
🔐 Authentication System

User Registration

Email Verification

Login

Logout

Access Token (1d expiry)

Refresh Token (10d expiry)

Secure HTTP-only cookies

Password Reset

👤 User Features

Profile Update

Avatar Upload

Cover Image Upload

Watch History Tracking

🎥 Video Features

Video Upload (Cloudinary)

Like System

Comment System

Playlist Support

📺 Channel System

Subscribe / Unsubscribe

Subscriber Count

Channel Aggregation Pipelines

Paginated video listing

🧠 Advanced Backend Architecture

Custom Async Handler

Centralized Error Handler

Custom API Response Structure

Health Check Route

Aggregation Pipelines

Token Rotation

Structured Logging (Winston)

Production-ready folder architecture

🗃️ Database Models

User

Video

Like

Comment

Subscription

Playlist

Tweet

🛠️ Installation
git clone https://github.com/yourusername/vidtube.git
cd vidtube
npm install


POST /api/v1/users/register
POST /api/v1/users/login
POST /api/v1/videos/upload

🧱 Architecture Highlights

Modular MVC pattern

Clean separation of concerns

Centralized error handling

Token-based authentication with refresh mechanism

Aggregation-heavy MongoDB queries for scalable channel pages

Cloud-based media storage

Structured logging system

📌 Future Improvements

Rate limiting

Role-based authorization

Redis caching

Video streaming optimization

CI/CD pipeline

Swagger API documentation

Docker support

👨‍💻 Author

Built as a backend engineering project to demonstrate:

Secure authentication systems

Scalable API architecture

Real-world production patterns

Aggregation and performance optimization
Nodemailer + Mailgen (Email Services)

mongoose-aggregate-paginate-v2
