import { describe, test, expect } from "@jest/globals";
import { NoteAPI } from "../../lib/api/productivity-api";
import { TestUtils, TEST_CONFIG } from "../setup/test-setup";
import type {
  CreateNoteData,
  UpdateNoteData,
} from "../../lib/api/productivity-api";

describe("NoteAPI", () => {
  describe("CRUD Operations", () => {
    test(
      "should create a new note",
      async () => {
        const noteData = TestUtils.generateTestNote();

        const createdNote = await NoteAPI.create(noteData);
        TestUtils.trackCreatedItem("notes", createdNote.id);

        // Assertions
        expect(createdNote).toBeDefined();
        expect(createdNote.id).toBeDefined();
        expect(createdNote.title).toBe(noteData.title);
        expect(createdNote.content).toBe(noteData.content);
        expect(createdNote.category_id).toBe(noteData.category_id);
        expect(createdNote.created_by).toBe(TestUtils.testUser.id);
        expect(createdNote.word_count).toBeGreaterThan(0);
        expect(createdNote.reading_time).toBeGreaterThan(0);

        TestUtils.assertObjectProperties(createdNote, [
          "id",
          "title",
          "content",
          "category_id",
          "word_count",
          "reading_time",
          "created_by",
          "created_at",
          "updated_at",
        ]);
      },
      TEST_CONFIG.testTimeout
    );

    test(
      "should retrieve a note by ID",
      async () => {
        // Create a note first
        const noteData = TestUtils.generateTestNote();
        const createdNote = await NoteAPI.create(noteData);
        TestUtils.trackCreatedItem("notes", createdNote.id);

        // Retrieve the note
        const retrievedNote = await NoteAPI.getById(createdNote.id);

        // Assertions
        TestUtils.assertNotNull(retrievedNote);
        expect(retrievedNote!.id).toBe(createdNote.id);
        expect(retrievedNote!.title).toBe(noteData.title);
        expect(retrievedNote!.content).toBe(noteData.content);
      },
      TEST_CONFIG.testTimeout
    );

    test(
      "should update a note",
      async () => {
        // Create a note first
        const noteData = TestUtils.generateTestNote();
        const createdNote = await NoteAPI.create(noteData);
        TestUtils.trackCreatedItem("notes", createdNote.id);

        // Update the note
        const updateData: UpdateNoteData = {
          title: "Updated Note Title",
          content:
            "Updated content with more words to test word count calculation.",
          tags: ["updated", "test"],
        };

        const updatedNote = await NoteAPI.update(createdNote.id, updateData);

        // Assertions
        expect(updatedNote.id).toBe(createdNote.id);
        expect(updatedNote.title).toBe(updateData.title);
        expect(updatedNote.content).toBe(updateData.content);
        expect(updatedNote.tags).toEqual(updateData.tags);
        expect(updatedNote.word_count).toBeGreaterThan(createdNote.word_count);
        expect(new Date(updatedNote.updated_at).getTime()).toBeGreaterThan(
          new Date(createdNote.updated_at).getTime()
        );
      },
      TEST_CONFIG.testTimeout
    );

    test(
      "should delete a note",
      async () => {
        // Create a note first
        const noteData = TestUtils.generateTestNote();
        const createdNote = await NoteAPI.create(noteData);

        // Delete the note
        await NoteAPI.delete(createdNote.id);

        // Verify deletion
        const deletedNote = await NoteAPI.getById(createdNote.id);
        expect(deletedNote).toBeNull();
      },
      TEST_CONFIG.testTimeout
    );

    test(
      "should toggle pin status",
      async () => {
        // Create a note first
        const noteData = TestUtils.generateTestNote();
        const createdNote = await NoteAPI.create(noteData);
        TestUtils.trackCreatedItem("notes", createdNote.id);

        // Pin the note
        const pinnedNote = await NoteAPI.togglePin(createdNote.id);
        expect(pinnedNote.is_pinned).toBe(true);

        // Unpin the note
        const unpinnedNote = await NoteAPI.togglePin(createdNote.id);
        expect(unpinnedNote.is_pinned).toBe(false);
      },
      TEST_CONFIG.testTimeout
    );

    test(
      "should toggle archive status",
      async () => {
        // Create a note first
        const noteData = TestUtils.generateTestNote();
        const createdNote = await NoteAPI.create(noteData);
        TestUtils.trackCreatedItem("notes", createdNote.id);

        // Archive the note
        const archivedNote = await NoteAPI.toggleArchive(createdNote.id);
        expect(archivedNote.is_archived).toBe(true);

        // Unarchive the note
        const unarchivedNote = await NoteAPI.toggleArchive(createdNote.id);
        expect(unarchivedNote.is_archived).toBe(false);
      },
      TEST_CONFIG.testTimeout
    );

    test(
      "should duplicate a note",
      async () => {
        // Create a note first
        const noteData = TestUtils.generateTestNote();
        const createdNote = await NoteAPI.create(noteData);
        TestUtils.trackCreatedItem("notes", createdNote.id);

        // Duplicate the note
        const duplicatedNote = await NoteAPI.duplicate(createdNote.id);
        TestUtils.trackCreatedItem("notes", duplicatedNote.id);

        // Assertions
        expect(duplicatedNote.id).not.toBe(createdNote.id);
        expect(duplicatedNote.title).toBe(`${createdNote.title} (Copy)`);
        expect(duplicatedNote.content).toBe(createdNote.content);
        expect(duplicatedNote.category_id).toBe(createdNote.category_id);
        expect(duplicatedNote.tags).toEqual(createdNote.tags);
      },
      TEST_CONFIG.testTimeout
    );
  });

  describe("Query Operations", () => {
    test(
      "should get all notes with pagination",
      async () => {
        // Create multiple notes
        const notePromises = Array.from({ length: 5 }, () => {
          const noteData = TestUtils.generateTestNote();
          return NoteAPI.create(noteData);
        });

        const createdNotes = await Promise.all(notePromises);
        createdNotes.forEach((note) =>
          TestUtils.trackCreatedItem("notes", note.id)
        );

        // Get notes with pagination
        const result = await NoteAPI.getAll({ page: 1, limit: 3 });

        // Assertions
        expect(result.data).toBeDefined();
        expect(result.total).toBeGreaterThanOrEqual(5);
        expect(result.data.length).toBeLessThanOrEqual(3);
        expect(result.hasMore).toBe(true);
      },
      TEST_CONFIG.testTimeout
    );

    test(
      "should get pinned notes",
      async () => {
        // Create and pin a note
        const noteData = TestUtils.generateTestNote();
        const createdNote = await NoteAPI.create(noteData);
        TestUtils.trackCreatedItem("notes", createdNote.id);

        await NoteAPI.togglePin(createdNote.id);

        // Get pinned notes
        const pinnedNotes = await NoteAPI.getPinned();

        // Assertions
        expect(pinnedNotes.some((note) => note.id === createdNote.id)).toBe(
          true
        );
        expect(pinnedNotes.every((note) => note.is_pinned)).toBe(true);
      },
      TEST_CONFIG.testTimeout
    );

    test(
      "should get recent notes",
      async () => {
        // Create multiple notes
        const notePromises = Array.from({ length: 3 }, async (_, index) => {
          const noteData = TestUtils.generateTestNote();
          const note = await NoteAPI.create(noteData);
          TestUtils.trackCreatedItem("notes", note.id);

          // Add small delay to ensure different timestamps
          await TestUtils.wait(100);
          return note;
        });

        await Promise.all(notePromises);

        // Get recent notes
        const recentNotes = await NoteAPI.getRecent(2);

        // Assertions
        expect(recentNotes.length).toBeLessThanOrEqual(2);

        // Check if notes are sorted by updated_at in descending order
        if (recentNotes.length > 1) {
          for (let i = 0; i < recentNotes.length - 1; i++) {
            expect(
              new Date(recentNotes[i].updated_at).getTime()
            ).toBeGreaterThanOrEqual(
              new Date(recentNotes[i + 1].updated_at).getTime()
            );
          }
        }
      },
      TEST_CONFIG.testTimeout
    );

    test(
      "should search notes",
      async () => {
        // Create notes with specific content
        const searchTerm = "unique-search-term";
        const noteData = {
          ...TestUtils.generateTestNote(),
          title: `Note with ${searchTerm}`,
          content: `This note contains the ${searchTerm} for testing search functionality.`,
        };

        const createdNote = await NoteAPI.create(noteData);
        TestUtils.trackCreatedItem("notes", createdNote.id);

        // Search for notes
        const searchResults = await NoteAPI.search(searchTerm);

        // Assertions
        expect(
          searchResults.data.some((note) => note.id === createdNote.id)
        ).toBe(true);
      },
      TEST_CONFIG.testTimeout
    );

    test(
      "should get all note tags",
      async () => {
        // Create notes with different tags
        const noteData1 = {
          ...TestUtils.generateTestNote(),
          tags: ["tag1", "common"],
        };
        const noteData2 = {
          ...TestUtils.generateTestNote(),
          tags: ["tag2", "common"],
        };

        const note1 = await NoteAPI.create(noteData1);
        const note2 = await NoteAPI.create(noteData2);

        TestUtils.trackCreatedItem("notes", note1.id);
        TestUtils.trackCreatedItem("notes", note2.id);

        // Get all tags
        const allTags = await NoteAPI.getAllTags();

        // Assertions
        expect(allTags).toContain("tag1");
        expect(allTags).toContain("tag2");
        expect(allTags).toContain("common");
      },
      TEST_CONFIG.testTimeout
    );

    test(
      "should get note statistics",
      async () => {
        // Create notes with different properties
        const noteData1 = TestUtils.generateTestNote();
        const noteData2 = TestUtils.generateTestNote();

        const note1 = await NoteAPI.create(noteData1);
        const note2 = await NoteAPI.create(noteData2);

        TestUtils.trackCreatedItem("notes", note1.id);
        TestUtils.trackCreatedItem("notes", note2.id);

        // Pin one note
        await NoteAPI.togglePin(note1.id);

        // Get statistics
        const stats = await NoteAPI.getStats();

        // Assertions
        expect(stats).toBeDefined();
        expect(stats.total).toBeGreaterThanOrEqual(2);
        expect(stats.pinned).toBeGreaterThanOrEqual(1);
        expect(stats.totalWords).toBeGreaterThan(0);
        expect(stats.averageWordCount).toBeGreaterThan(0);
      },
      TEST_CONFIG.testTimeout
    );
  });

  describe("Sharing Operations", () => {
    test(
      "should share and unshare notes",
      async () => {
        // Create a note
        const noteData = TestUtils.generateTestNote();
        const createdNote = await NoteAPI.create(noteData);
        TestUtils.trackCreatedItem("notes", createdNote.id);

        // Mock another user ID for sharing
        const mockUserId = "00000000-0000-0000-0000-000000000001";

        // Share the note
        const sharedNote = await NoteAPI.share(createdNote.id, [mockUserId]);
        expect(sharedNote.shared_with).toContain(mockUserId);

        // Unshare the note
        const unsharedNote = await NoteAPI.unshare(createdNote.id, [
          mockUserId,
        ]);
        expect(unsharedNote.shared_with).not.toContain(mockUserId);
      },
      TEST_CONFIG.testTimeout
    );
  });

  describe("Error Handling", () => {
    test(
      "should handle invalid note ID",
      async () => {
        const invalidId = "invalid-id";

        await expect(NoteAPI.getById(invalidId)).rejects.toThrow();
      },
      TEST_CONFIG.testTimeout
    );

    test(
      "should validate required fields",
      async () => {
        const invalidNoteData = {
          // Missing required title and content fields
          category_id: TestUtils.testCategories[0]?.id,
        } as CreateNoteData;

        await expect(NoteAPI.create(invalidNoteData)).rejects.toThrow();
      },
      TEST_CONFIG.testTimeout
    );
  });
});
