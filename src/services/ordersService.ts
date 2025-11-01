import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

export interface OrderItem {
  menu_item_id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface OrderInput {
  order_number: string;
  customer_name: string;
  table_number: string;
  total_amount: number;
  status?: string;
  notes?: string;
  items: OrderItem[];
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  table_number: string;
  total_amount: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  created_at: string;
  updated_at: string;
  items: OrderItemWithId[];
}

export interface OrderItemWithId extends OrderItem {
  id: string;
  order_id: string;
  created_at: string;
}

// Create a new order with items
export const createOrder = async (orderInput: OrderInput): Promise<Order> => {
  try {
    // Insert order into orders table
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        order_number: orderInput.order_number,
        customer_name: orderInput.customer_name,
        table_number: orderInput.table_number,
        total_amount: orderInput.total_amount,
        status: orderInput.status || 'pending',
        notes: orderInput.notes || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      throw new Error(`Failed to create order: ${orderError.message}`);
    }

    // Insert order items into order_items table
    const orderItems = orderInput.items.map(item => ({
      order_id: order.id,
      menu_item_id: Number(item.menu_item_id),
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      notes: null,
      created_at: new Date().toISOString()
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Error creating order items:', itemsError);
      throw new Error(`Failed to create order items: ${itemsError.message}`);
    }

    // Fetch the complete order with items
    const completeOrder = await getOrderById(order.id);
    if (!completeOrder) {
      throw new Error('Failed to fetch created order');
    }

    return completeOrder;
  } catch (error) {
    console.error('Failed to create order:', error);
    throw error;
  }
};

// Get all orders with their items
export const getOrders = async (): Promise<Order[]> => {
  try {
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          menu_item_id,
          name,
          quantity,
          price,
          notes,
          created_at
        )
      `)
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.error('Error fetching orders:', ordersError);
      throw new Error(`Failed to fetch orders: ${ordersError.message}`);
    }

    return orders.map(order => ({
      id: order.id,
      order_number: order.order_number,
      customer_name: order.customer_name || '',
      table_number: order.table_number || '',
      total_amount: order.total_amount,
      status: order.status as Order['status'],
      notes: order.notes || undefined,
      created_at: order.created_at,
      updated_at: order.updated_at,
      items: order.order_items.map((item: any) => ({
        id: item.id,
        order_id: order.id,
        menu_item_id: item.menu_item_id.toString(),
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        created_at: item.created_at
      }))
    }));
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    throw error;
  }
};

// Get a single order by ID
export const getOrderById = async (orderId: string): Promise<Order | null> => {
  try {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          menu_item_id,
          name,
          quantity,
          price,
          notes,
          created_at
        )
      `)
      .eq('id', orderId)
      .single();

    if (orderError) {
      if (orderError.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      console.error('Error fetching order:', orderError);
      throw new Error(`Failed to fetch order: ${orderError.message}`);
    }

    return {
      id: order.id,
      order_number: order.order_number,
      customer_name: order.customer_name || '',
      table_number: order.table_number || '',
      total_amount: order.total_amount,
      status: order.status as Order['status'],
      notes: order.notes || undefined,
      created_at: order.created_at,
      updated_at: order.updated_at,
      items: order.order_items.map((item: any) => ({
        id: item.id,
        order_id: order.id,
        menu_item_id: item.menu_item_id.toString(),
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        created_at: item.created_at
      }))
    };
  } catch (error) {
    console.error('Failed to fetch order:', error);
    throw error;
  }
};

// Update order status
export const updateOrderStatus = async (orderId: string, status: Order['status']): Promise<void> => {
  try {
    const { error } = await supabase
      .from('orders')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (error) {
      console.error('Error updating order status:', error);
      throw new Error(`Failed to update order status: ${error.message}`);
    }
  } catch (error) {
    console.error('Failed to update order status:', error);
    throw error;
  }
};

// Update order details
export const updateOrder = async (orderId: string, orderInput: Partial<OrderInput>): Promise<Order> => {
  try {
    // Update order details
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (orderInput.order_number !== undefined) updateData.order_number = orderInput.order_number;
    if (orderInput.customer_name !== undefined) updateData.customer_name = orderInput.customer_name;
    if (orderInput.table_number !== undefined) updateData.table_number = orderInput.table_number;
    if (orderInput.total_amount !== undefined) updateData.total_amount = orderInput.total_amount;
    if (orderInput.status !== undefined) updateData.status = orderInput.status;
    if (orderInput.notes !== undefined) updateData.notes = orderInput.notes;

    const { error: orderError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId);

    if (orderError) {
      console.error('Error updating order:', orderError);
      throw new Error(`Failed to update order: ${orderError.message}`);
    }

    // If items are provided, update them
    if (orderInput.items) {
      // Delete existing items
      const { error: deleteError } = await supabase
        .from('order_items')
        .delete()
        .eq('order_id', orderId);

      if (deleteError) {
        console.error('Error deleting existing order items:', deleteError);
        throw new Error(`Failed to delete existing order items: ${deleteError.message}`);
      }

      // Insert new items
      const orderItems = orderInput.items.map(item => ({
        order_id: orderId,
        menu_item_id: Number(item.menu_item_id),
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        notes: null,
        created_at: new Date().toISOString()
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Error updating order items:', itemsError);
        throw new Error(`Failed to update order items: ${itemsError.message}`);
      }
    }

    // Fetch and return the updated order
    const updatedOrder = await getOrderById(orderId);
    if (!updatedOrder) {
      throw new Error('Failed to fetch updated order');
    }

    return updatedOrder;
  } catch (error) {
    console.error('Failed to update order:', error);
    throw error;
  }
};

// Delete order (this will also delete order items due to CASCADE)
export const deleteOrder = async (orderId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId);

    if (error) {
      console.error('Error deleting order:', error);
      throw new Error(`Failed to delete order: ${error.message}`);
    }
  } catch (error) {
    console.error('Failed to delete order:', error);
    throw error;
  }
};

// Get orders by status
export const getOrdersByStatus = async (status: Order['status']): Promise<Order[]> => {
  try {
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          menu_item_id,
          name,
          quantity,
          price,
          notes,
          created_at
        )
      `)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.error('Error fetching orders by status:', ordersError);
      throw new Error(`Failed to fetch orders by status: ${ordersError.message}`);
    }

    return orders.map(order => ({
      id: order.id,
      order_number: order.order_number,
      customer_name: order.customer_name || '',
      table_number: order.table_number || '',
      total_amount: order.total_amount,
      status: order.status as Order['status'],
      notes: order.notes || undefined,
      created_at: order.created_at,
      updated_at: order.updated_at,
      items: order.order_items.map((item: any) => ({
        id: item.id,
        order_id: order.id,
        menu_item_id: item.menu_item_id.toString(),
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        created_at: item.created_at
      }))
    }));
  } catch (error) {
    console.error('Failed to fetch orders by status:', error);
    throw error;
  }
};

// Get orders within a specific date range
export const getOrdersByDateRange = async (startDate: Date, endDate: Date): Promise<Order[]> => {
    try {
        const { data: orders, error: ordersError } = await supabase
            .from('orders')
            .select(`
                *,
                order_items (
                    id,
                    menu_item_id,
                    name,
                    quantity,
                    price
                )
            `)
            .gte('created_at', startDate.toISOString())
            .lte('created_at', endDate.toISOString())
            .order('created_at', { ascending: false });

        if (ordersError) {
            console.error('Error fetching orders by date range:', ordersError);
            throw new Error(`Failed to fetch orders: ${ordersError.message}`);
        }

        return orders.map(order => ({
            id: order.id,
            order_number: order.order_number,
            customer_name: order.customer_name || '',
            table_number: order.table_number || '',
            total_amount: order.total_amount,
            status: order.status as Order['status'],
            notes: order.notes || undefined,
            created_at: order.created_at,
            updated_at: order.updated_at,
            items: order.order_items.map((item: any) => ({
                id: item.id,
                order_id: order.id,
                menu_item_id: item.menu_item_id.toString(),
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                created_at: item.created_at || ''
            }))
        }));
    } catch (error) {
        console.error('Failed to fetch orders by date range:', error);
        throw error;
    }
};

export interface SalesReportData {
  totalRevenue: number;
  totalOrders: number;
  totalItemsSold: number;
  averageOrderValue: number;
  revenuePerDay: { date: string; revenue: number }[];
  topSellingItems: { name: string; quantity: number }[];
}

export const getSalesReportData = async (startDate: Date, endDate: Date): Promise<SalesReportData> => {
  const orders = await getOrdersByDateRange(startDate, endDate);
  
  const completedOrders = orders.filter(o => o.status === 'completed');
  
  const totalRevenue = completedOrders.reduce((acc, order) => acc + order.total_amount, 0);
  const totalOrders = orders.length;
  const totalCompletedOrders = completedOrders.length;

  const allItems = completedOrders.flatMap(order => order.items);
  const totalItemsSold = allItems.reduce((acc, item) => acc + item.quantity, 0);

  const averageOrderValue = totalCompletedOrders > 0 ? totalRevenue / totalCompletedOrders : 0;
  
  const revenuePerDayMap = new Map<string, number>();
  completedOrders.forEach(order => {
      const day = format(new Date(order.created_at), 'yyyy-MM-dd');
      const currentRevenue = revenuePerDayMap.get(day) || 0;
      revenuePerDayMap.set(day, currentRevenue + order.total_amount);
  });
  const revenuePerDay = Array.from(revenuePerDayMap.entries()).map(([date, revenue]) => ({ date, revenue }));

  const topSellingItemsMap = new Map<string, number>();
  allItems.forEach(item => {
      const currentQty = topSellingItemsMap.get(item.name) || 0;
      topSellingItemsMap.set(item.name, currentQty + item.quantity);
  });
  const topSellingItems = Array.from(topSellingItemsMap.entries())
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5); // Top 5 items

  return {
      totalRevenue,
      totalOrders,
      totalItemsSold,
      averageOrderValue,
      revenuePerDay,
      topSellingItems,
  };
};

// Get all orders with their items
export const getKitchenOrders = async (): Promise<Order[]> => {
    try {
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            menu_item_id,
            name,
            quantity,
            price,
            notes
          )
        `)
        .in('status', ['pending', 'in_progress'])
        .order('created_at', { ascending: true });
  
      if (ordersError) {
        throw new Error(`Failed to fetch kitchen orders: ${ordersError.message}`);
      }
  
      return orders.map((order: any) => ({
        id: order.id,
        order_number: order.order_number,
        customer_name: order.customer_name || '',
        table_number: order.table_number || '',
        total_amount: order.total_amount,
        status: order.status as Order['status'],
        notes: order.notes || undefined,
        created_at: order.created_at,
        updated_at: order.updated_at,
        items: order.order_items.map((item: any) => ({
          id: item.id,
          order_id: order.id,
          menu_item_id: item.menu_item_id.toString(),
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          created_at: item.created_at
        }))
      }));
    } catch (error) {
      console.error('Failed to fetch kitchen orders:', error);
      throw error;
    }
};

export const subscribeToKitchenOrders = (callback: (payload: any) => void) => {
    const channel = supabase.channel('kitchen-orders');
  
    channel
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          callback(payload);
        }
      )
      .subscribe();
  
    return () => {
      supabase.removeChannel(channel);
    };
}; 