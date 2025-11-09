"""
URL Configuration for SLMTS App API
Defines API endpoints for the laundry management system
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet, BusinessSettingsViewSet, ServiceViewSet, OrderViewSet, RFIDTagViewSet, InvoiceViewSet,
    get_csrf_token, register_user, login_user, logout_user, get_user_profile, 
    update_user_profile, change_password, get_user_statistics, financial_summary, completed_orders
)

# Create router and register viewsets
router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'settings', BusinessSettingsViewSet, basename='settings')
router.register(r'services', ServiceViewSet, basename='service')
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'rfid-tags', RFIDTagViewSet, basename='rfid-tag')
router.register(r'invoices', InvoiceViewSet, basename='invoice')

# API URL patterns
urlpatterns = [
    # API endpoints
    path('api/', include(router.urls)),
    
    # Authentication endpoints
    path('api/auth/csrf/', get_csrf_token, name='csrf-token'),
    path('api/auth/register/', register_user, name='register'),
    path('api/auth/login/', login_user, name='login'),
    path('api/auth/logout/', logout_user, name='logout'),
    path('api/auth/profile/', get_user_profile, name='profile'),
    path('api/auth/profile/update/', update_user_profile, name='update-profile'),
    path('api/auth/change-password/', change_password, name='change-password'),
    path('api/auth/statistics/', get_user_statistics, name='user-statistics'),
    
    # Financial endpoints
    path('api/financial/summary/', financial_summary, name='financial-summary'),
    path('api/financial/completed-orders/', completed_orders, name='completed-orders'),
]

"""
Available API Endpoints:

User Management:
- GET    /api/users/                 - List all users (with filtering)
- POST   /api/users/                 - Create new user
- GET    /api/users/{id}/            - Get specific user details
- PUT    /api/users/{id}/            - Update user (full update)
- PATCH  /api/users/{id}/            - Update user (partial update)
- DELETE /api/users/{id}/            - Delete user
- GET    /api/users/by_role/         - Get users grouped by role
- GET    /api/users/stats/           - Get user statistics

Business Settings:
- GET    /api/settings/              - Get business settings
- PUT    /api/settings/current/      - Update business settings
- PATCH  /api/settings/current/      - Partial update business settings

Service Management:
- GET    /api/services/              - List all services
- POST   /api/services/              - Create new service
- GET    /api/services/{id}/         - Get specific service
- PUT    /api/services/{id}/         - Update service
- DELETE /api/services/{id}/         - Delete service
- GET    /api/services/active/       - Get active services only
- GET    /api/services/stats/        - Get service statistics

Query Parameters for /api/users/:
- ?role=customer                     - Filter by role
- ?status=active                     - Filter by status
- ?search=john                       - Search by name, email, phone
- ?ordering=name                     - Order by field
- ?ordering=-created_at              - Order by field (descending)

Examples:
- /api/users/?role=staff&status=active
- /api/users/?search=alice&ordering=name
- /api/users/?role=customer&ordering=-created_at
"""