import { getSupabaseClient } from "./supabase";
import type { CartItem } from "./cart";

type PlaceOrderResult = { orderId: string; error: null } | { orderId: null; error: string };

export async function placeOrder(
  customerId: string,
  items: CartItem[]
): Promise<PlaceOrderResult> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { orderId: null, error: "Supabase isn't configured yet." };
  }

  const { data, error } = await supabase.rpc("place_order", {
    p_customer_id: customerId,
    p_items: items.map((item) => ({ isbn: item.isbn, quantity: item.quantity })),
  });

  if (error) {
    return { orderId: null, error: error.message };
  }

  return { orderId: data as string, error: null };
}
