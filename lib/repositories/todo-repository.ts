"use server";

import {
  BaseRepository,
  type PaginationOptions,
  type SearchOptions,
} from "../database/base-repository";

export interface Todo {
  id: string;
  title: string;
  description?: string;
  category_id?: string;
  due_date?: string;
  status: "open" | "in_progress" | "completed" | "blocked";
  priority: "high" | "medium" | "low";
  is_archived: boolean;
  completed_at?: string;
  estimated_duration?: number;
  actual_duration?: number;
  tags: string[];
  attachments: any[];
  subtasks: any[];
  created_by: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTodoData {
  title: string;
  description?: string;
  is_archived?: boolean;
  attachments?: any[];
  category_id?: string;
  due_date?: string;
  status?: Todo["status"];
  priority?: Todo["priority"];
  estimated_duration?: number;
  tags?: string[];
  subtasks?: any[];
  assigned_to?: string;
}

export interface UpdateTodoData {
  completed_at: string;
  title?: string;
  description?: string;
  category_id?: string;
  due_date?: string;
  status?: Todo["status"];
  priority?: Todo["priority"];
  is_archived?: boolean;
  estimated_duration?: number;
  actual_duration?: number;
  tags?: string[];
  subtasks?: any[];
  assigned_to?: string;
}

export interface TodoFilters {
  status?: Todo["status"];
  priority?: Todo["priority"];
  category_id?: string;
  is_archived?: boolean;
  due_date_from?: string;
  due_date_to?: string;
  assigned_to?: string;
}

class TodoRepository extends BaseRepository<Todo> {
  constructor() {
    super("todos", "todo");
  }

  protected applySearchFilter(query: any, searchQuery: string): any {
    return query.or(
      `title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`
    );
  }

  protected calculateStats(data: Todo[]): Record<string, any> {
    const total = data.length;
    const completed = data.filter((todo) => todo.status === "completed").length;
    const inProgress = data.filter(
      (todo) => todo.status === "in_progress"
    ).length;
    const overdue = data.filter(
      (todo) =>
        todo.due_date &&
        new Date(todo.due_date) < new Date() &&
        todo.status !== "completed"
    ).length;

    const byPriority = {
      high: data.filter((todo) => todo.priority === "high").length,
      medium: data.filter((todo) => todo.priority === "medium").length,
      low: data.filter((todo) => todo.priority === "low").length,
    };

    const completionRate =
      total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      completed,
      inProgress,
      overdue,
      byPriority,
      completionRate,
    };
  }

