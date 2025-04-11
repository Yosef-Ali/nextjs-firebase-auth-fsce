# Plan to Fix Homepage Error

## Problem

An error occurs on the homepage (`app/(marketing)/(routes)/page.tsx`) when fetching data for the Vision/Mission/Values section. The error originates from the `getAboutContent` function within the `whoWeAreService` (`app/services/who-we-are.ts`).

## Analysis

- The `getAboutContent` function queries the correct Firestore collection (`about`).
- However, it directly maps Firestore document data to the `AboutContent` type without using the `documentToAboutContent` helper function, unlike other methods in the same service. This direct mapping might fail due to missing fields or incorrect data types (e.g., timestamps).

## Solution

1.  **Refactor `getAboutContent`:** Modify the function in `app/services/who-we-are.ts` to use the `documentToAboutContent` helper function for consistent and safer data mapping.

    ```typescript
    // Before
    const aboutData: AboutContent[] = querySnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      } as AboutContent))
      .filter(item => ['vision', 'mission', 'values'].includes(item.section));

    // After
    const aboutData: AboutContent[] = querySnapshot.docs
      .map((doc) => this.documentToAboutContent(doc)) // Use helper here
      .filter(item => ['vision', 'mission', 'values'].includes(item.section));
    ```

2.  **Switch to Code Mode:** Request a switch to 'code' mode to apply the code changes.

3.  **Verify Fix:** Test the homepage to confirm the error is resolved.

4.  **(Contingency) Review Firestore Rules/Data:** If the error persists after the refactor, the next steps in 'code' mode would be:
    *   Review `firestore.rules` to ensure read access to the `about` collection.
    *   Inspect the `about` collection data in Firebase console for structural issues.

## Diagram

```mermaid
graph TD
    A[Start: Error in HomePage] --> B{Identify Cause};
    B --> C[Examine HomePage Code];
    C --> D[Examine whoWeAreService Code];
    D --> E{Inconsistency Found: getAboutContent vs other methods};
    E --> F{Confirm Correct Collection: 'about'};
    F --> G[Hypothesize: Data Mapping Issue];
    G --> H[Plan: Refactor & Switch Mode];
    H --> I[Step 1: Refactor getAboutContent in who-we-are.ts];
    H --> J[Step 2: Switch to Code Mode];
    I --> K{Apply Changes in Code Mode};
    J --> K;
    K --> L[Test Application];
    L -- Error Persists --> M[Review Firestore Rules/Data];
    L -- Error Resolved --> N[End: Error Resolved];
    M --> N;

    style A fill:#f9f,stroke:#333,stroke-width:2px
    style N fill:#ccf,stroke:#333,stroke-width:2px