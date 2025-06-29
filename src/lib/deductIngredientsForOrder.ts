import { supabase } from "@/integrations/supabase/client";

/**
 * Deducts ingredients from stock for a given menu item.
 * @param menuItemId The menu item ID for which to deduct ingredients.
 * @returns Promise<{ success: boolean; error?: string }>
 */
export async function deductIngredientsForOrder(menuItemId: number): Promise<{ success: boolean; error?: string }> {
  // 1. Get all ingredients and required quantities for this menu item
  const { data: recipe, error: recipeError } = await supabase
    .from("menu_ingredients")
    .select("ingredient_id, quantity")
    .eq("item_id", menuItemId);

  if (recipeError) {
    return { success: false, error: "Failed to fetch recipe: " + recipeError.message };
  }
  if (!recipe || recipe.length === 0) {
    return { success: false, error: "No recipe found for this menu item." };
  }

  // 2. For each ingredient, deduct from stock and log
  for (const { ingredient_id, quantity } of recipe) {
    // Get current stock
    const { data: ingredient, error: ingredientError } = await supabase
      .from("ingredients")
      .select("stock_quantity")
      .eq("id", ingredient_id)
      .single();

    if (ingredientError) {
      return { success: false, error: `Failed to fetch ingredient ${ingredient_id}: ${ingredientError.message}` };
    }

    const currentStock = ingredient.stock_quantity as number;
    const newStock = Math.max(0, currentStock - quantity);

    // Update stock (ensure it doesn't go below 0)
    const { error: updateError } = await supabase
      .from("ingredients")
      .update({ stock_quantity: newStock })
      .eq("id", ingredient_id);

    if (updateError) {
      return { success: false, error: `Failed to update stock for ingredient ${ingredient_id}: ${updateError.message}` };
    }

    // Insert log
    const { error: logError } = await supabase.from("inventory_logs").insert([
      {
        ingredient_id,
        change_type: "deduct",
        quantity,
        note: "Used in order",
      },
    ]);
    if (logError) {
      return { success: false, error: `Failed to log deduction for ingredient ${ingredient_id}: ${logError.message}` };
    }
  }

  return { success: true };
} 