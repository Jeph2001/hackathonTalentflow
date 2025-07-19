"use server";

import {
  createTodo,
  getTodoById,
  getAllTodos,
  getTodosWithFilters,
  updateTodo,
  deleteTodo,
  getTodoStats,
  getOverdueTodos,
  getTodosDueToday,
  completeTodo,
  toggleTodoArchive,
  type Todo,
  type CreateTodoData,
  type UpdateTodoData,
  type TodoFilters,
} from "../repositories/todo-repository";

import {
  createNote,
  getNoteById,
  getAllNotes,
  getNotesWithFilters,
  updateNote,
  deleteNote,
  getNoteStats,
  getPinnedNotes,
  getRecentNotes,
  toggleNotePin,
  toggleNoteArchive,
  shareNote,
  unshareNote,
  getSharedNotes,
  searchNotes,
  getAllNoteTags,
  duplicateNote,
  type Note,
  type CreateNoteData,
  type UpdateNoteData,
  type NoteFilters,
} from "../repositories/note-repository";

import {
  createEvent,
  getEventById,
  getAllEvents,
  getEventsWithFilters,
  updateEvent,
  deleteEvent,
  getEventStats,
  getEventsByDateRange,
  getUpcomingEvents,
  getTodaysEvents,
  getThisWeeksEvents,
  cancelEvent,
  restoreEvent,
  getConflictingEvents,
  duplicateEvent,
  type Event,
  type CreateEventData,
  type UpdateEventData,
  type EventFilters,
} from "../repositories/event-repository";

import {
  createCategory,
  getCategoryById,
  getAllCategories,
  updateCategory,
  deleteCategory,
  getCategoryStats,
  getCategoryUsage,
  canDeleteCategory,
  deleteCategoryWithReassignment,
  type Category,
  type CreateCategoryData,
  type UpdateCategoryData,
} from "../repositories/category-repository";

import type {
  PaginationOptions,
  SearchOptions,
} from "../database/base-repository";

/**
 * Comprehensive API for productivity system
 * Provides unified access to all CRUD operations with caching and error handling
 */

// ============================================================================
// TODO API
// ============================================================================

export const TodoAPI = {
  // Create operations
  async create(data: CreateTodoData): Promise<Todo> {
    try {
      return await createTodo(data);
    } catch (error) {
      console.error("TodoAPI.create error:", error);
      throw new Error("Failed to create todo");
    }
  },

  // Read operations
  async getById(id: string): Promise<Todo | null> {
    try {
      return await getTodoById(id);
    } catch (error) {
      console.error("TodoAPI.getById error:", error);
      throw new Error("Failed to fetch todo");
    }
  },

  async getAll(pagination?: PaginationOptions, search?: SearchOptions) {
    try {
      return await getAllTodos(pagination, search);
    } catch (error) {
      console.error("TodoAPI.getAll error:", error);
      throw new Error("Failed to fetch todos");
    }
  },

  async getWithFilters(
    filters?: TodoFilters,
    pagination?: PaginationOptions,
    searchQuery?: string
  ) {
    try {
      return await getTodosWithFilters(filters, pagination, searchQuery);
    } catch (error) {
      console.error("TodoAPI.getWithFilters error:", error);
      throw new Error("Failed to fetch filtered todos");
    }
  },

  async getOverdue(): Promise<Todo[]> {
    try {
      return await getOverdueTodos();
    } catch (error) {
      console.error("TodoAPI.getOverdue error:", error);
      throw new Error("Failed to fetch overdue todos");
    }
  },

  async getDueToday(): Promise<Todo[]> {
    try {
      return await getTodosDueToday();
    } catch (error) {
      console.error("TodoAPI.getDueToday error:", error);
      throw new Error("Failed to fetch todos due today");
    }
  },

  async getStats(): Promise<Record<string, any>> {
    try {
      return await getTodoStats();
    } catch (error) {
      console.error("TodoAPI.getStats error:", error);
      throw new Error("Failed to fetch todo statistics");
    }
  },

  // Update operations
  async update(id: string, data: UpdateTodoData): Promise<Todo> {
    try {
      return await updateTodo(id, data);
    } catch (error) {
      console.error("TodoAPI.update error:", error);
      throw new Error("Failed to update todo");
    }
  },

  async complete(id: string): Promise<Todo> {
    try {
      return await completeTodo(id);
    } catch (error) {
      console.error("TodoAPI.complete error:", error);
      throw new Error("Failed to complete todo");
    }
  },

  async toggleArchive(id: string): Promise<Todo> {
    try {
      return await toggleTodoArchive(id);
    } catch (error) {
      console.error("TodoAPI.toggleArchive error:", error);
      throw new Error("Failed to toggle todo archive status");
    }
  },

  // Delete operations
  async delete(id: string): Promise<void> {
    try {
      return await deleteTodo(id);
    } catch (error) {
      console.error("TodoAPI.delete error:", error);
      throw new Error("Failed to delete todo");
    }
  },
};

