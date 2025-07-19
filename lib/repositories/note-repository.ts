"use server";

import {
  BaseRepository,
  type PaginationOptions,
  type SearchOptions,
} from "../database/base-repository";

export interface Note {
  id: string;
  title: string;
  content: string;
  category_id?: string;
  is_archived: boolean;
  is_pinned: boolean;
  tags: string[];
  attachments: any[];
  formatting: Record<string, any>;
  word_count: number;
  reading_time: number;
  created_by: string;
  shared_with: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateNoteData {
  title: string;
  content: string;
  category_id?: string;
  tags?: string[];
  formatting?: Record<string, any>;
}

export interface UpdateNoteData {
  title?: string;
  content?: string;
  category_id?: string;
  is_archived?: boolean;
  is_pinned?: boolean;
  tags?: string[];
  formatting?: Record<string, any>;
}

export interface NoteFilters {
  category_id?: string;
  is_archived?: boolean;
  is_pinned?: boolean;
  shared?: boolean;
}

class NoteRepository extends BaseRepository<Note> {
  constructor() {
    super("notes", "note");
  }

  protected applySearchFilter(query: any, searchQuery: string): any {
    return query.or(
      `title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`
    );
  }

  protected calculateStats(data: Note[]): Record<string, any> {
    const total = data.length;
    const archived = data.filter((note) => note.is_archived).length;
    const pinned = data.filter((note) => note.is_pinned).length;
    const shared = data.filter(
      (note) => note.shared_with && note.shared_with.length > 0
    ).length;

    const totalWords = data.reduce((sum, note) => sum + note.word_count, 0);
    const totalReadingTime = data.reduce(
      (sum, note) => sum + note.reading_time,
      0
    );

    const averageWordCount = total > 0 ? Math.round(totalWords / total) : 0;
    const averageReadingTime =
      total > 0 ? Math.round(totalReadingTime / total) : 0;

    return {
      total,
      archived,
      pinned,
      shared,
      totalWords,
      totalReadingTime,
      averageWordCount,
      averageReadingTime,
    };
  }

  /**
   * Get notes with advanced filtering
   */
  async getNotesWithFilters(
    filters: NoteFilters = {},
    pagination: PaginationOptions = { page: 1, limit: 20 },
    searchQuery?: string
  ): Promise<{ data: Note[]; total: number; hasMore: boolean }> {
    const searchOptions: SearchOptions = {
      query: searchQuery,
      filters: {
        ...filters,
        is_archived: filters.is_archived ?? false, // Default to non-archived
      },
    };

    return this.getAll(pagination, searchOptions);
  }

  /**
   * Get pinned notes
   */
  async getPinnedNotes(): Promise<Note[]> {
    const result = await this.getNotesWithFilters({ is_pinned: true });
    return result.data;
  }

  /**
   * Get recent notes
   */
  async getRecentNotes(limit = 10): Promise<Note[]> {
    const result = await this.getNotesWithFilters(
      { is_archived: false },
      { page: 1, limit, sortBy: "updated_at", sortOrder: "desc" }
    );
    return result.data;
  }

  /**
   * Pin/unpin note
   */
  async togglePin(id: string): Promise<Note> {
    const note = await this.getById(id);
    if (!note) {
      throw new Error("Note not found");
    }

    return this.update(id, { is_pinned: !note.is_pinned });
  }

  /**
   * Archive/unarchive note
   */
  async toggleArchive(id: string): Promise<Note> {
    const note = await this.getById(id);
    if (!note) {
      throw new Error("Note not found");
    }

    return this.update(id, { is_archived: !note.is_archived });
  }

  /**
   * Share note with users
   */
  async shareNote(id: string, userIds: string[]): Promise<Note> {
    const note = await this.getById(id);
    if (!note) {
      throw new Error("Note not found");
    }

    const currentSharedWith = note.shared_with || [];
    const newSharedWith = [...new Set([...currentSharedWith, ...userIds])];

    return this.update(id, { shared_with: newSharedWith });
  }

  /**
   * Unshare note from users
   */
  async unshareNote(id: string, userIds: string[]): Promise<Note> {
    const note = await this.getById(id);
    if (!note) {
      throw new Error("Note not found");
    }

    const currentSharedWith = note.shared_with || [];
    const newSharedWith = currentSharedWith.filter(
      (userId) => !userIds.includes(userId)
    );

    return this.update(id, { shared_with: newSharedWith });
  }

  /**
   * Get shared notes
   */
  async getSharedNotes(): Promise<Note[]> {
    const user = await this.getCurrentUser();
    const supabase = await this.getSupabaseClient();

    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .contains("shared_with", [user.id])
      .eq("is_archived", false)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error fetching shared notes:", error);
      throw new Error("Failed to fetch shared notes");
    }

    return data || [];
  }

  /**
   * Search notes with full-text search
   */
  async searchNotes(
    query: string,
    pagination: PaginationOptions = { page: 1, limit: 20 }
  ): Promise<{ data: Note[]; total: number; hasMore: boolean }> {
    const user = await this.getCurrentUser();
    const supabase = await this.getSupabaseClient();
    const { page, limit } = pagination;
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from("notes")
      .select("*", { count: "exact" })
      .eq("created_by", user.id)
      .textSearch("title_content", query, {
        type: "websearch",
        config: "english",
      })
      .eq("is_archived", false)
      .order("updated_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error searching notes:", error);
      throw new Error("Failed to search notes");
    }

