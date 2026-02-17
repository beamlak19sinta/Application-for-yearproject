# Dagmawi Menelik Digital Service Management System

A modern, high-performance digital platform designed to streamline citizen services, manage real-time queues, and coordinate appointments.

## 🚀 Features
- **Citizen Portal**: Browse services, grab queue tickets, and book appointments.
- **Officer Dashboard**: Real-time queue monitoring with "Call Next" functionality.
- **Admin Panel**: Manage service sectors and system users.
- **Multi-language**: Seamless switching between English and Amharic.
- **Modern UI**: Built with React, Tailwind CSS v4, and Shadcn components.

---

## 🛠️ Tech Stack
- **Frontend**: React (Vite), Tailwind CSS v4, Lucide React, Framer Motion.
- **Backend**: Node.js, Express, Prisma (v7).
- **Database**: PostgreSQL.

---

## 🏃 Getting Started

### Prerequisites
- **Node.js** (v20 or higher)
- **PostgreSQL** (Active Service)

### 1. Database Setup
First, create the database on your local PostgreSQL server:
```bash
# Enter psql
sudo -u postgres psql

# Create database and user
CREATE DATABASE dagmawi_db;
CREATE USER hab WITH PASSWORD 'dagmawi_pass';
ALTER DATABASE dagmawi_db OWNER TO hab;
ALTER USER hab WITH SUPERUSER;
\q
```

### 2. Backend Configuration
Navigate to the `backend` directory and install dependencies:
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder:
```env
DATABASE_URL="postgresql://hab:dagmawi_pass@localhost:5432/dagmawi_db"
JWT_SECRET="your_secure_secret_here"
PORT=5000
```

Initialize the database (Migrations & Seeding):
```bash
npx prisma migrate dev --name init
npx prisma db seed
```

Start the development server:
```bash
npm run dev
```

### 3. Frontend Configuration
Navigate to the `frontend` directory and install dependencies:
```bash
cd frontend
npm install
```

Start the Vite development server:
```bash
npm run dev
```

---

## 💡 Technical Notes (Prisma 7)
This project uses **Prisma v7**, which requires specific configurations for stability on Linux:
- **Driver Adapter**: Uses `@prisma/adapter-pg` to ensure robust connections.
- **Stable Initialization**: The client utilizes a custom utility (`src/utils/prisma.js`) for reliable environment synchronization.

## 📄 License
MIT License - Created for the Dagmawi Menelik Digital Service initiative.
Admin: 0911111111 / admin123
Officer: 0900000000 / officer1234
Citizen: 0909090909 / password1234