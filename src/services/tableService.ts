import { supabase } from "@/integrations/supabase/client";

export type Table = {
    id: string;
    name: string;
    status: 'Available' | 'Occupied' | 'Reserved';
    capacity: number;
    created_at: string;
    grid_x: number | null;
    grid_y: number | null;
    grid_w: number | null;
    grid_h: number | null;
};

export type NewTable = Omit<Table, 'id' | 'created_at'>;
export type TableStatus = 'Available' | 'Occupied' | 'Reserved';

export const getTables = async (): Promise<Table[]> => {
    const { data, error } = await supabase.from('tables').select('*').order('name');
    if (error) throw new Error(`Error fetching tables: ${error.message}`);
    return data;
};

export const createTable = async (table: NewTable): Promise<Table> => {
    const { data, error } = await supabase.from('tables').insert(table).select().single();
    if (error) throw new Error(`Error creating table: ${error.message}`);
    return data;
};

export const updateTable = async (id: string, updates: Partial<NewTable>): Promise<Table> => {
    const { data, error } = await supabase.from('tables').update(updates).eq('id', id).select().single();
    if (error) throw new Error(`Error updating table: ${error.message}`);
    return data;
};

export const deleteTable = async (id: string) => {
    const { error } = await supabase.from('tables').delete().eq('id', id);
    if (error) throw new Error(`Error deleting table: ${error.message}`);
};

export const subscribeToTableChanges = (callback: (payload: any) => void) => {
    const channel = supabase.channel('tables-changes');
    channel
        .on('postgres_changes', { event: '*', schema: 'public', table: 'tables' }, payload => {
            callback(payload);
        })
        .subscribe();
    
    return () => {
        supabase.removeChannel(channel);
    };
};

export const updateTableLayout = async (id: string, layout: { x: number; y: number; w: number; h: number }) => {
    const { data, error } = await supabase
        .from('tables')
        .update({ 
            grid_x: layout.x, 
            grid_y: layout.y, 
            grid_w: layout.w, 
            grid_h: layout.h 
        })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating table layout:', error);
        throw error;
    }
    return data;
}; 