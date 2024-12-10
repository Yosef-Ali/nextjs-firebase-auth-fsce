#!/bin/bash

# Load environment variables from .env.local
export $(cat .env.local | xargs)

# Run the seeding script
npx ts-node scripts/seed-program-offices.ts
