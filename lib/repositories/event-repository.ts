"use server";

import {
  BaseRepository,
  type PaginationOptions,
  type SearchOptions,
} from "../database/base-repository";

export interface Event {
  id: string;
  title: string;
  description?: string;
  category_id?: string;
  start_time: string;
  end_time: string;
  target_date: string;
  location?: string;
  is_all_day: boolean;
  recurrence: "none" | "daily" | "weekly" | "monthly" | "yearly";
  recurrence_end_date?: string;
  recurrence_interval: number;
  attendees: any[];
  reminders: any[];
  meeting_url?: string;
  is_cancelled: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateEventData {
  title: string;
  description?: string;
  category_id?: string;
  is_cancelled?: boolean; // Optional, defaults to false
  start_time: string;
  target_date?: string; // Optional, defaults to start_time if not provided
  end_time: string;
  location?: string;
  is_all_day?: boolean;
  recurrence?: Event["recurrence"];
  recurrence_end_date?: string;
  recurrence_interval?: number;
  attendees?: any[];
  reminders?: any[];
  meeting_url?: string;
}

export interface UpdateEventData {
  title?: string;
  description?: string;
  category_id?: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  is_all_day?: boolean;
  recurrence?: Event["recurrence"];
  recurrence_end_date?: string;
  recurrence_interval?: number;
  attendees?: any[];
  reminders?: any[];
  meeting_url?: string;
  is_cancelled?: boolean;
}

export interface EventFilters {
  category_id?: string;
  is_all_day?: boolean;
  is_cancelled?: boolean;
  start_date?: string;
  end_date?: string;
  recurrence?: Event["recurrence"];
}

class EventRepository extends BaseRepository<Event> {
  constructor() {
    super("events", "event");
  }

  protected applySearchFilter(query: any, searchQuery: string): any {
    return query.or(
      `title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%`
    );
  }

  protected calculateStats(data: Event[]): Record<string, any> {
    const total = data.length;
    const upcoming = data.filter(
      (event) => new Date(event.start_time) > new Date() && !event.is_cancelled
    ).length;
    const past = data.filter(
      (event) => new Date(event.end_time) < new Date() && !event.is_cancelled
    ).length;
    const cancelled = data.filter((event) => event.is_cancelled).length;
    const allDay = data.filter((event) => event.is_all_day).length;
    const recurring = data.filter(
      (event) => event.recurrence !== "none"
    ).length;

    const byRecurrence = {
      none: data.filter((event) => event.recurrence === "none").length,
      daily: data.filter((event) => event.recurrence === "daily").length,
      weekly: data.filter((event) => event.recurrence === "weekly").length,
      monthly: data.filter((event) => event.recurrence === "monthly").length,
      yearly: data.filter((event) => event.recurrence === "yearly").length,
    };

    return {
      total,
      upcoming,
      past,
      cancelled,
      allDay,
      recurring,
      byRecurrence,
    };
  }

  /**
   * Get events with advanced filtering
   */
  async getEventsWithFilters(
    filters: EventFilters = {},
    pagination: PaginationOptions = { page: 1, limit: 20 },
    searchQuery?: string
  ): Promise<{ data: Event[]; total: number; hasMore: boolean }> {
    const searchOptions: SearchOptions = {
      query: searchQuery,
      filters: {
        ...filters,
        is_cancelled: filters.is_cancelled ?? false, // Default to non-cancelled
      },
    };

    return this.getAll(pagination, searchOptions);
  }

