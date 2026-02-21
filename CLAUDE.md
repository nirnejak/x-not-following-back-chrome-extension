# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

A Chrome Manifest V3 extension that finds X (Twitter) accounts that don't follow you back. It works by scraping the DOM on `x.com/<username>/following` — no API keys required.

## Development

No build step. Load the project folder directly as an unpacked extension in `chrome://extensions` (Developer mode). Reload the extension after making changes.

## Architecture

Plain JavaScript, no framework or bundler. Three entry points:

- **`popup.html` / `popup.js`** — The extension popup UI. Opens when the toolbar icon is clicked. Checks if the active tab is on `x.com/.../following`, injects `content.js` via `chrome.scripting.executeScript`, and renders the results. Caches scan results in `chrome.storage.session`.
- **`content.js`** — Injected into the X following page. Auto-scrolls the page, scrapes `[data-testid="UserCell"]` elements to collect usernames, and detects "Follows you" badges via `cell.textContent.includes("Follows you")`. Returns an array of `{ username, name, followsBack }`.
- **`manifest.json`** — Manifest V3 config. Permissions: `activeTab`, `scripting`, `storage`.

## Key Constraints

- DOM selectors (especially `data-testid="UserCell"`) depend on X's current markup and may break if X changes their DOM structure.
- "Follows you" detection relies on English locale text matching.
