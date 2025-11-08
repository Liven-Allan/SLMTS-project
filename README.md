# 🧺 CityVille Laundromat Management System (SLMTS)

A modern, full-stack laundry management system built with React, TypeScript, and Django. Streamlined operations from order intake to final delivery with real-time tracking, automated workflows, and intelligent decision-making for modern laundry services.

![CityVille Laundromat](public/laundry.png)

## 🌟 Features

### 👥 Multi-Role Dashboard System
- **Customer Portal**: Order tracking, pickup scheduling, preference management
- **Staff Dashboard**: Task management, RFID scanning, work progress tracking
- **Admin Dashboard**: User management, financial overview, system analytics

### 🔄 Real-Time Operations
- **Order Lifecycle Management**: From placement to delivery
- **RFID Item Tracking**: Individual garment monitoring
- **Task Assignment**: Automated workflow distribution
- **Performance Metrics**: Real-time staff and system analytics

### 💰 Financial Management
- **Revenue Tracking**: Monthly revenue from completed orders
- **Pending Payments**: Orders in process monitoring
- **Financial Analytics**: Comprehensive business insights
- **Order History**: Complete transaction records

### 🔐 Authentication & Security
- **Role-Based Access Control**: Secure multi-role authentication
- **Token-Based Auth**: JWT authentication system
- **Protected Routes**: Role-specific dashboard access
- **User Management**: Complete CRUD operations for users

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Shadcn/UI** for component library
- **React Router** for navigation
- **TanStack Query** for state management
- **Lucide React** for icons

### Backend
- **Django 5.2** with Python
- **Django REST Framework** for API
- **SQLite** database (development)
- **Token Authentication** for security
- **CORS** enabled for frontend integration
- **Custom Management Commands** for data operations

## 📁 Project Structure

```
SLMTS/
├── 📁 Frontend (Root)
│   ├── src/
│   │   ├── components/          # React components
│   │   │   ├── admin/          # Admin dashboard components
│   │   │   ├── auth/           # Authentication components
│   │   │   ├── customer/       # Customer portal components
│   │   │   ├── dashboards/     # Main dashboard components
│   │   │   ├── staff/          # Staff dashboard components
│   │   │   └── ui/             # Shadcn UI components
│   │   ├── hooks/              # Custom React hooks
│   │   ├── pages/              # Page components
│   │   ├── services/           # API services and types
│   │   └── App.tsx             # Main app component
│   ├── public/                 # Static assets
│   └── package.json            # Frontend dependencies
│
└── 📁 zbackend/               # Django Backend
    ├── SLMTS_project/         # Django project settings
    └── SLMTS_app/             # Main Django application
        ├── models.py          # Database models
        ├── views.py           # API endpoints
        ├── serializers.py     # Data serialization
        ├── urls.py            # URL routing
        └── management/        # Custom Django commands
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v18 or higher)
- **Python** (v3.11 or higher)
- **npm** or **yarn**
- **pip** (Python package manager)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd SLMTS
```

### 2. Frontend Setup
```bash
# Install frontend dependencies
npm install

# Start the development server
npm run dev
```
The frontend will be available at `http://localhost:8081`

### 3. Backend Setup
```bash
# Navigate to backend directory
cd zbackend

# Install Python dependencies
pip install django djangorestframework django-cors-headers django-filter

# Run database migrations
python manage.py makemigrations
python manage.py migrate

# Create sample data (optional)
python manage.py create_sample_orders
python manage.py create_sample_tasks
python manage.py set_order_statuses

# Start the Django server
python manage.py runserver 8000
```
The backend API will be available at `http://localhost:8000`

## 📊 Sample Data Commands

The system includes several management commands to populate the database with sample data:

```bash
# Create sample orders
python manage.py create_sample_orders

# Create sample tasks for staff
python manage.py create_sample_tasks --count 30

# Set different order statuses for testing
python manage.py set_order_statuses

# Update user performance metrics
python manage.py update_user_metrics

# Create sample invoices
python manage.py create_simple_invoices
```

## 🔑 Default User Accounts

After running migrations, you can create users through the registration system or use the Django admin:

```bash
# Create a superuser for admin access
python manage.py createsuperuser
```

### Test Accounts (if sample data is loaded):
- **Admin**: Access admin dashboard for system management
- **Staff**: Access staff dashboard for task management
- **Customer**: Access customer portal for order tracking

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout
- `GET /api/auth/profile/` - Get user profile

### User Management
- `GET /api/users/` - List all users
- `POST /api/users/` - Create new user
- `GET /api/users/{id}/` - Get user details
- `PUT /api/users/{id}/` - Update user
- `DELETE /api/users/{id}/` - Delete user

### Financial Data
- `GET /api/financial/summary/` - Get financial summary
- `GET /api/financial/completed-orders/` - Get completed orders
- `GET /api/invoices/` - List invoices
- `POST /api/invoices/generate/` - Generate invoice

### Orders & Tasks
- `GET /api/orders/` - List orders
- `POST /api/orders/` - Create order
- `GET /api/tasks/` - List tasks (staff)
- `GET /api/rfid-tags/` - RFID tag management

## 🎨 UI Components

The system uses a modern, responsive design with:
- **Dark/Light Mode Support**: Automatic theme switching
- **Mobile Responsive**: Works on all device sizes
- **Accessibility**: WCAG compliant components
- **Modern Animations**: Smooth transitions and interactions
- **Professional Styling**: Clean, business-appropriate design

## 🔧 Configuration

### Frontend Configuration
- **API Base URL**: Configure in `src/services/api/config.ts`
- **Environment Variables**: Set up in `.env` file
- **CORS Settings**: Configured for development

### Backend Configuration
- **Database**: SQLite (development) - configure in `settings.py`
- **CORS Origins**: Set in `CORS_ALLOWED_ORIGINS`
- **API Permissions**: Currently set to `AllowAny` for development

## 📱 User Roles & Permissions

### 👤 Customer
- View and track orders
- Schedule pickups and deliveries
- Manage laundry preferences
- View order history and invoices

### 👷 Staff
- View assigned tasks
- Scan RFID tags for item tracking
- Update task progress and status
- Manage work queue and priorities

### 👨‍💼 Admin
- Complete user management (CRUD)
- Financial overview and reporting
- Order management and oversight
- System settings and configuration

**Built with ❤️ for modern laundry operations**

*CityVille Laundromat Management System - Streamlining laundry operations with technology*
