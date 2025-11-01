import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { _ } from 'lodash';

export interface IngredientUsage {
    ingredient_id: number;
    name: string;
    quantity_used: number;
    unit: string;
    menu_items: { id: number; name: string; count: number }[];
}

export interface DailyUsage {
    date: string;
    usage: { name: string, quantity: number }[];
}

type OrderItem = Database['public']['Tables']['order_items']['Row'] & {
    menu_item: (Database['public']['Tables']['menu_items']['Row'] & {
        ingredients: (Database['public']['Tables']['menu_ingredients']['Row'] & {
            ingredient: Database['public']['Tables']['ingredients']['Row'];
        })[];
    }) | null;
    quantity: number;
};

type Order = {
    created_at: string;
    items: OrderItem[];
};

// This is a simplified calculation. A real-world scenario would be more complex,
// potentially involving inventory snapshots and more detailed logging.
export const getInventoryUsageReport = async (startDate: Date, endDate: Date): Promise<{ usage: IngredientUsage[], daily: DailyUsage[] }> => {
    
    const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
            created_at,
            items:order_items (
                quantity,
                menu_item:menu_items (
                    id,
                    name,
                    ingredients:menu_ingredients (
                        quantity,
                        unit,
                        ingredient:ingredients (id, name, unit)
                    )
                )
            )
        `)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .eq('status', 'completed');
        
    if (ordersError) throw new Error(`Error fetching orders: ${ordersError.message}`);
    if (!orders) return { usage: [], daily: [] };

    const ingredientUsageMap = new Map<number, IngredientUsage>();
    const dailyUsageMap = new Map<string, Map<string, number>>();

    for (const order of orders as Order[]) {
        const orderDate = new Date(order.created_at).toISOString().split('T')[0];
        
        if (!dailyUsageMap.has(orderDate)) {
            dailyUsageMap.set(orderDate, new Map());
        }
        const dayUsage = dailyUsageMap.get(orderDate)!;

        for (const item of (order.items || [])) {
            if (!item.menu_item || !item.menu_item.ingredients) continue;
            
            for (const menuIngredient of item.menu_item.ingredients) {
                if (!menuIngredient.ingredient) continue;

                const { ingredient, quantity: recipeQuantity, unit } = menuIngredient;
                const totalUsed = (item.quantity || 0) * recipeQuantity;

                // Aggregate total usage per ingredient
                if (!ingredientUsageMap.has(ingredient.id)) {
                    ingredientUsageMap.set(ingredient.id, {
                        ingredient_id: ingredient.id,
                        name: ingredient.name,
                        unit: ingredient.unit,
                        quantity_used: 0,
                        menu_items: [],
                    });
                }
                const usageData = ingredientUsageMap.get(ingredient.id)!;
                usageData.quantity_used += totalUsed;
                
                let menuItemRef = usageData.menu_items.find(m => m.id === item.menu_item!.id);
                if (menuItemRef) {
                    menuItemRef.count += item.quantity || 0;
                } else {
                    usageData.menu_items.push({ id: item.menu_item!.id, name: item.menu_item!.name, count: item.quantity || 0 });
                }

                // Aggregate daily usage
                const currentDailyQty = dayUsage.get(ingredient.name) || 0;
                dayUsage.set(ingredient.name, currentDailyQty + totalUsed);
            }
        }
    }
    
    const usage = Array.from(ingredientUsageMap.values()).map(u => {
        u.menu_items.sort((a,b) => b.count - a.count);
        return u;
    }).sort((a,b) => b.quantity_used - a.quantity_used);
    
    const daily = Array.from(dailyUsageMap.entries()).map(([date, usageMap]) => ({
        date,
        usage: Array.from(usageMap.entries()).map(([name, quantity]) => ({name, quantity})),
    })).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return { usage, daily };
}; 