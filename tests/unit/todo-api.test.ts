import { describe, test, expect } from "@jest/globals";
import { TodoAPI } from "../../lib/api/productivity-api";
import { TestUtils, TEST_CONFIG } from "../setup/test-setup";
import type {
  CreateTodoData,
  UpdateTodoData,
} from "../../lib/api/productivity-api";

describe("TodoAPI", () => {
  describe("CRUD Operations", () => {
    test(
      "should create a new todo",
      async () => {
        const todoData = TestUtils.generateTestTodo();

        const createdTodo = await TodoAPI.create(todoData);
        TestUtils.trackCreatedItem("todos", createdTodo.id);

        // Assertions
        expect(createdTodo).toBeDefined();
        expect(createdTodo.id).toBeDefined();
        expect(createdTodo.title).toBe(todoData.title);
        expect(createdTodo.description).toBe(todoData.description);
        expect(createdTodo.category_id).toBe(todoData.category_id);
        expect(createdTodo.priority).toBe(todoData.priority);
        expect(createdTodo.status).toBe("open");
        expect(createdTodo.created_by).toBe(TestUtils.testUser.id);
        expect(createdTodo.created_at).toBeDefined();
        expect(createdTodo.updated_at).toBeDefined();

        TestUtils.assertObjectProperties(createdTodo, [
          "id",
          "title",
          "description",
          "category_id",
          "due_date",
          "status",
          "priority",
          "created_by",
          "created_at",
          "updated_at",
        ]);
      },
      TEST_CONFIG.testTimeout
    );

    test(
      "should retrieve a todo by ID",
      async () => {
        // Create a todo first
        const todoData = TestUtils.generateTestTodo();
        const createdTodo = await TodoAPI.create(todoData);
        TestUtils.trackCreatedItem("todos", createdTodo.id);

        // Retrieve the todo
        const retrievedTodo = await TodoAPI.getById(createdTodo.id);

        // Assertions
        TestUtils.assertNotNull(retrievedTodo);
        expect(retrievedTodo!.id).toBe(createdTodo.id);
        expect(retrievedTodo!.title).toBe(todoData.title);
        expect(retrievedTodo!.description).toBe(todoData.description);
      },
      TEST_CONFIG.testTimeout
    );

    test(
      "should return null for non-existent todo",
      async () => {
        const nonExistentId = "00000000-0000-0000-0000-000000000000";
        const result = await TodoAPI.getById(nonExistentId);

        expect(result).toBeNull();
      },
      TEST_CONFIG.testTimeout
    );

    test(
      "should update a todo",
      async () => {
        // Create a todo first
        const todoData = TestUtils.generateTestTodo();
        const createdTodo = await TodoAPI.create(todoData);
        TestUtils.trackCreatedItem("todos", createdTodo.id);

        // Update the todo
        const updateData: UpdateTodoData = {
          title: "Updated Todo Title",
          description: "Updated description",
          status: "in_progress",
          completed_at: new Date().toISOString(),
          priority: "high",
        };

        const updatedTodo = await TodoAPI.update(createdTodo.id, updateData);

        // Assertions
        expect(updatedTodo.id).toBe(createdTodo.id);
        expect(updatedTodo.title).toBe(updateData.title);
        expect(updatedTodo.description).toBe(updateData.description);
        expect(updatedTodo.status).toBe(updateData.status);
        expect(updatedTodo.priority).toBe(updateData.priority);
        expect(new Date(updatedTodo.updated_at).getTime()).toBeGreaterThan(
          new Date(createdTodo.updated_at).getTime()
        );
      },
      TEST_CONFIG.testTimeout
    );

    test(
      "should delete a todo",
      async () => {
        // Create a todo first
        const todoData = TestUtils.generateTestTodo();
        const createdTodo = await TodoAPI.create(todoData);

        // Delete the todo
        await TodoAPI.delete(createdTodo.id);

        // Verify deletion
        const deletedTodo = await TodoAPI.getById(createdTodo.id);
        expect(deletedTodo).toBeNull();
      },
      TEST_CONFIG.testTimeout
    );

    test(
      "should complete a todo",
      async () => {
        // Create a todo first
        const todoData = TestUtils.generateTestTodo();
        const createdTodo = await TodoAPI.create(todoData);
        TestUtils.trackCreatedItem("todos", createdTodo.id);

        // Complete the todo
        const completedTodo = await TodoAPI.complete(createdTodo.id);

        // Assertions
        expect(completedTodo.status).toBe("completed");
        expect(completedTodo.completed_at).toBeDefined();
        expect(completedTodo.completed_at).not.toBeNull();
      },
      TEST_CONFIG.testTimeout
    );

    test(
      "should toggle archive status",
      async () => {
        // Create a todo first
        const todoData = TestUtils.generateTestTodo();
        const createdTodo = await TodoAPI.create(todoData);
        TestUtils.trackCreatedItem("todos", createdTodo.id);

        // Archive the todo
        const archivedTodo = await TodoAPI.toggleArchive(createdTodo.id);
        expect(archivedTodo.is_archived).toBe(true);

        // Unarchive the todo
        const unarchivedTodo = await TodoAPI.toggleArchive(createdTodo.id);
        expect(unarchivedTodo.is_archived).toBe(false);
      },
      TEST_CONFIG.testTimeout
    );
  });

  describe("Query Operations", () => {
    test(
      "should get all todos with pagination",
      async () => {
        // Create multiple todos
        const todoPromises = Array.from({ length: 5 }, () => {
          const todoData = TestUtils.generateTestTodo();
          return TodoAPI.create(todoData);
        });

        const createdTodos = await Promise.all(todoPromises);
        createdTodos.forEach((todo) =>
          TestUtils.trackCreatedItem("todos", todo.id)
        );

        // Get todos with pagination
        const result = await TodoAPI.getAll({ page: 1, limit: 3 });

        // Assertions
        expect(result.data).toBeDefined();
        expect(result.total).toBeGreaterThanOrEqual(5);
        expect(result.data.length).toBeLessThanOrEqual(3);
        expect(result.hasMore).toBe(true);
      },
      TEST_CONFIG.testTimeout
    );

    test(
      "should filter todos by status",
      async () => {
        // Create todos with different statuses
        const todoData1 = TestUtils.generateTestTodo();
        const todoData2 = TestUtils.generateTestTodo();

        const todo1 = await TodoAPI.create(todoData1);
        const todo2 = await TodoAPI.create(todoData2);

        TestUtils.trackCreatedItem("todos", todo1.id);
        TestUtils.trackCreatedItem("todos", todo2.id);

        // Complete one todo
        await TodoAPI.complete(todo1.id);

        // Filter by completed status
        const completedTodos = await TodoAPI.getWithFilters({
          status: "completed",
        });
        const openTodos = await TodoAPI.getWithFilters({ status: "open" });

        // Assertions
        expect(completedTodos.data.some((todo) => todo.id === todo1.id)).toBe(
          true
        );
        expect(openTodos.data.some((todo) => todo.id === todo2.id)).toBe(true);
        expect(
          completedTodos.data.every((todo) => todo.status === "completed")
        ).toBe(true);
        expect(openTodos.data.every((todo) => todo.status === "open")).toBe(
          true
        );
      },
      TEST_CONFIG.testTimeout
    );

    test(
      "should get overdue todos",
      async () => {
        // Create an overdue todo
        const overdueDate = new Date(
          Date.now() - 24 * 60 * 60 * 1000
        ).toISOString();
        const todoData = {
          ...TestUtils.generateTestTodo(),
          due_date: overdueDate,
        };

        const overdueTodo = await TodoAPI.create(todoData);
        TestUtils.trackCreatedItem("todos", overdueTodo.id);

        // Get overdue todos
        const overdueTodos = await TodoAPI.getOverdue();

        // Assertions
        expect(overdueTodos.some((todo) => todo.id === overdueTodo.id)).toBe(
          true
        );
        expect(
          overdueTodos.every(
            (todo) => todo.due_date && new Date(todo.due_date) < new Date()
          )
        ).toBe(true);
      },
      TEST_CONFIG.testTimeout
    );

    test(
      "should get todos due today",
      async () => {
        // Create a todo due today
        const today = new Date();
        today.setHours(23, 59, 59, 999);

        const todoData = {
          ...TestUtils.generateTestTodo(),
          due_date: today.toISOString(),
        };

        const todayTodo = await TodoAPI.create(todoData);
        TestUtils.trackCreatedItem("todos", todayTodo.id);

        // Get todos due today
        const todayTodos = await TodoAPI.getDueToday();

        // Assertions
        expect(todayTodos.some((todo) => todo.id === todayTodo.id)).toBe(true);
      },
      TEST_CONFIG.testTimeout
    );

    test(
      "should get todo statistics",
      async () => {
        // Create todos with different statuses
        const todoData1 = TestUtils.generateTestTodo();
        const todoData2 = TestUtils.generateTestTodo();
        const todoData3 = TestUtils.generateTestTodo();

        const todo1 = await TodoAPI.create(todoData1);
        const todo2 = await TodoAPI.create(todoData2);
        const todo3 = await TodoAPI.create(todoData3);

        TestUtils.trackCreatedItem("todos", todo1.id);
        TestUtils.trackCreatedItem("todos", todo2.id);
        TestUtils.trackCreatedItem("todos", todo3.id);

        // Complete one todo
        await TodoAPI.complete(todo1.id);

        // Get statistics
        const stats = await TodoAPI.getStats();

        // Assertions
        expect(stats).toBeDefined();
        expect(stats.total).toBeGreaterThanOrEqual(3);
        expect(stats.completed).toBeGreaterThanOrEqual(1);
        expect(stats.completionRate).toBeDefined();
        expect(stats.byPriority).toBeDefined();
      },
      TEST_CONFIG.testTimeout
    );
  });

  describe("Error Handling", () => {
    test(
      "should handle invalid todo ID",
      async () => {
        const invalidId = "invalid-id";

        await expect(TodoAPI.getById(invalidId)).rejects.toThrow();
      },
      TEST_CONFIG.testTimeout
    );

    test(
      "should handle unauthorized access",
      async () => {
        // Sign out to simulate unauthorized access
        await TestUtils.supabase.auth.signOut();

        await expect(
          TodoAPI.create(TestUtils.generateTestTodo())
        ).rejects.toThrow();

        // Sign back in for other tests
        await TestUtils.supabase.auth.signInWithPassword({
          email: TEST_CONFIG.testUserEmail,
          password: TEST_CONFIG.testUserPassword,
        });
      },
      TEST_CONFIG.testTimeout
    );

    test(
      "should validate required fields",
      async () => {
        const invalidTodoData = {
          // Missing required title field
          description: "Test description",
        } as CreateTodoData;

        await expect(TodoAPI.create(invalidTodoData)).rejects.toThrow();
      },
      TEST_CONFIG.testTimeout
    );
  });
});
