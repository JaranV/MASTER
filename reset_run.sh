#!/bin/bash
# Creates a fresh run directory from the AI_GEN template.
# Usage: ./reset_run.sh 3   (creates AI_RUN_03)
#
# Run this from the Code/ directory before each Claude Code session.
# Each AI_RUN_XX directory gets its own isolated Claude memory namespace.
# This script also cleans any prior Claude memory for that run number.

if [ -z "$1" ]; then
  echo "Usage: ./reset_run.sh <run_number>"
  echo "Example: ./reset_run.sh 3"
  exit 1
fi

RUN_NUM=$(printf '%02d' "$1")
RUN_DIR="AI_RUN_${RUN_NUM}"

# Clean any existing run directory
if [ -d "$RUN_DIR" ]; then
  echo "Removing existing $RUN_DIR..."
  rm -rf "$RUN_DIR"
fi

# Derive Claude's project memory path from the script's own location (works on any machine).
# pwd -W gives the Windows-style path on Git Bash; falls back to POSIX on Linux/Mac.
_ABS="$(cd "$(dirname "$0")" && { pwd -W 2>/dev/null || pwd; })"
_ENC="${_ABS//\//-}"   # replace / with -
_ENC="${_ENC//:/-}"    # replace : with - (Windows drive-letter colon)
MEMORY_DIR="$HOME/.claude/projects/${_ENC}-AI-RUN-${RUN_NUM}"
if [ -d "$MEMORY_DIR" ]; then
  echo "Cleaning Claude memory: $MEMORY_DIR"
  rm -rf "$MEMORY_DIR"
fi

# Copy fresh template
cp -r "AI_GEN" "$RUN_DIR"
echo ""
echo "Ready: Code/$RUN_DIR"
echo ""
echo "Next steps:"
echo "  cd $RUN_DIR"
echo "  claude      (start fresh Claude Code session)"
