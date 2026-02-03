import { supabase } from '../lib/supabase';
import type { Resource } from '../types/database';

export const resourceService = {
  async getAllResources() {
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Resource[];
  },

  async getResourceById(id: string) {
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data as Resource | null;
  },

  async createResource(resource: Omit<Resource, 'id' | 'created_at' | 'updated_at' | 'created_by'>) {
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('resources')
      .insert({
        ...resource,
        created_by: user?.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data as Resource;
  },

  async updateResource(id: string, updates: Partial<Resource>) {
    const { data, error } = await supabase
      .from('resources')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Resource;
  },

  async deleteResource(id: string) {
    const { error } = await supabase
      .from('resources')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
