# Task Management Application

A full-stack task management application built with React, Node.js, Express, and MongoDB. This application provides secure user authentication with two-factor authentication (2FA), task management with calendar integration, and a modern responsive UI with dark/light theme support.

## 🌐 Live Demo

**Frontend (Deployed on Vercel):** [https://task-project-two-rust.vercel.app/](https://task-project-two-rust.vercel.app/)

> **Note:** The backend API needs to be deployed separately for full functionality. The frontend demo showcases the UI/UX design and interface.

## Key Features

- **Secure Authentication**: JWT-based authentication with optional two-factor authentication (2FA) using TOTP
- **Task Management**: Create, read, update, and delete tasks with categories and due dates
- **Calendar Integration**: Visual calendar view for task management with React Calendar
- **Modern UI**: Responsive design with Tailwind CSS and dark/light theme toggle
- **Real-time Updates**: Smooth animations and transitions with Framer Motion
- **Docker Support**: Containerized deployment with Docker Compose
- **Comprehensive Testing**: Full test coverage for backend components with Jest
- **Security Features**: Password hashing with bcrypt, JWT tokens, and CORS protection

## Technology Stack

### Frontend

- **React 19** - Modern React framework
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client for API requests
- **Framer Motion** - Animation library
- **React Calendar** - Calendar component
- **SweetAlert2** - Beautiful alert modals
- **QRCode.react** - QR code generation for 2FA

### Backend

- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **JWT** - JSON Web Tokens for authentication
- **bcrypt** - Password hashing
- **Speakeasy** - Two-factor authentication
- **QRCode** - QR code generation
- **CORS** - Cross-origin resource sharing
- **Jest** - Testing framework

### DevOps & Tools

- **Docker & Docker Compose** - Containerization
- **Nginx** - Web server (production)
- **Redis** - Session management (optional)
- **ESLint** - Code linting
- **Nodemon** - Development server auto-restart

## Prerequisites

Before you begin, ensure you have the following installed on your machine:

- **Node.js** (version 18.0 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **MongoDB** (version 7.0 or higher) - [Download here](https://www.mongodb.com/try/download/community)
- **Git** - [Download here](https://git-scm.com/)
- **Docker & Docker Compose** (optional, for containerized setup) - [Download here](https://www.docker.com/)

## Quick Start Guide

### Option 1: Local Development Setup

#### 1. Clone the Repository

```bash
git clone https://github.com/oshadha2k01/Task-Project.git
cd Task-Project
```

#### 2. Backend Setup

````bash
cd backend

# Install dependencies
npm install


#### 3. Configure Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
# Server Configuration
PORT=5000

# Database Configuration
MONGO_URI=mongodb://localhost:27017/taskapp

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
````

#### 4. Start MongoDB

**Using MongoDB Community Server:**

```bash
# Start MongoDB service (Windows)
net start MongoDB

# Start MongoDB service (macOS with Homebrew)
brew services start mongodb/brew/mongodb-community

# Start MongoDB service (Linux)
sudo systemctl start mongod
```

**Or using MongoDB Docker container:**

```bash
docker run -d -p 27017:27017 --name mongodb mongo:7.0
```

#### 5. Start the Backend Server

```bash
# In the backend directory
npm run dev
```

The backend server will start on `http://localhost:5000`

#### 6. Frontend Setup

Open a new terminal window:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend application will start on `http://localhost:5173`

### Option 2: Docker Setup (Recommended for Production)

#### 1. Clone the Repository

```bash
git clone https://github.com/oshadha2k01/Task-Project.git
cd Task-Project
```

#### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# MongoDB Configuration

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# API Configuration
REACT_APP_API_URL=http://localhost:5000
```

#### 3. Start the Application

```bash
# Build and start all services
docker-compose up -d

# View logs (optional)
docker-compose logs -f
```

#### 4. Access the Application

- **Frontend**: http://localhost (port 80)
- **Backend API**: http://localhost:5000
- **MongoDB**: localhost:27017

#### 5. Stop the Application

```bash
docker-compose down
```

## Running Tests

### Backend Tests

```bash
# Navigate to backend directory
cd backend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Frontend Tests (if available)

```bash
# Navigate to frontend directory
cd frontend

# Run tests
npm test
```

## API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Task Management Endpoints

- `GET /api/tasks` - Get all tasks for authenticated user
- `POST /api/tasks` - Create a new task
- `GET /api/tasks/:id` - Get a specific task
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task

### Two-Factor Authentication Endpoints

- `GET /api/2fa/status` - Get 2FA status
- `POST /api/2fa/generate` - Generate 2FA secret and QR code
- `POST /api/2fa/verify` - Verify 2FA token
- `POST /api/2fa/disable` - Disable 2FA

## Development Scripts

### Backend Scripts

```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm test           # Run tests
npm run test:watch # Run tests in watch mode
npm run test:coverage # Run tests with coverage
```

### Frontend Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

## Docker Commands

```bash
# Build and start all services
docker-compose up -d

# Rebuild services
docker-compose up -d --build

# View logs
docker-compose logs -f [service-name]

# Stop all services
docker-compose down

# Remove volumes (This will delete all data)
docker-compose down -v

# Access MongoDB shell
docker-compose exec mongodb mongosh

# Access backend container
docker-compose exec backend sh
```

## Security Considerations

- **JWT Secrets**: Always use strong, unique JWT secrets in production
- **Environment Variables**: Never commit `.env` files to version control
- **Database Security**: Use MongoDB authentication in production
- **HTTPS**: Enable HTTPS in production environments
- **CORS**: Configure CORS properly for your domain
- **Rate Limiting**: Consider implementing rate limiting for API endpoints

## Deployment

### Frontend Deployment (Vercel)

The frontend is deployed and accessible at: **[https://task-project-two-rust.vercel.app/](https://task-project-two-rust.vercel.app/)**

#### Deploy Your Own Frontend to Vercel:

1. **Fork this repository**
2. **Sign up for [Vercel](https://vercel.com)**
3. **Import your repository:**
   - Go to Vercel Dashboard
   - Click "New Project"
   - Select your forked repository
   - Set root directory to `frontend`
   - Framework will auto-detect as Vite
4. **Configure environment variables:**
   - Add `VITE_API_URL` with your backend URL
5. **Deploy!**

### Backend Deployment Options

#### Option 1: Railway
1. Sign up for [Railway](https://railway.app)
2. Connect your GitHub repository
3. Select the `backend` folder
4. Add environment variables (MONGO_URI, JWT_SECRET)
5. Deploy

#### Option 2: Heroku
1. Install Heroku CLI
2. Create new Heroku app
3. Set buildpack to Node.js
4. Add MongoDB Atlas connection string
5. Deploy via Git

#### Option 3: DigitalOcean App Platform
1. Create account on DigitalOcean
2. Use App Platform
3. Connect repository
4. Configure build settings for backend
5. Add environment variables

### Environment Setup

1. Set up a production MongoDB instance
2. Configure environment variables for production
3. Use a process manager like PM2 for Node.js
4. Set up a reverse proxy with Nginx
5. Configure SSL certificates
6. Set up monitoring and logging

### Using Docker in Production

```bash
# Production build
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## 🚀 Quick Links

- **Live Demo:** [https://task-project-two-rust.vercel.app/](https://task-project-two-rust.vercel.app/)
- **Repository:** [https://github.com/oshadha2k01/Task-Project](https://github.com/oshadha2k01/Task-Project)
- **Issues:** [GitHub Issues](https://github.com/oshadha2k01/Task-Project/issues)

---

**Made with ❤️ by Oshadha | [Live Demo](https://task-project-two-rust.vercel.app/)**