// ============================================================================
// NOTE API
// ============================================================================

export const NoteAPI = {
  // Create operations
  async create(data: CreateNoteData): Promise<Note> {
    try {
      return await createNote(data);
    } catch (error) {
      console.error("NoteAPI.create error:", error);
      throw new Error("Failed to create note");
    }
  },

  async duplicate(id: string): Promise<Note> {
    try {
      return await duplicateNote(id);
    } catch (error) {
      console.error("NoteAPI.duplicate error:", error);
      throw new Error("Failed to duplicate note");
    }
  },

  // Read operations
  async getById(id: string): Promise<Note | null> {
    try {
      return await getNoteById(id);
    } catch (error) {
      console.error("NoteAPI.getById error:", error);
      throw new Error("Failed to fetch note");
    }
  },

  async getAll(pagination?: PaginationOptions, search?: SearchOptions) {
    try {
      return await getAllNotes(pagination, search);
    } catch (error) {
      console.error("NoteAPI.getAll error:", error);
      throw new Error("Failed to fetch notes");
    }
  },

  async getWithFilters(
    filters?: NoteFilters,
    pagination?: PaginationOptions,
    searchQuery?: string
  ) {
    try {
      return await getNotesWithFilters(filters, pagination, searchQuery);
    } catch (error) {
      console.error("NoteAPI.getWithFilters error:", error);
      throw new Error("Failed to fetch filtered notes");
    }
  },

  async getPinned(): Promise<Note[]> {
    try {
      return await getPinnedNotes();
    } catch (error) {
      console.error("NoteAPI.getPinned error:", error);
      throw new Error("Failed to fetch pinned notes");
    }
  },

  async getRecent(limit?: number): Promise<Note[]> {
    try {
      return await getRecentNotes(limit);
    } catch (error) {
      console.error("NoteAPI.getRecent error:", error);
      throw new Error("Failed to fetch recent notes");
    }
  },

  async getShared(): Promise<Note[]> {
    try {
      return await getSharedNotes();
    } catch (error) {
      console.error("NoteAPI.getShared error:", error);
      throw new Error("Failed to fetch shared notes");
    }
  },

  async search(query: string, pagination?: PaginationOptions) {
    try {
      return await searchNotes(query, pagination);
    } catch (error) {
      console.error("NoteAPI.search error:", error);
      throw new Error("Failed to search notes");
    }
  },

  async getAllTags(): Promise<string[]> {
    try {
      return await getAllNoteTags();
    } catch (error) {
      console.error("NoteAPI.getAllTags error:", error);
      throw new Error("Failed to fetch note tags");
    }
  },

  async getStats(): Promise<Record<string, any>> {
    try {
      return await getNoteStats();
    } catch (error) {
      console.error("NoteAPI.getStats error:", error);
      throw new Error("Failed to fetch note statistics");
    }
  },

  // Update operations
  async update(id: string, data: UpdateNoteData): Promise<Note> {
    try {
      return await updateNote(id, data);
    } catch (error) {
      console.error("NoteAPI.update error:", error);
      throw new Error("Failed to update note");
    }
  },

  async togglePin(id: string): Promise<Note> {
    try {
      return await toggleNotePin(id);
    } catch (error) {
      console.error("NoteAPI.togglePin error:", error);
      throw new Error("Failed to toggle note pin status");
    }
  },

  async toggleArchive(id: string): Promise<Note> {
    try {
      return await toggleNoteArchive(id);
    } catch (error) {
      console.error("NoteAPI.toggleArchive error:", error);
      throw new Error("Failed to toggle note archive status");
    }
  },

  async share(id: string, userIds: string[]): Promise<Note> {
    try {
      return await shareNote(id, userIds);
    } catch (error) {
      console.error("NoteAPI.share error:", error);
      throw new Error("Failed to share note");
    }
  },

  async unshare(id: string, userIds: string[]): Promise<Note> {
    try {
      return await unshareNote(id, userIds);
    } catch (error) {
      console.error("NoteAPI.unshare error:", error);
      throw new Error("Failed to unshare note");
    }
  },

  // Delete operations
  async delete(id: string): Promise<void> {
    try {
      return await deleteNote(id);
    } catch (error) {
      console.error("NoteAPI.delete error:", error);
      throw new Error("Failed to delete note");
    }
  },
};

