"""
Custom Token Authentication for SLMTS
Works with our custom User and AuthToken models
"""

from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from .models import AuthToken


class CustomTokenAuthentication(BaseAuthentication):
    """
    Custom token authentication using our AuthToken model
    """
    keyword = 'Token'
    
    def authenticate(self, request):
        auth = request.META.get('HTTP_AUTHORIZATION')
        
        if not auth or not auth.startswith(f'{self.keyword} '):
            return None
        
        try:
            token_key = auth.split(' ')[1]
            token = AuthToken.objects.select_related('user').get(key=token_key)
            
            if not token.user.is_active:
                raise AuthenticationFailed('User inactive or deleted.')
            
            return (token.user, token)
            
        except AuthToken.DoesNotExist:
            raise AuthenticationFailed('Invalid token.')
        except IndexError:
            raise AuthenticationFailed('Invalid token header.')
    
    def authenticate_header(self, request):
        return self.keyword