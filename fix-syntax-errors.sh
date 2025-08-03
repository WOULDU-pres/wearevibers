#!/bin/bash

echo "🔧 Fixing common syntax errors caused by automated replacements..."

# Find files with potential missing comma issues after destructuring
find src -name "*.ts" -o -name "*.tsx" | while read file; do
    # Look for patterns where there might be missing commas in destructuring
    if grep -q "^[[:space:]]*[a-zA-Z_][a-zA-Z0-9_]*$" "$file"; then
        echo "Checking $file for potential syntax issues..."
        
        # Use a more careful sed replacement to fix missing commas
        # This looks for standalone identifiers that should probably have commas
        sed -i.bak -E '
            # Fix missing commas in destructuring patterns
            s/^([[:space:]]*[a-zA-Z_][a-zA-Z0-9_]*)[[:space:]]*$/\1,/g
            
            # Fix trailing comma issues in object destructuring  
            s/,([[:space:]]*[})])/\1/g
        ' "$file"
        
        # Check if anything changed
        if [ -f "$file.bak" ]; then
            if ! diff -q "$file" "$file.bak" > /dev/null; then
                echo "  ✅ Fixed potential syntax issues in $file"
            fi
            rm "$file.bak"
        fi
    fi
done

echo "✨ Syntax error fixes completed!"