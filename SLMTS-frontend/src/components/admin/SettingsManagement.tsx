/**
 * Settings Management Component for Admin Dashboard
 * Handles business settings and service management with real database integration
 */

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
    Save, Plus, Edit, Trash2, Search, Loader2, AlertCircle,
    Clock, DollarSign, Settings, Package
} from "lucide-react";

// Import our API services and hooks
import { useBusinessSettings, useServices, useService } from '@/hooks/useSettings';
import {
    BusinessSettings,
    UpdateBusinessSettingsRequest,
    Service,
    CreateServiceRequest,
    ServiceUnit,
    ServiceStatus
} from '@/services/api/types';

/**
 * Settings Management Component
 */
const SettingsManagement: React.FC = () => {
    // Business Settings Hook
    const {
        settings,
        loading: settingsLoading,
        error: settingsError,
        updateSettings,
        refresh: refreshSettings,
    } = useBusinessSettings();

    // Services Hook
    const {
        services,
        loading: servicesLoading,
        error: servicesError,
        totalCount: servicesCount,
        searchServices,
        filterByStatus,
        refresh: refreshServices,
    } = useServices();

    // Service Operations Hook
    const {
        createService,
        updateService,
        deleteService,
        loading: serviceActionLoading,
        error: serviceActionError,
    } = useService();

    // Local state for UI
    const [isEditingSettings, setIsEditingSettings] = useState(false);
    const [isAddingService, setIsAddingService] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [deleteConfirmService, setDeleteConfirmService] = useState<Service | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');

    // Form state for business settings
    const [settingsForm, setSettingsForm] = useState<UpdateBusinessSettingsRequest>({});

    // Form state for services
    const [serviceForm, setServiceForm] = useState<CreateServiceRequest>({
        name: '',
        description: '',
        price: 0,
        unit: 'per_item',
        status: 'active',
        created_by: 4, // TODO: Get from authenticated user context
    });

    // Initialize settings form when settings are loaded
    useEffect(() => {
        if (settings && !isEditingSettings) {
            setSettingsForm(settings);
        }
    }, [settings, isEditingSettings]);

    // Handle search and filter
    useEffect(() => {
        if (searchTerm) {
            searchServices(searchTerm);
        } else if (selectedStatus && selectedStatus !== 'all') {
            filterByStatus(selectedStatus as ServiceStatus);
        } else {
            refreshServices();
        }
    }, [searchTerm, selectedStatus, searchServices, filterByStatus, refreshServices]);

    // Handle settings form submission
    const handleSettingsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateSettings(settingsForm);
            setIsEditingSettings(false);
        } catch (error) {
            console.error('Failed to update settings:', error);
        }
    };

    // Handle service form submission
    const handleServiceSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingService) {
                await updateService(editingService.id, serviceForm);
                setEditingService(null);
            } else {
                await createService(serviceForm);
                setIsAddingService(false);
            }
            // Reset form
            setServiceForm({
                name: '',
                description: '',
                price: 0,
                unit: 'per_item',
                status: 'active',
                created_by: 4, // TODO: Get from authenticated user context
            });
            refreshServices();
        } catch (error) {
            console.error('Failed to save service:', error);
        }
    };

    // Handle service deletion
    const handleDeleteService = async (service: Service) => {
        try {
            await deleteService(service.id);
            setDeleteConfirmService(null);
            refreshServices();
        } catch (error) {
            console.error('Failed to delete service:', error);
        }
    };

    // Handle edit service
    const handleEditService = (service: Service) => {
        setEditingService(service);
        setServiceForm({
            name: service.name,
            description: service.description || '',
            price: Number(service.price),
            unit: service.unit,
            status: service.status,
            created_by: service.created_by,
        });
        setIsAddingService(true);
    };

    // Reset service form
    const resetServiceForm = () => {
        setServiceForm({
            name: '',
            description: '',
            price: 0,
            unit: 'per_item',
            status: 'active',
            created_by: 4, // TODO: Get from authenticated user context
        });
        setEditingService(null);
        setIsAddingService(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Settings Management</h2>
                    <p className="text-muted-foreground">
                        Manage business settings and services
                    </p>
                </div>
            </div>

            <Tabs defaultValue="business" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="business">Business Settings</TabsTrigger>
                    <TabsTrigger value="services">Services</TabsTrigger>
                </TabsList>

                {/* Business Settings Tab */}
                <TabsContent value="business" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="h-5 w-5" />
                                Business Configuration
                            </CardTitle>
                            <CardDescription>
                                Configure your laundry business settings and preferences
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {settingsLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-8 w-8 animate-spin" />
                                </div>
                            ) : settingsError ? (
                                <div className="flex items-center gap-2 text-red-600 py-4">
                                    <AlertCircle className="h-5 w-5" />
                                    <span>Failed to load settings: {settingsError}</span>
                                </div>
                            ) : (
                                <form onSubmit={handleSettingsSubmit} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="business_name">Business Name</Label>
                                            <Input
                                                id="business_name"
                                                value={settingsForm.business_name || ''}
                                                onChange={(e) => setSettingsForm(prev => ({
                                                    ...prev,
                                                    business_name: e.target.value
                                                }))}
                                                disabled={!isEditingSettings}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="business_email">Business Email</Label>
                                            <Input
                                                id="business_email"
                                                type="email"
                                                value={settingsForm.business_email || ''}
                                                onChange={(e) => setSettingsForm(prev => ({
                                                    ...prev,
                                                    business_email: e.target.value
                                                }))}
                                                disabled={!isEditingSettings}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="business_phone">Business Phone</Label>
                                            <Input
                                                id="business_phone"
                                                value={settingsForm.business_phone || ''}
                                                onChange={(e) => setSettingsForm(prev => ({
                                                    ...prev,
                                                    business_phone: e.target.value
                                                }))}
                                                disabled={!isEditingSettings}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="currency">Currency</Label>
                                            <Select
                                                value={settingsForm.currency || 'USD'}
                                                onValueChange={(value) => setSettingsForm(prev => ({
                                                    ...prev,
                                                    currency: value
                                                }))}
                                                disabled={!isEditingSettings}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="USD">USD ($)</SelectItem>
                                                    <SelectItem value="EUR">EUR (€)</SelectItem>
                                                    <SelectItem value="GBP">GBP (£)</SelectItem>
                                                    <SelectItem value="UGX">UGX (USh)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="business_address">Business Address</Label>
                                        <Textarea
                                            id="business_address"
                                            value={settingsForm.business_address || ''}
                                            onChange={(e) => setSettingsForm(prev => ({
                                                ...prev,
                                                business_address: e.target.value
                                            }))}
                                            disabled={!isEditingSettings}
                                            rows={3}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                id="order_updates"
                                                checked={settingsForm.order_updates || false}
                                                onCheckedChange={(checked) => setSettingsForm(prev => ({
                                                    ...prev,
                                                    order_updates: checked
                                                }))}
                                                disabled={!isEditingSettings}
                                            />
                                            <Label htmlFor="order_updates">Order updates</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                id="email_notifications"
                                                checked={settingsForm.email_notifications || false}
                                                onCheckedChange={(checked) => setSettingsForm(prev => ({
                                                    ...prev,
                                                    email_notifications: checked
                                                }))}
                                                disabled={!isEditingSettings}
                                            />
                                            <Label htmlFor="email_notifications">Email notifications</Label>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="flex justify-end gap-2">
                                        {isEditingSettings ? (
                                            <>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setIsEditingSettings(false);
                                                        setSettingsForm(settings || {});
                                                    }}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button type="submit" disabled={serviceActionLoading}>
                                                    {serviceActionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                    <Save className="mr-2 h-4 w-4" />
                                                    Save Changes
                                                </Button>
                                            </>
                                        ) : (
                                            <Button
                                                type="button"
                                                onClick={() => setIsEditingSettings(true)}
                                            >
                                                <Edit className="mr-2 h-4 w-4" />
                                                Edit Settings
                                            </Button>
                                        )}
                                    </div>
                                </form>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Services Tab */}
                <TabsContent value="services" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                Service Management
                            </CardTitle>
                            <CardDescription>
                                Manage your laundry services and pricing
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {/* Search and Filter Controls */}
                            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                        <Input
                                            placeholder="Search services..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Filter by status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button onClick={() => setIsAddingService(true)}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Service
                                </Button>
                            </div>

                            {/* Services Table */}
                            {servicesLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-8 w-8 animate-spin" />
                                </div>
                            ) : servicesError ? (
                                <div className="flex items-center gap-2 text-red-600 py-4">
                                    <AlertCircle className="h-5 w-5" />
                                    <span>Failed to load services: {servicesError}</span>
                                </div>
                            ) : (
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Service Name</TableHead>
                                                <TableHead>Description</TableHead>
                                                <TableHead>Price</TableHead>
                                                <TableHead>Unit</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Created</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {services.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                                        No services found. Add your first service to get started.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                services.map((service) => (
                                                    <TableRow key={service.id}>
                                                        <TableCell className="font-medium">{service.name}</TableCell>
                                                        <TableCell className="max-w-xs truncate">
                                                            {service.description || 'No description'}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-1">
                                                                <DollarSign className="h-4 w-4" />
                                                                {Number(service.price).toFixed(2)}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline">
                                                                {service.unit.replace('_', ' ')}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant={service.status === 'active' ? 'default' : 'secondary'}>
                                                                {service.status}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                                <Clock className="h-4 w-4" />
                                                                {new Date(service.created_at).toLocaleDateString()}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleEditService(service)}
                                                                >
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => setDeleteConfirmService(service)}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}

                            {/* Services Count */}
                            {servicesCount > 0 && (
                                <div className="flex items-center justify-between mt-4">
                                    <p className="text-sm text-muted-foreground">
                                        Showing {services.length} of {servicesCount} services
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Add/Edit Service Dialog */}
            <Dialog open={isAddingService} onOpenChange={(open) => {
                if (!open) resetServiceForm();
            }}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>
                            {editingService ? 'Edit Service' : 'Add New Service'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingService
                                ? 'Update the service details below.'
                                : 'Add a new laundry service with pricing information.'
                            }
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleServiceSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="service_name">Service Name</Label>
                            <Input
                                id="service_name"
                                value={serviceForm.name}
                                onChange={(e) => setServiceForm(prev => ({
                                    ...prev,
                                    name: e.target.value
                                }))}
                                placeholder="e.g., Wash & Fold"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="service_description">Description</Label>
                            <Textarea
                                id="service_description"
                                value={serviceForm.description}
                                onChange={(e) => setServiceForm(prev => ({
                                    ...prev,
                                    description: e.target.value
                                }))}
                                placeholder="Describe the service..."
                                rows={3}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="service_price">Price</Label>
                                <Input
                                    id="service_price"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={serviceForm.price}
                                    onChange={(e) => setServiceForm(prev => ({
                                        ...prev,
                                        price: parseFloat(e.target.value) || 0
                                    }))}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="service_unit">Unit</Label>
                                <Select
                                    value={serviceForm.unit}
                                    onValueChange={(value) => setServiceForm(prev => ({
                                        ...prev,
                                        unit: value as ServiceUnit
                                    }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="per_item">Per Item</SelectItem>
                                        <SelectItem value="per_kg">Per KG</SelectItem>
                                        <SelectItem value="per_load">Per Load</SelectItem>
                                        <SelectItem value="flat_rate">Flat Rate</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="service_status">Status</Label>
                            <Select
                                value={serviceForm.status}
                                onValueChange={(value) => setServiceForm(prev => ({
                                    ...prev,
                                    status: value as ServiceStatus
                                }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="outline" onClick={resetServiceForm}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={serviceActionLoading}>
                                {serviceActionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {editingService ? 'Update Service' : 'Add Service'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deleteConfirmService} onOpenChange={(open) => {
                if (!open) setDeleteConfirmService(null);
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Service</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{deleteConfirmService?.name}"?
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setDeleteConfirmService(null)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => deleteConfirmService && handleDeleteService(deleteConfirmService)}
                            disabled={serviceActionLoading}
                        >
                            {serviceActionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Delete Service
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default SettingsManagement;