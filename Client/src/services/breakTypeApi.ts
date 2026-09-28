import {api} from './api';

export interface BreakTypeRecord {
    _id: string;
    break_type_name: string;
    status: 'Enabled' | 'Disabled';
    add_by:string;
    add_date: string;
    update_by: string | null;
    delete_status: boolean;
    createdAt: string;
    updatedAt: string;
}

export const breakTypeApi = {
    create: (payload: {break_type_name: string; status: 'Enabled' | 'Disabled'}) => 
        api.post('/break-types', payload),

    list: (params?: { page?: number; limit?: number; search?: string }) =>
        api.get('/break-types', { params }),

    update: (id: string, payload: { break_type_name?: string; status?: 'Enabled' | 'Disabled' }) =>
        api.put(`/break-types/${id}`, payload),

    toggleStatus: (id: string) => 
        api.patch(`/break-types/${id}/toggle-status`),

    remove: (id: string) => 
        api.delete(`/break-types/${id}`),

};
