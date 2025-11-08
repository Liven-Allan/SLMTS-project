"""
Set different statuses for orders to test financial data
"""

from django.core.management.base import BaseCommand
from SLMTS_app.models import Order


class Command(BaseCommand):
    help = 'Set different statuses for orders to test financial data'

    def handle(self, *args, **options):
        orders = Order.objects.all()
        
        if not orders.exists():
            self.stdout.write(self.style.ERROR('No orders found.'))
            return

        # Set different statuses
        total_orders = orders.count()
        
        # 60% completed, 30% processing, 10% pending
        completed_count = int(total_orders * 0.6)
        processing_count = int(total_orders * 0.3)
        
        # Update orders
        for i, order in enumerate(orders):
            if i < completed_count:
                order.status = 'completed'
            elif i < completed_count + processing_count:
                order.status = 'processing'
            else:
                order.status = 'pending'
            order.save()

        self.stdout.write(
            self.style.SUCCESS(f'Updated {total_orders} orders:')
        )
        self.stdout.write(f'  Completed: {Order.objects.filter(status="completed").count()}')
        self.stdout.write(f'  Processing: {Order.objects.filter(status="processing").count()}')
        self.stdout.write(f'  Pending: {Order.objects.filter(status="pending").count()}')
        
        # Calculate financial summary
        from django.db.models import Sum
        completed_revenue = Order.objects.filter(status='completed').aggregate(
            total=Sum('amount')
        )['total'] or 0
        
        pending_payments = Order.objects.filter(
            status__in=['pending', 'processing']
        ).aggregate(
            total=Sum('amount')
        )['total'] or 0
        
        self.stdout.write(f'\nFinancial Summary:')
        self.stdout.write(f'  Monthly Revenue (Completed): UGX {completed_revenue:,.0f}')
        self.stdout.write(f'  Pending Payments (In Process): UGX {pending_payments:,.0f}')