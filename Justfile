# Justfile for libre-places
# Commands: dev, build, preview, lint, format, release

set shell := ["zsh", "-cu"]

default: deps

# Install dependencies
deps:
    npm ci

# Run development server
dev:
    npm run dev

# Build for production
build:
    npm run build

# Preview built site (static from docs/)
preview:
    npm run preview

# Lint TypeScript and JavaScript
lint:
    npm run lint

# Format code with Prettier
format:
    npm run format

# Clean build and node_modules
clean:
    rm -rf docs
    rm -rf node_modules

# Check all (lint + format check)
check: lint
    prettier --check .

# Run linting, formatting, build, and preview checks before push
verify: lint
    npm run format
    npm run build
    @echo "✓ Lint, format, and build passed. Ready for git commit."