  /**
   * Get todos with advanced filtering
   */
  async getTodosWithFilters(
    filters: TodoFilters = {},
    pagination: PaginationOptions = { page: 1, limit: 20 },
    searchQuery?: string
  ): Promise<{ data: Todo[]; total: number; hasMore: boolean }> {
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
   * Get todos by status
   */
  async getTodosByStatus(status: Todo["status"]): Promise<Todo[]> {
    const result = await this.getTodosWithFilters({ status });
    return result.data;
  }

  /**
   * Get overdue todos
   */
  async getOverdueTodos(): Promise<Todo[]> {
    const user = await this.getCurrentUser();
    const supabase = await this.getSupabaseClient();

    const { data, error } = await supabase
      .from("todos")
      .select("*")
      .eq("created_by", user.id)
      .lt("due_date", new Date().toISOString())
      .neq("status", "completed")
      .eq("is_archived", false)
      .order("due_date", { ascending: true });

    if (error) {
      console.error("Error fetching overdue todos:", error);
      throw new Error("Failed to fetch overdue todos");
    }

    return data || [];
  }

  /**
   * Get todos due today
   */
  async getTodosDueToday(): Promise<Todo[]> {
    const user = await this.getCurrentUser();
    const supabase = await this.getSupabaseClient();

    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
    const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

    const { data, error } = await supabase
      .from("todos")
      .select("*")
      .eq("created_by", user.id)
      .gte("due_date", startOfDay)
      .lte("due_date", endOfDay)
      .neq("status", "completed")
      .eq("is_archived", false)
      .order("due_date", { ascending: true });

    if (error) {
      console.error("Error fetching todos due today:", error);
      throw new Error("Failed to fetch todos due today");
    }

    return data || [];
  }

  /**
   * Mark todo as completed
   */
  async completeTodo(id: string): Promise<Todo> {
    return this.update(id, {
      status: "completed",
      completed_at: new Date().toISOString(),
    });
  }

  /**
   * Archive/unarchive todo
   */
  async toggleArchive(id: string): Promise<Todo> {
    const todo = await this.getById(id);
    if (!todo) {
      throw new Error("Todo not found");
    }

    return this.update(id, { is_archived: !todo.is_archived });
  }

  /**
   * Get todos by category
   */
  async getTodosByCategory(categoryId: string): Promise<Todo[]> {
    const result = await this.getTodosWithFilters({ category_id: categoryId });
    return result.data;
  }

  /**
   * Get todos assigned to user
   */
  async getAssignedTodos(): Promise<Todo[]> {
    const user = await this.getCurrentUser();
    const supabase = await this.getSupabaseClient();

    const { data, error } = await supabase
      .from("todos")
      .select("*")
      .eq("assigned_to", user.id)
      .eq("is_archived", false)
      .order("due_date", { ascending: true });

    if (error) {
      console.error("Error fetching assigned todos:", error);
      throw new Error("Failed to fetch assigned todos");
    }

    return data || [];
  }

  /**
   * Update todo status
   */
  async updateStatus(id: string, status: Todo["status"]): Promise<Todo> {
    const updateData: UpdateTodoData = {
      status,
      completed_at: "",
    };

    if (status === "completed") {
      updateData.completed_at = new Date().toISOString();
    } else {
      updateData.completed_at = "";
    }

    return this.update(id, updateData);
  }

  /**
   * Add subtask to todo
   */
  async addSubtask(
    todoId: string,
    subtask: { title: string; completed: boolean }
  ): Promise<Todo> {
    const todo = await this.getById(todoId);
    if (!todo) {
      throw new Error("Todo not found");
    }

    const subtasks = [
      ...(todo.subtasks || []),
      {
        id: crypto.randomUUID(),
        ...subtask,
        created_at: new Date().toISOString(),
      },
    ];

    return this.update(todoId, { subtasks });
  }

  /**
   * Update subtask
   */
  async updateSubtask(
    todoId: string,
    subtaskId: string,
    updates: { title?: string; completed?: boolean }
  ): Promise<Todo> {
    const todo = await this.getById(todoId);
    if (!todo) {
      throw new Error("Todo not found");
    }

    const subtasks = (todo.subtasks || []).map((subtask: any) =>
      subtask.id === subtaskId
        ? { ...subtask, ...updates, updated_at: new Date().toISOString() }
        : subtask
    );

    return this.update(todoId, { subtasks });
  }

  /**
   * Remove subtask from todo
   */
  async removeSubtask(todoId: string, subtaskId: string): Promise<Todo> {
    const todo = await this.getById(todoId);
    if (!todo) {
      throw new Error("Todo not found");
    }

    const subtasks = (todo.subtasks || []).filter(
      (subtask: any) => subtask.id !== subtaskId
    );

    return this.update(todoId, { subtasks });
  }
}

export const todoRepository = new TodoRepository();

// Export CRUD functions
export async function createTodo(data: CreateTodoData): Promise<Todo> {
  const todoData = {
    ...data,
    status: data.status ?? "open",
    priority: data.priority ?? "medium",
    is_archived: data.is_archived ?? false,
    tags: data.tags ?? [],
    attachments: data.attachments ?? [],
    subtasks: data.subtasks ?? [],
  };
  return todoRepository.create(
    todoData as Omit<Todo, "created_by" | "id" | "created_at" | "updated_at">
  );
}

export async function getTodoById(id: string): Promise<Todo | null> {
  return todoRepository.getById(id);
}

export async function getAllTodos(
  pagination?: PaginationOptions,
  search?: SearchOptions
): Promise<{ data: Todo[]; total: number; hasMore: boolean }> {
  return todoRepository.getAll(pagination, search);
}

export async function getTodosWithFilters(
  filters?: TodoFilters,
  pagination?: PaginationOptions,
  searchQuery?: string
): Promise<{ data: Todo[]; total: number; hasMore: boolean }> {
  return todoRepository.getTodosWithFilters(filters, pagination, searchQuery);
}

export async function updateTodo(
  id: string,
  data: UpdateTodoData
): Promise<Todo> {
  return todoRepository.update(id, data);
}

export async function deleteTodo(id: string): Promise<void> {
  return todoRepository.delete(id);
}

export async function getTodoStats(): Promise<Record<string, any>> {
  return todoRepository.getStats();
}

export async function getOverdueTodos(): Promise<Todo[]> {
  return todoRepository.getOverdueTodos();
}

export async function getTodosDueToday(): Promise<Todo[]> {
  return todoRepository.getTodosDueToday();
}

export async function completeTodo(id: string): Promise<Todo> {
  return todoRepository.completeTodo(id);
}

export async function toggleTodoArchive(id: string): Promise<Todo> {
  return todoRepository.toggleArchive(id);
}
