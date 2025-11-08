# Django Models for CityVille Laundromat Management System
# Complete models extracted from all dashboards (Customer, Staff, Driver, Admin)
# 
# Usage: Copy these models to your Django app's models.py file
# Make sure to run: python manage.py makemigrations && python manage.py migrate

from django.db import models
from django.utils import timezone


# =============================================================================
# 1. USER MODEL (Core - Used across all dashboards)
# =============================================================================

class User(models.Model):
    """
    Core user model supporting multiple roles: Customer, Staff, Driver, Admin
    Contains role-specific fields for all dashboard functionalities
    """
    ROLE_CHOICES = [
        ('customer', 'Customer'),
        ('staff', 'Staff'),
        ('driver', 'Driver'),
        ('admin', 'Admin'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('break', 'On Break'),
        ('inactive', 'Inactive'),
    ]
    
    # Basic Information
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20)  # +256 700 123 456
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='active')
    address = models.TextField(blank=True)  # From CustomerDashboard
    
    # Customer-specific fields
    orders_count = models.IntegerField(default=0, null=True, blank=True)
    total_spent = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    
    # Staff-specific fields (from StaffDashboard)
    station = models.CharField(max_length=50, blank=True)  # "Station 3"
    shift = models.CharField(max_length=100, blank=True)  # "Morning (8:00 AM - 4:00 PM)"
    tasks_completed = models.IntegerField(default=0, null=True, blank=True)
    efficiency_rating = models.FloatField(null=True, blank=True)  # 0-100
    items_processed = models.IntegerField(default=0, null=True, blank=True)
    
    # Driver-specific fields (from DriverDashboard)
    vehicle = models.CharField(max_length=50, blank=True)  # "UBD 123X"
    route = models.CharField(max_length=100, blank=True)  # "Central Kampala"
    deliveries_completed = models.IntegerField(default=0, null=True, blank=True)
    driver_rating = models.FloatField(null=True, blank=True)  # 0-5
    total_distance = models.FloatField(default=0, null=True, blank=True)  # km
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} ({self.get_role_display()})"
    
    class Meta:
        ordering = ['name']


# =============================================================================
# 2. CUSTOMER PREFERENCES MODEL (From CustomerDashboard)
# =============================================================================

class CustomerPreferences(models.Model):
    """
    Customer laundry preferences and special instructions
    """
    DETERGENT_CHOICES = [
        ('eco-friendly', 'Eco-friendly'),
        ('regular', 'Regular'),
        ('sensitive', 'Sensitive Skin'),
        ('fragrance-free', 'Fragrance-free'),
    ]
    
    customer = models.OneToOneField(User, on_delete=models.CASCADE, related_name='preferences')
    detergent = models.CharField(max_length=20, choices=DETERGENT_CHOICES, default='regular')
    fabric_softener = models.BooleanField(default=True)
    starch = models.BooleanField(default=False)
    special_instructions = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Preferences for {self.customer.name}"
    
    class Meta:
        verbose_name = "Customer Preferences"
        verbose_name_plural = "Customer Preferences"


# =============================================================================
# 3. SERVICE MODEL (Admin-Created Services)
# =============================================================================

class Service(models.Model):
    """
    Admin-defined services with flexible pricing
    Replaces hardcoded pricing in BusinessSettings
    """
    UNIT_CHOICES = [
        ('per_kg', 'Per Kilogram'),
        ('per_item', 'Per Item'),
        ('flat_rate', 'Flat Rate'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
    ]
    
    name = models.CharField(max_length=100)  # "Wash & Fold", "Dry Cleaning"
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    unit = models.CharField(max_length=10, choices=UNIT_CHOICES)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='active')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_services')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} - UGX {self.price}/{self.get_unit_display()}"
    
    class Meta:
        ordering = ['name']


# =============================================================================
# 4. ORDER MODEL (Enhanced from All Dashboards)
# =============================================================================

