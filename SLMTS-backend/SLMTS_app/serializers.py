"""
Django REST Framework Serializers for SLMTS API
Handles data serialization/deserialization between Django models and JSON
"""

from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.utils import timezone
from .models import User, CustomerPreferences, BusinessSettings, Service, Order, OrderItem, IndividualItem, OrderTimeline, RFIDTag, Task, Delivery, Invoice


class CustomerPreferencesSerializer(serializers.ModelSerializer):
    """
    Serializer for customer preferences
    Used when creating/updating customer users
    """
    class Meta:
        model = CustomerPreferences
        fields = [
            'detergent', 'fabric_softener', 'starch', 'special_instructions'
        ]


class UserSerializer(serializers.ModelSerializer):
    """
    Main User serializer for API operations
    Handles all user roles: Customer, Staff, Driver, Admin
    """
    preferences = CustomerPreferencesSerializer(required=False, allow_null=True)
    orders_count = serializers.SerializerMethodField()
    total_spent = serializers.SerializerMethodField()
    tasks_completed = serializers.SerializerMethodField()
    deliveries_completed = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'name', 'email', 'phone', 'role', 'status', 'address',
            # Customer fields
            'orders_count', 'total_spent',
            # Staff fields  
            'station', 'shift', 'tasks_completed', 'efficiency_rating', 'items_processed',
            # Driver fields
            'vehicle', 'route', 'deliveries_completed', 'driver_rating', 'total_distance',
            # Timestamps
            'created_at', 'updated_at',
            # Related data
            'preferences'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_orders_count(self, obj):
        """Calculate total orders for customers"""
        if obj.role == 'customer':
            return obj.customer_orders.count()
        return 0
    
    def get_total_spent(self, obj):
        """Calculate total spent for customers"""
        if obj.role == 'customer':
            from django.db.models import Sum
            total = obj.customer_orders.aggregate(total=Sum('amount'))['total']
            if total:
                return f"UGX {total:,.0f}"
            return "UGX 0"
        return "UGX 0"
    
    def get_tasks_completed(self, obj):
        """Calculate completed tasks for staff"""
        if obj.role == 'staff':
            return obj.assigned_tasks.filter(status='completed').count()
        return 0
    
    def get_deliveries_completed(self, obj):
        """Calculate completed deliveries for drivers"""
        if obj.role == 'driver':
            return obj.driver_deliveries.filter(status='completed').count()
        return 0
    
    def create(self, validated_data):
        """
        Create a new user with optional customer preferences
        """
        preferences_data = validated_data.pop('preferences', None)
        user = User.objects.create(**validated_data)
        
        # Create customer preferences if user is a customer and preferences provided
        if user.role == 'customer' and preferences_data:
            CustomerPreferences.objects.create(customer=user, **preferences_data)
        
        return user
    
    def update(self, instance, validated_data):
        """
        Update user and handle customer preferences
        """
        preferences_data = validated_data.pop('preferences', None)
        
        # Update user fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update or create customer preferences
        if instance.role == 'customer' and preferences_data:
            preferences, created = CustomerPreferences.objects.get_or_create(
                customer=instance,
                defaults=preferences_data
            )
            if not created:
                for attr, value in preferences_data.items():
                    setattr(preferences, attr, value)
                preferences.save()
        
        return instance


class UserListSerializer(serializers.ModelSerializer):
    """
    Simplified serializer for user list views
    Only includes essential fields for better performance
    """
    orders_count = serializers.SerializerMethodField()
    total_spent = serializers.SerializerMethodField()
    tasks_completed = serializers.SerializerMethodField()
    deliveries_completed = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'name', 'email', 'phone', 'role', 'status',
            'orders_count', 'total_spent', 'tasks_completed', 
            'efficiency_rating', 'deliveries_completed', 'driver_rating',
            'created_at'
        ]
    
    def get_orders_count(self, obj):
        """Calculate total orders for customers"""
        if obj.role == 'customer':
            return obj.customer_orders.count()
        return 0
    
    def get_total_spent(self, obj):
        """Calculate total spent for customers"""
        if obj.role == 'customer':
            from django.db.models import Sum
            total = obj.customer_orders.aggregate(total=Sum('amount'))['total']
            if total:
                return f"UGX {total:,.0f}"
            return "UGX 0"
        return "UGX 0"
    
    def get_tasks_completed(self, obj):
        """Calculate completed tasks for staff"""
        if obj.role == 'staff':
            return obj.assigned_tasks.filter(status='completed').count()
        return 0
    
    def get_deliveries_completed(self, obj):
        """Calculate completed deliveries for drivers"""
        if obj.role == 'driver':
            return obj.driver_deliveries.filter(status='completed').count()
        return 0

class ServiceSerializer(serializers.ModelSerializer):
    """
    Serializer for Service model
    Used in business settings for service management
    """
    created_by_name = serializers.CharField(source='created_by.name', read_only=True)
    
    class Meta:
        model = Service
        fields = [
            'id', 'name', 'description', 'price', 'unit', 'status',
            'created_by', 'created_by_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_by_name', 'created_at', 'updated_at']


