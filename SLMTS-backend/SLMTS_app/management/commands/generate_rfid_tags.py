"""
Management command to generate RFID tags for existing orders
"""

from django.core.management.base import BaseCommand
from SLMTS_app.models import Order, RFIDTag
import random

class Command(BaseCommand):
    help = 'Generate RFID tags for existing orders'

    def add_arguments(self, parser):
        parser.add_argument(
            '--order-id',
            type=str,
            help='Generate tags for a specific order ID',
        )

    def handle(self, *args, **options):
        order_id = options.get('order_id')
        
        if order_id:
            try:
                order = Order.objects.get(order_id=order_id)
                orders = [order]
            except Order.DoesNotExist:
                self.stdout.write(self.style.ERROR(f'Order {order_id} not found'))
                return
        else:
            # Get all orders that don't have RFID tags yet
            orders = Order.objects.filter(rfid_tags__isnull=True).distinct()
        
        if not orders:
            self.stdout.write(self.style.WARNING('No orders found that need RFID tags'))
            return
        
        # Sample item descriptions for different types of laundry items
        item_types = [
            ('shirt', ['Blue Cotton Shirt', 'White Dress Shirt', 'Polo Shirt', 'T-Shirt']),
            ('pants', ['Black Dress Pants', 'Jeans', 'Khaki Pants', 'Trousers']),
            ('dress', ['Summer Dress', 'Evening Dress', 'Casual Dress']),
            ('towel', ['Bath Towel', 'Hand Towel', 'Beach Towel']),
            ('bedding', ['Bed Sheet', 'Pillow Case', 'Comforter']),
            ('jacket', ['Blazer', 'Windbreaker', 'Suit Jacket']),
            ('underwear', ['Undergarments', 'Socks', 'Lingerie']),
        ]
        
        created_count = 0
        
        for order in orders:
            # Generate RFID tags based on the number of items in the order
            num_items = order.items or random.randint(3, 8)
            
            for i in range(num_items):
                # Randomly select an item type and description
                item_type, descriptions = random.choice(item_types)
                item_description = random.choice(descriptions)
                
                # Create RFID tag
                tag = RFIDTag.objects.create(
                    order=order,
                    item_description=item_description,
                    item_type=item_type,
                    status='pending'
                )
                
                created_count += 1
                
                self.stdout.write(f'Created tag {tag.tag_id} for {item_description} in order {order.order_id}')
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {created_count} RFID tags for {len(orders)} orders')
        )