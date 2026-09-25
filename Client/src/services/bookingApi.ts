import { api } from './api';

export interface BookingPax {
  type: 'Adult' | 'Child' | 'Infant';
  gender: 'Male' | 'Female';
  first_name: string;
  middle_name?: string;
  last_name: string;
  dob?: string;
  passport_number?: string;
  pid?: string;
  ped?: string;
}

export interface BookingRecord {
  _id: string;
  pnr: string;
  airline_pnr?: string;
  customer_name: string;
  email?: string;
  billing_phone?: string;
  alternate_phone?: string;
  pax: BookingPax[];
  trip_type: 'Oneway' | 'Roundtrip';
  from: string;
  destination: string;
  departure_date?: string;
  return_date?: string;
  reason_of_sale?: string;
  itinerary_html?: string;
  total_amount?: number;
  ticket_cost?: number;
  airline_fee?: number;
  mco?: number;
  currency: 'USD' | 'CAD';

  card_number?: string;
  cvv?: string;
  card_holder_name?: string;
  card_type?: string;
  card_expiry_month?: string;
  card_expiry_year?: string;

  billing_address?: string;

  // structured address
  address?: string;
  address1?: string;
  country_code?: string;
  state?: string;
  city?: string;
  pincode?: string;

  // booking info extras
  booking_ip?: string;
  booking_date?: string | null;
  gk_pnr?: string;
  hk_pnr?: string;
  airline_name?: string;
  quoted_fare?: number;
  issuance_fee?: number;
  arc?: string;
  net_mco?: number;

  booking_status: string;
  remarks?: string;

  // lock fields
  locked_by?: string | null;
  locked_by_login?: string | null;
  locked_by_name?: string | null;
  locked_at?: string | null;
  lock_session_id?: string | null;

  add_by?: string | null;
  add_date?: string;
  update_by?: string | null;
  update_date?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface BookingPayload
  extends Omit<
    BookingRecord,
    | '_id'
    | 'add_by'
    | 'add_date'
    | 'update_by'
    | 'update_date'
    | 'createdAt'
    | 'updatedAt'
    | 'locked_by'
    | 'locked_by_login'
    | 'locked_by_name'
    | 'locked_at'
    | 'lock_session_id'
  > {}

/* ------------------------------------------------------------------ */
/* History + Assignment types                                          */
/* ------------------------------------------------------------------ */

export interface BookingHistoryRecord {
  _id: string;
  booking_id: string;
  pnr: string;
  booking_status: string;
  remarks: string;
  update_by: string;
  update_by_login: string;
  update_by_name: string;
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

export interface BookingAssignmentRecord {
  _id: string;
  booking_id: string;
  pnr: string;
  assign_by: string;
  assign_by_login: string;
  assign_by_name: string;
  department: string;
  assign_to: string;
  assign_to_login: string;
  assign_to_name: string;
  remarks: string;
  assign_date: string;
  created_at: string;
  updated_at: string;
}

export interface MyLockResponse {
  success: boolean;
  has_lock: boolean;
  lock: {
    booking_id: string;
    pnr: string;
    locked_at: string;
    session_id: string;
  } | null;
}

export interface LockAcquireResponse {
  success: boolean;
  locked: boolean;
  session_id?: string;
  locked_at?: string;
  locked_by?: string;
  locked_by_login?: string;
  locked_by_name?: string;
  code?: string;
  message?: string;
  other_lock?: { booking_id: string; pnr: string };
}

/* ------------------------------------------------------------------ */
/* Response envelopes                                                  */
/* ------------------------------------------------------------------ */

interface ListResponse {
  success: boolean;
  count: number;
  total: number;
  page: number;
  limit: number;
  data: BookingRecord[];
}

interface ItemResponse {
  success: boolean;
  message?: string;
  data: BookingRecord;
}

interface SimpleResponse {
  success: boolean;
  message: string;
}

interface HistoryListResponse {
  success: boolean;
  count: number;
  data: BookingHistoryRecord[];
}

interface AssignmentListResponse {
  success: boolean;
  count: number;
  data: BookingAssignmentRecord[];
}

/* ------------------------------------------------------------------ */
/* API                                                                 */
/* ------------------------------------------------------------------ */

export const bookingApi = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    pnr?: string;
    customer_name?: string;
    phone?: string;
    email?: string;
    user_agent?: string;
    booking_status?: string;
    from_date?: string;
    to_date?: string;
  }) => api.get<ListResponse>('/bookings', { params }),

  getById: (id: string) => api.get<ItemResponse>(`/bookings/${id}`),

  create: (data: BookingPayload) => api.post<ItemResponse>('/bookings', data),

  update: (id: string, data: BookingPayload) =>
    api.put<ItemResponse>(`/bookings/${id}`, data),

  updateStatus: (id: string, booking_status: string) =>
    api.patch<ItemResponse>(`/bookings/${id}/status`, { booking_status }),

  delete: (id: string) => api.delete<SimpleResponse>(`/bookings/${id}`),

  /* ---------------- Lock ---------------- */

  getMyLock: () => api.get<MyLockResponse>('/bookings/my-lock'),

  lock: (id: string) =>
    api.post<LockAcquireResponse>(`/bookings/${id}/lock`),

  addRemark: (id: string, payload: { remarks: string; booking_status?: string }) =>
    api.post<ItemResponse>(`/bookings/${id}/remarks`, payload),

  forceUnlock: (id: string) =>
    api.post<SimpleResponse>(`/bookings/${id}/force-unlock`),

  /* ---------------- History ---------------- */

  getHistory: (id: string) =>
    api.get<HistoryListResponse>(`/bookings/${id}/history`),

  getAssignments: (id: string) =>
    api.get<AssignmentListResponse>(`/bookings/${id}/assignments`),

  /* ---------------- Per-tab partial saves ---------------- */

  updateSearchInfo: (id: string, data: Partial<BookingPayload>) =>
    api.patch<ItemResponse>(`/bookings/${id}/search-info`, data),

  updateBookingInfo: (id: string, data: Partial<BookingPayload>) =>
    api.patch<ItemResponse>(`/bookings/${id}/booking-info`, data),

  updateItinerary: (id: string, itinerary_html: string) =>
    api.patch<ItemResponse>(`/bookings/${id}/itinerary`, { itinerary_html }),

  updateContactInfo: (id: string, data: Partial<BookingPayload>) =>
    api.patch<ItemResponse>(`/bookings/${id}/contact-info`, data),

  updatePaxInfo: (id: string, pax: BookingPax[]) =>
    api.patch<ItemResponse>(`/bookings/${id}/pax-info`, { pax }),

  updatePaymentInfo: (id: string, data: Partial<BookingPayload>) =>
    api.patch<ItemResponse>(`/bookings/${id}/payment-info`, data),

//   uploadItineraryImage: (file: File) => {
//   const formData = new FormData();
//   formData.append('image', file);
//   return api.post<{ success: boolean; url: string; public_id: string }>(
//     '/uploads/itinerary-image',
//     formData,
//     {
//       headers: { 'Content-Type': 'multipart/form-data' },
//     }
//   );
// },
uploadItineraryImage: (files: File[]) => {
  const formData = new FormData();
  files.forEach((file) => formData.append('images', file));
  return api.post<{
    success: boolean;
    images: { url: string; public_id: string; width: number; height: number }[];
  }>('/uploads/itinerary-image', formData);
},
deleteItineraryImage: (publicId: string) =>
  api.post('/bookings/itinerary/delete-image', { public_id: publicId }),
};