class BusinessSettingsSerializer(serializers.ModelSerializer):
    """
    Serializer for BusinessSettings model
    Handles business configuration and settings
    """
    
    class Meta:
        model = BusinessSettings
        fields = [
            'id', 'opening_time', 'closing_time', 'working_days',
            'business_name', 'business_address', 'business_phone', 'business_email',
            'tax_rate', 'currency',
            'email_notifications', 'sms_notifications', 'order_updates', 'payment_reminders',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate_working_days(self, value):
        """
        Validate working days format
        """
        valid_days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        if not isinstance(value, list):
            raise serializers.ValidationError("Working days must be a list")
        
        for day in value:
            if day not in valid_days:
                raise serializers.ValidationError(f"Invalid day: {day}")
        
        return value
    
    def validate_tax_rate(self, value):
        """
        Validate tax rate is between 0 and 100
        """
        if value < 0 or value > 100:
            raise serializers.ValidationError("Tax rate must be between 0 and 100")
        return value
# =============================================================================
# AUTHENTICATION SERIALIZERS
# =============================================================================

class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration/signup
    """
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = [
            'email', 'password', 'password_confirm', 'name', 'phone', 
            'role', 'address'
        ]
        extra_kwargs = {
            'email': {'required': True},
            'name': {'required': True},
            'phone': {'required': True},
        }
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs
    
    def create(self, validated_data):
        # Remove password_confirm from validated_data
        password = validated_data.pop('password')
        validated_data.pop('password_confirm')
        
        # Create user with hashed password
        user = User.objects.create(
            email=validated_data['email'],
            name=validated_data['name'],
            phone=validated_data['phone'],
            role=validated_data.get('role', 'customer'),
            address=validated_data.get('address', ''),
        )
        user.set_password(password)
        user.save()
        return user


class UserLoginSerializer(serializers.Serializer):
    """
    Serializer for user login
    """
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            try:
                user = User.objects.get(email=email)
                if user.check_password(password) and user.is_active:
                    attrs['user'] = user
                else:
                    raise serializers.ValidationError('Invalid email or password')
            except User.DoesNotExist:
                raise serializers.ValidationError('Invalid email or password')
        else:
            raise serializers.ValidationError('Must include email and password')
        
        return attrs


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for user profile (read-only for authenticated user)
    """
    class Meta:
        model = User
        fields = [
            'id', 'email', 'name', 'phone', 'role', 'status', 'address',
            'orders_count', 'total_spent', 'created_at', 'last_login'
        ]
        read_only_fields = ['id', 'created_at', 'last_login', 'orders_count', 'total_spent']


class ChangePasswordSerializer(serializers.Serializer):
    """
    Serializer for changing user password
    """
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, validators=[validate_password])
    new_password_confirm = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError("New passwords don't match")
        return attrs
    
    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Old password is incorrect')
        return value

# =============================================================================
# ORDER SERIALIZERS
# =============================================================================

class IndividualItemSerializer(serializers.ModelSerializer):
    """
    Serializer for individual items within an order item
    """
    class Meta:
        model = IndividualItem
        fields = ['id', 'item_name', 'item_type']


class OrderItemSerializer(serializers.ModelSerializer):
    """
    Serializer for OrderItem model
    """
    service_name = serializers.CharField(source='service.name', read_only=True)
    service_unit = serializers.CharField(source='service.unit', read_only=True)
    individual_items = IndividualItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = OrderItem
        fields = [
            'id', 'service', 'service_name', 'service_unit', 'quantity', 
            'unit_price', 'total_price', 'special_instructions', 'individual_items'
        ]
        read_only_fields = ['total_price']


class OrderTimelineSerializer(serializers.ModelSerializer):
    """
    Serializer for OrderTimeline model
    """
    class Meta:
        model = OrderTimeline
        fields = [
            'id', 'stage', 'completed', 'is_current', 'timestamp', 'notes'
        ]


class OrderSerializer(serializers.ModelSerializer):
    """
    Serializer for Order model with related items and timeline
    """
    customer = UserListSerializer(read_only=True)
    assigned_to = UserListSerializer(read_only=True)
    customer_id = serializers.IntegerField(write_only=True, required=False)
    assigned_to_id = serializers.IntegerField(write_only=True, required=False)
    order_items = OrderItemSerializer(many=True, read_only=True)
    timeline = OrderTimelineSerializer(many=True, read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'order_id', 'customer', 'customer_id', 'assigned_to', 'assigned_to_id',
            'status', 'current_stage', 'amount', 'items', 'progress',
            'pickup_date', 'estimated_delivery', 'delivery_date', 'special_instructions',
            'order_items', 'timeline', 'created_at', 'updated_at'
        ]
        read_only_fields = ['order_id', 'amount', 'items', 'progress']
    
    def update(self, instance, validated_data):
        # Handle customer_id and assigned_to_id
        if 'customer_id' in validated_data:
            instance.customer_id = validated_data.pop('customer_id')
        if 'assigned_to_id' in validated_data:
            instance.assigned_to_id = validated_data.pop('assigned_to_id')
        
        return super().update(instance, validated_data)


