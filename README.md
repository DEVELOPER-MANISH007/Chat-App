# Chat App - Development Setup Guide

A real-time chat application built with React, Express, Socket.io, and MongoDB.

## Project Structure

```
Chat-App/
├── Client/          # React frontend application
├── Server/           # Express backend server
└── README.md        # This file
```

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB database (local or cloud instance)
- Cloudinary account (for image uploads)

## Environment Variables Setup

### Server Environment Variables

Create a `.env` file in the `Server/` directory with the following variables:

```env
# MongoDB Connection String
MONGODB_URI=mongodb://localhost:27017
# or for MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net

# JWT Secret Key (generate a strong random string)
JWT_SECRET=your_jwt_secret_key_here

# Node Environment
NODE_ENV=development

# Server Port (optional, defaults to 5000)
PORT=5000

# Client URL for CORS (optional for development)
CLIENT_URL=http://localhost:5173

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### Client Environment Variables

Create a `.env` file in the `Client/` directory with the following variable:

```env
# Backend Server URL
VITE_BACKEND_URL=http://localhost:5000
```

## Installation & Setup

### 1. Install Server Dependencies

```bash
cd Server
npm install
```

### 2. Install Client Dependencies

```bash
cd ../Client
npm install
```

### 3. Start the Development Servers

#### Terminal 1 - Start Backend Server

```bash
cd Server
npm run server
```

The server will run on `http://localhost:5000`

#### Terminal 2 - Start Frontend Client

```bash
cd Client
npm run dev
```

The client will run on `http://localhost:5173`

## Available Scripts

### Server Scripts

- `npm run server` - Start development server with nodemon (auto-reload)
- `npm start` - Start production server

### Client Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Features

- ✅ User authentication (signup/login)
- ✅ Real-time messaging with Socket.io
- ✅ Online user status tracking
- ✅ Profile management
- ✅ Image sharing via Cloudinary
- ✅ Message seen/read status
- ✅ Unread message counts

## API Endpoints

### Authentication Routes (`/api/auth`)

- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/check` - Check authentication status
- `PUT /api/auth/update-profile` - Update user profile

### Message Routes (`/api/messages`)

- `GET /api/messages/users` - Get all users for sidebar
- `GET /api/messages/:id` - Get messages with a user
- `POST /api/messages/send/:id` - Send a message to a user
- `GET /api/messages/marks/:id` - Mark a message as seen

## Technologies Used

### Frontend
- React 19
- Vite
- Socket.io Client
- Axios
- React Router
- TailwindCSS
- React Hot Toast

### Backend
- Node.js
- Express
- Socket.io
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs
- Cloudinary

## Development Notes

- The server uses top-level await, so Node.js v14.8+ is required
- Database connection errors are now properly handled
- All errors are logged using `console.error` for better debugging
- Authentication middleware includes proper error handling and status codes
- Socket.io is configured for both polling and websocket transports

## Troubleshooting

### Database Connection Issues

- Ensure MongoDB is running (if using local instance)
- Check that `MONGODB_URI` is correctly set in `.env`
- Verify network connectivity for cloud MongoDB instances

### CORS Errors

- Ensure `CLIENT_URL` in server `.env` matches your frontend URL
- Check that CORS middleware is properly configured

### Socket Connection Issues

- Verify that both client and server are running
- Check that `VITE_BACKEND_URL` matches your server URL
- Ensure firewall isn't blocking WebSocket connections

## Production Deployment

### For Vercel Deployment

The server is configured to work with Vercel's serverless functions. The app automatically detects the environment and handles server startup accordingly.

### Environment Variables in Production

Make sure to set all environment variables in your hosting platform (Vercel, Heroku, etc.)

## License

ISC

## Author

Developer Manish

