"use server";

import {
  BaseRepository,
  type PaginationOptions,
  type SearchOptions,
} from "../database/base-repository";

export interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
  description?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCategoryData {
  name: string;
  color?: string;
  icon?: string;
  description?: string;
}

export interface UpdateCategoryData {
  name?: string;
  color?: string;
  icon?: string;
  description?: string;
}

class CategoryRepository extends BaseRepository<Category> {
  constructor() {
    super("categories", "category");
  }

  protected applySearchFilter(query: any, searchQuery: string): any {
    return query.or(
      `name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`
    );
  }

  protected calculateStats(data: Category[]): Record<string, any> {
    const total = data.length;
    const withIcons = data.filter((category) => category.icon).length;
    const withDescriptions = data.filter(
      (category) => category.description
    ).length;

    const colorDistribution = data.reduce((acc, category) => {
      acc[category.color] = (acc[category.color] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      withIcons,
      withDescriptions,
      colorDistribution,
    };
  }

  /**
   * Get category usage statistics
   */
  async getCategoryUsage(): Promise<
    Array<{
      category: Category;
      usage: { todos: number; notes: number; events: number };
    }>
  > {
    const user = await this.getCurrentUser();
    const supabase = await this.getSupabaseClient();

    // Get all categories
    const { data: categories, error: categoriesError } = await supabase
      .from("categories")
      .select("*")
      .eq("created_by", user.id);

    if (categoriesError) {
      console.error("Error fetching categories:", categoriesError);
      throw new Error("Failed to fetch categories");
    }

    // Get usage counts for each category
    const categoryUsage = await Promise.all(
      (categories || []).map(async (category: { id: any }) => {
        const [todosCount, notesCount, eventsCount] = await Promise.all([
          supabase
            .from("todos")
            .select("id", { count: "exact", head: true })
            .eq("category_id", category.id)
            .eq("created_by", user.id),
          supabase
            .from("notes")
            .select("id", { count: "exact", head: true })
            .eq("category_id", category.id)
            .eq("created_by", user.id),
          supabase
            .from("events")
            .select("id", { count: "exact", head: true })
            .eq("category_id", category.id)
            .eq("created_by", user.id),
        ]);

        return {
          category,
          usage: {
            todos: todosCount.count || 0,
            notes: notesCount.count || 0,
            events: eventsCount.count || 0,
          },
        };
      })
    );

    return categoryUsage;
  }

  /**
   * Check if category can be deleted (not used by any items)
   */
  async canDeleteCategory(id: string): Promise<{
    canDelete: boolean;
    usage: { todos: number; notes: number; events: number };
  }> {
    const user = await this.getCurrentUser();
    const supabase = await this.getSupabaseClient();

    const [todosCount, notesCount, eventsCount] = await Promise.all([
      supabase
        .from("todos")
        .select("id", { count: "exact", head: true })
        .eq("category_id", id)
        .eq("created_by", user.id),
      supabase
        .from("notes")
        .select("id", { count: "exact", head: true })
        .eq("category_id", id)
        .eq("created_by", user.id),
      supabase
        .from("events")
        .select("id", { count: "exact", head: true })
        .eq("category_id", id)
        .eq("created_by", user.id),
    ]);

    const usage = {
      todos: todosCount.count || 0,
      notes: notesCount.count || 0,
      events: eventsCount.count || 0,
    };

    const canDelete =
      usage.todos === 0 && usage.notes === 0 && usage.events === 0;

    return { canDelete, usage };
  }

  /**
   * Delete category and optionally reassign items to another category
   */
  async deleteCategoryWithReassignment(
    id: string,
    reassignToCategoryId?: string
  ): Promise<void> {
    const user = await this.getCurrentUser();
    const supabase = await this.getSupabaseClient();

    // If reassigning, update all items to use the new category
    if (reassignToCategoryId) {
      await Promise.all([
        supabase
          .from("todos")
          .update({ category_id: reassignToCategoryId })
          .eq("category_id", id)
          .eq("created_by", user.id),
        supabase
          .from("notes")
          .update({ category_id: reassignToCategoryId })
          .eq("category_id", id)
          .eq("created_by", user.id),
        supabase
          .from("events")
          .update({ category_id: reassignToCategoryId })
          .eq("category_id", id)
          .eq("created_by", user.id),
      ]);
    }

    // Delete the category
    await this.delete(id);
  }
}

export const categoryRepository = new CategoryRepository();

// Export CRUD functions
export async function createCategory(
  data: CreateCategoryData
): Promise<Category> {
  // Ensure color is always a string
  const categoryData = {
    ...data,
    color: data.color ?? "#FFFFFF", // default color if not provided
  };
  return categoryRepository.create(categoryData);
}

export async function getCategoryById(id: string): Promise<Category | null> {
  return categoryRepository.getById(id);
}

export async function getAllCategories(
  pagination?: PaginationOptions,
  search?: SearchOptions
): Promise<{ data: Category[]; total: number; hasMore: boolean }> {
  return categoryRepository.getAll(pagination, search);
}

export async function updateCategory(
  id: string,
  data: UpdateCategoryData
): Promise<Category> {
  return categoryRepository.update(id, data);
}

export async function deleteCategory(id: string): Promise<void> {
  return categoryRepository.delete(id);
}

export async function getCategoryStats(): Promise<Record<string, any>> {
  return categoryRepository.getStats();
}

export async function getCategoryUsage(): Promise<
  Array<{
    category: Category;
    usage: { todos: number; notes: number; events: number };
  }>
> {
  return categoryRepository.getCategoryUsage();
}

export async function canDeleteCategory(id: string): Promise<{
  canDelete: boolean;
  usage: { todos: number; notes: number; events: number };
}> {
  return categoryRepository.canDeleteCategory(id);
}

export async function deleteCategoryWithReassignment(
  id: string,
  reassignToCategoryId?: string
): Promise<void> {
  return categoryRepository.deleteCategoryWithReassignment(
    id,
    reassignToCategoryId
  );
}
