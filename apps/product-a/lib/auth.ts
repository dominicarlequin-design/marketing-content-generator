import { getSupabaseClient } from "./supabase";

type AuthResult = { error: string | null };

async function ensureCustomerRow(authUserId: string): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return;
  }

  const { data: existing } = await supabase
    .from("customers")
    .select("customer_id")
    .eq("auth_user_id", authUserId)
    .maybeSingle();

  if (existing) {
    return;
  }

  const { error } = await supabase.from("customers").insert({ auth_user_id: authUserId });
  if (error) {
    throw error;
  }
}

export async function signUp(email: string, password: string): Promise<AuthResult> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { error: "Supabase isn't configured yet." };
  }

  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    return { error: error.message };
  }
  if (data.user) {
    await ensureCustomerRow(data.user.id);
  }
  return { error: null };
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { error: "Supabase isn't configured yet." };
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { error: error.message };
  }
  if (data.user) {
    await ensureCustomerRow(data.user.id);
  }
  return { error: null };
}

export async function signOut(): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return;
  }
  await supabase.auth.signOut();
}

export async function getCurrentCustomerId(): Promise<string | null> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return null;
  }

  const { data: sessionData } = await supabase.auth.getSession();
  const authUserId = sessionData.session?.user.id;
  if (!authUserId) {
    return null;
  }

  const { data } = await supabase
    .from("customers")
    .select("customer_id")
    .eq("auth_user_id", authUserId)
    .maybeSingle();

  return data?.customer_id ?? null;
}
