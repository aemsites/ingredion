#!/bin/bash

# Check if directory argument is provided
if [ $# -eq 0 ]; then
    echo "Usage: $0 <directory>"
    echo "Example: $0 ./my_directory"
    exit 1
fi

target_dir="$1"

# Check if directory exists
if [ ! -d "$target_dir" ]; then
    echo "Error: Directory '$target_dir' does not exist"
    exit 1
fi

# Count HTML files
html_count=$(find "$target_dir" -type f -name "*.html" | wc -l)

if [ "$html_count" -eq 0 ]; then
    echo "No HTML files found in '$target_dir' and its subdirectories"
    exit 0
fi

# Ask for confirmation
echo "Found $html_count HTML files in '$target_dir' and its subdirectories"
read -p "Are you sure you want to delete these files? (y/n) " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Delete HTML files
    find "$target_dir" -type f -name "*.html" -delete
    echo "Successfully deleted $html_count HTML files"
else
    echo "Operation cancelled"
    exit 0
fi 