"""
Custom authentication backend for SLMTS User model
"""

from django.contrib.auth.backends import BaseBackend
from django.contrib.auth.hashers import check_password
from .models import User


class EmailBackend(BaseBackend):
    """
    Custom authentication backend that allows users to login with email
    """
    
    def authenticate(self, request, username=None, password=None, **kwargs):
        """
        Authenticate user with email and password
        """
        try:
            # Try to find user by email
            user = User.objects.get(email=username)
            
            # Check password
            if user.check_password(password) and user.is_active:
                return user
        except User.DoesNotExist:
            return None
        
        return None
    
    def get_user(self, user_id):
        """
        Get user by ID
        """
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None