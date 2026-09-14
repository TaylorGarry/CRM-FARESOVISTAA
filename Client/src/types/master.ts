export type MasterStatus = 'Enabled' | 'Disabled';

export interface BookingType {
  _id: string;
  call_type_name: string;
  call_type_status: MasterStatus;
  add_by?: string;
  add_date?: string;
  update_by?: string;
  update_date?: string;
  delete_status?: boolean;
}

export interface Currency {
  _id: string;
  currency_name: string;
  crency_symbol: string;
  currency_status: MasterStatus;
  add_by?: string;
  add_date?: string;
  update_by?: string;
  update_date?: string;
  delete_status?: boolean;
}

export interface Source {
  _id: string;
  source_name: string;
  source_status: MasterStatus;
  add_by?: string;
  add_date?: string;
  update_by?: string;
  update_date?: string;
  delete_status?: boolean;
}

export interface CardType {
  _id: string;
  card_type_name: string;
  card_type_status: MasterStatus;
  add_by?: string;
  add_date?: string;
  update_by?: string;
  update_date?: string;
  delete_status?: boolean;
}

export interface EmailTemplate {
  _id: string;
  tamplate_name: string;
  Template_Type: 'New booking' | 'Changing';
  email_sub: string;
  email_body: string;
  status: MasterStatus;
  add_by?: string;
  add_date?: string;
  update_by?: string;
  update_date?: string;
  delete_status?: boolean;
}

export interface SaleType {
  _id: string;
  seal_type: string;
  seal_status: MasterStatus;
  add_by?: string;
  add_date?: string;
  update_by?: string;
  update_date?: string;
  delete_status?: boolean;
}

export interface AssignBookingStatus {
  _id: string;
  role_id: string | { _id: string; role_id?: string; role_name: string };
  role_name?: string;
  bookingstatusname: string;
  color: string;
  status: MasterStatus;
  add_by?: string;
  add_date?: string;
  update_by?: string;
  update_date?: string;
  delete_status?: boolean;
}

export interface RoleOption {
  _id: string;
  role_id?: string;
  role_name: string;
}

export interface MasterApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
}