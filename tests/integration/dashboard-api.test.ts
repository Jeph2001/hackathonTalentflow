import { describe, test, expect } from "@jest/globals";
import {
  DashboardAPI,
  TodoAPI,
  NoteAPI,
  EventAPI,
} from "@/lib/api/productivity-api";
import { TestUtils, TEST_CONFIG } from "../setup/test-setup";

describe("DashboardAPI Integration Tests", () => {
  test(
    "should get comprehensive dashboard data",
    async () => {
      // Create test data across all entities
      const todoData = TestUtils.generateTestTodo();
      const noteData = TestUtils.generateTestNote();
      const eventData = TestUtils.generateTestEvent();

      const createdTodo = await TodoAPI.create(todoData);
      const createdNote = await NoteAPI.create(noteData);
      const createdEvent = await EventAPI.create(eventData);

      TestUtils.trackCreatedItem("todos", createdTodo.id);
      TestUtils.trackCreatedItem("notes", createdNote.id);
      TestUtils.trackCreatedItem("events", createdEvent.id);

      // Complete one todo and pin one note
      await TodoAPI.complete(createdTodo.id);
      await NoteAPI.togglePin(createdNote.id);

      // Get dashboard data
      const dashboardData = await DashboardAPI.getDashboardData();

      // Assertions
      expect(dashboardData).toBeDefined();

      // Todo data
      expect(dashboardData.todos.stats).toBeDefined();
      expect(dashboardData.todos.stats.total).toBeGreaterThanOrEqual(1);
      expect(dashboardData.todos.stats.completed).toBeGreaterThanOrEqual(1);
      expect(dashboardData.todos.recent).toBeDefined();
      expect(Array.isArray(dashboardData.todos.recent)).toBe(true);

      // Note data
      expect(dashboardData.notes.stats).toBeDefined();
      expect(dashboardData.notes.stats.total).toBeGreaterThanOrEqual(1);
      expect(dashboardData.notes.stats.pinned).toBeGreaterThanOrEqual(1);
      expect(dashboardData.notes.pinned).toBeDefined();
      expect(Array.isArray(dashboardData.notes.pinned)).toBe(true);
      expect(dashboardData.notes.recent).toBeDefined();
      expect(Array.isArray(dashboardData.notes.recent)).toBe(true);

      // Event data
      expect(dashboardData.events.stats).toBeDefined();
      expect(dashboardData.events.stats.total).toBeGreaterThanOrEqual(1);
      expect(dashboardData.events.upcoming).toBeDefined();
      expect(Array.isArray(dashboardData.events.upcoming)).toBe(true);

      // Category data
      expect(dashboardData.categories.stats).toBeDefined();
      expect(dashboardData.categories.usage).toBeDefined();
      expect(Array.isArray(dashboardData.categories.usage)).toBe(true);
    },
    TEST_CONFIG.testTimeout
  );

  test(
    "should get quick stats for dashboard widgets",
    async () => {
      // Create some test data
      const todoData1 = TestUtils.generateTestTodo();
      const todoData2 = TestUtils.generateTestTodo();
      const noteData = TestUtils.generateTestNote();
      const eventData = TestUtils.generateTestEvent();

      const todo1 = await TodoAPI.create(todoData1);
      const todo2 = await TodoAPI.create(todoData2);
      const note = await NoteAPI.create(noteData);
      const event = await EventAPI.create(eventData);

      TestUtils.trackCreatedItem("todos", todo1.id);
      TestUtils.trackCreatedItem("todos", todo2.id);
      TestUtils.trackCreatedItem("notes", note.id);
      TestUtils.trackCreatedItem("events", event.id);

      // Complete one todo
      await TodoAPI.complete(todo1.id);

      // Get quick stats
      const quickStats = await DashboardAPI.getQuickStats();

      // Assertions
      expect(quickStats).toBeDefined();
      expect(quickStats.totalTodos).toBeGreaterThanOrEqual(2);
      expect(quickStats.completedTodos).toBeGreaterThanOrEqual(1);
      expect(quickStats.totalNotes).toBeGreaterThanOrEqual(1);
      expect(quickStats.totalEvents).toBeGreaterThanOrEqual(1);
      expect(quickStats.upcomingEvents).toBeGreaterThanOrEqual(1);
      expect(quickStats.overdueTodos).toBeGreaterThanOrEqual(0);

      // Verify data types
      expect(typeof quickStats.totalTodos).toBe("number");
      expect(typeof quickStats.completedTodos).toBe("number");
      expect(typeof quickStats.totalNotes).toBe("number");
      expect(typeof quickStats.totalEvents).toBe("number");
      expect(typeof quickStats.upcomingEvents).toBe("number");
      expect(typeof quickStats.overdueTodos).toBe("number");
    },
    TEST_CONFIG.testTimeout
  );

  test(
    "should handle empty dashboard data gracefully",
    async () => {
      // Get dashboard data when no items exist (except test categories)
      const dashboardData = await DashboardAPI.getDashboardData();

      // Assertions - should not throw errors and return valid structure
      expect(dashboardData).toBeDefined();
      expect(dashboardData.todos.stats).toBeDefined();
      expect(dashboardData.notes.stats).toBeDefined();
      expect(dashboardData.events.stats).toBeDefined();
      expect(dashboardData.categories.stats).toBeDefined();

      // Arrays should be defined even if empty
      expect(Array.isArray(dashboardData.todos.recent)).toBe(true);
      expect(Array.isArray(dashboardData.notes.recent)).toBe(true);
      expect(Array.isArray(dashboardData.events.upcoming)).toBe(true);
      expect(Array.isArray(dashboardData.categories.usage)).toBe(true);
    },
    TEST_CONFIG.testTimeout
  );

  test(
    "should maintain data consistency across API calls",
    async () => {
      // Create test data
      const todoData = TestUtils.generateTestTodo();
      const createdTodo = await TodoAPI.create(todoData);
      TestUtils.trackCreatedItem("todos", createdTodo.id);

      // Get data through different API endpoints
      const [individualTodo, allTodos, dashboardData, quickStats] =
        await Promise.all([
          TodoAPI.getById(createdTodo.id),
          TodoAPI.getAll({ page: 1, limit: 10 }),
          DashboardAPI.getDashboardData(),
          DashboardAPI.getQuickStats(),
        ]);

      // Verify consistency
      expect(individualTodo).toBeDefined();
      expect(allTodos.data.some((todo) => todo.id === createdTodo.id)).toBe(
        true
      );
      expect(dashboardData.todos.stats.total).toBeGreaterThanOrEqual(1);
      expect(quickStats.totalTodos).toBeGreaterThanOrEqual(1);

      // Verify the same todo appears in all relevant collections
      const todoInAll = allTodos.data.find(
        (todo) => todo.id === createdTodo.id
      );
      expect(todoInAll?.title).toBe(individualTodo!.title);
      expect(todoInAll?.status).toBe(individualTodo!.status);
    },
    TEST_CONFIG.testTimeout
  );
});
