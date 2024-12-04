# Database Seeding Scripts

## Seeding Programs

This script seeds the Firestore database with initial program data for the "What We Do" section.

### Prerequisites
- Firebase project set up
- Firestore database configured
- Firebase credentials configured in the project

### Running the Seed Script
```bash
bun run scripts/seed-programs.ts
```

### What This Script Does
- Creates sample programs for each category
- Adds programs to the 'posts' collection
- Sets initial metadata like creation timestamps and slugs

### Caution
- Running this script will add new documents to your Firestore database
- Existing documents in the 'posts' collection will not be modified
- Ensure you have the correct Firebase configuration before running
