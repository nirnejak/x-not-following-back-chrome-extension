# X Not Following Back

A Chrome extension that finds accounts on X (Twitter) that don't follow you back — no API keys or paid plans required. It reads directly from the page DOM.

## How It Works

1. You navigate to your following page on X (`x.com/<your-username>/following`)
2. Click the extension icon
3. The extension auto-scrolls through your entire following list, collecting every account
4. For each account, it checks for the "Follows you" badge
5. Results are displayed in the popup with links to each profile

## Installation

1. Clone or download this repository
2. Open `chrome://extensions` in Chrome
3. Enable **Developer mode** (toggle in the top-right corner)
4. Click **Load unpacked**
5. Select the project folder
6. The extension icon will appear in your toolbar — pin it for easy access

## Usage

1. Go to `https://x.com/<your-username>/following`
2. Click the extension icon
3. Wait while it auto-scrolls and scans the page (this may take a moment for large lists)
4. View the list of accounts that don't follow you back
5. Click any entry to open their profile in a new tab

Results are cached for the browser session — reopening the popup shows the last scan instantly. Click **Rescan** to refresh.

## Limitations

- Assumes English locale — the "Follows you" badge detection relies on English text
- X's DOM structure may change over time, which could break selectors
- Very large following lists (thousands) may take a while to auto-scroll through
