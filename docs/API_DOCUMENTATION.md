# Productivity API Documentation

## Overview

The Productivity API provides a comprehensive backend service for managing todos, notes, calendar events, and categories. Built with TypeScript, Supabase, and advanced caching mechanisms, it offers secure, scalable, and high-performance operations.

## Table of Contents

- [Getting Started](#getting-started)
- [Authentication](#authentication)
- [API Reference](#api-reference)
  - [Todo API](#todo-api)
  - [Note API](#note-api)
  - [Event API](#event-api)
  - [Category API](#category-api)
  - [Dashboard API](#dashboard-api)
- [Error Handling](#error-handling)
- [Caching](#caching)
- [Performance](#performance)
- [Security](#security)
- [Testing](#testing)

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account and project
- Environment variables configured

### Installation

\`\`\`bash
npm install
\`\`\`

### Environment Setup

Create a `.env.local` file:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
\`\`\`

### Database Setup

Run the SQL scripts to set up your database:

\`\`\`bash

# Run the schema creation script

psql -f scripts/create-productivity-schema.sql

# Run the sample data script (optional)

psql -f scripts/sample-productivity-data.sql
\`\`\`

## Authentication

All API operations require user authentication. The system uses Supabase Auth with Row Level Security (RLS) to ensure data isolation.

### Authentication Flow

\`\`\`typescript
import { useAuth } from '@/lib/auth-context'

function MyComponent() {
const { user, signIn, signOut, isAuthenticated } = useAuth()

// User is authenticated, can use APIs
return <Dashboard />
}
\`\`\`

### User Session Management

The system automatically handles:

- Session persistence across page reloads
- Token refresh
- Session expiration
- Multi-tab synchronization

## API Reference

### Todo API

The Todo API provides comprehensive task management functionality.

#### Import

\`\`\`typescript
import { TodoAPI } from '@/lib/api/productivity-api'
\`\`\`

#### Create Todo

\`\`\`typescript
const todoData = {
title: "Complete project documentation",
description: "Write comprehensive API documentation",
category_id: "category-uuid",
due_date: "2024-01-15T10:00:00Z",
priority: "high",
tags: ["documentation", "project"]
}

try {
const createdTodo = await TodoAPI.create(todoData)
console.log('Todo created:', createdTodo)
} catch (error) {
console.error('Failed to create todo:', error)
}
\`\`\`

**Parameters:**

- `title` (string, required): Todo title
- `description` (string, optional): Detailed description
- `category_id` (string, optional): Category UUID
- `due_date` (string, optional): ISO date string
- `priority` ('high' | 'medium' | 'low', optional): Priority level
- `status` ('open' | 'in_progress' | 'completed' | 'blocked', optional): Initial status
- `tags` (string[], optional): Array of tags
- `estimated_duration` (number, optional): Estimated duration in minutes

**Returns:** `Todo` object with generated ID and timestamps

#### Get Todo by ID

\`\`\`typescript
try {
const todo = await TodoAPI.getById('todo-uuid')
if (todo) {
console.log('Todo found:', todo)
} else {
console.log('Todo not found')
}
} catch (error) {
console.error('Failed to fetch todo:', error)
}
\`\`\`

**Parameters:**

- `id` (string, required): Todo UUID

**Returns:** `Todo | null`

#### Get All Todos

\`\`\`typescript
try {
const result = await TodoAPI.getAll(
{ page: 1, limit: 20, sortBy: 'due_date', sortOrder: 'asc' },
{ query: 'project' }
)

console.log('Todos:', result.data)
console.log('Total:', result.total)
console.log('Has more:', result.hasMore)
} catch (error) {
console.error('Failed to fetch todos:', error)
}
\`\`\`

**Parameters:**

- `pagination` (object, optional):
  - `page` (number): Page number (default: 1)
  - `limit` (number): Items per page (default: 20)
  - `sortBy` (string): Sort field (default: 'created_at')
  - `sortOrder` ('asc' | 'desc'): Sort direction (default: 'desc')
- `search` (object, optional):
  - `query` (string): Search query
  - `filters` (object): Additional filters

**Returns:** `{ data: Todo[], total: number, hasMore: boolean }`

#### Get Todos with Filters

\`\`\`typescript
try {
const filters = {
status: 'open',
priority: 'high',
category_id: 'category-uuid',
due_date_from: '2024-01-01T00:00:00Z',
due_date_to: '2024-01-31T23:59:59Z'
}

const result = await TodoAPI.getWithFilters(
filters,
{ page: 1, limit: 10 },
'urgent'
)

console.log('Filtered todos:', result.data)
} catch (error) {
console.error('Failed to fetch filtered todos:', error)
}
\`\`\`

**Filter Options:**

- `status`: Filter by todo status
- `priority`: Filter by priority level
- `category_id`: Filter by category
- `is_archived`: Include/exclude archived todos
- `due_date_from`: Start date for due date range
- `due_date_to`: End date for due date range
- `assigned_to`: Filter by assigned user

#### Update Todo

\`\`\`typescript
try {
const updates = {
title: "Updated todo title",
status: "in_progress",
priority: "medium"
}

const updatedTodo = await TodoAPI.update('todo-uuid', updates)
console.log('Todo updated:', updatedTodo)
} catch (error) {
console.error('Failed to update todo:', error)
}
\`\`\`

#### Complete Todo

\`\`\`typescript
try {
const completedTodo = await TodoAPI.complete('todo-uuid')
console.log('Todo completed:', completedTodo.completed_at)
} catch (error) {
console.error('Failed to complete todo:', error)
}
\`\`\`

#### Get Overdue Todos

\`\`\`typescript
try {
const overdueTodos = await TodoAPI.getOverdue()
console.log(`Found ${overdueTodos.length} overdue todos`)
} catch (error) {
console.error('Failed to fetch overdue todos:', error)
}
\`\`\`

#### Get Todos Due Today

\`\`\`typescript
try {
const todayTodos = await TodoAPI.getDueToday()
console.log(`${todayTodos.length} todos due today`)
} catch (error) {
console.error('Failed to fetch today\'s todos:', error)
}
\`\`\`

#### Get Todo Statistics

\`\`\`typescript
try {
const stats = await TodoAPI.getStats()
console.log('Todo Statistics:', {
total: stats.total,
completed: stats.completed,
completionRate: stats.completionRate,
overdue: stats.overdue,
byPriority: stats.byPriority
})
} catch (error) {
console.error('Failed to fetch todo stats:', error)
}
\`\`\`

#### Delete Todo

\`\`\`typescript
try {
await TodoAPI.delete('todo-uuid')
console.log('Todo deleted successfully')
} catch (error) {
console.error('Failed to delete todo:', error)
}
\`\`\`

### Note API

The Note API provides rich note management with tagging, sharing, and search capabilities.

#### Import

\`\`\`typescript
import { NoteAPI } from '@/lib/api/productivity-api'
\`\`\`

#### Create Note

\`\`\`typescript
const noteData = {
title: "Meeting Notes - Q4 Planning",
content: "Key discussion points from today's meeting...",
category_id: "category-uuid",
tags: ["meeting", "planning", "q4"],
formatting: {
bold: [0, 12], // Bold "Meeting Notes"
italic: [15, 27] // Italic "Q4 Planning"
}
}

try {
const createdNote = await NoteAPI.create(noteData)
console.log('Note created:', createdNote)
console.log('Word count:', createdNote.word_count)
console.log('Reading time:', createdNote.reading_time, 'minutes')
} catch (error) {
console.error('Failed to create note:', error)
}
\`\`\`

#### Search Notes

\`\`\`typescript
try {
const searchResults = await NoteAPI.search(
"meeting planning",
{ page: 1, limit: 10 }
)

console.log('Search results:', searchResults.data)
console.log('Total matches:', searchResults.total)
} catch (error) {
console.error('Search failed:', error)
}
\`\`\`

#### Pin/Unpin Note

\`\`\`typescript
try {
const pinnedNote = await NoteAPI.togglePin('note-uuid')
console.log('Note pinned:', pinnedNote.is_pinned)
} catch (error) {
console.error('Failed to toggle pin:', error)
}
\`\`\`

#### Share Note

\`\`\`typescript
try {
const userIds = ['user-uuid-1', 'user-uuid-2']
const sharedNote = await NoteAPI.share('note-uuid', userIds)
console.log('Note shared with:', sharedNote.shared_with)
} catch (error) {
console.error('Failed to share note:', error)
}
\`\`\`

#### Get All Note Tags

\`\`\`typescript
try {
const tags = await NoteAPI.getAllTags()
console.log('Available tags:', tags)
} catch (error) {
console.error('Failed to fetch tags:', error)
}
\`\`\`

#### Duplicate Note

\`\`\`typescript
try {
const duplicatedNote = await NoteAPI.duplicate('note-uuid')
console.log('Note duplicated:', duplicatedNote.title) // "Original Title (Copy)"
} catch (error) {
console.error('Failed to duplicate note:', error)
}
\`\`\`

### Event API

The Event API provides comprehensive calendar event management with recurrence, attendees, and conflict detection.

#### Import

\`\`\`typescript
import { EventAPI } from '@/lib/api/productivity-api'
\`\`\`

#### Create Event

\`\`\`typescript
const eventData = {
title: "Team Standup",
description: "Daily team synchronization meeting",
category_id: "work-category-uuid",
start_time: "2024-01-15T09:00:00Z",
end_time: "2024-01-15T09:30:00Z",
location: "Conference Room A",
recurrence: "daily",
recurrence_interval: 1,
recurrence_end_date: "2024-12-31",
attendees: [
{
email: "john@example.com",
name: "John Doe",
status: "accepted"
}
],
reminders: [
{
type: "email",
minutes_before: 15
}
]
}

try {
const createdEvent = await EventAPI.create(eventData)
console.log('Event created:', createdEvent)
} catch (error) {
console.error('Failed to create event:', error)
}
\`\`\`

#### Get Events by Date Range

\`\`\`typescript
try {
const startDate = "2024-01-01T00:00:00Z"
const endDate = "2024-01-31T23:59:59Z"

const result = await EventAPI.getByDateRange(
startDate,
endDate,
{ page: 1, limit: 50 }
)

console.log('Events in January:', result.data)
} catch (error) {
console.error('Failed to fetch events:', error)
}
\`\`\`

#### Get Upcoming Events

\`\`\`typescript
try {
const upcomingEvents = await EventAPI.getUpcoming(10)
console.log('Next 10 events:', upcomingEvents)
} catch (error) {
console.error('Failed to fetch upcoming events:', error)
}
\`\`\`

#### Check for Conflicting Events

\`\`\`typescript
try {
const conflicts = await EventAPI.getConflicting(
"2024-01-15T09:00:00Z",
"2024-01-15T10:00:00Z",
"exclude-event-uuid" // Optional: exclude specific event
)

if (conflicts.length > 0) {
console.log('Scheduling conflict detected:', conflicts)
}
} catch (error) {
console.error('Failed to check conflicts:', error)
}
\`\`\`

#### Cancel/Restore Event

\`\`\`typescript
try {
// Cancel event
const cancelledEvent = await EventAPI.cancel('event-uuid')
console.log('Event cancelled:', cancelledEvent.is_cancelled)

// Restore event
const restoredEvent = await EventAPI.restore('event-uuid')
console.log('Event restored:', !restoredEvent.is_cancelled)
} catch (error) {
console.error('Failed to cancel/restore event:', error)
}
\`\`\`

#### Duplicate Event

\`\`\`typescript
try {
const newStartTime = "2024-01-22T09:00:00Z" // One week later
const duplicatedEvent = await EventAPI.duplicate('event-uuid', newStartTime)
console.log('Event duplicated for:', duplicatedEvent.start_time)
} catch (error) {
console.error('Failed to duplicate event:', error)
}
\`\`\`

### Category API

The Category API provides organization and categorization for all entities.

#### Import

\`\`\`typescript
import { CategoryAPI } from '@/lib/api/productivity-api'
\`\`\`

#### Create Category

\`\`\`typescript
const categoryData = {
name: "Work Projects",
color: "#3B82F6",
icon: "briefcase",
description: "Work-related projects and tasks"
}

try {
const createdCategory = await CategoryAPI.create(categoryData)
console.log('Category created:', createdCategory)
} catch (error) {
console.error('Failed to create category:', error)
}
\`\`\`

#### Get Category Usage

\`\`\`typescript
try {
const usage = await CategoryAPI.getUsage()

usage.forEach(item => {
console.log(`Category: ${item.category.name}`)
console.log(`  Todos: ${item.usage.todos}`)
console.log(`  Notes: ${item.usage.notes}`)
console.log(`  Events: ${item.usage.events}`)
})
} catch (error) {
console.error('Failed to fetch category usage:', error)
}
\`\`\`

#### Check if Category Can Be Deleted

\`\`\`typescript
try {
const result = await CategoryAPI.canDelete('category-uuid')

if (result.canDelete) {
console.log('Category can be safely deleted')
} else {
console.log('Category is in use:', result.usage)
}
} catch (error) {
console.error('Failed to check category deletion:', error)
}
\`\`\`

#### Delete Category with Reassignment

\`\`\`typescript
try {
await CategoryAPI.deleteWithReassignment(
'old-category-uuid',
'new-category-uuid' // Optional: reassign items to this category
)
console.log('Category deleted and items reassigned')
} catch (error) {
console.error('Failed to delete category:', error)
}
\`\`\`

### Dashboard API

The Dashboard API provides aggregated data for dashboard views.

#### Import

\`\`\`typescript
import { DashboardAPI } from '@/lib/api/productivity-api'
\`\`\`

#### Get Comprehensive Dashboard Data

\`\`\`typescript
try {
const dashboardData = await DashboardAPI.getDashboardData()

console.log('Dashboard Data:', {
todos: {
total: dashboardData.todos.stats.total,
completed: dashboardData.todos.stats.completed,
overdue: dashboardData.todos.overdue.length,
dueToday: dashboardData.todos.dueToday.length
},
notes: {
total: dashboardData.notes.stats.total,
pinned: dashboardData.notes.pinned.length,
totalWords: dashboardData.notes.stats.totalWords
},
events: {
total: dashboardData.events.stats.total,
upcoming: dashboardData.events.upcoming.length,
today: dashboardData.events.today.length
}
})
} catch (error) {
console.error('Failed to fetch dashboard data:', error)
}
\`\`\`

#### Get Quick Stats

\`\`\`typescript
try {
const quickStats = await DashboardAPI.getQuickStats()

console.log('Quick Stats:', quickStats)
// {
// totalTodos: 25,
// completedTodos: 18,
// totalNotes: 12,
// totalEvents: 8,
// upcomingEvents: 3,
// overdueTodos: 2
// }
} catch (error) {
console.error('Failed to fetch quick stats:', error)
}
\`\`\`

## Error Handling

All API functions throw errors that should be handled appropriately:

\`\`\`typescript
import { TodoAPI } from '@/lib/api/productivity-api'

async function handleTodoCreation() {
try {
const todo = await TodoAPI.create({
title: "New Todo",
description: "Todo description"
})

    // Success handling
    console.log('Todo created successfully:', todo)
    return todo

} catch (error) {
// Error handling
if (error instanceof Error) {
console.error('Error message:', error.message)

      // Handle specific error types
      if (error.message.includes('authentication')) {
        // Handle authentication errors
        redirectToLogin()
      } else if (error.message.includes('validation')) {
        // Handle validation errors
        showValidationError(error.message)
      } else {
        // Handle general errors
        showGenericError('Failed to create todo')
      }
    }

    throw error // Re-throw if needed

}
}
\`\`\`

### Common Error Types

- **Authentication Errors**: User not authenticated or session expired
- **Authorization Errors**: User doesn't have permission for the operation
- **Validation Errors**: Invalid input data
- **Not Found Errors**: Requested resource doesn't exist
- **Conflict Errors**: Operation conflicts with existing data
- **Network Errors**: Connection or server issues

## Caching

The system implements intelligent caching to improve performance:

### Cache Strategy

- **Individual Items**: Cached for 30 minutes
- **List Queries**: Cached for 5 minutes
- **Statistics**: Cached for 30 minutes
- **Search Results**: Cached for 5 minutes

### Cache Invalidation

Cache is automatically invalidated when:

- Items are created, updated, or deleted
- User performs bulk operations
- Related data changes

### Manual Cache Management

\`\`\`typescript
import { CacheManager } from '@/lib/cache/redis-client'

// Clear specific cache
await CacheManager.del('cache-key')

// Clear user's cache
await CacheManager.invalidateUserCache('user-uuid')

// Clear item-specific cache
await CacheManager.invalidateItemCache('todo', 'item-uuid', 'user-uuid')
\`\`\`

## Performance

### Optimization Features

- **Database Indexing**: Strategic indexes for all query patterns
- **Connection Pooling**: Efficient database connection management
- **Pagination**: All list operations support pagination
- **Bulk Operations**: Efficient batch processing
- **Query Optimization**: Optimized SQL queries with proper joins

### Performance Monitoring

\`\`\`typescript
// Example: Measure API performance
const startTime = Date.now()
const todos = await TodoAPI.getAll()
const duration = Date.now() - startTime
console.log(`Query took ${duration}ms`)
\`\`\`

### Best Practices

1. **Use Pagination**: Always paginate large datasets
2. **Implement Caching**: Leverage built-in caching mechanisms
3. **Batch Operations**: Use bulk operations for multiple items
4. **Optimize Queries**: Use specific filters to reduce data transfer
5. **Monitor Performance**: Track query times and optimize as needed

## Security

### Authentication & Authorization

- **Row Level Security (RLS)**: Database-level data isolation
- **JWT Tokens**: Secure authentication tokens
- **Session Management**: Automatic session handling
- **Permission Checks**: Operation-level permission validation

### Data Privacy

- **User Isolation**: Users can only access their own data
- **Secure Sharing**: Controlled sharing with permission levels
- **Audit Trail**: Complete activity logging
- **Data Encryption**: Sensitive data encryption at rest

### Security Best Practices

\`\`\`typescript
// Always validate user authentication
const { user } = useAuth()
if (!user) {
throw new Error('User not authenticated')
}

// Use type-safe operations
const todoData: CreateTodoData = {
title: sanitizeInput(userInput.title),
description: sanitizeInput(userInput.description)
}

// Handle errors securely
try {
const result = await TodoAPI.create(todoData)
} catch (error) {
// Don't expose internal errors to users
logError(error)
showUserFriendlyError('Failed to create todo')
}
\`\`\`

## Testing

### Running Tests

\`\`\`bash

# Run all tests

npm run test:all

# Run specific test suites

npm run test:unit
npm run test:integration
npm run test:performance
npm run test:security

# Run with coverage

npm run test:coverage

# Watch mode for development

npm run test:watch
\`\`\`

### Test Categories

1. **Unit Tests**: Individual API function testing
2. **Integration Tests**: Cross-service functionality
3. **Performance Tests**: Load and stress testing
4. **Security Tests**: Authentication and authorization
5. **Cache Tests**: Caching mechanism validation

### Writing Custom Tests

\`\`\`typescript
import { TodoAPI } from '@/lib/api/productivity-api'
import { TestUtils } from '../setup/test-setup'

describe('Custom Todo Tests', () => {
test('should handle custom business logic', async () => {
// Create test data
const todoData = TestUtils.generateTestTodo()
const createdTodo = await TodoAPI.create(todoData)

    // Test your custom logic
    expect(createdTodo.status).toBe('open')

    // Cleanup
    TestUtils.trackCreatedItem('todos', createdTodo.id)

})
})
\`\`\`

### Test Utilities

The test suite provides utilities for:

- **Test Data Generation**: Realistic test data creation
- **Cleanup Management**: Automatic test data cleanup
- **Performance Measurement**: Built-in timing utilities
- **Error Simulation**: Testing error conditions
- **Cache Testing**: Cache behavior validation

## Conclusion

This API provides a robust, secure, and scalable foundation for productivity applications. With comprehensive CRUD operations, intelligent caching, and extensive testing, it's ready for production use.

For additional support or questions, please refer to the test files for usage examples or create an issue in the project repository.
