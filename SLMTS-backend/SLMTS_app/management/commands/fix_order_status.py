"""
Django management command to fix order status based on current stage
This will update existing orders to have the correct status based on their current stage
"""

from django.core.management.base import BaseCommand
from SLMTS_app.models import Order


class Command(BaseCommand):
    help = 'Fix order status based on current stage for existing orders'

    def handle(self, *args, **options):
        self.stdout.write('Fixing order status based on current stage...')
        
        # Get all orders
        orders = Order.objects.all()
        updated_count = 0
        
        for order in orders:
            old_status = order.status
            
            # Apply the same logic as in the update_stage view
            if order.current_stage in ['order_placed', 'pickup_confirmed']:
                new_status = 'pending'
            elif order.current_stage in ['items_received', 'washing', 'drying', 'folding', 'quality_check', 'ready_for_delivery', 'out_for_delivery']:
                new_status = 'processing'
            elif order.current_stage == 'delivered':
                new_status = 'completed'
            else:
                new_status = 'pending'  # Default fallback
            
            # Update if status needs to change
            if old_status != new_status:
                order.status = new_status
                order.save()
                updated_count += 1
                self.stdout.write(
                    f'Updated {order.order_id}: {old_status} -> {new_status} (stage: {order.current_stage})'
                )
        
        if updated_count == 0:
            self.stdout.write(
                self.style.SUCCESS('No orders needed status updates - all are already correct!')
            )
        else:
            self.stdout.write(
                self.style.SUCCESS(f'Successfully updated {updated_count} orders!')
            )