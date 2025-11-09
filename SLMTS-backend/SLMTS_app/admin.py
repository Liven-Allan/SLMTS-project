from django.contrib import admin
from .models import (
    User, CustomerPreferences, Service, Order, OrderItem, OrderTimeline,
    Task, RFIDTag, Delivery, Notification, Invoice, FinancialRecord,
    MonthlyAnalytics, BusinessSettings, RevenueSummary
)

# =============================================================================
# USER ADMIN
# =============================================================================

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'role', 'status', 'created_at']
    list_filter = ['role', 'status', 'created_at']
    search_fields = ['name', 'email', 'phone']
    ordering = ['name']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'email', 'phone', 'role', 'status', 'address')
        }),
        ('Customer Fields', {
            'fields': ('orders_count', 'total_spent'),
            'classes': ('collapse',)
        }),
        ('Staff Fields', {
            'fields': ('station', 'shift', 'tasks_completed', 'efficiency_rating', 'items_processed'),
            'classes': ('collapse',)
        }),
        ('Driver Fields', {
            'fields': ('vehicle', 'route', 'deliveries_completed', 'driver_rating', 'total_distance'),
            'classes': ('collapse',)
        }),
    )


# =============================================================================
# SERVICE ADMIN
# =============================================================================

@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ['name', 'price', 'unit', 'status', 'created_by', 'created_at']
    list_filter = ['unit', 'status', 'created_at']
    search_fields = ['name', 'description']
    ordering = ['name']


# =============================================================================
# ORDER ADMIN
# =============================================================================

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['order_id', 'customer', 'status', 'current_stage', 'amount', 'progress', 'created_at']
    list_filter = ['status', 'current_stage', 'created_at']
    search_fields = ['order_id', 'customer__name']
    ordering = ['-created_at']
    
    readonly_fields = ['amount', 'items', 'progress']


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ['order', 'service', 'quantity', 'unit_price', 'total_price']
    list_filter = ['service', 'created_at']
    search_fields = ['order__order_id', 'service__name']


@admin.register(OrderTimeline)
class OrderTimelineAdmin(admin.ModelAdmin):
    list_display = ['order', 'stage', 'completed', 'is_current', 'timestamp']
    list_filter = ['completed', 'is_current', 'created_at']
    search_fields = ['order__order_id', 'stage']


# =============================================================================
# TASK ADMIN
# =============================================================================

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ['task_id', 'order', 'assigned_to', 'task_type', 'status', 'priority', 'created_at']
    list_filter = ['task_type', 'status', 'priority', 'created_at']
    search_fields = ['task_id', 'order__order_id', 'assigned_to__name']
    ordering = ['-created_at']


@admin.register(RFIDTag)
class RFIDTagAdmin(admin.ModelAdmin):
    list_display = ['tag_id', 'order', 'item_description', 'status', 'verified_by', 'verified_at']
    list_filter = ['status', 'verified_at', 'item_type']
    search_fields = ['tag_id', 'item_description', 'order__order_id']
    readonly_fields = ['tag_id', 'created_at', 'updated_at']
    search_fields = ['tag_id', 'order__order_id', 'item_description']


# =============================================================================
# DELIVERY ADMIN
# =============================================================================

@admin.register(Delivery)
class DeliveryAdmin(admin.ModelAdmin):
    list_display = ['delivery_id', 'order', 'driver', 'delivery_type', 'status', 'priority', 'created_at']
    list_filter = ['delivery_type', 'status', 'priority', 'created_at']
    search_fields = ['delivery_id', 'order__order_id', 'driver__name', 'address']
    ordering = ['-created_at']


# =============================================================================
# NOTIFICATION ADMIN
# =============================================================================

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'notification_type', 'read', 'created_at']
    list_filter = ['notification_type', 'read', 'created_at']
    search_fields = ['title', 'message', 'user__name']
    ordering = ['-created_at']


# =============================================================================
# FINANCIAL ADMIN
# =============================================================================

@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ['invoice_id', 'order', 'customer', 'amount', 'status', 'invoice_date', 'due_date']
    list_filter = ['status', 'invoice_date']
    search_fields = ['invoice_id', 'order__order_id', 'customer__name']
    ordering = ['-invoice_date']


@admin.register(FinancialRecord)
class FinancialRecordAdmin(admin.ModelAdmin):
    list_display = ['record_date', 'record_type', 'amount', 'service', 'customer', 'order']
    list_filter = ['record_type', 'record_date', 'service']
    search_fields = ['description', 'order__order_id', 'customer__name']
    ordering = ['-record_date']


@admin.register(MonthlyAnalytics)
class MonthlyAnalyticsAdmin(admin.ModelAdmin):
    list_display = ['month', 'year', 'revenue', 'orders_count', 'revenue_growth', 'customer_satisfaction']
    list_filter = ['year', 'month']
    ordering = ['-year', '-month']


# =============================================================================
# BUSINESS ADMIN
# =============================================================================

@admin.register(BusinessSettings)
class BusinessSettingsAdmin(admin.ModelAdmin):
    list_display = ['business_name', 'opening_time', 'closing_time', 'currency', 'tax_rate']
    
    fieldsets = (
        ('Business Information', {
            'fields': ('business_name', 'business_address', 'business_phone', 'business_email')
        }),
        ('Operating Hours', {
            'fields': ('opening_time', 'closing_time', 'working_days')
        }),
        ('Financial Settings', {
            'fields': ('currency', 'tax_rate')
        }),
        ('Notifications', {
            'fields': ('email_notifications', 'sms_notifications', 'order_updates', 'payment_reminders')
        }),
    )


@admin.register(CustomerPreferences)
class CustomerPreferencesAdmin(admin.ModelAdmin):
    list_display = ['customer', 'detergent', 'fabric_softener', 'starch']
    list_filter = ['detergent', 'fabric_softener', 'starch']
    search_fields = ['customer__name']


@admin.register(RevenueSummary)
class RevenueSummaryAdmin(admin.ModelAdmin):
    list_display = ['date', 'total_revenue', 'total_orders', 'total_customers']
    list_filter = ['date']
    ordering = ['-date']
    readonly_fields = ['service_breakdown']