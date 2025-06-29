import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Ingredient {
  id: number;
  name: string;
  unit: string;
}

interface RecipeRow {
  id?: number; // menu_ingredients row id
  ingredient_id: number;
  ingredient_name: string;
  quantity: number;
  unit: string;
  isNew?: boolean;
}

interface RecipeEditorProps {
  itemId: number;
}

const RecipeEditor: React.FC<RecipeEditorProps> = ({ itemId }) => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [recipe, setRecipe] = useState<RecipeRow[]>([]);
  const [selectedIngredient, setSelectedIngredient] = useState<number | "">("");
  const [quantity, setQuantity] = useState<number>(0);
  const [unit, setUnit] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all ingredients
  useEffect(() => {
    const fetchIngredients = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("ingredients")
        .select("id, name, unit");
      if (!error && data) setIngredients(data);
      setLoading(false);
    };
    fetchIngredients();
  }, []);

  // Fetch current recipe for this item
  useEffect(() => {
    const fetchRecipe = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("menu_ingredients")
        .select("id, ingredient_id, quantity, unit, ingredients(name)")
        .eq("item_id", itemId);
      if (!error && data) {
        setRecipe(
          data.map((row: any) => ({
            id: row.id,
            ingredient_id: row.ingredient_id,
            ingredient_name: row.ingredients?.name || "",
            quantity: row.quantity,
            unit: row.unit,
          }))
        );
      }
      setLoading(false);
    };
    fetchRecipe();
  }, [itemId]);

  // Add new ingredient to recipe (not yet saved)
  const handleAdd = () => {
    if (!selectedIngredient || quantity <= 0 || !unit) return;
    const ingredient = ingredients.find((i) => i.id === selectedIngredient);
    if (!ingredient) return;
    // Prevent duplicate
    if (recipe.some((r) => r.ingredient_id === selectedIngredient && r.isNew)) return;
    setRecipe([
      ...recipe,
      {
        ingredient_id: selectedIngredient,
        ingredient_name: ingredient.name,
        quantity,
        unit,
        isNew: true,
      },
    ]);
    setSelectedIngredient("");
    setQuantity(0);
    setUnit("");
  };

  // Remove a row (if new, just remove; if existing, delete from DB)
  const handleRemove = async (row: RecipeRow) => {
    if (row.isNew || !row.id) {
      setRecipe(recipe.filter((r) => r !== row));
    } else {
      setLoading(true);
      const { error } = await supabase.from("menu_ingredients").delete().eq("id", row.id);
      if (!error) setRecipe(recipe.filter((r) => r.id !== row.id));
      setLoading(false);
    }
  };

  // Edit a row (inline editing)
  const handleEdit = (idx: number, field: keyof RecipeRow, value: any) => {
    setRecipe((prev) =>
      prev.map((row, i) => (i === idx ? { ...row, [field]: value } : row))
    );
  };

  // Save all new/edited rows
  const handleSave = async () => {
    setSaving(true);
    setError(null);
    // Save new rows
    const newRows = recipe.filter((r) => r.isNew);
    for (const row of newRows) {
      const { error } = await supabase.from("menu_ingredients").insert({
        item_id: itemId,
        ingredient_id: row.ingredient_id,
        quantity: row.quantity,
        unit: row.unit,
      });
      if (error) setError(error.message);
    }
    // Save edited rows (existing)
    const editedRows = recipe.filter((r) => !r.isNew && r.id);
    for (const row of editedRows) {
      const { error } = await supabase
        .from("menu_ingredients")
        .update({ quantity: row.quantity, unit: row.unit })
        .eq("id", row.id!);
      if (error) setError(error.message);
    }
    // Refetch recipe
    const { data, error: fetchError } = await supabase
      .from("menu_ingredients")
      .select("id, ingredient_id, quantity, unit, ingredients(name)")
      .eq("item_id", itemId);
    if (!fetchError && data) {
      setRecipe(
        data.map((row: any) => ({
          id: row.id,
          ingredient_id: row.ingredient_id,
          ingredient_name: row.ingredients?.name || "",
          quantity: row.quantity,
          unit: row.unit,
        }))
      );
    }
    setSaving(false);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Recipe Editor</h2>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Label>Ingredient</Label>
          <select
            className="w-full border rounded p-2 mt-1"
            value={selectedIngredient}
            onChange={(e) => setSelectedIngredient(Number(e.target.value))}
          >
            <option value="">Select ingredient</option>
            {ingredients.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <Label>Quantity</Label>
          <Input
            type="number"
            min={0}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="mt-1"
          />
        </div>
        <div className="flex-1">
          <Label>Unit</Label>
          <Input
            type="text"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="mt-1"
            placeholder="e.g. g, ml, pcs"
          />
        </div>
        <div className="flex items-end">
          <Button type="button" onClick={handleAdd} className="bg-purple-600 text-white">
            Add
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="py-2 px-3 border-b">Ingredient</th>
              <th className="py-2 px-3 border-b">Quantity</th>
              <th className="py-2 px-3 border-b">Unit</th>
              <th className="py-2 px-3 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {recipe.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-4 text-center text-gray-400">
                  No ingredients linked to this item.
                </td>
              </tr>
            ) : (
              recipe.map((row, idx) => (
                <tr key={row.ingredient_id} className="hover:bg-gray-50">
                  <td className="py-2 px-3 border-b">{row.ingredient_name}</td>
                  <td className="py-2 px-3 border-b">
                    <Input
                      type="number"
                      min={0}
                      value={row.quantity}
                      onChange={(e) => handleEdit(idx, "quantity", Number(e.target.value))}
                      className="w-24"
                    />
                  </td>
                  <td className="py-2 px-3 border-b">
                    <Input
                      type="text"
                      value={row.unit}
                      onChange={(e) => handleEdit(idx, "unit", e.target.value)}
                      className="w-24"
                    />
                  </td>
                  <td className="py-2 px-3 border-b">
                    <Button
                      type="button"
                      variant="outline"
                      className="mr-2"
                      onClick={() => handleRemove(row)}
                    >
                      Remove
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="flex justify-end mt-4">
        <Button
          type="button"
          className="bg-purple-600 text-white"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Recipe"}
        </Button>
      </div>
    </div>
  );
};

export default RecipeEditor; 