"""
Django Management Command: Create Sample Invoices
Creates invoices for existing completed orders to test financial data
"""

from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db import models
from datetime import datetime, timedelta, date
import random
from SLMTS_app.models import Order, Invoice


class Command(BaseCommand):
    help = 'Create sample invoices for completed orders to test financial metrics'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing invoices before creating new ones'
        )

    def handle(self, *args, **options):
        clear_existing = options['clear']

        if clear_existing:
            self.stdout.write('Clearing existing invoices...')
            Invoice.objects.all().delete()
            self.stdout.write(self.style.SUCCESS('Existing invoices cleared.'))

        # Get completed orders that don't have invoices yet
        completed_orders = Order.objects.filter(
            status='completed'
        ).exclude(
            id__in=Invoice.objects.values_list('order_id', flat=True)
        )

        if not completed_orders.exists():
            self.stdout.write(
                self.style.WARNING('No completed orders without invoices found.')
            )
            return

        self.stdout.write(f'Creating invoices for {completed_orders.count()} completed orders...')

        invoices_created = 0
        statuses = ['paid', 'pending', 'overdue']
        
        # Generate invoice ID counter
        today = date.today()
        existing_invoices = Invoice.objects.filter(
            invoice_id__startswith=f"INV-{today.year}-"
        ).order_by('-invoice_id')
        
        if existing_invoices.exists():
            last_invoice_id = existing_invoices.first().invoice_id
            try:
                last_number = int(last_invoice_id.split('-')[-1])
                invoice_counter = last_number + 1
            except (ValueError, IndexError):
                invoice_counter = 1
        else:
            invoice_counter = 1

        for order in completed_orders:
            # Generate invoice ID
            invoice_id = f"INV-{today.year}-{invoice_counter:03d}"
            
            # Random status (80% paid, 15% pending, 5% overdue)
            status_weights = [0.8, 0.15, 0.05]
            status = random.choices(statuses, weights=status_weights)[0]
            
            # Set dates based on status
            invoice_date = order.created_at.date()
            due_date = invoice_date + timedelta(days=30)
            paid_date = None
            
            if status == 'paid':
                # Paid invoices were paid within 1-20 days
                paid_date = invoice_date + timedelta(days=random.randint(1, 20))
            elif status == 'overdue':
                # Overdue invoices have passed due date
                due_date = invoice_date + timedelta(days=random.randint(15, 25))

            # Create invoice
            invoice = Invoice.objects.create(
                invoice_id=invoice_id,
                order=order,
                customer=order.customer,
                amount=order.amount,
                subtotal=order.amount,
                tax_amount=0,  # No tax for now
                invoice_date=invoice_date,
                due_date=due_date,
                paid_date=paid_date,
                status=status
            )

            invoices_created += 1
            invoice_counter += 1

        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {invoices_created} invoices.')
        )

        # Show summary by status
        self.stdout.write('\nInvoice summary by status:')
        for status_choice in ['paid', 'pending', 'overdue']:
            count = Invoice.objects.filter(status=status_choice).count()
            total_amount = Invoice.objects.filter(status=status_choice).aggregate(
                total=models.Sum('amount')
            )['total'] or 0
            
            self.stdout.write(
                f'  {status_choice.title()}: {count} invoices, UGX {total_amount:,.0f}'
            )

        # Calculate financial summary
        from django.db.models import Sum
        monthly_revenue = Order.objects.filter(status='completed').aggregate(
            total=Sum('amount')
        )['total'] or 0
        
        pending_payments = Invoice.objects.filter(
            status__in=['pending', 'overdue']
        ).aggregate(
            total=Sum('amount')
        )['total'] or 0

        self.stdout.write(f'\nFinancial Summary:')
        self.stdout.write(f'  Monthly Revenue: UGX {monthly_revenue:,.0f}')
        self.stdout.write(f'  Pending Payments: UGX {pending_payments:,.0f}')
        
        self.stdout.write(
            self.style.SUCCESS('\nSample invoices created successfully! Financial data should now show real values.')
        )