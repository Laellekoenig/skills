#!/bin/zsh
set -euo pipefail

# Prepares a fresh worktree for `bun run verify` and `bun run dev`: installs
# dependencies and links the main checkout's `.env`. Safe to rerun.
# Usage: bun run setup

main=$(git worktree list --porcelain | sed -n '1s/^worktree //p')

bun install

if [[ ! -e .env && -e "$main/.env" ]]; then
  ln -s "$main/.env" .env
  echo "Linked .env from $main"
fi
