export type QuoteStatus = 'draft' | 'sent' | 'approved' | 'rejected';
export type ProductType = 'product' | 'service';
export type DiscountType = 'fixed' | 'percentage';

export interface User { id: number; name: string; email: string; role: 'admin' | 'user' }
export interface Client { id: number; name: string; email: string; phone: string; company: string | null; notes: string | null; created_at: string; updated_at: string }
export interface Product { id: number; name: string; description: string | null; unit_price: number; type: ProductType; is_active: boolean; created_at: string; updated_at: string }
export interface QuoteItem { id?: number; product_id?: number | null; item_name: string; item_description?: string | null; quantity: number; unit_price: number; total?: number }
export interface StatusHistory { id: number; previous_status: QuoteStatus | null; new_status: QuoteStatus; changed_by_name?: string; created_at: string }
export interface Quote {
  id: number; quote_number: string; client_id: number; client_name?: string; client_email?: string; client_phone?: string; client_company?: string | null;
  status: QuoteStatus; subtotal: number; discount_type: DiscountType; discount_value: number; discount_amount: number; total: number;
  notes: string | null; valid_until: string; pdf_path: string | null; created_at: string; updated_at: string; items?: QuoteItem[]; history?: StatusHistory[];
}
export interface QuotePayload { client_id: number; status: QuoteStatus; discount_type: DiscountType; discount_value: number; notes: string | null; valid_until: string; items: QuoteItem[] }
export interface Pagination { page: number; limit: number; total: number; totalPages: number }
export interface Paginated<T> { items: T[]; pagination: Pagination }
export interface ApiResponse<T> { success: true; message: string; data: T }
export interface ApiFieldError { field: string; message: string }
export interface ApiError { success: false; message: string; errors: ApiFieldError[] }
export interface DashboardData { total_quotes: number; sent_quotes: number; approved_quotes: number; rejected_quotes: number; total_value: number; approved_value: number; recent_quotes: Quote[] }