// ============================================================================
// EVENT API
// ============================================================================

export const EventAPI = {
  // Create operations
  async create(data: CreateEventData): Promise<Event> {
    try {
      return await createEvent(data);
    } catch (error) {
      console.error("EventAPI.create error:", error);
      throw new Error("Failed to create event");
    }
  },

  async duplicate(id: string, newStartTime?: string): Promise<Event> {
    try {
      return await duplicateEvent(id, newStartTime);
    } catch (error) {
      console.error("EventAPI.duplicate error:", error);
      throw new Error("Failed to duplicate event");
    }
  },

  // Read operations
  async getById(id: string): Promise<Event | null> {
    try {
      return await getEventById(id);
    } catch (error) {
      console.error("EventAPI.getById error:", error);
      throw new Error("Failed to fetch event");
    }
  },

  async getAll(pagination?: PaginationOptions, search?: SearchOptions) {
    try {
      return await getAllEvents(pagination, search);
    } catch (error) {
      console.error("EventAPI.getAll error:", error);
      throw new Error("Failed to fetch events");
    }
  },

  async getWithFilters(
    filters?: EventFilters,
    pagination?: PaginationOptions,
    searchQuery?: string
  ) {
    try {
      return await getEventsWithFilters(filters, pagination, searchQuery);
    } catch (error) {
      console.error("EventAPI.getWithFilters error:", error);
      throw new Error("Failed to fetch filtered events");
    }
  },

  async getByDateRange(
    startDate: string,
    endDate: string,
    pagination?: PaginationOptions
  ) {
    try {
      return await getEventsByDateRange(startDate, endDate, pagination);
    } catch (error) {
      console.error("EventAPI.getByDateRange error:", error);
      throw new Error("Failed to fetch events by date range");
    }
  },

  async getUpcoming(limit?: number): Promise<Event[]> {
    try {
      return await getUpcomingEvents(limit);
    } catch (error) {
      console.error("EventAPI.getUpcoming error:", error);
      throw new Error("Failed to fetch upcoming events");
    }
  },

  async getTodays(): Promise<Event[]> {
    try {
      return await getTodaysEvents();
    } catch (error) {
      console.error("EventAPI.getTodays error:", error);
      throw new Error("Failed to fetch today's events");
    }
  },

  async getThisWeeks(): Promise<Event[]> {
    try {
      return await getThisWeeksEvents();
    } catch (error) {
      console.error("EventAPI.getThisWeeks error:", error);
      throw new Error("Failed to fetch this week's events");
    }
  },

  async getConflicting(
    startTime: string,
    endTime: string,
    excludeEventId?: string
  ): Promise<Event[]> {
    try {
      return await getConflictingEvents(startTime, endTime, excludeEventId);
    } catch (error) {
      console.error("EventAPI.getConflicting error:", error);
      throw new Error("Failed to fetch conflicting events");
    }
  },

  async getStats(): Promise<Record<string, any>> {
    try {
      return await getEventStats();
    } catch (error) {
      console.error("EventAPI.getStats error:", error);
      throw new Error("Failed to fetch event statistics");
    }
  },

  // Update operations
  async update(id: string, data: UpdateEventData): Promise<Event> {
    try {
      return await updateEvent(id, data);
    } catch (error) {
      console.error("EventAPI.update error:", error);
      throw new Error("Failed to update event");
    }
  },

  async cancel(id: string): Promise<Event> {
    try {
      return await cancelEvent(id);
    } catch (error) {
      console.error("EventAPI.cancel error:", error);
      throw new Error("Failed to cancel event");
    }
  },

  async restore(id: string): Promise<Event> {
    try {
      return await restoreEvent(id);
    } catch (error) {
      console.error("EventAPI.restore error:", error);
      throw new Error("Failed to restore event");
    }
  },

  // Delete operations
  async delete(id: string): Promise<void> {
    try {
      return await deleteEvent(id);
    } catch (error) {
      console.error("EventAPI.delete error:", error);
      throw new Error("Failed to delete event");
    }
  },
};

