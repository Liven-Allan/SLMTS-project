"""
Django REST Framework Views for SLMTS API
Handles HTTP requests for user management and other operations
"""

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.exceptions import ValidationError
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Sum
from django.db import models

from .models import User, BusinessSettings, Service, Order, OrderItem, OrderTimeline, RFIDTag, Invoice
from .serializers import (
    UserSerializer, UserListSerializer, BusinessSettingsSerializer, ServiceSerializer,
    OrderSerializer, CreateOrderSerializer, CreateOrderWithItemsSerializer, OrderItemSerializer, OrderTimelineSerializer,
    RFIDTagSerializer, CreateRFIDTagSerializer, InvoiceSerializer, FinancialSummarySerializer
)


class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet for User management
    Provides CRUD operations for all user types (Customer, Staff, Driver, Admin)
    
    Endpoints:
    - GET /api/users/ - List all users
    - POST /api/users/ - Create new user
    - GET /api/users/{id}/ - Get specific user
    - PUT /api/users/{id}/ - Update user
    - DELETE /api/users/{id}/ - Delete user
    - GET /api/users/by_role/{role}/ - Get users by role
    """
    
    queryset = User.objects.all().order_by('-created_at')
    serializer_class = UserSerializer
    permission_classes = [AllowAny]  # Temporarily allow unauthenticated access
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    
    # Filter options
    filterset_fields = ['role', 'status']
    search_fields = ['name', 'email', 'phone']
    ordering_fields = ['name', 'created_at', 'role']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        """
        Use different serializers for list vs detail views
        List view uses simplified serializer for better performance
        """
        if self.action == 'list':
            return UserListSerializer
        return UserSerializer
    
    def get_queryset(self):
        """
        Optionally filter users by role via query parameter
        Example: /api/users/?role=customer
        """
        queryset = User.objects.all().select_related('preferences')
        role = self.request.query_params.get('role', None)
        
        if role:
            queryset = queryset.filter(role=role)
        
        return queryset.order_by('-created_at')
    
    @action(detail=False, methods=['get'])
    def by_role(self, request):
        """
        Get users grouped by role
        Endpoint: GET /api/users/by_role/
        Returns: {customers: [...], staff: [...], drivers: [...], admins: [...]}
        """
        users_by_role = {
            'customers': UserListSerializer(
                User.objects.filter(role='customer'), many=True
            ).data,
            'staff': UserListSerializer(
                User.objects.filter(role='staff'), many=True
            ).data,
            'drivers': UserListSerializer(
                User.objects.filter(role='driver'), many=True
            ).data,
            'admins': UserListSerializer(
                User.objects.filter(role='admin'), many=True
            ).data,
        }
        return Response(users_by_role)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        Get user statistics
        Endpoint: GET /api/users/stats/
        Returns: User counts by role and status
        """
        stats = {
            'total_users': User.objects.count(),
            'by_role': {
                'customers': User.objects.filter(role='customer').count(),
                'staff': User.objects.filter(role='staff').count(),
                'drivers': User.objects.filter(role='driver').count(),
                'admins': User.objects.filter(role='admin').count(),
            },
            'by_status': {
                'active': User.objects.filter(status='active').count(),
                'inactive': User.objects.filter(status='inactive').count(),
                'on_break': User.objects.filter(status='break').count(),
            }
        }
        return Response(stats)
    
    def create(self, request, *args, **kwargs):
        """
        Create a new user with proper validation
        """
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(
                UserSerializer(user).data, 
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def update(self, request, *args, **kwargs):
        """
        Update user with partial update support
        """
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        
        if serializer.is_valid():
            user = serializer.save()
            return Response(UserSerializer(user).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def destroy(self, request, *args, **kwargs):
        """
        Delete user with proper response
        """
        instance = self.get_object()
        user_name = instance.name
        self.perform_destroy(instance)
        return Response(
            {'message': f'User "{user_name}" deleted successfully'}, 
            status=status.HTTP_204_NO_CONTENT
        )

class BusinessSettingsViewSet(viewsets.ModelViewSet):
    """
    ViewSet for BusinessSettings management
    Handles business configuration and settings
    
    Endpoints:
    - GET /api/settings/ - Get business settings (returns single object)
    - PUT/PATCH /api/settings/{id}/ - Update business settings
    - POST /api/settings/ - Create business settings (if none exist)
    """
    
    queryset = BusinessSettings.objects.all()
    serializer_class = BusinessSettingsSerializer
    
    def list(self, request):
        """
        Get business settings (should be only one instance)
        If no settings exist, return default values
        """
        settings = BusinessSettings.objects.first()
        if settings:
            serializer = self.get_serializer(settings)
            return Response(serializer.data)
        else:
            # Return default settings structure
            default_settings = {
                'opening_time': '08:00',
                'closing_time': '20:00',
                'working_days': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                'business_name': 'CityVille Laundromat',
                'business_address': '',
                'business_phone': '',
                'business_email': '',
                'tax_rate': 0.00,
                'currency': 'UGX',
                'email_notifications': True,
                'sms_notifications': True,
                'order_updates': True,
                'payment_reminders': True,
            }
            return Response(default_settings)
    
    def create(self, request, *args, **kwargs):
        """
        Create business settings (only if none exist)
        """
        if BusinessSettings.objects.exists():
            return Response(
                {'error': 'Business settings already exist. Use PUT/PATCH to update.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            settings = serializer.save()
            return Response(
                BusinessSettingsSerializer(settings).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def update(self, request, *args, **kwargs):
        """
        Update business settings
        """
        # Get or create settings instance
        settings, created = BusinessSettings.objects.get_or_create(
            id=kwargs.get('pk', 1),
            defaults={}
        )
        
        partial = kwargs.pop('partial', False)
        serializer = self.get_serializer(settings, data=request.data, partial=partial)
        
        if serializer.is_valid():
            settings = serializer.save()
            return Response(BusinessSettingsSerializer(settings).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get', 'put', 'patch'])
    def current(self, request):
        """
        Get or update current business settings
        Endpoint: GET/PUT/PATCH /api/settings/current/
        """
        if request.method == 'GET':
            return self.list(request)
        else:
            # Get or create the first (and should be only) settings instance
            settings, created = BusinessSettings.objects.get_or_create(pk=1)
            
            partial = request.method == 'PATCH'
            serializer = self.get_serializer(settings, data=request.data, partial=partial)
            
            if serializer.is_valid():
                settings = serializer.save()
                return Response(BusinessSettingsSerializer(settings).data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ServiceViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Service management
    Handles CRUD operations for laundry services
    
    Endpoints:
    - GET /api/services/ - List all services
    - POST /api/services/ - Create new service
    - GET /api/services/{id}/ - Get specific service
    - PUT/PATCH /api/services/{id}/ - Update service
    - DELETE /api/services/{id}/ - Delete service
    """
    
    queryset = Service.objects.all().select_related('created_by').order_by('name')
    serializer_class = ServiceSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    
    # Filter options
    filterset_fields = ['status', 'unit']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'price', 'created_at']
    ordering = ['name']
    
    def perform_create(self, serializer):
        """
        Set the created_by field to the current user (for now, use first admin user)
        In a real app, you'd use request.user
        """
        # For now, get the first admin user or create a default one
        admin_user = User.objects.filter(role='admin').first()
        if not admin_user:
            admin_user = User.objects.create(
                name='System Admin',
                email='admin@cityville.com',
                phone='+256 700 000 000',
                role='admin'
            )
        serializer.save(created_by=admin_user)
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """
        Get only active services
        Endpoint: GET /api/services/active/
        """
        active_services = self.queryset.filter(status='active')
        serializer = self.get_serializer(active_services, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        Get service statistics
        Endpoint: GET /api/services/stats/
        """
        stats = {
            'total_services': Service.objects.count(),
            'active_services': Service.objects.filter(status='active').count(),
            'inactive_services': Service.objects.filter(status='inactive').count(),
            'by_unit': {
                'per_kg': Service.objects.filter(unit='per_kg').count(),
                'per_item': Service.objects.filter(unit='per_item').count(),
                'flat_rate': Service.objects.filter(unit='flat_rate').count(),
            }
        }
        return Response(stats)
# =============================================================================
# AUTHENTICATION VIEWS
# =============================================================================



from django.contrib.auth import authenticate, login, logout
from django.utils import timezone
from django.middleware.csrf import get_token
from django.views.decorators.csrf import ensure_csrf_cookie
from .models import User, BusinessSettings, Service, Order, OrderItem, OrderTimeline, AuthToken
from .serializers import (
    UserRegistrationSerializer, UserLoginSerializer, 
    UserProfileSerializer, ChangePasswordSerializer
)


@api_view(['GET'])
@permission_classes([AllowAny])
@ensure_csrf_cookie
def get_csrf_token(request):
    """
    Get CSRF token for authentication
    """
    return Response({
        'csrfToken': get_token(request)
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """
    Register a new user account
    """
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        
        # Create authentication token
        token, created = AuthToken.objects.get_or_create(user=user)
        
        return Response({
            'message': 'User registered successfully',
            'user': UserProfileSerializer(user).data,
            'token': token.key,
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    """
    Login user and create session
    """
    serializer = UserLoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        
        # Log the user in (creates session)
        login(request, user, backend='SLMTS_app.authentication.EmailBackend')
        
        # Create or get authentication token
        token, created = AuthToken.objects.get_or_create(user=user)
        
        # Update last login
        user.last_login = timezone.now()
        user.save()
        
        return Response({
            'message': 'Login successful',
            'user': UserProfileSerializer(user).data,
            'token': token.key,
        }, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def logout_user(request):
    """
    Logout user and destroy session/token
    """
    try:
        # Delete the user's token if it exists
        if hasattr(request.user, 'auth_token'):
            request.user.auth_token.delete()
        
        # Logout from session
        logout(request)
        
        return Response({
            'message': 'Logout successful'
        }, status=status.HTTP_200_OK)
    except:
        return Response({
            'error': 'Error logging out'
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_profile(request):
    """
    Get current user's profile
    """
    serializer = UserProfileSerializer(request.user)
    return Response(serializer.data)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_user_profile(request):
    """
    Update current user's profile
    """
    serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response({
            'message': 'Profile updated successfully',
            'user': serializer.data
        })
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """
    Change user password
    """
    serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        user = request.user
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        
        return Response({
            'message': 'Password changed successfully',
        })
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_statistics(request):
    """
    Get user statistics including total orders and total spent
    """
    user = request.user
    
    # Get user's orders
    user_orders = Order.objects.filter(customer=user)
    
    # Calculate statistics
    total_orders = user_orders.count()
    total_spent = user_orders.aggregate(
        total=models.Sum('amount')
    )['total'] or 0
    
    # Get recent orders for additional context
    recent_orders = user_orders.order_by('-created_at')[:5]
    
    statistics = {
        'total_orders': total_orders,
        'total_spent': float(total_spent),
        'orders_by_status': {
            'pending': user_orders.filter(status='pending').count(),
            'processing': user_orders.filter(status='processing').count(),
            'completed': user_orders.filter(status='completed').count(),
            'cancelled': user_orders.filter(status='cancelled').count(),
        },
        'member_since': user.created_at.isoformat() if user.created_at else None,
        'recent_orders': [
            {
                'order_id': order.order_id,
                'amount': float(order.amount),
                'status': order.status,
                'created_at': order.created_at.isoformat(),
            }
            for order in recent_orders
        ]
    }
    
    return Response(statistics)


# =============================================================================
# RFID TAG VIEWS
# =============================================================================

class RFIDTagViewSet(viewsets.ModelViewSet):
    """
    ViewSet for RFID Tag management
    Handles tag creation, verification, and tracking
    """
    serializer_class = RFIDTagSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    
    # Filter options
    filterset_fields = ['status', 'order', 'verified_by']
    search_fields = ['tag_id', 'item_description', 'order__order_id']
    ordering_fields = ['created_at', 'verified_at']
    ordering = ['tag_id']
    
    def get_queryset(self):
        """
        Filter RFID tags based on user role and permissions
        """
        queryset = RFIDTag.objects.all().select_related('order', 'verified_by')
        
        # If user is staff, show only tags for orders assigned to them
        if self.request.user.is_authenticated and hasattr(self.request.user, 'role') and self.request.user.role == 'staff':
            queryset = queryset.filter(order__assigned_to=self.request.user)
        
        return queryset
    
    def get_serializer_class(self):
        """
        Use different serializers for different actions
        """
        if self.action == 'create':
            return CreateRFIDTagSerializer
        return RFIDTagSerializer
    
    @action(detail=True, methods=['post'])
    def verify(self, request, pk=None):
        """
        Verify an RFID tag
        """
        tag = self.get_object()
        verification_notes = request.data.get('verification_notes', '')
        
        tag.status = 'verified'
        tag.verified_by = request.user
        tag.verified_at = timezone.now()
        tag.verification_notes = verification_notes
        tag.save()
        
        return Response({
            'message': 'Tag verified successfully',
            'tag': RFIDTagSerializer(tag).data
        })
    
    @action(detail=False, methods=['get'])
    def for_staff_orders(self, request):
        """
        Get RFID tags for orders assigned to the current staff member
        """
        if not request.user.is_authenticated or request.user.role != 'staff':
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        
        tags = RFIDTag.objects.filter(
            order__assigned_to=request.user
        ).select_related('order', 'verified_by').order_by('order__order_id', 'tag_id')
        
        serializer = RFIDTagSerializer(tags, many=True)
        return Response(serializer.data)


# =============================================================================
# ORDER VIEWS
# =============================================================================

class OrderViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Order management
    Handles order creation, tracking, and management
    """
    serializer_class = OrderSerializer
    permission_classes = [AllowAny]  # Temporarily allow all for testing
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    
    # Filter options
    filterset_fields = ['status', 'current_stage', 'customer']
    search_fields = ['order_id', 'customer__name', 'customer__email']
    ordering_fields = ['created_at', 'pickup_date', 'amount']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """
        Filter orders based on user role and permissions
        """
        queryset = Order.objects.all().select_related('customer', 'assigned_to').prefetch_related('order_items', 'timeline')
        
        # If user is authenticated and is a customer, show only their orders
        if self.request.user.is_authenticated and hasattr(self.request.user, 'role') and self.request.user.role == 'customer':
            queryset = queryset.filter(customer=self.request.user)
        
        return queryset
    
    def get_serializer_class(self):
        """
        Use different serializers for different actions
        """
        if self.action == 'create':
            return CreateOrderWithItemsSerializer
        return OrderSerializer
    
    def perform_create(self, serializer):
        """
        Create order with proper customer assignment
        """
        from django.db import IntegrityError
        
        try:
            # If customer is provided in the data, use it; otherwise use authenticated user
            if 'customer' not in serializer.validated_data:
                if self.request.user.is_authenticated:
                    serializer.save(customer=self.request.user)
                else:
                    # Use first customer as fallback for testing
                    customer = User.objects.filter(role='customer').first()
                    serializer.save(customer=customer)
            else:
                serializer.save()
        except IntegrityError as e:
            if 'UNIQUE constraint failed: SLMTS_app_order.order_id' in str(e):
                raise ValidationError({
                    'order_id': 'Order ID generation failed. Please try again.'
                })
            else:
                raise ValidationError({
                    'non_field_errors': 'A database constraint was violated. Please check your data and try again.'
                })
    
    @action(detail=True, methods=['post'])
    def update_stage(self, request, pk=None):
        """
        Update order stage and timeline
        """
        order = self.get_object()
        new_stage = request.data.get('stage')
        
        if new_stage not in dict(Order.STAGE_CHOICES):
            return Response({'error': 'Invalid stage'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Update current stage
        order.current_stage = new_stage
        
        # Auto-update status based on stage
        if new_stage in ['order_placed', 'pickup_confirmed']:
            order.status = 'pending'
        elif new_stage in ['items_received', 'washing', 'drying', 'folding', 'quality_check', 'ready_for_delivery', 'out_for_delivery']:
            order.status = 'processing'
        elif new_stage == 'delivered':
            order.status = 'completed'
        
        order.save()
        
        # Update timeline
        OrderTimeline.objects.filter(order=order, is_current=True).update(
            is_current=False, 
            completed=True, 
            timestamp=timezone.now()
        )
        
        OrderTimeline.objects.create(
            order=order,
            stage=new_stage,
            completed=False,
            is_current=True
        )
        
        return Response({'message': 'Stage updated successfully'})
    
    @action(detail=False, methods=['get'])
    def customer_orders(self, request):
        """
        Get orders for a specific customer
        """
        customer_id = request.query_params.get('customer_id')
        if not customer_id:
            return Response({'error': 'customer_id parameter required'}, status=status.HTTP_400_BAD_REQUEST)
        
        orders = self.get_queryset().filter(customer_id=customer_id)
        serializer = self.get_serializer(orders, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        Get order statistics
        """
        queryset = self.get_queryset()
        
        stats = {
            'total_orders': queryset.count(),
            'by_status': {
                'pending': queryset.filter(status='pending').count(),
                'processing': queryset.filter(status='processing').count(),
                'completed': queryset.filter(status='completed').count(),
                'cancelled': queryset.filter(status='cancelled').count(),
            },
            'by_stage': {}
        }
        
        # Add stage statistics
        for stage_key, stage_label in Order.STAGE_CHOICES:
            stats['by_stage'][stage_key] = queryset.filter(current_stage=stage_key).count()
        
        return Response(stats)

# =============================================================================
# FINANCIAL VIEWS
# =============================================================================

class InvoiceViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Invoice management
    Provides CRUD operations for invoices
    
    Endpoints:
    - GET /api/invoices/ - List all invoices
    - POST /api/invoices/ - Create new invoice
    - GET /api/invoices/{id}/ - Get specific invoice
    - PUT /api/invoices/{id}/ - Update invoice
    - DELETE /api/invoices/{id}/ - Delete invoice
    """
    
    queryset = Invoice.objects.all().select_related('customer', 'order').order_by('-invoice_date')
    serializer_class = InvoiceSerializer
    permission_classes = [AllowAny]  # Temporarily allow unauthenticated access
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    
    # Filter options
    filterset_fields = ['status', 'customer']
    search_fields = ['invoice_id', 'customer__name', 'customer__email']
    ordering_fields = ['invoice_date', 'amount', 'status']
    ordering = ['-invoice_date']

    @action(detail=False, methods=['post'])
    def generate(self, request):
        """
        Generate invoice for an order
        Endpoint: POST /api/invoices/generate/
        Body: {"order_id": 123}
        """
        order_id = request.data.get('order_id')
        
        if not order_id:
            return Response(
                {'error': 'order_id is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            order = Order.objects.get(id=order_id)
        except Order.DoesNotExist:
            return Response(
                {'error': 'Order not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if invoice already exists for this order
        if hasattr(order, 'invoice'):
            return Response(
                {'error': 'Invoice already exists for this order'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Generate invoice ID
        import datetime
        today = datetime.date.today()
        
        existing_invoices = Invoice.objects.filter(
            invoice_id__startswith=f"INV-{today.year}-"
        ).order_by('-invoice_id')
        
        if existing_invoices.exists():
            last_invoice_id = existing_invoices.first().invoice_id
            try:
                last_number = int(last_invoice_id.split('-')[-1])
                invoice_number = last_number + 1
            except (ValueError, IndexError):
                invoice_number = 1
        else:
            invoice_number = 1
        
        invoice_id = f"INV-{today.year}-{invoice_number:03d}"
        
        # Create invoice
        invoice = Invoice.objects.create(
            invoice_id=invoice_id,
            order=order,
            customer=order.customer,
            amount=order.amount,
            subtotal=order.amount,
            tax_amount=0,  # No tax for now
            invoice_date=today,
            due_date=today + datetime.timedelta(days=30),  # 30 days payment term
            status='pending'
        )
        
        serializer = InvoiceSerializer(invoice)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([AllowAny])
def financial_summary(request):
    """
    Get financial summary data
    Endpoint: GET /api/financial/summary/
    Returns: Monthly revenue, pending payments, invoice counts, etc.
    """
    try:
        # Calculate monthly revenue from completed orders
        from datetime import datetime, timedelta
        current_month = datetime.now().replace(day=1)
        next_month = (current_month + timedelta(days=32)).replace(day=1)
        
        # Monthly revenue from completed orders
        monthly_orders = Order.objects.filter(
            status='completed',
            created_at__gte=current_month,
            created_at__lt=next_month
        )
        monthly_revenue = monthly_orders.aggregate(
            total=Sum('amount')
        )['total'] or 0
        
        # Pending payments from orders that are in process (not completed)
        pending_orders = Order.objects.filter(
            status__in=['pending', 'processing']
        )
        pending_payments = pending_orders.aggregate(
            total=Sum('amount')
        )['total'] or 0
        
        # Order counts
        total_orders = Order.objects.count()
        completed_orders_count = Order.objects.filter(status='completed').count()
        pending_orders_count = Order.objects.filter(status__in=['pending', 'processing']).count()
        
        summary_data = {
            'monthly_revenue': float(monthly_revenue),
            'pending_payments': float(pending_payments),
            'total_orders': total_orders,
            'completed_orders': completed_orders_count,
            'pending_orders': pending_orders_count,
        }
        
        serializer = FinancialSummarySerializer(summary_data)
        return Response(serializer.data)
        
    except Exception as e:
        return Response(
            {'error': f'Failed to calculate financial summary: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([AllowAny])
def completed_orders(request):
    """
    Get completed orders for financial table
    Endpoint: GET /api/financial/completed-orders/
    Returns: List of completed orders with customer details
    """
    try:
        # Get completed orders with customer details
        orders = Order.objects.filter(
            status='completed'
        ).select_related('customer').order_by('-created_at')[:10]  # Latest 10 completed orders
        
        orders_data = []
        for order in orders:
            orders_data.append({
                'id': order.id,
                'order_id': order.order_id,
                'customer_name': order.customer.name,
                'customer_email': order.customer.email,
                'amount': float(order.amount),
                'created_at': order.created_at.date().isoformat(),
                'status': order.status,
            })
        
        return Response(orders_data)
        
    except Exception as e:
        return Response(
            {'error': f'Failed to fetch completed orders: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )