#!/bin/bash

# Convenience script to sync untracked files across worktrees
# This is a wrapper around the git hook script for easy access

echo "Running worktree file sync..."
./.git/hooks/sync-worktree-files.sh