import { supabase } from "./supabaseClient";

export interface Address {
  id: string; // Unique identifier (UUID or timestamp)
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  isDefault?: boolean;
}

/**
 * Fetches saved addresses from the current user's user_metadata.
 */
export const getSavedAddresses = async (): Promise<Address[]> => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return [];

  const metadata = user.user_metadata || {};
  const addresses = metadata.saved_addresses || [];
  return addresses as Address[];
};

/**
 * Saves a new address or updates an existing one (if ID matches) in user_metadata.
 */
export const saveAddress = async (address: Address): Promise<{ success: boolean; error?: any }> => {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return { success: false, error: userError || "User not found" };

  let currentAddresses = (user.user_metadata?.saved_addresses || []) as Address[];

  if (address.isDefault) {
    // Remove default flag from other addresses if this one is default
    currentAddresses = currentAddresses.map((a) => ({ ...a, isDefault: false }));
  } else if (currentAddresses.length === 0) {
    // If it's the first address, make it default automatically
    address.isDefault = true;
  }

  const existingIndex = currentAddresses.findIndex((a) => a.id === address.id);

  if (existingIndex >= 0) {
    // Update existing
    currentAddresses[existingIndex] = address;
  } else {
    // Add new
    currentAddresses.push(address);
  }

  const { error: updateError } = await supabase.auth.updateUser({
    data: { saved_addresses: currentAddresses },
  });

  if (updateError) return { success: false, error: updateError };
  return { success: true };
};

/**
 * Deletes an address by its ID.
 */
export const deleteAddress = async (addressId: string): Promise<{ success: boolean; error?: any }> => {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return { success: false, error: userError || "User not found" };

  let currentAddresses = (user.user_metadata?.saved_addresses || []) as Address[];
  const wasDefault = currentAddresses.find(a => a.id === addressId)?.isDefault;

  currentAddresses = currentAddresses.filter((a) => a.id !== addressId);

  // If we deleted the default, make the first remaining one default
  if (wasDefault && currentAddresses.length > 0) {
    currentAddresses[0].isDefault = true;
  }

  const { error: updateError } = await supabase.auth.updateUser({
    data: { saved_addresses: currentAddresses },
  });

  if (updateError) return { success: false, error: updateError };
  return { success: true };
};

/**
 * Sets a specific address as the default.
 */
export const setDefaultAddress = async (addressId: string): Promise<{ success: boolean; error?: any }> => {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return { success: false, error: userError || "User not found" };

  let currentAddresses = (user.user_metadata?.saved_addresses || []) as Address[];

  currentAddresses = currentAddresses.map((a) => ({
    ...a,
    isDefault: a.id === addressId,
  }));

  const { error: updateError } = await supabase.auth.updateUser({
    data: { saved_addresses: currentAddresses },
  });

  if (updateError) return { success: false, error: updateError };
  return { success: true };
};
