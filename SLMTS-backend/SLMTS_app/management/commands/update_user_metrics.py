"""
Django Management Command: Update User Performance Metrics
Calculates and updates performance metrics for all users based on actual data
"""

from django.core.management.base import BaseCommand
from django.db.models import Sum, Count
from SLMTS_app.models import User, Task, Order, Delivery


class Command(BaseCommand):
    help = 'Update user performance metrics based on actual data'

    def add_arguments(self, parser):
        parser.add_argument(
            '--role',
            type=str,
            choices=['customer', 'staff', 'driver', 'all'],
            default='all',
            help='Update metrics for specific role only (default: all)'
        )

    def handle(self, *args, **options):
        role_filter = options['role']

        self.stdout.write('Updating user performance metrics...')

        # Get users based on role filter
        if role_filter == 'all':
            users = User.objects.all()
        else:
            users = User.objects.filter(role=role_filter)

        updated_count = 0

        for user in users:
            if user.role == 'customer':
                # Update customer metrics
                orders = user.customer_orders.all()
                orders_count = orders.count()
                total_spent = orders.aggregate(total=Sum('amount'))['total'] or 0

                # Update the user record (though we now calculate dynamically)
                user.orders_count = orders_count
                user.total_spent = total_spent
                user.save()

                self.stdout.write(f'  Customer {user.name}: {orders_count} orders, UGX {total_spent:,.0f} spent')

            elif user.role == 'staff':
                # Update staff metrics
                tasks = user.assigned_tasks.all()
                tasks_completed = tasks.filter(status='completed').count()
                total_tasks = tasks.count()

                # Calculate efficiency (completed tasks / total tasks * 100)
                efficiency = (tasks_completed / total_tasks * 100) if total_tasks > 0 else 0

                # Update the user record
                user.tasks_completed = tasks_completed
                user.efficiency_rating = efficiency
                user.save()

                self.stdout.write(f'  Staff {user.name}: {tasks_completed}/{total_tasks} tasks completed ({efficiency:.1f}% efficiency)')

            elif user.role == 'driver':
                # Update driver metrics
                deliveries = user.driver_deliveries.all()
                deliveries_completed = deliveries.filter(status='completed').count()
                total_deliveries = deliveries.count()

                # Calculate average rating (placeholder - would need actual rating data)
                avg_rating = 4.5  # Default good rating

                # Update the user record
                user.deliveries_completed = deliveries_completed
                user.driver_rating = avg_rating
                user.save()

                self.stdout.write(f'  Driver {user.name}: {deliveries_completed}/{total_deliveries} deliveries completed ({avg_rating}★ rating)')

            updated_count += 1

        self.stdout.write(
            self.style.SUCCESS(f'\nSuccessfully updated metrics for {updated_count} users.')
        )

        # Show summary
        if role_filter in ['staff', 'all']:
            staff_users = User.objects.filter(role='staff')
            self.stdout.write(f'\nStaff Performance Summary:')
            for staff in staff_users:
                completed = staff.assigned_tasks.filter(status='completed').count()
                total = staff.assigned_tasks.count()
                self.stdout.write(f'  {staff.name}: {completed} completed tasks')

        if role_filter in ['customer', 'all']:
            customer_users = User.objects.filter(role='customer')
            self.stdout.write(f'\nCustomer Summary:')
            for customer in customer_users:
                orders = customer.customer_orders.count()
                spent = customer.customer_orders.aggregate(total=Sum('amount'))['total'] or 0
                self.stdout.write(f'  {customer.name}: {orders} orders, UGX {spent:,.0f} spent')