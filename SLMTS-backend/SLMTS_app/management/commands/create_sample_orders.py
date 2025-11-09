"""
Management command to create sample orders for testing
"""

from django.core.management.base import BaseCommand
from django.utils import timezone
from SLMTS_app.models import User, Order, Service, OrderItem
import random
from decimal import Decimal
import datetime

class Command(BaseCommand):
    help = 'Create sample orders for testing'

    def add_arguments(self, parser):
        parser.add_argument(
            '--count',
            type=int,
            default=10,
            help='Number of sample orders to create',
        )

    def handle(self, *args, **options):
        count = options['count']
        
        # Get or create customers
        customers = User.objects.filter(role='customer')
        if not customers.exists():
            self.stdout.write(self.style.WARNING('No customers found. Creating sample customers...'))
            # Create sample customers
            for i in range(3):
                User.objects.create(
                    name=f'Customer {i+1}',
                    email=f'customer{i+1}@example.com',
                    phone=f'+256700{i+1:06d}',
                    role='customer',
                    status='active'
                )
            customers = User.objects.filter(role='customer')

        # Get or create staff
        staff = User.objects.filter(role='staff')
        if not staff.exists():
            self.stdout.write(self.style.WARNING('No staff found. Creating sample staff...'))
            # Create sample staff
            for i in range(2):
                User.objects.create(
                    name=f'Staff {i+1}',
                    email=f'staff{i+1}@example.com',
                    phone=f'+256700{i+10:06d}',
                    role='staff',
                    status='active'
                )
            staff = User.objects.filter(role='staff')

        # Get or create services
        services = Service.objects.all()
        if not services.exists():
            self.stdout.write(self.style.WARNING('No services found. Creating sample services...'))
            # Create sample services
            Service.objects.create(
                name='Washing',
                description='Basic washing service',
                price=Decimal('5000'),
                unit='per_kg',
                status='active',
                created_by=User.objects.filter(role='admin').first() or User.objects.first()
            )
            Service.objects.create(
                name='Dry Cleaning',
                description='Professional dry cleaning',
                price=Decimal('15000'),
                unit='per_item',
                status='active',
                created_by=User.objects.filter(role='admin').first() or User.objects.first()
            )
            services = Service.objects.all()

        # Create sample orders
        statuses = ['pending', 'processing', 'completed', 'cancelled']
        stages = ['order_placed', 'pickup_confirmed', 'items_received', 'washing', 'drying', 'folding', 'quality_check', 'ready_for_delivery', 'out_for_delivery', 'delivered']
        
        created_count = 0
        for i in range(count):
            # Generate order ID
            today = timezone.now().date()
            order_count = Order.objects.filter(created_at__date=today).count() + 1
            order_id = f"ORD-{today.year}-{order_count:03d}"
            
            # Random customer and staff
            customer = random.choice(customers)
            assigned_staff = random.choice(staff) if random.choice([True, False]) else None
            
            # Random status and stage
            status = random.choice(statuses)
            stage = random.choice(stages)
            
            # Create order
            order = Order.objects.create(
                order_id=order_id,
                customer=customer,
                assigned_to=assigned_staff,
                status=status,
                current_stage=stage,
                pickup_date=timezone.now().date() + datetime.timedelta(days=random.randint(0, 3)),
                estimated_delivery=timezone.now().date() + datetime.timedelta(days=random.randint(2, 7)),
                special_instructions=f'Sample order {i+1} instructions' if random.choice([True, False]) else '',
                created_at=timezone.now() - datetime.timedelta(days=random.randint(0, 30))
            )
            
            # Add order items
            num_items = random.randint(1, 3)
            total_amount = Decimal('0')
            total_items = 0
            
            for j in range(num_items):
                service = random.choice(services)
                quantity = random.randint(1, 5)
                unit_price = service.price
                total_price = unit_price * quantity
                
                OrderItem.objects.create(
                    order=order,
                    service=service,
                    quantity=quantity,
                    unit_price=unit_price,
                    total_price=total_price
                )
                
                total_amount += total_price
                total_items += quantity
            
            # Update order totals
            order.amount = total_amount
            order.items = total_items
            order.update_progress()
            order.save()
            
            created_count += 1

        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {created_count} sample orders')
        )