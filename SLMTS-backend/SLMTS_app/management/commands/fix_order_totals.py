"""
Django management command to fix order totals and item counts
This will recalculate totals for existing orders to use individual items count
"""

from django.core.management.base import BaseCommand
from SLMTS_app.models import Order


class Command(BaseCommand):
    help = 'Fix order totals to count individual items correctly'

    def handle(self, *args, **options):
        self.stdout.write('Fixing order totals...')
        
        # Get all orders
        orders = Order.objects.all()
        updated_count = 0
        
        for order in orders:
            old_items = order.items
            
            # Recalculate totals using the new logic
            order.calculate_totals()
            
            # Reload to get updated values
            order.refresh_from_db()
            new_items = order.items
            
            if old_items != new_items:
                updated_count += 1
                self.stdout.write(
                    f'Updated {order.order_id}: {old_items} -> {new_items} items'
                )
        
        if updated_count == 0:
            self.stdout.write(
                self.style.SUCCESS('No orders needed item count updates - all are already correct!')
            )
        else:
            self.stdout.write(
                self.style.SUCCESS(f'Successfully updated {updated_count} orders!')
            )