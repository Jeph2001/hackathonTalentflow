import { describe, test, expect } from "@jest/globals";
import { EventAPI } from "../../lib/api/productivity-api";
import { TestUtils, TEST_CONFIG } from "../setup/test-setup";
import type {
  CreateEventData,
  UpdateEventData,
} from "../../lib/api/productivity-api";

describe("EventAPI", () => {
  describe("CRUD Operations", () => {
    test(
      "should create a new event",
      async () => {
        const eventData = TestUtils.generateTestEvent();

        const createdEvent = await EventAPI.create(eventData);
        TestUtils.trackCreatedItem("events", createdEvent.id);

        // Assertions
        expect(createdEvent).toBeDefined();
        expect(createdEvent.id).toBeDefined();
        expect(createdEvent.title).toBe(eventData.title);
        expect(createdEvent.description).toBe(eventData.description);
        expect(createdEvent.category_id).toBe(eventData.category_id);
        expect(createdEvent.start_time).toBe(eventData.start_time);
        expect(createdEvent.end_time).toBe(eventData.end_time);
        expect(createdEvent.location).toBe(eventData.location);
        expect(createdEvent.created_by).toBe(TestUtils.testUser.id);
        expect(createdEvent.is_cancelled).toBe(false);

        TestUtils.assertObjectProperties(createdEvent, [
          "id",
          "title",
          "start_time",
          "end_time",
          "target_date",
          "created_by",
          "created_at",
          "updated_at",
        ]);
      },
      TEST_CONFIG.testTimeout
    );

    test(
      "should retrieve an event by ID",
      async () => {
        // Create an event first
        const eventData = TestUtils.generateTestEvent();
        const createdEvent = await EventAPI.create(eventData);
        TestUtils.trackCreatedItem("events", createdEvent.id);

        // Retrieve the event
        const retrievedEvent = await EventAPI.getById(createdEvent.id);

        // Assertions
        TestUtils.assertNotNull(retrievedEvent);
        expect(retrievedEvent!.id).toBe(createdEvent.id);
        expect(retrievedEvent!.title).toBe(eventData.title);
        expect(retrievedEvent!.description).toBe(eventData.description);
      },
      TEST_CONFIG.testTimeout
    );

    test(
      "should update an event",
      async () => {
        // Create an event first
        const eventData = TestUtils.generateTestEvent();
        const createdEvent = await EventAPI.create(eventData);
        TestUtils.trackCreatedItem("events", createdEvent.id);

        // Update the event
        const newStartTime = new Date(
          Date.now() + 2 * 60 * 60 * 1000
        ).toISOString();
        const newEndTime = new Date(
          Date.now() + 3 * 60 * 60 * 1000
        ).toISOString();

        const updateData: UpdateEventData = {
          title: "Updated Event Title",
          description: "Updated description",
          start_time: newStartTime,
          end_time: newEndTime,
          location: "Updated Location",
        };

        const updatedEvent = await EventAPI.update(createdEvent.id, updateData);

        // Assertions
        expect(updatedEvent.id).toBe(createdEvent.id);
        expect(updatedEvent.title).toBe(updateData.title);
        expect(updatedEvent.description).toBe(updateData.description);
        expect(updatedEvent.start_time).toBe(updateData.start_time);
        expect(updatedEvent.end_time).toBe(updateData.end_time);
        expect(updatedEvent.location).toBe(updateData.location);
        expect(new Date(updatedEvent.updated_at).getTime()).toBeGreaterThan(
          new Date(createdEvent.updated_at).getTime()
        );
      },
      TEST_CONFIG.testTimeout
    );

    test(
      "should delete an event",
      async () => {
        // Create an event first
        const eventData = TestUtils.generateTestEvent();
        const createdEvent = await EventAPI.create(eventData);

        // Delete the event
        await EventAPI.delete(createdEvent.id);

        // Verify deletion
        const deletedEvent = await EventAPI.getById(createdEvent.id);
        expect(deletedEvent).toBeNull();
      },
      TEST_CONFIG.testTimeout
    );

    test(
      "should cancel and restore an event",
      async () => {
        // Create an event first
        const eventData = TestUtils.generateTestEvent();
        const createdEvent = await EventAPI.create(eventData);
        TestUtils.trackCreatedItem("events", createdEvent.id);

        // Cancel the event
        const cancelledEvent = await EventAPI.cancel(createdEvent.id);
        expect(cancelledEvent.is_cancelled).toBe(true);

        // Restore the event
        const restoredEvent = await EventAPI.restore(createdEvent.id);
        expect(restoredEvent.is_cancelled).toBe(false);
      },
      TEST_CONFIG.testTimeout
    );

    test(
      "should duplicate an event",
      async () => {
        // Create an event first
        const eventData = TestUtils.generateTestEvent();
        const createdEvent = await EventAPI.create(eventData);
        TestUtils.trackCreatedItem("events", createdEvent.id);

        // Duplicate the event
        const newStartTime = new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ).toISOString();
        const duplicatedEvent = await EventAPI.duplicate(
          createdEvent.id,
          newStartTime
        );
        TestUtils.trackCreatedItem("events", duplicatedEvent.id);

        // Assertions
        expect(duplicatedEvent.id).not.toBe(createdEvent.id);
        expect(duplicatedEvent.title).toBe(`${createdEvent.title} (Copy)`);
        expect(duplicatedEvent.description).toBe(createdEvent.description);
        expect(duplicatedEvent.category_id).toBe(createdEvent.category_id);
        expect(duplicatedEvent.location).toBe(createdEvent.location);
        expect(duplicatedEvent.start_time).toBe(newStartTime);
      },
      TEST_CONFIG.testTimeout
    );
  });

  describe("Query Operations", () => {
    test(
      "should get all events with pagination",
      async () => {
        // Create multiple events
        const eventPromises = Array.from({ length: 5 }, () => {
          const eventData = TestUtils.generateTestEvent();
          return EventAPI.create(eventData);
        });

        const createdEvents = await Promise.all(eventPromises);
        createdEvents.forEach((event) =>
          TestUtils.trackCreatedItem("events", event.id)
        );

        // Get events with pagination
        const result = await EventAPI.getAll({ page: 1, limit: 3 });

        // Assertions
        expect(result.data).toBeDefined();
        expect(result.total).toBeGreaterThanOrEqual(5);
        expect(result.data.length).toBeLessThanOrEqual(3);
        expect(result.hasMore).toBe(true);
      },
      TEST_CONFIG.testTimeout
    );

    test(
      "should get events by date range",
      async () => {
        // Create events for different dates
        const today = new Date();
        const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
        const dayAfterTomorrow = new Date(
          today.getTime() + 2 * 24 * 60 * 60 * 1000
        );

        const eventData1 = {
          ...TestUtils.generateTestEvent(),
          start_time: tomorrow.toISOString(),
          end_time: new Date(tomorrow.getTime() + 60 * 60 * 1000).toISOString(),
        };

        const eventData2 = {
          ...TestUtils.generateTestEvent(),
          start_time: dayAfterTomorrow.toISOString(),
          end_time: new Date(
            dayAfterTomorrow.getTime() + 60 * 60 * 1000
          ).toISOString(),
        };

        const event1 = await EventAPI.create(eventData1);
        const event2 = await EventAPI.create(eventData2);

        TestUtils.trackCreatedItem("events", event1.id);
        TestUtils.trackCreatedItem("events", event2.id);

        // Get events for tomorrow only
        const tomorrowStart = new Date(tomorrow);
        tomorrowStart.setHours(0, 0, 0, 0);
        const tomorrowEnd = new Date(tomorrow);
        tomorrowEnd.setHours(23, 59, 59, 999);

        const result = await EventAPI.getByDateRange(
          tomorrowStart.toISOString(),
          tomorrowEnd.toISOString()
        );

        // Assertions
        expect(result.data.some((event) => event.id === event1.id)).toBe(true);
        expect(result.data.some((event) => event.id === event2.id)).toBe(false);
      },
      TEST_CONFIG.testTimeout
    );

    test(
      "should get upcoming events",
      async () => {
        // Create future events
        const futureDate = new Date(Date.now() + 2 * 60 * 60 * 1000);
        const eventData = {
          ...TestUtils.generateTestEvent(),
          start_time: futureDate.toISOString(),
          end_time: new Date(
            futureDate.getTime() + 60 * 60 * 1000
          ).toISOString(),
        };

        const createdEvent = await EventAPI.create(eventData);
        TestUtils.trackCreatedItem("events", createdEvent.id);

        // Get upcoming events
        const upcomingEvents = await EventAPI.getUpcoming(10);

        // Assertions
        expect(
          upcomingEvents.some((event) => event.id === createdEvent.id)
        ).toBe(true);
        expect(
          upcomingEvents.every(
            (event) => new Date(event.start_time) > new Date()
          )
        ).toBe(true);
      },
      TEST_CONFIG.testTimeout
    );

    test(
      "should get conflicting events",
      async () => {
        // Create an event
        const startTime = new Date(Date.now() + 60 * 60 * 1000);
        const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

        const eventData = {
          ...TestUtils.generateTestEvent(),
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
        };

        const createdEvent = await EventAPI.create(eventData);
        TestUtils.trackCreatedItem("events", createdEvent.id);

        // Check for conflicts with overlapping time
        const conflictStart = new Date(startTime.getTime() + 30 * 60 * 1000); // 30 minutes after start
        const conflictEnd = new Date(endTime.getTime() + 30 * 60 * 1000); // 30 minutes after end

        const conflictingEvents = await EventAPI.getConflicting(
          conflictStart.toISOString(),
          conflictEnd.toISOString()
        );

        // Assertions
        expect(
          conflictingEvents.some((event) => event.id === createdEvent.id)
        ).toBe(true);
      },
      TEST_CONFIG.testTimeout
    );

    test(
      "should get event statistics",
      async () => {
        // Create events with different properties
        const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000);

        const pastEventData = {
          ...TestUtils.generateTestEvent(),
          start_time: pastDate.toISOString(),
          end_time: new Date(pastDate.getTime() + 60 * 60 * 1000).toISOString(),
        };

        const futureEventData = {
          ...TestUtils.generateTestEvent(),
          start_time: futureDate.toISOString(),
          end_time: new Date(
            futureDate.getTime() + 60 * 60 * 1000
          ).toISOString(),
        };

        const pastEvent = await EventAPI.create(pastEventData);
        const futureEvent = await EventAPI.create(futureEventData);

        TestUtils.trackCreatedItem("events", pastEvent.id);
        TestUtils.trackCreatedItem("events", futureEvent.id);

        // Cancel one event
        await EventAPI.cancel(pastEvent.id);

        // Get statistics
        const stats = await EventAPI.getStats();

        // Assertions
        expect(stats).toBeDefined();
        expect(stats.total).toBeGreaterThanOrEqual(2);
        expect(stats.upcoming).toBeGreaterThanOrEqual(1);
        expect(stats.cancelled).toBeGreaterThanOrEqual(1);
        expect(stats.byRecurrence).toBeDefined();
      },
      TEST_CONFIG.testTimeout
    );
  });

  describe("Error Handling", () => {
    test(
      "should handle invalid event ID",
      async () => {
        const invalidId = "invalid-id";

        await expect(EventAPI.getById(invalidId)).rejects.toThrow();
      },
      TEST_CONFIG.testTimeout
    );

    test(
      "should validate event time constraints",
      async () => {
        const startTime = new Date(Date.now() + 60 * 60 * 1000);
        const endTime = new Date(startTime.getTime() - 30 * 60 * 1000); // End before start

        const invalidEventData = {
          ...TestUtils.generateTestEvent(),
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
        };

        await expect(EventAPI.create(invalidEventData)).rejects.toThrow();
      },
      TEST_CONFIG.testTimeout
    );

    test(
      "should validate required fields",
      async () => {
        const invalidEventData = {
          // Missing required title, start_time, and end_time fields
          description: "Test description",
        } as CreateEventData;

        await expect(EventAPI.create(invalidEventData)).rejects.toThrow();
      },
      TEST_CONFIG.testTimeout
    );
  });
});
