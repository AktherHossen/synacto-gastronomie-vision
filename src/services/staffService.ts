import { supabase } from '@/integrations/supabase/client';
import { eachDayOfInterval, format, parseISO } from 'date-fns';

export interface StaffPerformance {
    staff_id: string;
    staff_name: string;
    total_orders: number;
    total_revenue: number;
    average_order_value: number;
    last_activity: string;
}

export const getStaffPerformanceReport = async (startDate: Date, endDate: Date): Promise<StaffPerformance[]> => {
    
    const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
            created_at,
            total_amount,
            created_by,
            staff:staff ( id, name )
        `)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .eq('status', 'completed') as any;

    if (ordersError) throw new Error(`Error fetching staff performance data: ${ordersError.message}`);
    if (!orders) return [];

    const performanceMap = new Map<string, StaffPerformance>();

    for (const order of orders) {
        if (!order.created_by || !order.staff) continue;

        if (!performanceMap.has(order.created_by)) {
            performanceMap.set(order.created_by, {
                staff_id: order.created_by,
                staff_name: order.staff.name,
                total_orders: 0,
                total_revenue: 0,
                average_order_value: 0,
                last_activity: '1970-01-01T00:00:00.000Z',
            });
        }

        const staffPerf = performanceMap.get(order.created_by)!;
        staffPerf.total_orders += 1;
        staffPerf.total_revenue += order.total_amount;

        if (new Date(order.created_at) > new Date(staffPerf.last_activity)) {
            staffPerf.last_activity = order.created_at;
        }
    }
    
    const result = Array.from(performanceMap.values()).map(perf => {
        perf.average_order_value = perf.total_orders > 0 ? perf.total_revenue / perf.total_orders : 0;
        return perf;
    }).sort((a,b) => b.total_orders - a.total_orders);

    return result;
}; 