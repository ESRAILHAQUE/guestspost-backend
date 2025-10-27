# GuestPost Backend API

A production-ready RESTful API built with Node.js, Express.js, TypeScript, and MongoDB for the GuestPost marketplace platform.

## 🚀 Features

- **TypeScript** - Type-safe code with full IntelliSense support
- **Express.js** - Fast, unopinionated web framework
- **MongoDB & Mongoose** - NoSQL database with elegant ODM
- **JWT Authentication** - Secure token-based authentication
- **Role-Based Access Control** - Admin and user roles
- **Error Handling** - Centralized error handling with custom error classes
- **Validation** - Request validation using express-validator
- **Security** - Helmet, CORS, bcrypt password hashing
- **Logging** - Colored console logging with Morgan
- **Environment Configuration** - Centralized config management
- **Modular Architecture** - Feature-based modular pattern for scalability

## 🏗️ Modular Architecture

This project uses a **feature-based modular pattern** instead of traditional MVC:

### Why Modular?

✅ **Better Scalability** - Each feature is self-contained  
✅ **Easier Maintenance** - All related code in one place  
✅ **Team Collaboration** - Different developers can work on different modules  
✅ **Code Organization** - Clear separation of concerns

### Module Structure

Each module contains:

- **Model** - Database schema
- **Service** - Business logic
- **Controller** - Request/response handling
- **Routes** - API endpoints
- **Index** - Module exports

Example: `src/modules/user/`

```
user/
├── user.model.ts      # User schema & database
├── user.service.ts    # Business logic
├── user.controller.ts # HTTP handlers
├── user.routes.ts     # API routes
└── index.ts           # Exports
```

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0 or **yarn**
- **MongoDB** >= 6.0 (local or MongoDB Atlas)

## 🛠️ Installation

### 1. Clone the repository

```bash
cd Backend
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```bash
cp env.example .env
```

Edit the `.env` file with your configuration:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
API_VERSION=v1

# Database
MONGODB_URI=mongodb://localhost:27017/guestpost_db

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_super_secret_refresh_token_key
JWT_REFRESH_EXPIRES_IN=30d

# CORS
CORS_ORIGIN=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000

# Email (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
EMAIL_FROM=noreply@guestpostnow.io

# Security
BCRYPT_SALT_ROUNDS=12

# URLs
APP_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000
```

### 4. Start MongoDB

**Local MongoDB:**

```bash
mongod
```

**Or use MongoDB Atlas** (cloud database) - update MONGODB_URI in .env

## 🚀 Running the Application

### Development Mode

```bash
npm run dev
```

The server will start on `http://localhost:5000` with hot-reload enabled.

### Production Build

```bash
# Build TypeScript
npm run build

# Start production server
npm start
```

### Linting

```bash
# Check for lint errors
npm run lint

# Fix lint errors
npm run lint:fix
```

## 📁 Project Structure (Modular Pattern)

```
Backend/
├── src/
│   ├── config/              # Configuration files
│   │   ├── database.ts      # MongoDB connection
│   │   └── env.config.ts    # Environment variables
│   │
│   ├── modules/             # 🎯 Feature-based modules
│   │   ├── auth/            # Authentication module
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.routes.ts
│   │   │   └── index.ts
│   │   ├── user/            # User management module
│   │   │   ├── user.model.ts
│   │   │   ├── user.controller.ts
│   │   │   ├── user.service.ts
│   │   │   ├── user.routes.ts
│   │   │   └── index.ts
│   │   ├── website/         # Website module
│   │   │   ├── website.model.ts
│   │   │   └── index.ts
│   │   ├── order/           # Order module
│   │   │   ├── order.model.ts
│   │   │   └── index.ts
│   │   ├── fundRequest/     # Fund request module
│   │   │   ├── fundRequest.model.ts
│   │   │   └── index.ts
│   │   └── blog/            # Blog module
│   │       ├── blog.model.ts
│   │       └── index.ts
│   │
│   ├── middlewares/         # Global middlewares
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   ├── validation.middleware.ts
│   │   └── index.ts
│   │
│   ├── routes/              # Route aggregator
│   │   └── index.ts         # Mounts all module routes
│   │
│   ├── utils/               # Utility functions
│   │   ├── AppError.ts      # Custom error classes
│   │   ├── apiResponse.ts   # Response formatter
│   │   ├── asyncHandler.ts  # Async error wrapper
│   │   ├── jwt.utils.ts     # JWT helpers
│   │   ├── password.utils.ts# Password hashing
│   │   └── logger.ts        # Logger utility
│   │
│   ├── app.ts               # Express app setup
│   └── server.ts            # Server entry point
│
├── uploads/                 # File uploads directory
├── dist/                    # Compiled JavaScript (generated)
├── .env                     # Environment variables
├── env.example              # Environment template
├── .gitignore
├── package.json
├── tsconfig.json           # TypeScript configuration
├── .eslintrc.json          # ESLint configuration
├── nodemon.json            # Nodemon configuration
└── README.md
```

