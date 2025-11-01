// src/services/menuService.ts

import { supabase } from "@/integrations/supabase/client";

// Define types
export interface MenuItem {
  id: number;
  name: string;
  description?: string;
  price: number;
  category: string;
  available: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface MenuItemFormData {
  name: string;
  description?: string;
  price: number;
  category: string;
  available: boolean;
}

// ✅ Get all menu items
export async function getMenuItems(): Promise<MenuItem[]> {
  try {
    console.log('🔄 Fetching menu items from Supabase...');
    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.error("🔥 Supabase fetch error:", error.message, error.details);
      throw new Error(`Error loading menu items: ${error.message}`);
    }

    console.log('✅ Menu items fetched successfully:', data?.length || 0, 'items');
    return data || [];
  } catch (error) {
    console.error('❌ getMenuItems failed:', error);
    throw error;
  }
}

// ✅ Add new menu item
export async function addMenuItem(itemData: MenuItemFormData): Promise<MenuItem> {
  try {
    console.log('🔄 Adding menu item:', itemData);
    
    // Validate the available field is boolean
    if (typeof itemData.available !== 'boolean') {
      throw new Error('Available field must be a boolean value');
    }
    
    // Prepare the insert data with proper types
    const insertData = {
      name: itemData.name,
      description: itemData.description || null,
      price: Number(itemData.price),
      category: itemData.category,
      available: Boolean(itemData.available),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('📝 Insert data prepared:', insertData);
    
    const { data, error } = await supabase
      .from("menu_items")
      .insert([insertData])
      .select()
      .single();

    if (error) {
      console.error("❌ Add menu item error:", error.message, error.details, error.hint);
      throw new Error(`Failed to add menu item: ${error.message}`);
    }

    if (!data) {
      throw new Error('No data returned after insert');
    }

    console.log('✅ Menu item added successfully:', data);
    return data;
  } catch (error) {
    console.error('❌ addMenuItem failed:', error);
    throw error;
  }
}

// ✅ Update menu item
export async function updateMenuItem(id: number, itemData: MenuItemFormData): Promise<MenuItem> {
  try {
    console.log('🔄 Updating menu item:', id, itemData);
    
    // Validate the available field is boolean
    if (typeof itemData.available !== 'boolean') {
      throw new Error('Available field must be a boolean value');
    }
    
    // Prepare the update data with proper types
    const updateData = {
      name: itemData.name,
      description: itemData.description || null,
      price: Number(itemData.price),
      category: itemData.category,
      available: Boolean(itemData.available),
      updated_at: new Date().toISOString()
    };
    
    console.log('📝 Update data prepared:', updateData);
    
    const { data, error } = await supabase
      .from("menu_items")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("❌ Update menu item error:", error.message, error.details, error.hint);
      throw new Error(`Failed to update menu item: ${error.message}`);
    }

    if (!data) {
      throw new Error('Menu item not found');
    }

    console.log('✅ Menu item updated successfully:', data);
    return data;
  } catch (error) {
    console.error('❌ updateMenuItem failed:', error);
    throw error;
  }
}

// ✅ Delete menu item
export async function deleteMenuItem(id: number): Promise<void> {
  try {
    console.log('🔄 Deleting menu item:', id);
    const { error } = await supabase
      .from("menu_items")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("❌ Delete menu item error:", error.message, error.details, error.hint);
      throw new Error(`Failed to delete menu item: ${error.message}`);
    }

    console.log('✅ Menu item deleted successfully');
  } catch (error) {
    console.error('❌ deleteMenuItem failed:', error);
    throw error;
  }
}

// ✅ Get menu item by ID
export async function getMenuItemById(id: number): Promise<MenuItem | null> {
  try {
    console.log('🔄 Fetching menu item by ID:', id);
    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.log('ℹ️ Menu item not found:', id);
        return null;
      }
      console.error("❌ Get menu item error:", error.message, error.details, error.hint);
      throw new Error(`Failed to get menu item: ${error.message}`);
    }

    console.log('✅ Menu item fetched successfully:', data);
    return data;
  } catch (error) {
    console.error('❌ getMenuItemById failed:', error);
    throw error;
  }
}

