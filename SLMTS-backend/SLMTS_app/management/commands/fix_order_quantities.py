"""
Django management command to fix order item quantities to match individual items
This will update OrderItem quantities to match the actual number of IndividualItems
"""

from django.core.management.base import BaseCommand
from SLMTS_app.models import Order, OrderItem, IndividualItem


class Command(BaseCommand):
    help = 'Fix order item quantities to match individual items count'

    def handle(self, *args, **options):
        self.stdout.write('Fixing order item quantities...')
        
        # Get all orders
        orders = Order.objects.all()
        updated_count = 0
        
        for order in orders:
            self.stdout.write(f'\nChecking order: {order.order_id}')
            
            for order_item in order.order_items.all():
                individual_items_count = order_item.individual_items.count()
                old_quantity = order_item.quantity
                
                if individual_items_count > 0 and individual_items_count != int(old_quantity):
                    # Update quantity to match individual items count
                    order_item.quantity = individual_items_count
                    order_item.save()  # This will recalculate total_price
                    
                    updated_count += 1
                    self.stdout.write(
                        f'  Updated {order_item.service.name}: {old_quantity} -> {individual_items_count} items'
                    )
                elif individual_items_count > 0:
                    self.stdout.write(
                        f'  {order_item.service.name}: {old_quantity} items (already correct)'
                    )
            
            # Recalculate order totals
            order.calculate_totals()
        
        if updated_count == 0:
            self.stdout.write(
                self.style.SUCCESS('No order items needed quantity updates - all are already correct!')
            )
        else:
            self.stdout.write(
                self.style.SUCCESS(f'Successfully updated {updated_count} order items!')
            )