class CreateOrderItemWithItemsSerializer(serializers.Serializer):
    """
    Serializer for creating order items with individual items
    """
    service = serializers.IntegerField()
    quantity = serializers.DecimalField(max_digits=8, decimal_places=2)
    unit_price = serializers.DecimalField(max_digits=8, decimal_places=2)
    special_instructions = serializers.CharField(required=False, allow_blank=True)
    individual_items = serializers.ListField(
        child=serializers.DictField(child=serializers.CharField()),
        required=False
    )


class CreateOrderSerializer(serializers.ModelSerializer):
    """
    Serializer for creating new orders (legacy - without individual items)
    """
    order_items = OrderItemSerializer(many=True, write_only=True)
    
    class Meta:
        model = Order
        fields = [
            'customer', 'pickup_date', 'estimated_delivery', 'special_instructions', 'order_items'
        ]


class CreateOrderWithItemsSerializer(serializers.ModelSerializer):
    """
    Serializer for creating new orders with individual item names
    """
    order_items = CreateOrderItemWithItemsSerializer(many=True, write_only=True)
    
    class Meta:
        model = Order
        fields = [
            'customer', 'pickup_date', 'estimated_delivery', 'special_instructions', 'order_items'
        ]
    
    def create(self, validated_data):
        order_items_data = validated_data.pop('order_items')
        
        # Generate unique order ID
        import datetime
        today = datetime.date.today()
        
        existing_orders = Order.objects.filter(
            order_id__startswith=f"ORD-{today.year}-"
        ).order_by('-order_id')
        
        if existing_orders.exists():
            last_order_id = existing_orders.first().order_id
            try:
                last_number = int(last_order_id.split('-')[-1])
                order_number = last_number + 1
            except (ValueError, IndexError):
                order_number = 1
        else:
            order_number = 1
        
        order_id = f"ORD-{today.year}-{order_number:03d}"
        
        while Order.objects.filter(order_id=order_id).exists():
            order_number += 1
            order_id = f"ORD-{today.year}-{order_number:03d}"
            if order_number > 9999:
                raise ValueError("Too many orders created this year")
        
        # Create order
        order = Order.objects.create(order_id=order_id, **validated_data)
        
        # Create order items and individual items
        for item_data in order_items_data:
            individual_items_data = item_data.pop('individual_items', [])
            
            # Create order item
            order_item = OrderItem.objects.create(
                order=order,
                service_id=item_data['service'],
                quantity=item_data['quantity'],
                unit_price=item_data['unit_price'],
                special_instructions=item_data.get('special_instructions', '')
            )
            
            # Create individual items (this will auto-create RFID tags via signal)
            for individual_item_data in individual_items_data:
                IndividualItem.objects.create(
                    order_item=order_item,
                    item_name=individual_item_data['item_name'],
                    item_type=individual_item_data.get('item_type', '')
                )
        
        # Create initial timeline entries
        OrderTimeline.objects.create(
            order=order,
            stage='Order Placed',
            completed=True,
            is_current=False,
            timestamp=timezone.now()
        )
        
        OrderTimeline.objects.create(
            order=order,
            stage='Pickup Scheduled',
            completed=False,
            is_current=True
        )
        
        return order




# =============================================================================
# RFID TAG SERIALIZERS
# =============================================================================

class RFIDTagSerializer(serializers.ModelSerializer):
    """
    Serializer for RFIDTag model
    """
    verified_by_name = serializers.CharField(source='verified_by.name', read_only=True)
    order_id = serializers.CharField(source='order.order_id', read_only=True)
    display_name = serializers.CharField(read_only=True)
    service_name = serializers.CharField(read_only=True)
    
    class Meta:
        model = RFIDTag
        fields = [
            'id', 'tag_id', 'order', 'order_id', 'individual_item', 'item_description', 'item_type',
            'display_name', 'service_name', 'status', 'verified_by', 'verified_by_name', 'verified_at', 
            'verification_notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['tag_id', 'display_name', 'service_name', 'created_at', 'updated_at']


class CreateRFIDTagSerializer(serializers.ModelSerializer):
    """
    Serializer for creating RFID tags
    """
    class Meta:
        model = RFIDTag
        fields = ['order', 'item_description', 'item_type']


# =============================================================================
# FINANCIAL SERIALIZERS
# =============================================================================

class InvoiceSerializer(serializers.ModelSerializer):
    """
    Serializer for Invoice model
    """
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    customer_email = serializers.CharField(source='customer.email', read_only=True)
    order_id = serializers.CharField(source='order.order_id', read_only=True)
    
    class Meta:
        model = Invoice
        fields = [
            'id', 'invoice_id', 'customer', 'customer_name', 'customer_email',
            'order', 'order_id', 'amount', 'status', 'invoice_date', 'due_date', 
            'paid_date', 'subtotal', 'tax_amount', 'created_at', 'updated_at'
        ]
        read_only_fields = ['invoice_id', 'created_at', 'updated_at']


class FinancialSummarySerializer(serializers.Serializer):
    """
    Serializer for financial summary data
    """
    monthly_revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
    pending_payments = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_orders = serializers.IntegerField()
    completed_orders = serializers.IntegerField()
    pending_orders = serializers.IntegerField()