class Order(models.Model):
    """
    Core order model with timeline tracking and stage management
    Used across Customer, Staff, Driver, and Admin dashboards
    """
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    STAGE_CHOICES = [
        ('order_placed', 'Order Placed'),
        ('pickup_confirmed', 'Pickup Confirmed'),
        ('items_received', 'Items Received'),
        ('washing', 'Washing'),
        ('drying', 'Drying'),
        ('folding', 'Folding'),
        ('quality_check', 'Quality Check'),
        ('ready_for_delivery', 'Ready for Delivery'),
        ('out_for_delivery', 'Out for Delivery'),
        ('delivered', 'Delivered'),
    ]
    
    order_id = models.CharField(max_length=20, unique=True)  # ORD-2024-007
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='customer_orders')
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_orders')
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='pending')
    current_stage = models.CharField(max_length=20, choices=STAGE_CHOICES, default='order_placed')
    
    # Calculated fields (auto-updated from OrderItems)
    amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    items = models.IntegerField(default=0)
    progress = models.IntegerField(default=0)  # 0-100 percentage
    
    # Dates (from CustomerDashboard)
    pickup_date = models.DateField(null=True, blank=True)
    estimated_delivery = models.DateField(null=True, blank=True)
    delivery_date = models.DateField(null=True, blank=True)
    
    # Instructions
    special_instructions = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def calculate_totals(self):
        """Calculate order totals from order items (services)"""
        order_items = self.order_items.all()
        self.amount = sum(item.total_price for item in order_items)
        self.items = sum(item.quantity for item in order_items)
        self.save()
    
    def update_progress(self):
        """Update progress based on current stage"""
        stage_progress = {
            'order_placed': 10,
            'pickup_confirmed': 20,
            'items_received': 30,
            'washing': 45,
            'drying': 60,
            'folding': 75,
            'quality_check': 85,
            'ready_for_delivery': 90,
            'out_for_delivery': 95,
            'delivered': 100,
        }
        self.progress = stage_progress.get(self.current_stage, 0)
        self.save()
    
    def __str__(self):
        return f"{self.order_id} - {self.customer.name}"
    
    class Meta:
        ordering = ['-created_at']


# =============================================================================
# 5. ORDER ITEM MODEL (Links Orders to Services)
# =============================================================================

class OrderItem(models.Model):
    """
    Individual service items within an order
    Links orders to services with quantities and pricing
    """
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='order_items')
    service = models.ForeignKey(Service, on_delete=models.CASCADE)
    quantity = models.DecimalField(max_digits=8, decimal_places=2)  # kg, items, etc.
    unit_price = models.DecimalField(max_digits=8, decimal_places=2)  # Price at time of order
    total_price = models.DecimalField(max_digits=10, decimal_places=2)  # quantity * unit_price
    special_instructions = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def save(self, *args, **kwargs):
        # Auto-calculate total price
        self.total_price = self.quantity * self.unit_price
        super().save(*args, **kwargs)
        # Update order totals
        self.order.calculate_totals()
    
    def __str__(self):
        return f"{self.service.name} x {self.quantity} for {self.order.order_id}"


# =============================================================================
# 6. ORDER TIMELINE MODEL (From CustomerDashboard)
# =============================================================================

class OrderTimeline(models.Model):
    """
    Timeline tracking for order progress
    Shows detailed stage progression with timestamps
    """
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='timeline')
    stage = models.CharField(max_length=50)
    completed = models.BooleanField(default=False)
    is_current = models.BooleanField(default=False)
    timestamp = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.order.order_id} - {self.stage}"
    
    class Meta:
        ordering = ['created_at']


# =============================================================================
# 7. TASK MODEL (From StaffDashboard)
# =============================================================================

class Task(models.Model):
    """
    Individual tasks assigned to staff members
    Tracks work progress and RFID scanning
    """
    TASK_TYPE_CHOICES = [
        ('washing', 'Washing'),
        ('drying', 'Drying'),
        ('folding', 'Folding'),
        ('pressing', 'Pressing'),
        ('stain_treatment', 'Stain Treatment'),
        ('quality_check', 'Quality Check'),
        ('packaging', 'Packaging'),
    ]
    
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in-progress', 'In Progress'),
        ('completed', 'Completed'),
    ]
    
    task_id = models.CharField(max_length=20, unique=True)  # TASK-001
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='tasks')
    assigned_to = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assigned_tasks')
    task_type = models.CharField(max_length=20, choices=TASK_TYPE_CHOICES)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='pending')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    
    items_count = models.IntegerField()
    estimated_duration = models.CharField(max_length=20)  # "45 min"
    current_stage = models.IntegerField(default=0)
    total_stages = models.IntegerField(default=4)
    special_instructions = models.TextField(blank=True)
    
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def get_progress_percentage(self):
        """Calculate task progress percentage"""
        if self.total_stages == 0:
            return 0
        return int((self.current_stage / self.total_stages) * 100)
    
    def __str__(self):
        return f"{self.task_id} - {self.task_type} ({self.get_status_display()})"
    
    class Meta:
        ordering = ['-created_at']


# =============================================================================
# 8. RFID TAG MODEL (From StaffDashboard)
# =============================================================================

class RFIDTag(models.Model):
    """
    RFID tags for garment tracking and verification
    Used in staff dashboard for item scanning
    """
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('scanned', 'Scanned'),
        ('verified', 'Verified'),
        ('completed', 'Completed'),
    ]
    
    tag_id = models.CharField(max_length=20, unique=True)  # RF001
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='rfid_tags')
    task = models.ForeignKey(Task, on_delete=models.SET_NULL, null=True, blank=True)
    item_description = models.CharField(max_length=200, blank=True)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='pending')
    
    scanned_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='scanned_tags')
    scanned_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.tag_id} - {self.item_description}"
    
    class Meta:
        ordering = ['tag_id']


