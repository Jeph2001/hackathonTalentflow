import { beforeAll, afterAll, beforeEach, afterEach } from "@jest/globals";
import { createClient } from "@supabase/supabase-js";

// Test configuration
export const TEST_CONFIG = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:54321",
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "test-key",
  testUserEmail: "gabiroarnaud@gmail.com",
  testUserPassword: "Hrzex1357$",
  testTimeout: 30000,
};

// Test utilities
export class TestUtils {
  static supabase = createClient(
    TEST_CONFIG.supabaseUrl,
    TEST_CONFIG.supabaseKey
  );
  static testUser: any = null;
  static testCategories: any[] = [];
  static createdItems: { type: string; id: string }[] = [];

  /**
   * Setup test environment
   */
  static async setupTestEnvironment() {
    try {
      // Create test user
      const { data: authData, error: authError } =
        await this.supabase.auth.signUp({
          email: TEST_CONFIG.testUserEmail,
          password: TEST_CONFIG.testUserPassword,
          options: {
            data: {
              full_name: "Test User",
            },
          },
        });

      if (authError && authError.message !== "User already registered") {
        throw authError;
      }

      // Sign in test user
      const { data: signInData, error: signInError } =
        await this.supabase.auth.signInWithPassword({
          email: TEST_CONFIG.testUserEmail,
          password: TEST_CONFIG.testUserPassword,
        });

      if (signInError) {
        throw signInError;
      }

      this.testUser = signInData.user;

      // Create test categories
      await this.createTestCategories();

      console.log("✅ Test environment setup complete");
    } catch (error) {
      console.error("❌ Test environment setup failed:", error);
      throw error;
    }
  }

  /**
   * Cleanup test environment
   */
  static async cleanupTestEnvironment() {
    try {
      // Clean up created items
      await this.cleanupCreatedItems();

      // Clean up test categories
      await this.cleanupTestCategories();

      // Sign out
      await this.supabase.auth.signOut();

      console.log("✅ Test environment cleanup complete");
    } catch (error) {
      console.error("❌ Test environment cleanup failed:", error);
    }
  }

  /**
   * Create test categories
   */
  static async createTestCategories() {
    const categories = [
      { name: "Test Work", color: "#3B82F6", icon: "briefcase" },
      { name: "Test Personal", color: "#10B981", icon: "user" },
      { name: "Test Health", color: "#F59E0B", icon: "heart" },
    ];

    for (const category of categories) {
      const { data, error } = await this.supabase
        .from("categories")
        .insert({
          ...category,
          created_by: this.testUser.id,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      this.testCategories.push(data);
    }
  }

  /**
   * Cleanup test categories
   */
  static async cleanupTestCategories() {
    for (const category of this.testCategories) {
      await this.supabase.from("categories").delete().eq("id", category.id);
    }
    this.testCategories = [];
  }

  /**
   * Track created items for cleanup
   */
  static trackCreatedItem(type: string, id: string) {
    this.createdItems.push({ type, id });
  }

  /**
   * Cleanup created items
   */
  static async cleanupCreatedItems() {
    for (const item of this.createdItems) {
      try {
        await this.supabase.from(item.type).delete().eq("id", item.id);
      } catch (error) {
        console.warn(`Failed to cleanup ${item.type} ${item.id}:`, error);
      }
    }
    this.createdItems = [];
  }

  /**
   * Generate test data
   */
  static generateTestTodo() {
    return {
      title: `Test Todo ${Date.now()}`,
      description: "This is a test todo item",
      category_id: this.testCategories[0]?.id,
      due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      priority: "medium" as const,
      tags: ["test", "automation"],
    };
  }

  static generateTestNote() {
    return {
      title: `Test Note ${Date.now()}`,
      content: "This is a test note with some content for testing purposes.",
      category_id: this.testCategories[1]?.id,
      tags: ["test", "note"],
    };
  }

  static generateTestEvent() {
    const startTime = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour duration

    return {
      title: `Test Event ${Date.now()}`,
      description: "This is a test event",
      category_id: this.testCategories[2]?.id,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      location: "Test Location",
    };
  }

  static generateTestCategory() {
    return {
      name: `Test Category ${Date.now()}`,
      color: "#8B5CF6",
      icon: "star",
      description: "This is a test category",
    };
  }

  /**
   * Wait for a specified amount of time
   */
  static async wait(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Retry a function with exponential backoff
   */
  static async retry<T>(
    fn: () => Promise<T>,
    maxRetries = 3,
    baseDelay = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        if (i < maxRetries - 1) {
          await this.wait(baseDelay * Math.pow(2, i));
        }
      }
    }

    throw lastError!;
  }

  /**
   * Assert that an object has expected properties
   */
  static assertObjectProperties(obj: any, expectedProps: string[]) {
    for (const prop of expectedProps) {
      if (!(prop in obj)) {
        throw new Error(`Expected property '${prop}' not found in object`);
      }
    }
  }

  /**
   * Assert that a value is not null or undefined
   */
  static assertNotNull(value: any, message?: string) {
    if (value === null || value === undefined) {
      throw new Error(message || "Value should not be null or undefined");
    }
  }

  /**
   * Assert that two values are equal
   */
  static assertEqual(actual: any, expected: any, message?: string) {
    if (actual !== expected) {
      throw new Error(message || `Expected ${expected}, but got ${actual}`);
    }
  }

  /**
   * Assert that an array has a specific length
   */
  static assertArrayLength(
    array: any[],
    expectedLength: number,
    message?: string
  ) {
    if (array.length !== expectedLength) {
      throw new Error(
        message ||
          `Expected array length ${expectedLength}, but got ${array.length}`
      );
    }
  }
}

// Global test setup
beforeAll(async () => {
  await TestUtils.setupTestEnvironment();
}, TEST_CONFIG.testTimeout);

afterAll(async () => {
  await TestUtils.cleanupTestEnvironment();
}, TEST_CONFIG.testTimeout);

beforeEach(() => {
  // Reset created items tracking for each test
  TestUtils.createdItems = [];
});

afterEach(async () => {
  // Cleanup items created during the test
  await TestUtils.cleanupCreatedItems();
});
