export interface EggDelivery {
  id: string;
  supplier_name: string;
  phone_number: string | null;
  delivery_date: string;
  trays: number;
  price_per_tray: number;
  total_amount: number;
  payment_status: 'pending' | 'paid' | 'overdue';
  delivery_location: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface DeliveryFormData {
  supplier_name: string;
  phone_number?: string;
  delivery_date: string;
  trays: number;
  price_per_tray: number;
  payment_status: 'pending' | 'paid' | 'overdue';
  delivery_location?: string;
  notes?: string;
}

export interface DeliveryFilters {
  supplier_name?: string;
  payment_status?: 'pending' | 'paid' | 'overdue' | 'all';
  start_date?: string;
  end_date?: string;
}

export interface DeliveryStats {
  total_deliveries: number;
  total_trays: number;
  total_revenue: number;
  paid_deliveries: number;
  pending_deliveries: number;
  overdue_deliveries: number;
  unique_suppliers: number;
}