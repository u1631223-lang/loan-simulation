/**
 * useLifeEvents - ライフイベント管理フック
 *
 * ライフイベントのCRUD操作を提供
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import type {
  LifeEvent,
  CreateLifeEventParams,
  UpdateLifeEventParams,
} from '@/types/lifePlan';

interface UseLifeEventsReturn {
  events: LifeEvent[];
  loading: boolean;
  error: string | null;
  createEvent: (params: CreateLifeEventParams) => Promise<LifeEvent | null>;
  updateEvent: (id: string, params: UpdateLifeEventParams) => Promise<boolean>;
  deleteEvent: (id: string) => Promise<boolean>;
  refreshEvents: () => Promise<void>;
}

export const useLifeEvents = (lifePlanId?: string): UseLifeEventsReturn => {
  const { user } = useAuth();
  const [events, setEvents] = useState<LifeEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // イベント一覧を取得
  const fetchEvents = useCallback(async () => {
    if (!lifePlanId || !supabase) {
      setEvents([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('life_events')
        .select('*')
        .eq('life_plan_id', lifePlanId)
        .order('year', { ascending: true });

      if (fetchError) throw fetchError;

      setEvents(
        (data || []).map((item) => ({
          id: item.id,
          lifePlanId: item.life_plan_id,
          eventType: item.event_type,
          eventName: item.event_name,
          year: item.year,
          amount: item.amount,
          notes: item.notes,
          createdAt: item.created_at,
        }))
      );
    } catch (err) {
      console.error('Error fetching life events:', err);
      setError(err instanceof Error ? err.message : 'イベントの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [lifePlanId]);

  // イベント作成
  const createEvent = async (
    params: CreateLifeEventParams
  ): Promise<LifeEvent | null> => {
    if (!user || !supabase) {
      setError(!supabase ? '認証が設定されていません' : 'ログインが必要です');
      return null;
    }

    try {
      setError(null);

      const { data, error: createError } = await supabase
        .from('life_events')
        .insert({
          life_plan_id: params.lifePlanId,
          event_type: params.eventType,
          event_name: params.eventName,
          year: params.year,
          amount: params.amount,
          notes: params.notes,
        })
        .select()
        .single();

      if (createError) throw createError;

      const newEvent: LifeEvent = {
        id: data.id,
        lifePlanId: data.life_plan_id,
        eventType: data.event_type,
        eventName: data.event_name,
        year: data.year,
        amount: data.amount,
        notes: data.notes,
        createdAt: data.created_at,
      };

      setEvents((prev) => [...prev, newEvent].sort((a, b) => a.year - b.year));
      return newEvent;
    } catch (err) {
      console.error('Error creating life event:', err);
      setError(err instanceof Error ? err.message : 'イベントの作成に失敗しました');
      return null;
    }
  };

  // イベント更新
  const updateEvent = async (
    id: string,
    params: UpdateLifeEventParams
  ): Promise<boolean> => {
    if (!supabase) {
      setError('認証が設定されていません');
      return false;
    }

    try {
      setError(null);

      const updateData: Record<string, unknown> = {};
      if (params.eventType !== undefined) updateData.event_type = params.eventType;
      if (params.eventName !== undefined) updateData.event_name = params.eventName;
      if (params.year !== undefined) updateData.year = params.year;
      if (params.amount !== undefined) updateData.amount = params.amount;
      if (params.notes !== undefined) updateData.notes = params.notes;

      const { error: updateError } = await supabase
        .from('life_events')
        .update(updateData)
        .eq('id', id);

      if (updateError) throw updateError;

      setEvents((prev) =>
        prev
          .map((event) =>
            event.id === id ? { ...event, ...params } : event
          )
          .sort((a, b) => a.year - b.year)
      );

      return true;
    } catch (err) {
      console.error('Error updating life event:', err);
      setError(err instanceof Error ? err.message : 'イベントの更新に失敗しました');
      return false;
    }
  };

  // イベント削除
  const deleteEvent = async (id: string): Promise<boolean> => {
    if (!supabase) {
      setError('認証が設定されていません');
      return false;
    }

    try {
      setError(null);

      const { error: deleteError } = await supabase
        .from('life_events')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setEvents((prev) => prev.filter((event) => event.id !== id));
      return true;
    } catch (err) {
      console.error('Error deleting life event:', err);
      setError(err instanceof Error ? err.message : 'イベントの削除に失敗しました');
      return false;
    }
  };

  // 初回ロード
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return {
    events,
    loading,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
    refreshEvents: fetchEvents,
  };
};