# =============================================================================
# 9. DELIVERY MODEL (From DriverDashboard)
# =============================================================================

class Delivery(models.Model):
    """
    Pickup and delivery management for drivers
    GPS tracking and status updates
    """
    TYPE_CHOICES = [
        ('pickup', 'Pickup'),
        ('delivery', 'Delivery'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in-transit', 'In Transit'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('rescheduled', 'Rescheduled'),
    ]
    
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    ]
    
    delivery_id = models.CharField(max_length=20, unique=True)  # DEL-001
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='deliveries')
    driver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='driver_deliveries')
    delivery_type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='pending')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    
    # Address and location (GPS coordinates)
    address = models.TextField()
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    
    # Timing
    scheduled_time = models.CharField(max_length=50)  # "10:00 AM - 11:00 AM"
    estimated_duration = models.CharField(max_length=20)  # "15 min"
    distance = models.CharField(max_length=20)  # "2.3 km"
    
    # Instructions and notes
    special_instructions = models.TextField(blank=True)
    delivery_notes = models.TextField(blank=True)
    
    # Completion details
    completed_at = models.DateTimeField(null=True, blank=True)
    signature_image = models.ImageField(upload_to='signatures/', null=True, blank=True)
    photo_confirmation = models.ImageField(upload_to='delivery_photos/', null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.delivery_id} - {self.get_delivery_type_display()} ({self.get_status_display()})"
    
    class Meta:
        ordering = ['-created_at']


# =============================================================================
# 10. NOTIFICATION MODEL (From CustomerDashboard)
# =============================================================================

class Notification(models.Model):
    """
    System notifications for all users
    Order updates, alerts, and system messages
    """
    TYPE_CHOICES = [
        ('info', 'Info'),
        ('success', 'Success'),
        ('warning', 'Warning'),
        ('error', 'Error'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=10, choices=TYPE_CHOICES, default='info')
    title = models.CharField(max_length=200)
    message = models.TextField()
    read = models.BooleanField(default=False)
    
    # Optional links to related objects
    order = models.ForeignKey(Order, on_delete=models.CASCADE, null=True, blank=True)
    task = models.ForeignKey(Task, on_delete=models.CASCADE, null=True, blank=True)
    delivery = models.ForeignKey(Delivery, on_delete=models.CASCADE, null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.title} - {self.user.name}"
    
    class Meta:
        ordering = ['-created_at']


# =============================================================================
# 11. INVOICE MODEL (From AdminDashboard)
# =============================================================================

class Invoice(models.Model):
    """
    Financial invoices linked to orders
    Payment tracking and billing management
    """
    STATUS_CHOICES = [
        ('paid', 'Paid'),
        ('pending', 'Pending'),
        ('overdue', 'Overdue'),
        ('cancelled', 'Cancelled'),
    ]
    
    invoice_id = models.CharField(max_length=20, unique=True)  # INV-2024-001
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='invoice')
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='invoices')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    invoice_date = models.DateField()
    due_date = models.DateField()
    paid_date = models.DateField(null=True, blank=True)
    
    # Tax and totals
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.invoice_id} - UGX {self.amount} ({self.get_status_display()})"
    
    class Meta:
        ordering = ['-invoice_date']


# =============================================================================
# 12. FINANCIAL RECORD MODEL (Modified for Service Revenue)
# =============================================================================

class FinancialRecord(models.Model):
    """
    Financial transactions and revenue tracking
    Links to services for detailed revenue analysis
    """
    RECORD_TYPE_CHOICES = [
        ('revenue', 'Revenue'),
        ('expense', 'Expense'),
        ('payment', 'Payment'),
        ('refund', 'Refund'),
    ]
    
    record_date = models.DateField()
    record_type = models.CharField(max_length=10, choices=RECORD_TYPE_CHOICES)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    description = models.TextField(blank=True)
    
    # Links to related models
    order = models.ForeignKey(Order, on_delete=models.SET_NULL, null=True, blank=True, related_name='financial_records')
    service = models.ForeignKey(Service, on_delete=models.SET_NULL, null=True, blank=True, related_name='financial_records')
    customer = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='financial_records')
    invoice = models.ForeignKey(Invoice, on_delete=models.SET_NULL, null=True, blank=True, related_name='financial_records')
    
    # Revenue details (for service revenue records)
    quantity = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    unit_price = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.get_record_type_display()} - UGX {self.amount} ({self.record_date})"
    
    class Meta:
        ordering = ['-record_date', '-created_at']


