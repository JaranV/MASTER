#!/bin/bash
# Creates a fresh CI/CD run directory at the chosen specification level.
# Usage: ./reset_run.sh <level> <number>
# Example: ./reset_run.sh 2 03   → AI_RUN_L2_03/

set -e

if [ -z "$1" ] || [ -z "$2" ]; then
  echo "Usage: ./reset_run.sh <level> <number>"
  echo "  level:  1 | 2 | 3"
  echo "  number: e.g. 1, 2, 3 …"
  echo "Example: ./reset_run.sh 2 03"
  exit 1
fi

LEVEL="$1"
case "$LEVEL" in
  1|2|3) ;;
  *) echo "Level must be 1, 2, or 3."; exit 1 ;;
esac

RUN_NUM=$(printf '%02d' "$2")
RUN_DIR="AI_RUN_L${LEVEL}_${RUN_NUM}"

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
MEMORY_DIR="$HOME/.claude/projects/${_ENC}-AI-RUN-L${LEVEL}-${RUN_NUM}"
if [ -d "$MEMORY_DIR" ]; then
  echo "Cleaning Claude memory: $MEMORY_DIR"
  rm -rf "$MEMORY_DIR"
fi

# Copy fresh template
cp -r "AI_GEN" "$RUN_DIR"

# Pick the chosen CLAUDE_LX.md, drop the others
mv "$RUN_DIR/CLAUDE_L${LEVEL}.md" "$RUN_DIR/CLAUDE.md"
rm -f "$RUN_DIR"/CLAUDE_L*.md

echo ""
echo "Ready: Code/CICD/$RUN_DIR  (spec level L${LEVEL})"
echo ""
echo "Next steps:"
echo "  cd $RUN_DIR"
echo "  claude"
echo "  /model Opus"
echo "  /effort max"
echo "  → prompt: Set it up."
