/**
 * useLifeEvents - ライフイベント管理フック
 *
 * 認証撤廃に伴い、ローカルステートのみで動作。
 */

import { useState } from 'react';
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

export const useLifeEvents = (_lifePlanId?: string): UseLifeEventsReturn => {
  const [events, setEvents] = useState<LifeEvent[]>([]);
  const [error, setError] = useState<string | null>(null);

  const createEvent = async (
    params: CreateLifeEventParams
  ): Promise<LifeEvent | null> => {
    const newEvent: LifeEvent = {
      id: `event-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      lifePlanId: params.lifePlanId,
      eventType: params.eventType,
      eventName: params.eventName,
      year: params.year,
      amount: params.amount,
      notes: params.notes,
      createdAt: new Date().toISOString(),
    };
    setEvents((prev) => [...prev, newEvent].sort((a, b) => a.year - b.year));
    return newEvent;
  };

  const updateEvent = async (
    id: string,
    params: UpdateLifeEventParams
  ): Promise<boolean> => {
    setEvents((prev) =>
      prev
        .map((event) =>
          event.id === id ? { ...event, ...params } : event
        )
        .sort((a, b) => a.year - b.year)
    );
    return true;
  };

  const deleteEvent = async (id: string): Promise<boolean> => {
    setEvents((prev) => prev.filter((event) => event.id !== id));
    return true;
  };

  const refreshEvents = async () => {};

  // Suppress unused setter warning
  void setError;

  return {
    events,
    loading: false,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
    refreshEvents,
  };
};