# =============================================================================
# 13. MONTHLY ANALYTICS MODEL (From AdminDashboard)
# =============================================================================

class MonthlyAnalytics(models.Model):
    """
    Monthly business analytics and KPIs
    Revenue trends, order volumes, and performance metrics
    """
    MONTH_CHOICES = [
        ('Jan', 'January'), ('Feb', 'February'), ('Mar', 'March'),
        ('Apr', 'April'), ('May', 'May'), ('Jun', 'June'),
        ('Jul', 'July'), ('Aug', 'August'), ('Sep', 'September'),
        ('Oct', 'October'), ('Nov', 'November'), ('Dec', 'December'),
    ]
    
    month = models.CharField(max_length=3, choices=MONTH_CHOICES)
    year = models.IntegerField()
    revenue = models.DecimalField(max_digits=12, decimal_places=2)
    orders_count = models.IntegerField()
    
    # Analytics metrics
    revenue_growth = models.FloatField(default=0)  # percentage
    order_growth = models.FloatField(default=0)  # percentage
    customer_satisfaction = models.FloatField(default=0)  # 0-5 rating
    on_time_delivery = models.FloatField(default=0)  # percentage
    repeat_customers = models.FloatField(default=0)  # percentage
    avg_turnaround = models.FloatField(default=0)  # hours
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.month} {self.year} - UGX {self.revenue}"
    
    class Meta:
        unique_together = ['month', 'year']
        ordering = ['-year', '-month']


# =============================================================================
# 14. BUSINESS SETTINGS MODEL (Modified - No Hardcoded Pricing)
# =============================================================================

class BusinessSettings(models.Model):
    """
    Business configuration and settings
    Services are now managed through the Service model
    """
    WEEKDAY_CHOICES = [
        ('Monday', 'Monday'),
        ('Tuesday', 'Tuesday'),
        ('Wednesday', 'Wednesday'),
        ('Thursday', 'Thursday'),
        ('Friday', 'Friday'),
        ('Saturday', 'Saturday'),
        ('Sunday', 'Sunday'),
    ]
    
    # Business Hours
    opening_time = models.TimeField(default='08:00')
    closing_time = models.TimeField(default='20:00')
    working_days = models.JSONField(default=list)  # Store array of working days
    
    # Business Information
    business_name = models.CharField(max_length=100, default='CityVille Laundromat')
    business_address = models.TextField(blank=True)
    business_phone = models.CharField(max_length=20, blank=True)
    business_email = models.EmailField(blank=True)
    
    # Financial Settings
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)  # VAT percentage
    currency = models.CharField(max_length=10, default='UGX')
    
    # Notifications
    email_notifications = models.BooleanField(default=True)
    sms_notifications = models.BooleanField(default=True)
    order_updates = models.BooleanField(default=True)
    payment_reminders = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.business_name} Settings"
    
    class Meta:
        verbose_name = "Business Settings"
        verbose_name_plural = "Business Settings"


# =============================================================================
# ADDITIONAL HELPER MODELS
# =============================================================================

class RevenueSummary(models.Model):
    """
    Daily revenue summary for quick analytics
    Auto-generated from FinancialRecord data
    """
    date = models.DateField(unique=True)
    
    # Daily totals
    total_revenue = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_orders = models.IntegerField(default=0)
    total_customers = models.IntegerField(default=0)
    
    # Service breakdown (JSON field for flexibility)
    service_breakdown = models.JSONField(default=dict)  # {"Wash & Fold": 150000, "Dry Cleaning": 80000}
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Revenue Summary - {self.date} (UGX {self.total_revenue})"
    
    class Meta:
        ordering = ['-date']
        verbose_name = "Revenue Summary"
        verbose_name_plural = "Revenue Summaries"


# =============================================================================
# MODEL RELATIONSHIPS SUMMARY
# =============================================================================
"""
Key Relationships:
1. User (1) → CustomerPreferences (1) - One-to-One
2. User (1) → Order (M) - Customer/Staff/Driver relationships
3. User (1) → Service (M) - Admin creates services
4. Order (1) → OrderItem (M) - Services in order
5. Order (1) → OrderTimeline (M) - Progress tracking
6. Order (1) → Task (M) - Staff tasks
7. Order (1) → Delivery (M) - Driver deliveries
8. Order (1) → RFIDTag (M) - Item tracking
9. Order (1) → Notification (M) - Order updates
10. Order (1) → Invoice (1) - Billing
11. Service (1) → OrderItem (M) - Service usage
12. Task (1) → RFIDTag (M) - Task items
13. All models → FinancialRecord (M) - Revenue tracking

Total Models: 15 models covering all dashboard functionalities
"""