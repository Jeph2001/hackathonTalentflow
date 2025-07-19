import { describe, test, expect } from "@jest/globals";
import { CategoryAPI } from "../../lib/api/productivity-api";
import { TestUtils, TEST_CONFIG } from "../setup/test-setup";
import type {
  CreateCategoryData,
  UpdateCategoryData,
} from "../../lib/api/productivity-api";

describe("CategoryAPI", () => {
  describe("CRUD Operations", () => {
    test(
      "should create a new category",
      async () => {
        const categoryData = TestUtils.generateTestCategory();

        const createdCategory = await CategoryAPI.create(categoryData);
        TestUtils.trackCreatedItem("categories", createdCategory.id);

        // Assertions
        expect(createdCategory).toBeDefined();
        expect(createdCategory.id).toBeDefined();
        expect(createdCategory.name).toBe(categoryData.name);
        expect(createdCategory.color).toBe(categoryData.color);
        expect(createdCategory.icon).toBe(categoryData.icon);
        expect(createdCategory.description).toBe(categoryData.description);
        expect(createdCategory.created_by).toBe(TestUtils.testUser.id);

        TestUtils.assertObjectProperties(createdCategory, [
          "id",
          "name",
          "color",
          "created_by",
          "created_at",
          "updated_at",
        ]);
      },
      TEST_CONFIG.testTimeout
    );

    test(
      "should retrieve a category by ID",
      async () => {
        // Create a category first
        const categoryData = TestUtils.generateTestCategory();
        const createdCategory = await CategoryAPI.create(categoryData);
        TestUtils.trackCreatedItem("categories", createdCategory.id);

        // Retrieve the category
        const retrievedCategory = await CategoryAPI.getById(createdCategory.id);

        // Assertions
        TestUtils.assertNotNull(retrievedCategory);
        expect(retrievedCategory!.id).toBe(createdCategory.id);
        expect(retrievedCategory!.name).toBe(categoryData.name);
        expect(retrievedCategory!.color).toBe(categoryData.color);
      },
      TEST_CONFIG.testTimeout
    );

    test(
      "should update a category",
      async () => {
        // Create a category first
        const categoryData = TestUtils.generateTestCategory();
        const createdCategory = await CategoryAPI.create(categoryData);
        TestUtils.trackCreatedItem("categories", createdCategory.id);

        // Update the category
        const updateData: UpdateCategoryData = {
          name: "Updated Category Name",
          color: "#FF5733",
          icon: "updated-icon",
          description: "Updated description",
        };

        const updatedCategory = await CategoryAPI.update(
          createdCategory.id,
          updateData
        );

        // Assertions
        expect(updatedCategory.id).toBe(createdCategory.id);
        expect(updatedCategory.name).toBe(updateData.name);
        expect(updatedCategory.color).toBe(updateData.color);
        expect(updatedCategory.icon).toBe(updateData.icon);
        expect(updatedCategory.description).toBe(updateData.description);
        expect(new Date(updatedCategory.updated_at).getTime()).toBeGreaterThan(
          new Date(createdCategory.updated_at).getTime()
        );
      },
      TEST_CONFIG.testTimeout
    );

    test(
      "should delete a category",
      async () => {
        // Create a category first
        const categoryData = TestUtils.generateTestCategory();
        const createdCategory = await CategoryAPI.create(categoryData);

        // Delete the category
        await CategoryAPI.delete(createdCategory.id);

        // Verify deletion
        const deletedCategory = await CategoryAPI.getById(createdCategory.id);
        expect(deletedCategory).toBeNull();
      },
      TEST_CONFIG.testTimeout
    );
  });

  describe("Query Operations", () => {
    test(
      "should get all categories with pagination",
      async () => {
        // Create multiple categories
        const categoryPromises = Array.from({ length: 5 }, () => {
          const categoryData = TestUtils.generateTestCategory();
          return CategoryAPI.create(categoryData);
        });

        const createdCategories = await Promise.all(categoryPromises);
        createdCategories.forEach((category) =>
          TestUtils.trackCreatedItem("categories", category.id)
        );

        // Get categories with pagination
        const result = await CategoryAPI.getAll({ page: 1, limit: 3 });

        // Assertions
        expect(result.data).toBeDefined();
        expect(result.total).toBeGreaterThanOrEqual(5);
        expect(result.data.length).toBeLessThanOrEqual(3);
        expect(result.hasMore).toBe(true);
      },
      TEST_CONFIG.testTimeout
    );

    test(
      "should get category usage statistics",
      async () => {
        // Use existing test categories and create some items
        const testCategory = TestUtils.testCategories[0];

        // Create a todo with this category
        const todoData = {
          ...TestUtils.generateTestTodo(),
          category_id: testCategory.id,
        };

        const createdTodo = await TestUtils.supabase
          .from("todos")
          .insert({
            ...todoData,
            created_by: TestUtils.testUser.id,
          })
          .select()
          .single();

        TestUtils.trackCreatedItem("todos", createdTodo.data.id);

        // Get category usage
        const usage = await CategoryAPI.getUsage();

        // Assertions
        expect(usage).toBeDefined();
        expect(Array.isArray(usage)).toBe(true);

        const categoryUsage = usage.find(
          (u) => u.category.id === testCategory.id
        );
        expect(categoryUsage).toBeDefined();
        expect(categoryUsage!.usage.todos).toBeGreaterThanOrEqual(1);
      },
      TEST_CONFIG.testTimeout
    );

    test(
      "should check if category can be deleted",
      async () => {
        // Create a new category
        const categoryData = TestUtils.generateTestCategory();
        const createdCategory = await CategoryAPI.create(categoryData);
        TestUtils.trackCreatedItem("categories", createdCategory.id);

        // Check if it can be deleted (should be true since no items use it)
        const canDeleteResult = await CategoryAPI.canDelete(createdCategory.id);

        // Assertions
        expect(canDeleteResult.canDelete).toBe(true);
        expect(canDeleteResult.usage.todos).toBe(0);
        expect(canDeleteResult.usage.notes).toBe(0);
        expect(canDeleteResult.usage.events).toBe(0);
      },
      TEST_CONFIG.testTimeout
    );

    test(
      "should get category statistics",
      async () => {
        // Create categories with different properties
        const categoryData1 = TestUtils.generateTestCategory();
        const categoryData2 = {
          ...TestUtils.generateTestCategory(),
          icon: undefined,
        };

        const category1 = await CategoryAPI.create(categoryData1);
        const category2 = await CategoryAPI.create(categoryData2);

        TestUtils.trackCreatedItem("categories", category1.id);
        TestUtils.trackCreatedItem("categories", category2.id);

        // Get statistics
        const stats = await CategoryAPI.getStats();

        // Assertions
        expect(stats).toBeDefined();
        expect(stats.total).toBeGreaterThanOrEqual(2);
        expect(stats.withIcons).toBeGreaterThanOrEqual(1);
        expect(stats.colorDistribution).toBeDefined();
      },
      TEST_CONFIG.testTimeout
    );
  });

  describe("Advanced Operations", () => {
    test(
      "should delete category with reassignment",
      async () => {
        // Create two categories
        const categoryData1 = TestUtils.generateTestCategory();
        const categoryData2 = TestUtils.generateTestCategory();

        const category1 = await CategoryAPI.create(categoryData1);
        const category2 = await CategoryAPI.create(categoryData2);

        TestUtils.trackCreatedItem("categories", category2.id); // Only track category2 for cleanup

        // Create a todo with category1
        const todoData = {
          ...TestUtils.generateTestTodo(),
          category_id: category1.id,
        };

        const createdTodo = await TestUtils.supabase
          .from("todos")
          .insert({
            ...todoData,
            created_by: TestUtils.testUser.id,
          })
          .select()
          .single();

        TestUtils.trackCreatedItem("todos", createdTodo.data.id);

        // Delete category1 and reassign items to category2
        await CategoryAPI.deleteWithReassignment(category1.id, category2.id);

        // Verify category1 is deleted
        const deletedCategory = await CategoryAPI.getById(category1.id);
        expect(deletedCategory).toBeNull();

        // Verify todo is reassigned to category2
        const updatedTodo = await TestUtils.supabase
          .from("todos")
          .select("*")
          .eq("id", createdTodo.data.id)
          .single();

        expect(updatedTodo.data.category_id).toBe(category2.id);
      },
      TEST_CONFIG.testTimeout
    );
  });

  describe("Error Handling", () => {
    test(
      "should handle invalid category ID",
      async () => {
        const invalidId = "invalid-id";

        await expect(CategoryAPI.getById(invalidId)).rejects.toThrow();
      },
      TEST_CONFIG.testTimeout
    );

    test(
      "should prevent duplicate category names",
      async () => {
        // Create a category
        const categoryData = TestUtils.generateTestCategory();
        const createdCategory = await CategoryAPI.create(categoryData);
        TestUtils.trackCreatedItem("categories", createdCategory.id);

        // Try to create another category with the same name
        const duplicateData = { ...categoryData };

        await expect(CategoryAPI.create(duplicateData)).rejects.toThrow();
      },
      TEST_CONFIG.testTimeout
    );

    test(
      "should validate required fields",
      async () => {
        const invalidCategoryData = {
          // Missing required name field
          color: "#FF5733",
        } as CreateCategoryData;

        await expect(CategoryAPI.create(invalidCategoryData)).rejects.toThrow();
      },
      TEST_CONFIG.testTimeout
    );
  });
});
