"""
Django Management Command: Create Sample Tasks for Staff Users
Creates realistic task data for testing staff performance metrics
"""

from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import datetime, timedelta
import random
from SLMTS_app.models import User, Task, Order


class Command(BaseCommand):
    help = 'Create sample tasks for staff users to test performance metrics'

    def add_arguments(self, parser):
        parser.add_argument(
            '--count',
            type=int,
            default=20,
            help='Number of tasks to create (default: 20)'
        )
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing tasks before creating new ones'
        )

    def handle(self, *args, **options):
        count = options['count']
        clear_existing = options['clear']

        if clear_existing:
            self.stdout.write('Clearing existing tasks...')
            Task.objects.all().delete()
            self.stdout.write(self.style.SUCCESS('Existing tasks cleared.'))

        # Get staff users
        staff_users = User.objects.filter(role='staff')
        if not staff_users.exists():
            self.stdout.write(
                self.style.ERROR('No staff users found. Please create staff users first.')
            )
            return

        # Get existing orders to assign tasks to
        orders = Order.objects.all()
        if not orders.exists():
            self.stdout.write(
                self.style.ERROR('No orders found. Please create orders first using create_sample_orders command.')
            )
            return

        self.stdout.write(f'Creating {count} sample tasks for {staff_users.count()} staff users...')

        # Task types and their typical durations
        task_types = [
            ('washing', '45 min', 4),
            ('drying', '60 min', 3),
            ('folding', '30 min', 4),
            ('pressing', '20 min', 3),
            ('stain_treatment', '15 min', 2),
            ('quality_check', '10 min', 2),
            ('packaging', '15 min', 3),
        ]

        priorities = ['low', 'medium', 'high']
        statuses = ['pending', 'in-progress', 'completed']

        tasks_created = 0

        for i in range(count):
            # Select random staff user and order
            staff_user = random.choice(staff_users)
            order = random.choice(orders)
            task_type, duration, stages = random.choice(task_types)
            priority = random.choice(priorities)
            status = random.choice(statuses)

            # Generate task ID
            task_id = f"TASK-{tasks_created + 1:03d}"

            # Create task
            task = Task.objects.create(
                task_id=task_id,
                order=order,
                assigned_to=staff_user,
                task_type=task_type,
                status=status,
                priority=priority,
                items_count=random.randint(3, 15),
                estimated_duration=duration,
                current_stage=random.randint(0, stages) if status != 'pending' else 0,
                total_stages=stages,
                special_instructions=f"Handle with care - {task_type} task for {order.order_id}"
            )

            # Set timestamps based on status
            if status in ['in-progress', 'completed']:
                # Task was started 1-5 hours ago
                started_time = timezone.now() - timedelta(hours=random.randint(1, 5))
                task.started_at = started_time

            if status == 'completed':
                # Task was completed 30 minutes to 2 hours after starting
                completion_time = task.started_at + timedelta(minutes=random.randint(30, 120))
                task.completed_at = completion_time
                task.current_stage = task.total_stages  # Complete all stages

            task.save()
            tasks_created += 1

        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {tasks_created} sample tasks.')
        )

        # Show summary by staff user
        self.stdout.write('\nTask summary by staff user:')
        for staff_user in staff_users:
            user_tasks = Task.objects.filter(assigned_to=staff_user)
            completed_tasks = user_tasks.filter(status='completed').count()
            total_tasks = user_tasks.count()
            
            self.stdout.write(
                f'  {staff_user.name}: {completed_tasks} completed / {total_tasks} total tasks'
            )

        self.stdout.write(
            self.style.SUCCESS('\nSample tasks created successfully! Staff performance metrics should now show real data.')
        )