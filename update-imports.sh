#!/bin/bash

# Function to update imports in a file
update_file() {
    local file=$1
    sed -i '' 's|@/app/firebase|@/lib/firebase|g' "$file"
}

# Find all TypeScript and TypeScript React files
find . -type f \( -name "*.ts" -o -name "*.tsx" \) | while read -r file; do
    update_file "$file"
done
