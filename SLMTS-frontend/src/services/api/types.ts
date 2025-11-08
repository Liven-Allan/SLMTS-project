/**
 * TypeScript Types for API Data
 * Defines interfaces for all data structures used in API communication
 */

// =============================================================================
// USER TYPES
// =============================================================================

export type UserRole = 'customer' | 'staff' | 'driver' | 'admin';
export type UserStatus = 'active' | 'break' | 'inactive';

export interface CustomerPreferences {
  detergent: 'eco-friendly' | 'regular' | 'sensitive' | 'fragrance-free';
  fabric_softener: boolean;
  starch: boolean;
  special_instructions: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  address?: string;
  
  // Customer-specific fields
  orders_count?: number;
  total_spent?: string;
  
  // Staff-specific fields
  station?: string;
  shift?: string;
  tasks_completed?: number;
  efficiency_rating?: number;
  items_processed?: number;
  
  // Driver-specific fields
  vehicle?: string;
  route?: string;
  deliveries_completed?: number;
  driver_rating?: number;
  total_distance?: number;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  
  // Related data
  preferences?: CustomerPreferences;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status?: UserStatus;
  address?: string;
  
  // Role-specific fields
  station?: string;
  shift?: string;
  vehicle?: string;
  route?: string;
  
  // Customer preferences
  preferences?: Partial<CustomerPreferences>;
}

export interface UpdateUserRequest extends Partial<CreateUserRequest> {
  id: number;
}

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface UserStats {
  total_users: number;
  by_role: {
    customers: number;
    staff: number;
    drivers: number;
    admins: number;
  };
  by_status: {
    active: number;
    inactive: number;
    on_break: number;
  };
}

export interface UsersByRole {
  customers: User[];
  staff: User[];
  drivers: User[];
  admins: User[];
}

// =============================================================================
// ERROR TYPES
// =============================================================================

export interface ApiError {
  message: string;
  status: number;
  details?: Record<string, string[]>;
}

export interface ValidationError {
  field: string;
  message: string;
}

// =============================================================================
// QUERY PARAMETERS
// =============================================================================

export interface UserQueryParams {
  role?: UserRole;
  status?: UserStatus;
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}

// =============================================================================
// BUSINESS SETTINGS TYPES
// =============================================================================

export interface BusinessSettings {
  id?: number;
  opening_time: string;
  closing_time: string;
  working_days: string[];
  business_name: string;
  business_address?: string;
  business_phone?: string;
  business_email?: string;
  tax_rate: number;
  currency: string;
  email_notifications: boolean;
  sms_notifications: boolean;
  order_updates: boolean;
  payment_reminders: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface UpdateBusinessSettingsRequest extends Partial<BusinessSettings> {}

// =============================================================================
// SERVICE TYPES
// =============================================================================

export type ServiceUnit = 'per_kg' | 'per_item' | 'flat_rate';
export type ServiceStatus = 'active' | 'inactive';

export interface Service {
  id: number;
  name: string;
  description?: string;
  price: string; // Django DecimalField serializes as string
  unit: ServiceUnit;
  status: ServiceStatus;
  created_by: number;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateServiceRequest {
  name: string;
  description?: string;
  price: number;
  unit: ServiceUnit;
  status?: ServiceStatus;
  created_by: number;
}

export interface UpdateServiceRequest extends Partial<CreateServiceRequest> {
  id: number;
}

export interface ServiceStats {
  total_services: number;
  active_services: number;
  inactive_services: number;
  by_unit: {
    per_kg: number;
    per_item: number;
    flat_rate: number;
  };
}

export interface ServiceQueryParams {
  status?: ServiceStatus;
  unit?: ServiceUnit;
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}

// =============================================================================
// AUTHENTICATION TYPES
// =============================================================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  password_confirm: string;
  name: string;
  phone: string;
  role?: 'customer' | 'staff' | 'driver' | 'admin';
  address?: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token?: string;
}

// Use User type as AuthUser for consistency
export type AuthUser = User;

// =============================================================================
// ORDER TYPES
// =============================================================================

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';

export type OrderStage = 
  | 'order_placed' 
  | 'pickup_confirmed' 
  | 'items_received' 
  | 'washing' 
  | 'drying' 
  | 'folding' 
  | 'quality_check' 
  | 'ready_for_delivery' 
  | 'out_for_delivery' 
  | 'delivered';

export interface OrderItem {
  id?: number;
  service: number;
  service_name?: string;
  service_unit?: string;
  quantity: number;
  unit_price?: string;
  total_price?: string;
  special_instructions?: string;
}

export interface OrderTimeline {
  id?: number;
  stage: string;
  completed: boolean;
  is_current: boolean;
  timestamp?: string;
  notes?: string;
}

export interface Order {
  id: number;
  order_id: string;
  customer?: User;
  customer_id?: number;
  assigned_to?: User;
  assigned_to_id?: number;
  status: OrderStatus;
  current_stage: OrderStage;
  amount: number;
  items: number;
  progress: number;
  pickup_date?: string;
  estimated_delivery?: string;
  delivery_date?: string;
  special_instructions?: string;
  order_items?: OrderItem[];
  timeline?: OrderTimeline[];
  created_at: string;
  updated_at: string;
}

export interface CreateOrderRequest {
  customer?: number;
  pickup_date?: string;
  estimated_delivery?: string;
  special_instructions?: string;
  order_items: OrderItem[];
}

export interface OrderStats {
  total_orders: number;
  by_status: {
    pending: number;
    processing: number;
    completed: number;
    cancelled: number;
  };
  by_stage: Record<OrderStage, number>;
}

// =============================================================================
// RFID TAG TYPES
// =============================================================================

export type RFIDTagStatus = 'pending' | 'scanned' | 'verified' | 'completed';

export interface RFIDTag {
  id: number;
  tag_id: string;
  order: number;
  order_id: string;
  individual_item?: number;
  item_description: string;
  item_type: string;
  display_name: string;
  service_name: string;
  status: RFIDTagStatus;
  verified_by?: number;
  verified_by_name?: string;
  verified_at?: string;
  verification_notes: string;
  created_at: string;
  updated_at: string;
}

export interface CreateRFIDTagRequest {
  order: number;
  item_description: string;
  item_type?: string;
}

export interface VerifyRFIDTagRequest {
  verification_notes?: string;
}