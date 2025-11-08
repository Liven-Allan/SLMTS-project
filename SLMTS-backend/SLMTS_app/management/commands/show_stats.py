"""
Django management command to show current system statistics
"""

from django.core.management.base import BaseCommand
from SLMTS_app.models import Order, User
from datetime import date


class Command(BaseCommand):
    help = 'Show current system statistics'

    def handle(self, *args, **options):
        self.stdout.write('=== ORDER STATISTICS ===')
        orders = Order.objects.all()
        self.stdout.write(f'Total Orders: {orders.count()}')
        self.stdout.write(f'Pending: {orders.filter(status="pending").count()}')
        self.stdout.write(f'Processing: {orders.filter(status="processing").count()}')
        self.stdout.write(f'Completed: {orders.filter(status="completed").count()}')
        self.stdout.write(f'Cancelled: {orders.filter(status="cancelled").count()}')
        
        self.stdout.write('\n=== USER STATISTICS ===')
        users = User.objects.all()
        self.stdout.write(f'Total Users: {users.count()}')
        self.stdout.write(f'Customers: {users.filter(role="customer").count()}')
        self.stdout.write(f'Staff: {users.filter(role="staff").count()}')
        self.stdout.write(f'Drivers: {users.filter(role="driver").count()}')
        self.stdout.write(f'Admins: {users.filter(role="admin").count()}')
        
        self.stdout.write('\n=== REVENUE STATISTICS ===')
        today = date.today()
        completed_orders = orders.filter(status='completed')
        today_revenue = sum(order.amount for order in completed_orders if order.created_at.date() == today)
        monthly_revenue = sum(order.amount for order in completed_orders if order.created_at.month == today.month and order.created_at.year == today.year)
        self.stdout.write(f'Today Revenue: UGX {today_revenue:,.2f}')
        self.stdout.write(f'Monthly Revenue: UGX {monthly_revenue:,.2f}')
        
        self.stdout.write('\n=== RECENT ORDERS ===')
        recent_orders = orders.order_by('-created_at')[:5]
        for order in recent_orders:
            self.stdout.write(f'{order.order_id}: {order.customer.name} - {order.status} - UGX {order.amount:,.2f}')