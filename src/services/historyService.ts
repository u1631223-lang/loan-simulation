/**
 * History Service - Cloud history sync with Supabase
 *
 * Handles synchronization between localStorage and Supabase for loan history.
 * Tier 2 (Registered) users get cloud backup of their history.
 */

import { supabase } from '@/lib/supabase';
import type { LoanHistory, LoanParams, LoanResult } from '@/types/loan';
import { loadHistory as loadLocalHistory, saveHistory as saveLocalHistory } from '@/utils/storage';

/**
 * Database row type for loan_history table
 */
interface LoanHistoryRow {
  id: string;
  user_id: string;
  params: LoanParams;
  result: LoanResult;
  label?: string;
  customer_name?: string; // 🆕 Phase 9.9: お客様名
  created_at: string;
  updated_at: string;
}

/**
 * Convert database row to LoanHistory
 */
const rowToHistory = (row: LoanHistoryRow): LoanHistory => ({
  id: row.id,
  timestamp: new Date(row.created_at).getTime(),
  params: row.params,
  result: row.result,
  label: row.label,
  memo: row.customer_name, // 🆕 Map from snake_case to camelCase
});

/**
 * Convert LoanHistory to database insert format
 */
const historyToInsert = (history: LoanHistory, userId: string) => ({
  id: history.id,
  user_id: userId,
  params: history.params,
  result: history.result,
  label: history.label,
  customer_name: history.params.memo || null, // 🆕 Extract from params
});

/**
 * Load history from Supabase cloud storage
 *
 * @returns Promise<LoanHistory[]> - Cloud history (newest first)
 */
export const loadCloudHistory = async (): Promise<LoanHistory[]> => {
  if (!supabase) {
    console.warn('Supabase not configured - cloud history unavailable');
    return [];
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.warn('User not authenticated - cloud history unavailable');
      return [];
    }

    const { data, error } = await supabase
      .from('loan_history')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Failed to load cloud history:', error);
      return [];
    }

    if (!data) {
      return [];
    }

    return data.map(rowToHistory);
  } catch (error) {
    console.error('Unexpected error loading cloud history:', error);
    return [];
  }
};

/**
 * Save history item to Supabase cloud storage
 *
 * @param history - History item to save
 * @returns Promise<boolean> - Success status
 */
export const saveCloudHistoryItem = async (history: LoanHistory): Promise<boolean> => {
  if (!supabase) {
    console.warn('Supabase not configured - cloud save unavailable');
    return false;
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.warn('User not authenticated - cloud save unavailable');
      return false;
    }

    const { error } = await supabase
      .from('loan_history')
      .upsert(historyToInsert(history, user.id), {
        onConflict: 'id',
      });

    if (error) {
      console.error('Failed to save cloud history item:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error saving cloud history:', error);
    return false;
  }
};

/**
 * Delete history item from Supabase cloud storage
 *
 * @param historyId - ID of history item to delete
 * @returns Promise<boolean> - Success status
 */
export const deleteCloudHistoryItem = async (historyId: string): Promise<boolean> => {
  if (!supabase) {
    console.warn('Supabase not configured - cloud delete unavailable');
    return false;
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.warn('User not authenticated - cloud delete unavailable');
      return false;
    }

    const { error } = await supabase
      .from('loan_history')
      .delete()
      .eq('id', historyId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Failed to delete cloud history item:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error deleting cloud history:', error);
    return false;
  }
};

/**
 * Clear all cloud history for current user
 *
 * @returns Promise<boolean> - Success status
 */
export const clearCloudHistory = async (): Promise<boolean> => {
  if (!supabase) {
    console.warn('Supabase not configured - cloud clear unavailable');
    return false;
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.warn('User not authenticated - cloud clear unavailable');
      return false;
    }

    const { error } = await supabase
      .from('loan_history')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      console.error('Failed to clear cloud history:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error clearing cloud history:', error);
    return false;
  }
};

/**
 * Sync localStorage history to cloud
 * Called after user logs in to upload local history
 *
 * Strategy: Merge local and cloud history, keeping newest 20 items
 *
 * @returns Promise<boolean> - Success status
 */
