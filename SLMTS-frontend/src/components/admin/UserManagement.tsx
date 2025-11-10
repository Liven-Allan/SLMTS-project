/**
 * User Management Component for Admin Dashboard
 * Handles CRUD operations for users with real database integration
 */

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserPlus, Edit, Trash2, Eye, Search, Filter, Loader2, AlertCircle } from "lucide-react";

// Import our API services and hooks
import { useUsers, useUser } from '@/hooks/useUsers';
import { User, CreateUserRequest, UserRole, UserStatus } from '@/services/api/types';

/**
 * User Management Component
 */
const UserManagement: React.FC = () => {
  // State management using custom hooks
  const {
    users,
    loading: usersLoading,
    error: usersError,
    totalCount,
    searchUsers,
    filterByRole,
    filterByStatus,
    refresh: refreshUsers,
  } = useUsers();

  // Debug logging to see what data we're getting
  React.useEffect(() => {
    console.log('UserManagement - Users data:', users);
    console.log('UserManagement - Loading:', usersLoading);
    console.log('UserManagement - Error:', usersError);
    
    // Log specific staff users
    const staffUsers = users.filter(user => user.role === 'staff');
    console.log('Staff users:', staffUsers);
    staffUsers.forEach(user => {
      console.log(`${user.name}: ${user.tasks_completed} tasks completed`);
    });
  }, [users, usersLoading, usersError]);

  const {
    createUser,
    updateUser,
    deleteUser,
    loading: userActionLoading,
    error: userActionError,
  } = useUser();

  // Local state for UI
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [deleteConfirm, setDeleteConfirm] = useState<User | null>(null);

  // Form state for new/edit user
  const [formData, setFormData] = useState<CreateUserRequest>({
    name: '',
    email: '',
    phone: '',
    role: 'customer',
    status: 'active',
    address: '',
  });

  /**
   * Handle search input change
   */
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    if (value.trim()) {
      searchUsers(value);
    } else {
      refreshUsers();
    }
  };

  /**
   * Handle role filter change
   */
  const handleRoleFilter = (role: string) => {
    setSelectedRole(role);
    filterByRole(role === 'all' ? undefined : role);
  };

  /**
   * Handle status filter change
   */
  const handleStatusFilter = (status: string) => {
    setSelectedStatus(status);
    filterByStatus(status === 'all' ? undefined : status);
  };

  /**
   * Reset form data
   */
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'customer',
      status: 'active',
      address: '',
    });
  };

  /**
   * Handle form submission for creating user
   */
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newUser = await createUser(formData);
    if (newUser) {
      setIsAddingUser(false);
      resetForm();
      refreshUsers();
    }
  };

  /**
   * Handle form submission for updating user
   */
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingUser) return;
    
    const updatedUser = await updateUser(editingUser.id, formData);
    if (updatedUser) {
      setEditingUser(null);
      resetForm();
      refreshUsers();
    }
  };

  /**
   * Handle user deletion
   */
  const handleDeleteUser = async (user: User) => {
    const success = await deleteUser(user.id);
    if (success) {
      setDeleteConfirm(null);
      refreshUsers();
    }
  };

  /**
   * Open edit dialog with user data
   */
  const openEditDialog = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      address: user.address || '',
      station: user.station || '',
      shift: user.shift || '',
      vehicle: user.vehicle || '',
      route: user.route || '',
    });
  };

  /**
   * Get role-specific performance display
   */
  const getRolePerformance = (user: User) => {
    switch (user.role) {
      case 'customer':
        return `${user.orders_count || 0} orders • ${user.total_spent || 'UGX 0'}`;
      case 'staff':
        return `${user.tasks_completed || 0} tasks completed`;
      case 'driver':
        return `${user.deliveries_completed || 0} deliveries • ${user.driver_rating || 0}★`;
      default:
        return 'N/A';
    }
  };

  /**
   * Get role color for badges
   */
  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'customer': return 'bg-primary/10 text-primary';
      case 'staff': return 'bg-secondary/10 text-secondary';
      case 'driver': return 'bg-accent/10 text-accent';
      case 'admin': return 'bg-destructive/10 text-destructive';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  /**
   * Get status color for badges
   */
  const getStatusColor = (status: UserStatus) => {
    switch (status) {
      case 'active': return 'bg-secondary text-secondary-foreground';
      case 'break': return 'bg-accent text-accent-foreground';
      case 'inactive': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">User Management</h2>
          <p className="text-muted-foreground">Manage customers, staff, and drivers</p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => {
              console.log('Manual refresh clicked');
              refreshUsers();
            }}
          >
            Refresh Data
          </Button>
          
          {/* Add User Dialog */}
          <Dialog open={isAddingUser} onOpenChange={setIsAddingUser}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary">
                <UserPlus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>Create a new user account</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter full name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter email address"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Enter phone number"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">Customer</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="driver">Driver</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Role-specific fields */}
              {formData.role === 'staff' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="station">Station</Label>
                    <Input
                      id="station"
                      value={formData.station || ''}
                      onChange={(e) => setFormData({ ...formData, station: e.target.value })}
                      placeholder="e.g., Station 3"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shift">Shift</Label>
                    <Input
                      id="shift"
                      value={formData.shift || ''}
                      onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                      placeholder="e.g., Morning (8:00 AM - 4:00 PM)"
                    />
                  </div>
                </>
              )}
              
              {formData.role === 'driver' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="vehicle">Vehicle</Label>
                    <Input
                      id="vehicle"
                      value={formData.vehicle || ''}
                      onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
                      placeholder="e.g., UBD 123X"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="route">Route</Label>
                    <Input
                      id="route"
                      value={formData.route || ''}
                      onChange={(e) => setFormData({ ...formData, route: e.target.value })}
                      placeholder="e.g., Central Kampala"
                    />
                  </div>
                </>
              )}
              
              {/* Error display */}
              {userActionError && (
                <div className="flex items-center gap-2 text-destructive text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {userActionError}
                </div>
              )}
              
              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setIsAddingUser(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-primary"
                  disabled={userActionLoading}
                >
                  {userActionLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create User'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* View User Modal */}
      <Dialog open={!!viewingUser} onOpenChange={() => setViewingUser(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>View user information and performance</DialogDescription>
          </DialogHeader>
          {viewingUser && (
            <div className="space-y-4">
              {/* User Avatar and Basic Info */}
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center text-white text-xl font-semibold">
                  {viewingUser.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground">{viewingUser.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={getRoleColor(viewingUser.role)} variant="outline">
                      {viewingUser.role}
                    </Badge>
                    <Badge className={getStatusColor(viewingUser.status)} variant="outline">
                      {viewingUser.status}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-muted-foreground">EMAIL</Label>
                  <p className="text-sm font-medium">{viewingUser.email}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-muted-foreground">PHONE</Label>
                  <p className="text-sm font-medium">{viewingUser.phone}</p>
                </div>
                {viewingUser.address && (
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-muted-foreground">ADDRESS</Label>
                    <p className="text-sm font-medium">{viewingUser.address}</p>
                  </div>
                )}
              </div>

              {/* Role-specific Information */}
              {viewingUser.role === 'staff' && (
                <div className="space-y-3 p-3 bg-secondary/10 rounded-lg">
                  <h4 className="text-sm font-semibold text-foreground">Staff Information</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {viewingUser.station && (
                      <div className="space-y-1">
                        <Label className="text-xs font-medium text-muted-foreground">STATION</Label>
                        <p className="text-sm font-medium">{viewingUser.station}</p>
                      </div>
                    )}
                    {viewingUser.shift && (
                      <div className="space-y-1">
                        <Label className="text-xs font-medium text-muted-foreground">SHIFT</Label>
                        <p className="text-sm font-medium">{viewingUser.shift}</p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-muted-foreground">PERFORMANCE</Label>
                    <p className="text-sm font-medium">{getRolePerformance(viewingUser)}</p>
                  </div>
                </div>
              )}

              {viewingUser.role === 'driver' && (
                <div className="space-y-3 p-3 bg-accent/10 rounded-lg">
                  <h4 className="text-sm font-semibold text-foreground">Driver Information</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {viewingUser.vehicle && (
                      <div className="space-y-1">
                        <Label className="text-xs font-medium text-muted-foreground">VEHICLE</Label>
                        <p className="text-sm font-medium">{viewingUser.vehicle}</p>
                      </div>
                    )}
                    {viewingUser.route && (
                      <div className="space-y-1">
                        <Label className="text-xs font-medium text-muted-foreground">ROUTE</Label>
                        <p className="text-sm font-medium">{viewingUser.route}</p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-muted-foreground">PERFORMANCE</Label>
                    <p className="text-sm font-medium">{getRolePerformance(viewingUser)}</p>
                  </div>
                </div>
              )}

              {viewingUser.role === 'customer' && (
                <div className="space-y-3 p-3 bg-primary/10 rounded-lg">
                  <h4 className="text-sm font-semibold text-foreground">Customer Information</h4>
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-muted-foreground">ORDER HISTORY</Label>
                    <p className="text-sm font-medium">{getRolePerformance(viewingUser)}</p>
                  </div>
                </div>
              )}

              {/* Account Information */}
              <div className="space-y-3 p-3 bg-muted/30 rounded-lg">
                <h4 className="text-sm font-semibold text-foreground">Account Information</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-muted-foreground">USER ID</Label>
                    <p className="text-sm font-medium">#{viewingUser.id}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-muted-foreground">JOINED</Label>
                    <p className="text-sm font-medium">
                      {viewingUser.created_at ? new Date(viewingUser.created_at).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <div className="flex justify-end pt-2 border-t">
                <Button variant="outline" size="sm" onClick={() => setViewingUser(null)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information</DialogDescription>
          </DialogHeader>
          {editingUser && (
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Full Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter full name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter email address"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone *</Label>
                <Input
                  id="edit-phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Enter phone number"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-address">Address</Label>
                <Input
                  id="edit-address"
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Enter address"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-role">Role *</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">Customer</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="driver">Driver</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as UserStatus })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="break">On Break</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Role-specific fields for editing */}
              {formData.role === 'staff' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="edit-station">Station</Label>
                    <Input
                      id="edit-station"
                      value={formData.station || ''}
                      onChange={(e) => setFormData({ ...formData, station: e.target.value })}
                      placeholder="e.g., Station 3"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-shift">Shift</Label>
                    <Input
                      id="edit-shift"
                      value={formData.shift || ''}
                      onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                      placeholder="e.g., Morning (8:00 AM - 4:00 PM)"
                    />
                  </div>
                </>
              )}
              
              {formData.role === 'driver' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="edit-vehicle">Vehicle</Label>
                    <Input
                      id="edit-vehicle"
                      value={formData.vehicle || ''}
                      onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
                      placeholder="e.g., UBD 123X"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-route">Route</Label>
                    <Input
                      id="edit-route"
                      value={formData.route || ''}
                      onChange={(e) => setFormData({ ...formData, route: e.target.value })}
                      placeholder="e.g., Central Kampala"
                    />
                  </div>
                </>
              )}
              
              {/* Error display */}
              {userActionError && (
                <div className="flex items-center gap-2 text-destructive text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {userActionError}
                </div>
              )}
              
              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setEditingUser(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-primary"
                  disabled={userActionLoading}
                >
                  {userActionLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update User'
                  )}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Filters and Search */}
      <Card className="shadow-card border-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Users ({totalCount})</CardTitle>
              <CardDescription>Manage all system users</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  className="pl-10 w-64"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
              <Select value={selectedRole} onValueChange={handleRoleFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="customer">Customers</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="driver">Drivers</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={handleStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="break">On Break</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Loading State */}
          {usersLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading users...</span>
            </div>
          )}

          {/* Error State */}
          {usersError && (
            <div className="flex items-center justify-center py-8 text-destructive">
              <AlertCircle className="h-5 w-5 mr-2" />
              {usersError}
            </div>
          )}

          {/* Users Table */}
          {!usersLoading && !usersError && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white text-xs font-semibold">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRoleColor(user.role)} variant="outline">
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(user.status)} variant="outline">
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {getRolePerformance(user)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setViewingUser(user)}
                          title="View user details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(user)}
                          title="Edit user"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleteConfirm(user)}
                          title="Delete user"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Empty State */}
          {!usersLoading && !usersError && users.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No users found. Try adjusting your search or filters.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteConfirm?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setDeleteConfirm(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => deleteConfirm && handleDeleteUser(deleteConfirm)}
              disabled={userActionLoading}
            >
              {userActionLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete User'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;