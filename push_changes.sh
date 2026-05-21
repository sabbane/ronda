#!/bin/bash
set -e

VERSION=$1

# 1. Check git status
if [ -n "$(git status --porcelain)" ]; then
    echo -e "\e[36mChanges found. Staging files...\e[0m"
    git add .

    # Ask for commit message
    echo -n "Enter commit message (Default: 'chore: update changes'): "
    read -r commitMsg
    if [ -z "$commitMsg" ]; then
        commitMsg="chore: update changes"
    fi

    echo -e "\e[36mCreating commit: '$commitMsg'...\e[0m"
    git commit -m "$commitMsg"
else
    echo -e "\e[33mNo local changes to commit.\e[0m"
fi

# 2. Create version, create branch, push, and return to main
if [ -n "$VERSION" ]; then
    # Clean version string
    VERSION=$(echo "$VERSION" | tr -d '"' | tr -d "'" | xargs)
    
    echo -e "\e[36mCreating version $VERSION...\e[0m"
    npm version "$VERSION"

    echo -e "\e[36mPushing main branch and tags to origin...\e[0m"
    git push origin main
    git push origin --tags

    # Create and push the version branch
    BRANCH_NAME="v$VERSION"
    echo -e "\e[36mCreating and switching to version branch: $BRANCH_NAME...\e[0m"
    git checkout -b "$BRANCH_NAME"

    echo -e "\e[36mPushing version branch $BRANCH_NAME to origin...\e[0m"
    git push origin "$BRANCH_NAME"

    # Return to main
    echo -e "\e[36mReturning to main branch...\e[0m"
    git checkout main
else
    echo -e "\e[36mNo version provided. Pushing changes on main to origin...\e[0m"
    git push origin main
fi

echo -e "\e[32mCompleted successfully!\e[0m"