export const syncLocalToCloud = async (): Promise<boolean> => {
  if (!supabase) {
    console.warn('Supabase not configured - sync unavailable');
    return false;
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.warn('User not authenticated - sync unavailable');
      return false;
    }

    // Load local history
    const localHistory = loadLocalHistory();
    if (localHistory.length === 0) {
      console.log('No local history to sync');
      return true;
    }

    // Load cloud history
    const cloudHistory = await loadCloudHistory();

    // Merge: create a map by ID to avoid duplicates
    const mergedMap = new Map<string, LoanHistory>();

    // Add cloud items first
    cloudHistory.forEach((item) => {
      mergedMap.set(item.id, item);
    });

    // Add/override with local items (local is source of truth)
    localHistory.forEach((item) => {
      mergedMap.set(item.id, item);
    });

    // Convert to array and sort by timestamp (newest first)
    const mergedHistory = Array.from(mergedMap.values())
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 20); // Keep only 20 newest

    // Upload all items to cloud
    const uploadPromises = mergedHistory.map((item) =>
      saveCloudHistoryItem(item)
    );

    const results = await Promise.all(uploadPromises);
    const allSucceeded = results.every((r) => r);

    if (allSucceeded) {
      console.log(`Synced ${mergedHistory.length} items to cloud`);
      // Update local storage with merged history
      saveLocalHistory(mergedHistory);
      return true;
    } else {
      console.error('Some items failed to sync to cloud');
      return false;
    }
  } catch (error) {
    console.error('Unexpected error syncing to cloud:', error);
    return false;
  }
};

/**
 * Sync cloud history to localStorage
 * Called after user logs in to download cloud history
 *
 * Strategy: Merge cloud and local, keeping newest 20 items
 *
 * @returns Promise<boolean> - Success status
 */
export const syncCloudToLocal = async (): Promise<boolean> => {
  if (!supabase) {
    console.warn('Supabase not configured - sync unavailable');
    return false;
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.warn('User not authenticated - sync unavailable');
      return false;
    }

    // Load cloud history
    const cloudHistory = await loadCloudHistory();
    if (cloudHistory.length === 0) {
      console.log('No cloud history to sync');
      return true;
    }

    // Load local history
    const localHistory = loadLocalHistory();

    // Merge: create a map by ID to avoid duplicates
    const mergedMap = new Map<string, LoanHistory>();

    // Add local items first
    localHistory.forEach((item) => {
      mergedMap.set(item.id, item);
    });

    // Add/override with cloud items (cloud is source of truth after login)
    cloudHistory.forEach((item) => {
      mergedMap.set(item.id, item);
    });

    // Convert to array and sort by timestamp (newest first)
    const mergedHistory = Array.from(mergedMap.values())
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 20); // Keep only 20 newest

    // Save merged history to localStorage
    saveLocalHistory(mergedHistory);

    console.log(`Synced ${mergedHistory.length} items from cloud to local`);
    return true;
  } catch (error) {
    console.error('Unexpected error syncing from cloud:', error);
    return false;
  }
};

/**
 * Full bidirectional sync
 * Call this after user logs in
 *
 * Strategy:
 * 1. Load local and cloud history
 * 2. Merge (deduplicate by ID, keep newest 20)
 * 3. Save merged result to both local and cloud
 *
 * @returns Promise<boolean> - Success status
 */
export const syncHistory = async (): Promise<boolean> => {
  if (!supabase) {
    console.warn('Supabase not configured - sync unavailable');
    return false;
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.warn('User not authenticated - sync unavailable');
      return false;
    }

    // Load both local and cloud
    const [localHistory, cloudHistory] = await Promise.all([
      Promise.resolve(loadLocalHistory()),
      loadCloudHistory(),
    ]);

    // Merge: create a map by ID to avoid duplicates
    const mergedMap = new Map<string, LoanHistory>();

    // Add all items (local first, then cloud)
    localHistory.forEach((item) => {
      mergedMap.set(item.id, item);
    });

    cloudHistory.forEach((item) => {
      // If item exists in local, keep local version (more recent)
      if (!mergedMap.has(item.id)) {
        mergedMap.set(item.id, item);
      }
    });

    // Convert to array and sort by timestamp (newest first)
    const mergedHistory = Array.from(mergedMap.values())
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 20); // Keep only 20 newest

    // Save to both local and cloud
    saveLocalHistory(mergedHistory);

    // Upload to cloud (parallel)
    const uploadPromises = mergedHistory.map((item) =>
      saveCloudHistoryItem(item)
    );
    const results = await Promise.all(uploadPromises);
    const allSucceeded = results.every((r) => r);

    if (allSucceeded) {
      console.log(`Full sync complete: ${mergedHistory.length} items synchronized`);
      return true;
    } else {
      console.error('Some items failed to sync to cloud during full sync');
      return false;
    }
  } catch (error) {
    console.error('Unexpected error during full sync:', error);
    return false;
  }
};