// ============================================================================
// CATEGORY API
// ============================================================================

export const CategoryAPI = {
  // Create operations
  async create(data: CreateCategoryData): Promise<Category> {
    try {
      return await createCategory(data);
    } catch (error) {
      console.error("CategoryAPI.create error:", error);
      throw new Error("Failed to create category");
    }
  },

  // Read operations
  async getById(id: string): Promise<Category | null> {
    try {
      return await getCategoryById(id);
    } catch (error) {
      console.error("CategoryAPI.getById error:", error);
      throw new Error("Failed to fetch category");
    }
  },

  async getAll(pagination?: PaginationOptions, search?: SearchOptions) {
    try {
      return await getAllCategories(pagination, search);
    } catch (error) {
      console.error("CategoryAPI.getAll error:", error);
      throw new Error("Failed to fetch categories");
    }
  },

  async getUsage() {
    try {
      return await getCategoryUsage();
    } catch (error) {
      console.error("CategoryAPI.getUsage error:", error);
      throw new Error("Failed to fetch category usage");
    }
  },

  async canDelete(id: string) {
    try {
      return await canDeleteCategory(id);
    } catch (error) {
      console.error("CategoryAPI.canDelete error:", error);
      throw new Error("Failed to check if category can be deleted");
    }
  },

  async getStats(): Promise<Record<string, any>> {
    try {
      return await getCategoryStats();
    } catch (error) {
      console.error("CategoryAPI.getStats error:", error);
      throw new Error("Failed to fetch category statistics");
    }
  },

  // Update operations
  async update(id: string, data: UpdateCategoryData): Promise<Category> {
    try {
      return await updateCategory(id, data);
    } catch (error) {
      console.error("CategoryAPI.update error:", error);
      throw new Error("Failed to update category");
    }
  },

  // Delete operations
  async delete(id: string): Promise<void> {
    try {
      return await deleteCategory(id);
    } catch (error) {
      console.error("CategoryAPI.delete error:", error);
      throw new Error("Failed to delete category");
    }
  },

  async deleteWithReassignment(
    id: string,
    reassignToCategoryId?: string
  ): Promise<void> {
    try {
      return await deleteCategoryWithReassignment(id, reassignToCategoryId);
    } catch (error) {
      console.error("CategoryAPI.deleteWithReassignment error:", error);
      throw new Error("Failed to delete category with reassignment");
    }
  },
};

