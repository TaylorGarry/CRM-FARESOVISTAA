import { api } from './api';

export interface IpRestrictionRecord {
  _id: string;
  user_ip: string;
  username: string;
  status: 'Enabled' | 'Disabled';
  add_by?: string | null;
  add_date?: string;
  update_by?: string | null;
  update_date?: string | null;
  delete_by?: string | null;
  delete_date?: string | null;
  delete_status?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface IpRestrictionPayload {
  user_ip: string;
  username: string;
  status: 'Enabled' | 'Disabled';
}

interface IpListResponse {
  success: boolean;
  count: number;
  data: IpRestrictionRecord[];
}

interface IpMutationResponse {
  success: boolean;
  message: string;
  data: IpRestrictionRecord;
}

interface IpDeleteResponse {
  success: boolean;
  message: string;
}

export const ipRestrictionApi = {
  getAll: () =>
    api.get<IpListResponse>('/ip-restrictions/allowed-ip'),

  create: (data: IpRestrictionPayload) =>
    api.post<IpMutationResponse>('/ip-restrictions/restrict-ip', data),

  update: (id: string, data: IpRestrictionPayload) =>
    api.put<IpMutationResponse>(`/ip-restrictions/${id}`, data),

  delete: (id: string) =>
    api.delete<IpDeleteResponse>(`/ip-restrictions/${id}`),
};