"""
Django Management Command: Test User API Response
Tests the user serializer to verify performance data is being calculated correctly
"""

from django.core.management.base import BaseCommand
from SLMTS_app.models import User
from SLMTS_app.serializers import UserListSerializer
import json


class Command(BaseCommand):
    help = 'Test user API response to verify performance data'

    def handle(self, *args, **options):
        self.stdout.write('Testing User API Response...')

        # Get staff users to test
        staff_users = User.objects.filter(role='staff')
        
        if not staff_users.exists():
            self.stdout.write(self.style.ERROR('No staff users found.'))
            return

        self.stdout.write(f'Found {staff_users.count()} staff users:')

        for user in staff_users:
            # Test the serializer directly
            serializer = UserListSerializer(user)
            data = serializer.data

            self.stdout.write(f'\nUser: {user.name}')
            self.stdout.write(f'  Role: {data["role"]}')
            self.stdout.write(f'  Tasks Completed: {data["tasks_completed"]}')
            self.stdout.write(f'  Raw JSON: {json.dumps(data, indent=2)}')

            # Also check the actual database relationships
            actual_tasks = user.assigned_tasks.all()
            completed_tasks = user.assigned_tasks.filter(status='completed')
            
            self.stdout.write(f'  Database Check:')
            self.stdout.write(f'    Total tasks assigned: {actual_tasks.count()}')
            self.stdout.write(f'    Completed tasks: {completed_tasks.count()}')
            self.stdout.write(f'    Task IDs: {[task.task_id for task in actual_tasks]}')

        # Test customer users too
        customer_users = User.objects.filter(role='customer')[:2]  # Just first 2
        
        self.stdout.write(f'\nTesting {customer_users.count()} customer users:')
        
        for user in customer_users:
            serializer = UserListSerializer(user)
            data = serializer.data

            self.stdout.write(f'\nCustomer: {user.name}')
            self.stdout.write(f'  Orders Count: {data["orders_count"]}')
            self.stdout.write(f'  Total Spent: {data["total_spent"]}')

            # Database check
            actual_orders = user.customer_orders.all()
            self.stdout.write(f'  Database Check:')
            self.stdout.write(f'    Total orders: {actual_orders.count()}')
            if actual_orders.exists():
                total_amount = sum(order.amount for order in actual_orders)
                self.stdout.write(f'    Total amount: UGX {total_amount:,.0f}')

        self.stdout.write(self.style.SUCCESS('\nAPI test completed!'))