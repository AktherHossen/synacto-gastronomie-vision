import { supabase } from "@/integrations/supabase/client";

/**
 * Deducts ingredients from stock for a given menu item.
 * @param menuItemId The menu item ID for which to deduct ingredients.
 * @param quantity The quantity of the menu item being ordered.
 * @returns Promise<{ success: boolean; error?: string }>
 */
export const deductIngredientsForOrder = async (menuItemId: string, quantity: number): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data: recipeItems, error: recipeError } = await supabase
      .from('menu_item_ingredients')
      .select('ingredient_id, quantity')
      .eq('menu_item_id', menuItemId);

    if (recipeError) {
      console.error('Error fetching recipe:', recipeError);
      return { success: false, error: recipeError.message };
    }

    if (!recipeItems || recipeItems.length === 0) {
      // It's possible an item has no ingredients, so this isn't necessarily an error.
      return { success: true };
    }

    for (const recipeItem of recipeItems) {
      const requiredQuantity = recipeItem.quantity * quantity;

      const { data: ingredient, error: ingredientError } = await supabase
        .from('ingredients')
        .select('stock_quantity')
        .eq('id', recipeItem.ingredient_id)
        .single();

      if (ingredientError) {
        console.error('Error fetching ingredient:', ingredientError);
        return { success: false, error: `Could not fetch ingredient: ${recipeItem.ingredient_id}` };
      }

      if (ingredient.stock_quantity < requiredQuantity) {
        return { success: false, error: `Not enough stock for ingredient ${recipeItem.ingredient_id}` };
      }

      const { error: updateError } = await supabase
        .from('ingredients')
        .update({ stock_quantity: ingredient.stock_quantity - requiredQuantity })
        .eq('id', recipeItem.ingredient_id);

      if (updateError) {
        console.error('Error updating ingredient stock:', updateError);
        return { success: false, error: `Could not update stock for ingredient ${recipeItem.ingredient_id}` };
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error deducting ingredients:', error);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}; 