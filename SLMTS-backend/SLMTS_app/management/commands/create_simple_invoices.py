"""
Simple command to create a few invoices for testing
"""

from django.core.management.base import BaseCommand
from datetime import date, timedelta
from SLMTS_app.models import Order, Invoice, User


class Command(BaseCommand):
    help = 'Create simple invoices for testing financial data'

    def handle(self, *args, **options):
        # Clear existing invoices
        Invoice.objects.all().delete()
        self.stdout.write('Cleared existing invoices.')

        # Get some completed orders
        completed_orders = Order.objects.filter(status='completed')[:5]
        
        if not completed_orders.exists():
            self.stdout.write(self.style.ERROR('No completed orders found. Please create some orders first.'))
            return

        invoices_created = 0
        today = date.today()

        for i, order in enumerate(completed_orders, 1):
            invoice_id = f"INV-2024-{i:03d}"
            
            # Create invoice
            Invoice.objects.create(
                invoice_id=invoice_id,
                order=order,
                customer=order.customer,
                amount=order.amount,
                subtotal=order.amount,
                tax_amount=0,
                invoice_date=today - timedelta(days=i),
                due_date=today + timedelta(days=30-i),
                status='paid' if i <= 3 else 'pending'
            )
            invoices_created += 1

        self.stdout.write(
            self.style.SUCCESS(f'Created {invoices_created} sample invoices.')
        )
        
        # Show summary
        from django.db.models import Sum
        total_revenue = Invoice.objects.filter(status='paid').aggregate(
            total=Sum('amount')
        )['total'] or 0
        
        pending_payments = Invoice.objects.filter(status='pending').aggregate(
            total=Sum('amount')
        )['total'] or 0
        
        self.stdout.write(f'Total Revenue: UGX {total_revenue:,.0f}')
        self.stdout.write(f'Pending Payments: UGX {pending_payments:,.0f}')