// ============================================================================
// UNIFIED DASHBOARD API
// ============================================================================

export const DashboardAPI = {
  /**
   * Get comprehensive dashboard data for the current user
   */
  async getDashboardData(): Promise<{
    todos: {
      stats: Record<string, any>;
      overdue: Todo[];
      dueToday: Todo[];
      recent: Todo[];
    };
    notes: {
      stats: Record<string, any>;
      pinned: Note[];
      recent: Note[];
      tags: string[];
    };
    events: {
      stats: Record<string, any>;
      upcoming: Event[];
      today: Event[];
      thisWeek: Event[];
    };
    categories: {
      stats: Record<string, any>;
      usage: Array<{
        category: Category;
        usage: { todos: number; notes: number; events: number };
      }>;
    };
  }> {
    try {
      const [
        todoStats,
        overdueTodos,
        todosDueToday,
        recentTodos,
        noteStats,
        pinnedNotes,
        recentNotes,
        noteTags,
        eventStats,
        upcomingEvents,
        todaysEvents,
        thisWeeksEvents,
        categoryStats,
        categoryUsage,
      ] = await Promise.all([
        TodoAPI.getStats(),
        TodoAPI.getOverdue(),
        TodoAPI.getDueToday(),
        TodoAPI.getWithFilters(
          {},
          { page: 1, limit: 5, sortBy: "updated_at", sortOrder: "desc" }
        ),
        NoteAPI.getStats(),
        NoteAPI.getPinned(),
        NoteAPI.getRecent(5),
        NoteAPI.getAllTags(),
        EventAPI.getStats(),
        EventAPI.getUpcoming(5),
        EventAPI.getTodays(),
        EventAPI.getThisWeeks(),
        CategoryAPI.getStats(),
        CategoryAPI.getUsage(),
      ]);

      return {
        todos: {
          stats: todoStats,
          overdue: overdueTodos,
          dueToday: todosDueToday,
          recent: recentTodos.data,
        },
        notes: {
          stats: noteStats,
          pinned: pinnedNotes,
          recent: recentNotes,
          tags: noteTags,
        },
        events: {
          stats: eventStats,
          upcoming: upcomingEvents,
          today: todaysEvents,
          thisWeek: thisWeeksEvents,
        },
        categories: {
          stats: categoryStats,
          usage: categoryUsage,
        },
      };
    } catch (error) {
      console.error("DashboardAPI.getDashboardData error:", error);
      throw new Error("Failed to fetch dashboard data");
    }
  },

  /**
   * Get quick stats for dashboard widgets
   */
  async getQuickStats(): Promise<{
    totalTodos: number;
    completedTodos: number;
    totalNotes: number;
    totalEvents: number;
    upcomingEvents: number;
    overdueTodos: number;
  }> {
    try {
      const [todoStats, noteStats, eventStats, overdueTodos] =
        await Promise.all([
          TodoAPI.getStats(),
          NoteAPI.getStats(),
          EventAPI.getStats(),
          TodoAPI.getOverdue(),
        ]);

      return {
        totalTodos: todoStats.total,
        completedTodos: todoStats.completed,
        totalNotes: noteStats.total,
        totalEvents: eventStats.total,
        upcomingEvents: eventStats.upcoming,
        overdueTodos: overdueTodos.length,
      };
    } catch (error) {
      console.error("DashboardAPI.getQuickStats error:", error);
      throw new Error("Failed to fetch quick stats");
    }
  },
};

// Export all APIs

// Export types for convenience
export type {
  Todo,
  CreateTodoData,
  UpdateTodoData,
  TodoFilters,
  Note,
  CreateNoteData,
  UpdateNoteData,
  NoteFilters,
  Event,
  CreateEventData,
  UpdateEventData,
  EventFilters,
  Category,
  CreateCategoryData,
  UpdateCategoryData,
  PaginationOptions,
  SearchOptions,
};
