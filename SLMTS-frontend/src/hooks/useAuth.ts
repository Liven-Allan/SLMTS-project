import { useState, useEffect } from 'react';
import { authService } from '@/services/api/authService';
import { AuthUser, LoginRequest, RegisterRequest } from '@/services/api/types';

export const useAuth = () => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const savedUser = localStorage.getItem('auth_user');
                if (savedUser) {
                    setUser(JSON.parse(savedUser));
                    
                    // Load auth token if available
                    const authToken = localStorage.getItem('auth_token');
                    if (authToken) {
                        const { apiClient } = await import('@/services/api/client');
                        apiClient.setAuthToken(authToken);
                    }
                }
            } catch (error) {
                console.error('Error checking auth:', error);
                localStorage.removeItem('auth_user');
                localStorage.removeItem('auth_token');
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    const login = async (data: LoginRequest) => {
        try {
            setLoading(true);
            setError(null);
            const response = await authService.login(data);
            setUser(response.user);
            localStorage.setItem('auth_user', JSON.stringify(response.user));
            
            // Store auth token if provided
            if (response.token) {
                // Set token in API client
                const { apiClient } = await import('@/services/api/client');
                apiClient.setAuthToken(response.token);
            }
        } catch (error: any) {
            // Handle Django validation errors
            let errorMessage = 'Login failed';
            

            
            try {
                if (error && typeof error === 'object') {
                    if (error.details) {
                        // Handle different error formats from Django
                        if (error.details.non_field_errors) {
                            // Non-field errors (like "Invalid email or password")
                            const nonFieldErrors = error.details.non_field_errors;
                            if (Array.isArray(nonFieldErrors)) {
                                errorMessage = nonFieldErrors.join(', ');
                            } else if (typeof nonFieldErrors === 'string') {
                                errorMessage = nonFieldErrors;
                            } else {
                                errorMessage = String(nonFieldErrors);
                            }
                        } else {
                            // Field-specific errors
                            const errorEntries = Object.entries(error.details);
                            const errors = errorEntries
                                .map(([field, messages]: [string, any]) => {
                                    if (Array.isArray(messages)) {
                                        return `${field}: ${messages.join(', ')}`;
                                    }
                                    return `${field}: ${String(messages)}`;
                                })
                                .join('; ');
                            errorMessage = errors || String(error.message) || errorMessage;
                        }
                    } else if (error.message && typeof error.message === 'string') {
                        errorMessage = error.message;
                    } else if (error.message) {
                        errorMessage = String(error.message);
                    }
                } else if (typeof error === 'string') {
                    errorMessage = error;
                } else {
                    // Fallback for any other error type
                    errorMessage = 'An unexpected error occurred during login';
                }
            } catch (processingError) {
                console.error('Error processing login error:', processingError);
                errorMessage = 'An unexpected error occurred during login';
            }
            
            // Final safety check - ensure errorMessage is a string
            if (typeof errorMessage !== 'string' || errorMessage.length === 0) {
                errorMessage = 'Login failed - please try again';
            }
            

            setError(errorMessage);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const register = async (data: RegisterRequest) => {
        try {
            setLoading(true);
            setError(null);
            const response = await authService.register(data);
            setUser(response.user);
            localStorage.setItem('auth_user', JSON.stringify(response.user));
            
            // Store auth token if provided
            if (response.token) {
                const { apiClient } = await import('@/services/api/client');
                apiClient.setAuthToken(response.token);
            }
        } catch (error: any) {
            // Handle Django validation errors
            let errorMessage = 'Registration failed';
            

            
            if (error && typeof error === 'object') {
                if (error.details) {
                    // Handle different error formats from Django
                    if (error.details.non_field_errors) {
                        // Non-field errors
                        errorMessage = Array.isArray(error.details.non_field_errors) 
                            ? error.details.non_field_errors.join(', ')
                            : String(error.details.non_field_errors);
                    } else {
                        // Field-specific errors (like password validation)
                        const errors = Object.entries(error.details)
                            .map(([field, messages]: [string, any]) => {
                                if (Array.isArray(messages)) {
                                    return `${field}: ${messages.join(', ')}`;
                                }
                                return `${field}: ${String(messages)}`;
                            })
                            .join('; ');
                        errorMessage = errors || String(error.message) || errorMessage;
                    }
                } else if (error.message) {
                    errorMessage = String(error.message);
                }
            } else if (typeof error === 'string') {
                errorMessage = error;
            }
            
            // Ensure errorMessage is a string
            if (typeof errorMessage !== 'string') {
                errorMessage = 'An unexpected error occurred during registration';
            }
            
            setError(errorMessage);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            setLoading(true);
            await authService.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            localStorage.removeItem('auth_user');
            
            // Clear auth token
            const { apiClient } = await import('@/services/api/client');
            apiClient.setAuthToken(null);
            
            setLoading(false);
        }
    };

    const updateUser = (updatedUser: AuthUser) => {
        setUser(updatedUser);
        localStorage.setItem('auth_user', JSON.stringify(updatedUser));
    };

    const clearError = () => setError(null);
    const isAuthenticated = !!user;

    return {
        user,
        loading,
        error,
        login,
        register,
        logout,
        updateUser,
        clearError,
        isAuthenticated,
    };
};