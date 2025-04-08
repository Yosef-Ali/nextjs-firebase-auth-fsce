# Firebase Indexing Strategy for Free Tier

This document explains how to avoid hitting Firebase Firestore index quota limits on the free tier (Spark plan).

## Understanding the Problem

On the Firebase free tier (Spark plan), there are limitations on the number of composite indexes you can create. When you run queries that require composite indexes, Firebase tries to create them automatically, but you can hit quota limits, resulting in errors like:

```plaintext
Quota exceeded. message
```

## What Are Firestore Indexes?

Firestore indexes are essential for query performance:

1. **Single-field indexes**: Created automatically for each field in your documents
2. **Composite indexes**: Required when you query using multiple conditions or sort orders

## Common Index-Requiring Queries

These query patterns require composite indexes:

```javascript
// Requires a composite index
query(
  collection(db, 'posts'),
  where('published', '==', true),
  orderBy('createdAt', 'desc')
);

// Requires a composite index
query(
  collection(db, 'posts'),
  where('category', '==', 'news'),
  where('published', '==', true)
);
```

## Our Solution

We've implemented a strategy to minimize index requirements:

1. **Use simple queries with at most one filter condition**
2. **Perform additional filtering and sorting in memory**
3. **Create only essential indexes manually**

### Example: Optimized Query Helper

We've created a utility function in `app/utils/query-helpers.ts` that:

1. Uses at most one `where` clause in the Firestore query
2. Performs additional filtering in memory
3. Sorts results in memory instead of using `orderBy`

```typescript
// Instead of this (requires composite index):
const q = query(
  collection(db, 'posts'),
  where('published', '==', true),
  orderBy('createdAt', 'desc')
);

// Use this (no composite index required):
const results = await optimizedQuery('posts', {
  published: true,
  sortBy: 'createdAt',
  sortDirection: 'desc'
});
```

## Essential Indexes

We've defined only the most critical indexes in `firestore.indexes.json`:

```json
{
  "indexes": [
    {
      "collectionGroup": "posts",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "published", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "resources",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "published", "order": "ASCENDING" },
        { "fieldPath": "publishedDate", "order": "DESCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

These indexes support the most common query patterns in our application:

1. For the `posts` collection: Filtering by `published` status and sorting by `createdAt`
2. For the `resources` collection: Filtering by `published` status and sorting by `publishedDate`

## Performance Considerations

This approach works well for collections with fewer than 1,000 documents. For larger collections, consider:

1. Implementing pagination
2. Using more specific queries to reduce the amount of data processed in memory
3. Upgrading to a paid Firebase plan if needed

## Best Practices

1. **Avoid complex queries** with multiple conditions when possible
2. **Use client-side filtering** for secondary conditions
3. **Sort in memory** instead of using `orderBy` in queries
4. **Monitor performance** as your data grows
5. **Create indexes manually** only for the most critical queries

By following these guidelines, you can avoid hitting Firebase's free tier index quota limits while still building a functional application.