## 🔌 API Endpoints

### Authentication

| Method | Endpoint                | Description       | Access  |
| ------ | ----------------------- | ----------------- | ------- |
| POST   | `/api/v1/auth/register` | Register new user | Public  |
| POST   | `/api/v1/auth/login`    | Login user        | Public  |
| POST   | `/api/v1/auth/logout`   | Logout user       | Private |
| GET    | `/api/v1/auth/me`       | Get current user  | Private |

### Users

| Method | Endpoint            | Description    | Access  |
| ------ | ------------------- | -------------- | ------- |
| GET    | `/api/v1/users`     | Get all users  | Admin   |
| GET    | `/api/v1/users/:id` | Get user by ID | Private |
| PUT    | `/api/v1/users/:id` | Update user    | Private |
| DELETE | `/api/v1/users/:id` | Delete user    | Admin   |

### Health Check

| Method | Endpoint         | Description      | Access |
| ------ | ---------------- | ---------------- | ------ |
| GET    | `/api/v1/health` | API health check | Public |
| GET    | `/`              | Root endpoint    | Public |

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication.

### Register/Login Response:

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "ID": "507f1f77bcf86cd799439011",
      "user_nicename": "John Doe",
      "user_email": "john@example.com",
      "balance": 0,
      "role": "user"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Using the Token:

Include the token in the `Authorization` header:

```
Authorization: Bearer <your_token_here>
```

## 📝 Environment Variables

| Variable             | Description                          | Default                                |
| -------------------- | ------------------------------------ | -------------------------------------- |
| `NODE_ENV`           | Environment (development/production) | development                            |
| `PORT`               | Server port                          | 5000                                   |
| `API_VERSION`        | API version                          | v1                                     |
| `MONGODB_URI`        | MongoDB connection string            | mongodb://localhost:27017/guestpost_db |
| `JWT_SECRET`         | JWT secret key                       | Required                               |
| `JWT_EXPIRES_IN`     | JWT expiration time                  | 7d                                     |
| `CORS_ORIGIN`        | Allowed CORS origins                 | http://localhost:3000                  |
| `BCRYPT_SALT_ROUNDS` | Bcrypt salt rounds                   | 12                                     |

## 🧪 Testing

```bash
npm test
```

## 🔧 Troubleshooting

### MongoDB Connection Issues

1. Ensure MongoDB is running
2. Check MONGODB_URI in .env
3. Verify network connectivity

### Port Already in Use

```bash
# Kill process on port 5000
npx kill-port 5000
```

### TypeScript Compilation Errors

```bash
# Clean and rebuild
npm run build
```

## 📚 Technologies Used

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **TypeScript** - Type-safe JavaScript
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **helmet** - Security headers
- **cors** - Cross-origin resource sharing
- **morgan** - HTTP request logger
- **dotenv** - Environment variables

## 📄 License

MIT

## 👨‍💻 Author

GuestPostNow Development Team

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**Happy Coding! 🚀**
