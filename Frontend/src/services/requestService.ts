import { supabase } from '../lib/supabase';
import type { Request, RequestWithDetails } from '../types/database';

export const requestService = {
  async getAllRequests() {
    const { data, error } = await supabase
      .from('requests')
      .select(`
        *,
        resource:resources(*),
        user:profiles!requests_user_id_fkey(*),
        reviewer:profiles!requests_reviewed_by_fkey(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as RequestWithDetails[];
  },

  async getMyRequests() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('requests')
      .select(`
        *,
        resource:resources(*),
        reviewer:profiles!requests_reviewed_by_fkey(*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as RequestWithDetails[];
  },

  async createRequest(resourceId: string, quantityRequested: number, purpose: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('requests')
      .insert({
        user_id: user.id,
        resource_id: resourceId,
        quantity_requested: quantityRequested,
        purpose,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    return data as Request;
  },

  async updateRequestStatus(
    requestId: string,
    status: 'approved' | 'rejected',
    rejectionReason?: string
  ) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('requests')
      .update({
        status,
        rejection_reason: rejectionReason || null,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', requestId)
      .select()
      .single();

    if (error) throw error;
    return data as Request;
  },
};