    return {
      data: data || [],
      total: count || 0,
      hasMore: (count || 0) > offset + limit,
    };
  }

  /**
   * Get notes by category
   */
  async getNotesByCategory(categoryId: string): Promise<Note[]> {
    const result = await this.getNotesWithFilters({ category_id: categoryId });
    return result.data;
  }

  /**
   * Get notes by tags
   */
  async getNotesByTags(tags: string[]): Promise<Note[]> {
    const user = await this.getCurrentUser();
    const supabase = await this.getSupabaseClient();

    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .eq("created_by", user.id)
      .overlaps("tags", tags)
      .eq("is_archived", false)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error fetching notes by tags:", error);
      throw new Error("Failed to fetch notes by tags");
    }

    return data || [];
  }

  /**
   * Get all unique tags for user's notes
   */
  async getAllTags(): Promise<string[]> {
    const user = await this.getCurrentUser();
    const supabase = await this.getSupabaseClient();

    const { data, error } = await supabase
      .from("notes")
      .select("tags")
      .eq("created_by", user.id)
      .eq("is_archived", false);

    if (error) {
      console.error("Error fetching note tags:", error);
      throw new Error("Failed to fetch note tags");
    }

    const allTags = new Set<string>();
    data?.forEach((note: { tags: string[] }) => {
      note.tags?.forEach((tag: string) => allTags.add(tag));
    });

    return Array.from(allTags).sort();
  }

  /**
   * Duplicate note
   */
  async duplicateNote(id: string): Promise<Note> {
    const note = await this.getById(id);
    if (!note) {
      throw new Error("Note not found");
    }

    const duplicateData: Omit<
      Note,
      "created_by" | "updated_at" | "id" | "created_at"
    > = {
      title: `${note.title} (Copy)`,
      content: note.content,
      category_id: note.category_id,
      tags: note.tags,
      formatting: note.formatting,
      is_archived: false,
      is_pinned: false,
      attachments: [],
      word_count: note.word_count ?? 0,
      reading_time: note.reading_time ?? 0,
      shared_with: [],
    };

    return this.create(duplicateData);
  }
}

export const noteRepository = new NoteRepository();

// Export CRUD functions
export async function createNote(data: CreateNoteData): Promise<Note> {
  const noteData: Omit<
    Note,
    "created_by" | "updated_at" | "id" | "created_at"
  > = {
    title: data.title,
    content: data.content,
    category_id: data.category_id,
    tags: data.tags ?? [],
    formatting: data.formatting ?? {},
    is_archived: false,
    is_pinned: false,
    attachments: [],
    word_count: data.content ? data.content.split(/\s+/).length : 0,
    reading_time: data.content
      ? Math.ceil(data.content.split(/\s+/).length / 200)
      : 0,
    shared_with: [],
  };
  return noteRepository.create(noteData);
}

export async function getNoteById(id: string): Promise<Note | null> {
  return noteRepository.getById(id);
}

export async function getAllNotes(
  pagination?: PaginationOptions,
  search?: SearchOptions
): Promise<{ data: Note[]; total: number; hasMore: boolean }> {
  return noteRepository.getAll(pagination, search);
}

export async function getNotesWithFilters(
  filters?: NoteFilters,
  pagination?: PaginationOptions,
  searchQuery?: string
): Promise<{ data: Note[]; total: number; hasMore: boolean }> {
  return noteRepository.getNotesWithFilters(filters, pagination, searchQuery);
}

export async function updateNote(
  id: string,
  data: UpdateNoteData
): Promise<Note> {
  return noteRepository.update(id, data);
}

export async function deleteNote(id: string): Promise<void> {
  return noteRepository.delete(id);
}

export async function getNoteStats(): Promise<Record<string, any>> {
  return noteRepository.getStats();
}

export async function getPinnedNotes(): Promise<Note[]> {
  return noteRepository.getPinnedNotes();
}

export async function getRecentNotes(limit?: number): Promise<Note[]> {
  return noteRepository.getRecentNotes(limit);
}

export async function toggleNotePin(id: string): Promise<Note> {
  return noteRepository.togglePin(id);
}

export async function toggleNoteArchive(id: string): Promise<Note> {
  return noteRepository.toggleArchive(id);
}

export async function shareNote(id: string, userIds: string[]): Promise<Note> {
  return noteRepository.shareNote(id, userIds);
}

export async function unshareNote(
  id: string,
  userIds: string[]
): Promise<Note> {
  return noteRepository.unshareNote(id, userIds);
}

export async function getSharedNotes(): Promise<Note[]> {
  return noteRepository.getSharedNotes();
}

export async function searchNotes(
  query: string,
  pagination?: PaginationOptions
): Promise<{ data: Note[]; total: number; hasMore: boolean }> {
  return noteRepository.searchNotes(query, pagination);
}

export async function getAllNoteTags(): Promise<string[]> {
  return noteRepository.getAllTags();
}

export async function duplicateNote(id: string): Promise<Note> {
  return noteRepository.duplicateNote(id);
}
