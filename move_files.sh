#!/bin/bash

# Check if both source and destination arguments are provided
if [ $# -ne 2 ]; then
    echo "Usage: $0 <source_directory> <destination_directory>"
    echo "Example: $0 ./source_folder ./destination_folder"
    exit 1
fi

source_dir="$1"
dest_dir="$2"

# Check if source directory exists
if [ ! -d "$source_dir" ]; then
    echo "Error: Source directory '$source_dir' does not exist"
    exit 1
fi

# Check if destination directory exists, if not create it
if [ ! -d "$dest_dir" ]; then
    read -p "Destination directory '$dest_dir' does not exist. Create it? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        mkdir -p "$dest_dir"
    else
        echo "Operation cancelled"
        exit 0
    fi
fi

# Count items to be moved
item_count=$(find "$source_dir" -mindepth 1 -maxdepth 1 | wc -l)

if [ "$item_count" -eq 0 ]; then
    echo "No files or directories found in '$source_dir'"
    exit 0
fi

# List contents of source directory
echo "Contents of source directory '$source_dir':"
ls -la "$source_dir"

# Ask for confirmation
echo -e "\nFound $item_count items to move from '$source_dir' to '$dest_dir'"
read -p "Are you sure you want to move these items? (y/n) " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Move items
    mv "$source_dir"/* "$dest_dir"/
    if [ $? -eq 0 ]; then
        echo "Successfully moved $item_count items to '$dest_dir'"
    else
        echo "Error: Some items could not be moved"
        exit 1
    fi
else
    echo "Operation cancelled"
    exit 0
fi 