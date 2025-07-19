"use server";

import { createClient } from "../supabase/server";
import { cookies } from "next/headers";
import { CacheManager, CacheKeys, CacheTTL } from "../cache/redis-client";

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface SearchOptions {
  query?: string;
  filters?: Record<string, any>;
}

export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export abstract class BaseRepository<T extends BaseEntity> {
  protected tableName: string;
  protected cachePrefix: string;

  constructor(tableName: string, cachePrefix: string) {
    this.tableName = tableName;
    this.cachePrefix = cachePrefix;
  }

  protected async getSupabaseClient() {
    const cookieStore = cookies();
    return createClient(cookieStore);
  }

  protected async getCurrentUser() {
    const supabase = await this.getSupabaseClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      throw new Error("User not authenticated");
    }

    return user;
  }

  protected getCacheKey(
    userId: string,
    operation: string,
    params?: any
  ): string {
    const paramString = params ? JSON.stringify(params) : "default";
    return `${this.cachePrefix}:${userId}:${operation}:${paramString}`;
  }

  /**
   * Create a new entity
   */
  async create(
    data: Omit<T, "id" | "created_at" | "updated_at" | "created_by">
  ): Promise<T> {
    const user = await this.getCurrentUser();
    const supabase = await this.getSupabaseClient();

    const entityData = {
      ...data,
      created_by: user.id,
    };

    const { data: result, error } = await supabase
      .from(this.tableName)
      .insert(entityData)
      .select()
      .single();

    if (error) {
      console.error(`Error creating ${this.tableName}:`, error);
      throw new Error(`Failed to create ${this.tableName}`);
    }

    // Invalidate relevant caches
    await CacheManager.invalidateUserCache(user.id);

    // Log activity
    await this.logActivity(user.id, result.id, "create", null, result);

    return result;
  }

  /**
   * Get entity by ID
   */
  async getById(id: string): Promise<T | null> {
    const user = await this.getCurrentUser();
    const cacheKey = CacheKeys[this.cachePrefix as keyof typeof CacheKeys](id);

    // Try cache first
    const cached = await CacheManager.get<T>(cacheKey);
    if (cached) {
      return cached;
    }

    const supabase = await this.getSupabaseClient();
    const { data, error } = await supabase
      .from(this.tableName)
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null; // Not found
      }
      console.error(`Error fetching ${this.tableName}:`, error);
      throw new Error(`Failed to fetch ${this.tableName}`);
    }

    // Cache the result
    await CacheManager.set(cacheKey, data, CacheTTL.MEDIUM);

    return data;
  }

  /**
   * Get all entities for the current user with pagination and search
   */
  async getAll(
    pagination: PaginationOptions = { page: 1, limit: 20 },
    search: SearchOptions = {}
  ): Promise<{ data: T[]; total: number; hasMore: boolean }> {
    const user = await this.getCurrentUser();
    const cacheKey = this.getCacheKey(user.id, "getAll", {
      pagination,
      search,
    });

    // Try cache first
    const cached = await CacheManager.get<{
      data: T[];
      total: number;
      hasMore: boolean;
    }>(cacheKey);
    if (cached) {
      return cached;
    }

    const supabase = await this.getSupabaseClient();
    const {
      page,
      limit,
      sortBy = "created_at",
      sortOrder = "desc",
    } = pagination;
    const offset = (page - 1) * limit;

    let query = supabase
      .from(this.tableName)
      .select("*", { count: "exact" })
      .eq("created_by", user.id);

    // Apply search filters
    if (search.query) {
      query = this.applySearchFilter(query, search.query);
    }

    if (search.filters) {
      Object.entries(search.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });
    }

    // Apply sorting and pagination
    query = query
      .order(sortBy, { ascending: sortOrder === "asc" })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error(`Error fetching ${this.tableName}:`, error);
      throw new Error(`Failed to fetch ${this.tableName}`);
    }

    const result = {
      data: data || [],
      total: count || 0,
      hasMore: (count || 0) > offset + limit,
    };

    // Cache the result
    await CacheManager.set(cacheKey, result, CacheTTL.SHORT);

    return result;
  }

  /**
   * Update an entity
   */
  async update(
    id: string,
    data: Partial<Omit<T, "id" | "created_at" | "updated_at" | "created_by">>
  ): Promise<T> {
    const user = await this.getCurrentUser();
    const supabase = await this.getSupabaseClient();

    // Get the current entity for logging
    const currentEntity = await this.getById(id);
    if (!currentEntity) {
      throw new Error(`${this.tableName} not found`);
    }

    const { data: result, error } = await supabase
      .from(this.tableName)
      .update(data)
      .eq("id", id)
      .eq("created_by", user.id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating ${this.tableName}:`, error);
      throw new Error(`Failed to update ${this.tableName}`);
    }

    // Invalidate caches
    await CacheManager.invalidateItemCache(this.cachePrefix, id, user.id);

    // Log activity
    await this.logActivity(user.id, id, "update", currentEntity, result);

    return result;
  }

  /**
   * Delete an entity
   */
  async delete(id: string): Promise<void> {
    const user = await this.getCurrentUser();
    const supabase = await this.getSupabaseClient();

    // Get the current entity for logging
    const currentEntity = await this.getById(id);
    if (!currentEntity) {
      throw new Error(`${this.tableName} not found`);
    }

    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq("id", id)
      .eq("created_by", user.id);

    if (error) {
      console.error(`Error deleting ${this.tableName}:`, error);
      throw new Error(`Failed to delete ${this.tableName}`);
    }

    // Invalidate caches
    await CacheManager.invalidateItemCache(this.cachePrefix, id, user.id);

    // Log activity
    await this.logActivity(user.id, id, "delete", currentEntity, null);
  }

  /**
   * Bulk operations
   */
  async bulkCreate(
    items: Array<Omit<T, "id" | "created_at" | "updated_at" | "created_by">>
  ): Promise<T[]> {
    const user = await this.getCurrentUser();
    const supabase = await this.getSupabaseClient();

    const itemsWithUser = items.map((item) => ({
      ...item,
      created_by: user.id,
    }));

    const { data, error } = await supabase
      .from(this.tableName)
      .insert(itemsWithUser)
      .select();

    if (error) {
      console.error(`Error bulk creating ${this.tableName}:`, error);
      throw new Error(`Failed to bulk create ${this.tableName}`);
    }

    // Invalidate caches
    await CacheManager.invalidateUserCache(user.id);

    return data;
  }

  async bulkUpdate(
    updates: Array<{ id: string; data: Partial<T> }>
  ): Promise<T[]> {
    const user = await this.getCurrentUser();
    const results: T[] = [];

    // Process updates in batches to avoid overwhelming the database
    const batchSize = 10;
    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = updates.slice(i, i + batchSize);
      const batchPromises = batch.map((update) =>
        this.update(update.id, update.data)
      );
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }

    return results;
  }

  async bulkDelete(ids: string[]): Promise<void> {
    const user = await this.getCurrentUser();
    const supabase = await this.getSupabaseClient();

    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .in("id", ids)
      .eq("created_by", user.id);

    if (error) {
      console.error(`Error bulk deleting ${this.tableName}:`, error);
      throw new Error(`Failed to bulk delete ${this.tableName}`);
    }

    // Invalidate caches
    await CacheManager.invalidateUserCache(user.id);
  }

  /**
   * Abstract method for applying search filters (to be implemented by subclasses)
   */
  protected abstract applySearchFilter(query: any, searchQuery: string): any;

  /**
   * Log activity for audit trail
   */
  protected async logActivity(
    userId: string,
    entityId: string,
    action: string,
    oldValues: any,
    newValues: any
  ): Promise<void> {
    try {
      const supabase = await this.getSupabaseClient();
      await supabase.from("activity_logs").insert({
        user_id: userId,
        entity_type: this.tableName,
        entity_id: entityId,
        action,
        old_values: oldValues,
        new_values: newValues,
      });
    } catch (error) {
      console.error("Error logging activity:", error);
      // Don't throw error for logging failures
    }
  }

  /**
   * Get statistics for the current user
   */
  async getStats(): Promise<Record<string, any>> {
    const user = await this.getCurrentUser();
    const cacheKey = CacheKeys.stats(user.id);

    // Try cache first
    const cached = await CacheManager.get<Record<string, any>>(cacheKey);
    if (cached) {
      return cached;
    }

    const supabase = await this.getSupabaseClient();
    const { data, error } = await supabase
      .from(this.tableName)
      .select("*")
      .eq("created_by", user.id);

    if (error) {
      console.error(`Error fetching ${this.tableName} stats:`, error);
      throw new Error(`Failed to fetch ${this.tableName} stats`);
    }

    const stats = this.calculateStats(data || []);

    // Cache the result
    await CacheManager.set(cacheKey, stats, CacheTTL.MEDIUM);

    return stats;
  }

  /**
   * Abstract method for calculating statistics (to be implemented by subclasses)
   */
  protected abstract calculateStats(data: T[]): Record<string, any>;
}