  /**
   * Get events for a specific date range
   */
  async getEventsByDateRange(
    startDate: string,
    endDate: string,
    pagination: PaginationOptions = { page: 1, limit: 100 }
  ): Promise<{ data: Event[]; total: number; hasMore: boolean }> {
    const user = await this.getCurrentUser();
    const supabase = await this.getSupabaseClient();
    const { page, limit } = pagination;
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from("events")
      .select("*", { count: "exact" })
      .eq("created_by", user.id)
      .gte("start_time", startDate)
      .lte("start_time", endDate)
      .eq("is_cancelled", false)
      .order("start_time", { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching events by date range:", error);
      throw new Error("Failed to fetch events by date range");
    }

    return {
      data: data || [],
      total: count || 0,
      hasMore: (count || 0) > offset + limit,
    };
  }

  /**
   * Get upcoming events
   */
  async getUpcomingEvents(limit = 10): Promise<Event[]> {
    const user = await this.getCurrentUser();
    const supabase = await this.getSupabaseClient();

    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("created_by", user.id)
      .gte("start_time", new Date().toISOString())
      .eq("is_cancelled", false)
      .order("start_time", { ascending: true })
      .limit(limit);

    if (error) {
      console.error("Error fetching upcoming events:", error);
      throw new Error("Failed to fetch upcoming events");
    }

    return data || [];
  }

  /**
   * Get events for today
   */
  async getTodaysEvents(): Promise<Event[]> {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
    const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

    const result = await this.getEventsByDateRange(startOfDay, endOfDay);
    return result.data;
  }

  /**
   * Get events for this week
   */
  async getThisWeeksEvents(): Promise<Event[]> {
    const today = new Date();
    const startOfWeek = new Date(
      today.setDate(today.getDate() - today.getDay())
    );
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const result = await this.getEventsByDateRange(
      startOfWeek.toISOString(),
      endOfWeek.toISOString()
    );
    return result.data;
  }

  /**
   * Cancel event
   */
  async cancelEvent(id: string): Promise<Event> {
    return this.update(id, { is_cancelled: true });
  }

  /**
   * Restore cancelled event
   */
  async restoreEvent(id: string): Promise<Event> {
    return this.update(id, { is_cancelled: false });
  }

  /**
   * Add attendee to event
   */
  async addAttendee(
    eventId: string,
    attendee: { email: string; name: string; status: string }
  ): Promise<Event> {
    const event = await this.getById(eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    const attendees = [
      ...(event.attendees || []),
      {
        id: crypto.randomUUID(),
        ...attendee,
        added_at: new Date().toISOString(),
      },
    ];

    return this.update(eventId, { attendees });
  }

  /**
   * Remove attendee from event
   */
  async removeAttendee(eventId: string, attendeeId: string): Promise<Event> {
    const event = await this.getById(eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    const attendees = (event.attendees || []).filter(
      (attendee: any) => attendee.id !== attendeeId
    );

    return this.update(eventId, { attendees });
  }

  /**
   * Update attendee status
   */
  async updateAttendeeStatus(
    eventId: string,
    attendeeId: string,
    status: string
  ): Promise<Event> {
    const event = await this.getById(eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    const attendees = (event.attendees || []).map((attendee: any) =>
      attendee.id === attendeeId
        ? { ...attendee, status, updated_at: new Date().toISOString() }
        : attendee
    );

    return this.update(eventId, { attendees });
  }

  /**
   * Add reminder to event
   */
  async addReminder(
    eventId: string,
    reminder: { type: string; minutes_before: number; message?: string }
  ): Promise<Event> {
    const event = await this.getById(eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    const reminders = [
      ...(event.reminders || []),
      {
        id: crypto.randomUUID(),
        ...reminder,
        created_at: new Date().toISOString(),
      },
    ];

    return this.update(eventId, { reminders });
  }

  /**
   * Remove reminder from event
   */
  async removeReminder(eventId: string, reminderId: string): Promise<Event> {
    const event = await this.getById(eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    const reminders = (event.reminders || []).filter(
      (reminder: any) => reminder.id !== reminderId
    );

    return this.update(eventId, { reminders });
  }

  /**
   * Get conflicting events
   */
  async getConflictingEvents(
    startTime: string,
    endTime: string,
    excludeEventId?: string
  ): Promise<Event[]> {
    const user = await this.getCurrentUser();
    const supabase = await this.getSupabaseClient();

    let query = supabase
      .from("events")
      .select("*")
      .eq("created_by", user.id)
      .eq("is_cancelled", false)
      .or(
        `and(start_time.lte.${startTime},end_time.gt.${startTime}),and(start_time.lt.${endTime},end_time.gte.${endTime}),and(start_time.gte.${startTime},end_time.lte.${endTime})`
      );

    if (excludeEventId) {
      query = query.neq("id", excludeEventId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching conflicting events:", error);
      throw new Error("Failed to fetch conflicting events");
    }

    return data || [];
  }

  /**
   * Get events by category
   */
  async getEventsByCategory(categoryId: string): Promise<Event[]> {
    const result = await this.getEventsWithFilters({ category_id: categoryId });
    return result.data;
  }

  /**
   * Duplicate event
   */
  async duplicateEvent(id: string, newStartTime?: string): Promise<Event> {
    const event = await this.getById(id);
    if (!event) {
      throw new Error("Event not found");
    }

    const originalStart = new Date(event.start_time);
    const originalEnd = new Date(event.end_time);
    const duration = originalEnd.getTime() - originalStart.getTime();

    const newStart = newStartTime
      ? new Date(newStartTime)
      : new Date(originalStart.getTime() + 7 * 24 * 60 * 60 * 1000); // Default: 1 week later
    const newEnd = new Date(newStart.getTime() + duration);

    const duplicateData = {
      title: `${event.title} (Copy)`,
      description: event.description,
      category_id: event.category_id,
      start_time: newStart.toISOString(),
      end_time: newEnd.toISOString(),
      target_date: event.target_date ?? newStart.toISOString(),
      location: event.location,
      is_all_day: event.is_all_day,
      recurrence: event.recurrence,
      recurrence_end_date: event.recurrence_end_date,
      recurrence_interval: event.recurrence_interval,
      attendees: event.attendees,
      reminders: event.reminders,
      meeting_url: event.meeting_url,
      is_cancelled: false,
    };

    return this.create(duplicateData);
  }
}

export const eventRepository = new EventRepository();

// Export CRUD functions
export async function createEvent(data: CreateEventData): Promise<Event> {
  // Ensure recurrence is always a valid value
  const eventData = {
    ...data,
    recurrence: data.recurrence ?? "none",
  };
  return eventRepository.create(
    eventData as Omit<Event, "created_by" | "id" | "created_at" | "updated_at">
  );
}
export async function getEventById(id: string): Promise<Event | null> {
  return eventRepository.getById(id);
}

export async function getAllEvents(
  pagination?: PaginationOptions,
  search?: SearchOptions
): Promise<{ data: Event[]; total: number; hasMore: boolean }> {
  return eventRepository.getAll(pagination, search);
}

export async function getEventsWithFilters(
  filters?: EventFilters,
  pagination?: PaginationOptions,
  searchQuery?: string
): Promise<{ data: Event[]; total: number; hasMore: boolean }> {
  return eventRepository.getEventsWithFilters(filters, pagination, searchQuery);
}

export async function updateEvent(
  id: string,
  data: UpdateEventData
): Promise<Event> {
  return eventRepository.update(id, data);
}

export async function deleteEvent(id: string): Promise<void> {
  return eventRepository.delete(id);
}

export async function getEventStats(): Promise<Record<string, any>> {
  return eventRepository.getStats();
}

export async function getEventsByDateRange(
  startDate: string,
  endDate: string,
  pagination?: PaginationOptions
): Promise<{ data: Event[]; total: number; hasMore: boolean }> {
  return eventRepository.getEventsByDateRange(startDate, endDate, pagination);
}

export async function getUpcomingEvents(limit?: number): Promise<Event[]> {
  return eventRepository.getUpcomingEvents(limit);
}

export async function getTodaysEvents(): Promise<Event[]> {
  return eventRepository.getTodaysEvents();
}

export async function getThisWeeksEvents(): Promise<Event[]> {
  return eventRepository.getThisWeeksEvents();
}

export async function cancelEvent(id: string): Promise<Event> {
  return eventRepository.cancelEvent(id);
}

export async function restoreEvent(id: string): Promise<Event> {
  return eventRepository.restoreEvent(id);
}

export async function getConflictingEvents(
  startTime: string,
  endTime: string,
  excludeEventId?: string
): Promise<Event[]> {
  return eventRepository.getConflictingEvents(
    startTime,
    endTime,
    excludeEventId
  );
}

export async function duplicateEvent(
  id: string,
  newStartTime?: string
): Promise<Event> {
  return eventRepository.duplicateEvent(id, newStartTime);
}
