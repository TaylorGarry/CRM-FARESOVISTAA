import { api } from './api';
import { type
  BookingType,type Currency,type Source,type CardType,type EmailTemplate, type SaleType,
 type AssignBookingStatus,type RoleOption,type MasterApiResponse,
} from '../types/master';

export const bookingTypeApi = {
  getAll: () => api.get<MasterApiResponse<BookingType[]>>('/master/booking-types'),
  create: (data: Partial<BookingType>) => api.post<MasterApiResponse<BookingType>>('/master/booking-types', data),
  update: (id: string, data: Partial<BookingType>) => api.put<MasterApiResponse<BookingType>>(`/master/booking-types/${id}`, data),
  delete: (id: string) => api.delete<MasterApiResponse>(`/master/booking-types/${id}`),
  toggleStatus: (id: string, status: string) => api.patch<MasterApiResponse<BookingType>>(`/master/booking-types/${id}/status`, { status }),
};

export const currencyApi = {
  getAll: () => api.get<MasterApiResponse<Currency[]>>('/master/currencies'),
  create: (data: Partial<Currency>) => api.post<MasterApiResponse<Currency>>('/master/currencies', data),
  update: (id: string, data: Partial<Currency>) => api.put<MasterApiResponse<Currency>>(`/master/currencies/${id}`, data),
  delete: (id: string) => api.delete<MasterApiResponse>(`/master/currencies/${id}`),
  toggleStatus: (id: string, status: string) => api.patch<MasterApiResponse<Currency>>(`/master/currencies/${id}/status`, { status }),
};

export const sourceApi = {
  getAll: () => api.get<MasterApiResponse<Source[]>>('/master/sources'),
  create: (data: Partial<Source>) => api.post<MasterApiResponse<Source>>('/master/sources', data),
  update: (id: string, data: Partial<Source>) => api.put<MasterApiResponse<Source>>(`/master/sources/${id}`, data),
  delete: (id: string) => api.delete<MasterApiResponse>(`/master/sources/${id}`),
  toggleStatus: (id: string, status: string) => api.patch<MasterApiResponse<Source>>(`/master/sources/${id}/status`, { status }),
};

export const cardTypeApi = {
  getAll: () => api.get<MasterApiResponse<CardType[]>>('/master/card-types'),
  create: (data: Partial<CardType>) => api.post<MasterApiResponse<CardType>>('/master/card-types', data),
  update: (id: string, data: Partial<CardType>) => api.put<MasterApiResponse<CardType>>(`/master/card-types/${id}`, data),
  delete: (id: string) => api.delete<MasterApiResponse>(`/master/card-types/${id}`),
  toggleStatus: (id: string, status: string) => api.patch<MasterApiResponse<CardType>>(`/master/card-types/${id}/status`, { status }),
};

export const emailTemplateApi = {
  getAll: () => api.get<MasterApiResponse<EmailTemplate[]>>('/master/email-templates'),
  create: (data: Partial<EmailTemplate>) => api.post<MasterApiResponse<EmailTemplate>>('/master/email-templates', data),
  update: (id: string, data: Partial<EmailTemplate>) => api.put<MasterApiResponse<EmailTemplate>>(`/master/email-templates/${id}`, data),
  delete: (id: string) => api.delete<MasterApiResponse>(`/master/email-templates/${id}`),
  toggleStatus: (id: string, status: string) => api.patch<MasterApiResponse<EmailTemplate>>(`/master/email-templates/${id}/status`, { status }),
};

export const saleTypeApi = {
  getAll: () => api.get<MasterApiResponse<SaleType[]>>('/master/sale-types'),
  create: (data: Partial<SaleType>) => api.post<MasterApiResponse<SaleType>>('/master/sale-types', data),
  update: (id: string, data: Partial<SaleType>) => api.put<MasterApiResponse<SaleType>>(`/master/sale-types/${id}`, data),
  delete: (id: string) => api.delete<MasterApiResponse>(`/master/sale-types/${id}`),
  toggleStatus: (id: string, status: string) => api.patch<MasterApiResponse<SaleType>>(`/master/sale-types/${id}/status`, { status }),
};

export const assignBookingStatusApi = {
  getAll: () => api.get<MasterApiResponse<AssignBookingStatus[]>>('/master/assign-booking-statuses'),
  create: (data: Partial<AssignBookingStatus>) => api.post<MasterApiResponse<AssignBookingStatus>>('/master/assign-booking-statuses', data),
  update: (id: string, data: Partial<AssignBookingStatus>) => api.put<MasterApiResponse<AssignBookingStatus>>(`/master/assign-booking-statuses/${id}`, data),
  delete: (id: string) => api.delete<MasterApiResponse>(`/master/assign-booking-statuses/${id}`),
  toggleStatus: (id: string, status: string) => api.patch<MasterApiResponse<AssignBookingStatus>>(`/master/assign-booking-statuses/${id}/status`, { status }),
};

export const getRolesForAssignBooking = () =>
  api.get<MasterApiResponse<RoleOption[]>>('/master/roles-for-assign-booking');