// ✅ Get menu items by category
export async function getMenuItemsByCategory(category: string): Promise<MenuItem[]> {
  try {
    console.log('🔄 Fetching menu items by category:', category);
    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .eq("category", category)
      .order("id", { ascending: true });

    if (error) {
      console.error("❌ Get menu items by category error:", error.message, error.details, error.hint);
      throw new Error(`Failed to get menu items by category: ${error.message}`);
    }

    console.log('✅ Menu items by category fetched successfully:', data?.length || 0, 'items');
    return data || [];
  } catch (error) {
    console.error('❌ getMenuItemsByCategory failed:', error);
    throw error;
  }
}

// ✅ Get available menu items only
export async function getAvailableMenuItems(): Promise<MenuItem[]> {
  try {
    console.log('🔄 Fetching available menu items...');
    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .eq("available", true)
      .order("id", { ascending: true });

    if (error) {
      console.error("❌ Get available menu items error:", error.message, error.details, error.hint);
      throw new Error(`Failed to get available menu items: ${error.message}`);
    }

    console.log('✅ Available menu items fetched successfully:', data?.length || 0, 'items');
    return data || [];
  } catch (error) {
    console.error('❌ getAvailableMenuItems failed:', error);
    throw error;
  }
}

// ✅ Search menu items by name
export async function searchMenuItems(searchTerm: string): Promise<MenuItem[]> {
  try {
    console.log('🔄 Searching menu items:', searchTerm);
    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .ilike("name", `%${searchTerm}%`)
      .order("id", { ascending: true });

    if (error) {
      console.error("❌ Search menu items error:", error.message, error.details, error.hint);
      throw new Error(`Failed to search menu items: ${error.message}`);
    }

    console.log('✅ Menu items search completed:', data?.length || 0, 'results');
    return data || [];
  } catch (error) {
    console.error('❌ searchMenuItems failed:', error);
    throw error;
  }
}

// ✅ Toggle menu item availability
export async function toggleMenuItemAvailability(id: number): Promise<MenuItem> {
  try {
    console.log('🔄 Toggling menu item availability:', id);
    
    // First get the current item to toggle its availability
    const currentItem = await getMenuItemById(id);
    if (!currentItem) {
      throw new Error('Menu item not found');
    }

    const newAvailable = !currentItem.available;
    console.log(`🔄 Toggling availability from ${currentItem.available} to ${newAvailable}`);

    const { data, error } = await supabase
      .from("menu_items")
      .update({
        available: newAvailable,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("❌ Toggle availability error:", error.message, error.details, error.hint);
      throw new Error(`Failed to toggle menu item availability: ${error.message}`);
    }

    if (!data) {
      throw new Error('Menu item not found after update');
    }

    console.log('✅ Menu item availability toggled successfully:', data);
    return data;
  } catch (error) {
    console.error('❌ toggleMenuItemAvailability failed:', error);
    throw error;
  }
}

// ✅ Validate menu item data
export function validateMenuItemData(data: any): MenuItemFormData {
  const errors: string[] = [];
  
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push('Name is required and must be a non-empty string');
  }
  
  if (typeof data.price !== 'number' || data.price < 0) {
    errors.push('Price must be a non-negative number');
  }
  
  if (!data.category || typeof data.category !== 'string' || data.category.trim().length === 0) {
    errors.push('Category is required and must be a non-empty string');
  }
  
  if (typeof data.available !== 'boolean') {
    errors.push('Available must be a boolean value');
  }
  
  if (errors.length > 0) {
    throw new Error(`Validation failed: ${errors.join(', ')}`);
  }
  
  return {
    name: data.name.trim(),
    description: data.description?.trim() || undefined,
    price: Number(data.price),
    category: data.category.trim(),
    available: Boolean(data.available)
  };
}

export const getMenuItem = async (id: string): Promise<MenuItem> => {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching menu item:', error);
    throw error;
  }
  return data;
};

export const createMenuItem = async (menuItem: Omit<MenuItem, 'id' | 'created_at' | 'available'>) => {
  // ... existing code ...
};
