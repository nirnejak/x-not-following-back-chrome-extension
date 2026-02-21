(async () => {
  const collected = new Map();

  function scanCells() {
    const cells = document.querySelectorAll('[data-testid="UserCell"]');
    for (const cell of cells) {
      const links = cell.querySelectorAll('a[role="link"]');
      let username = "";
      let name = "";

      for (const link of links) {
        const href = link.getAttribute("href");
        if (!href || href === "/") continue;
        const match = href.match(/^\/([A-Za-z0-9_]+)$/);
        if (match && !username) {
          username = match[1];
        }
      }

      if (!username || collected.has(username)) continue;

      const nameSpans = cell.querySelectorAll("span");
      for (const span of nameSpans) {
        const text = span.textContent.trim();
        if (
          text &&
          !text.startsWith("@") &&
          text !== "Follows you" &&
          text.length < 60 &&
          !span.querySelector("span")
        ) {
          name = text;
          break;
        }
      }

      const followsBack = cell.textContent.includes("Follows you");
      collected.set(username, { username, name: name || username, followsBack });
    }
  }

  // Initial scan
  scanCells();

  // Auto-scroll and collect
  const scrollContainer = document.scrollingElement || document.documentElement;
  let lastCount = 0;
  let stableRounds = 0;

  while (stableRounds < 5) {
    window.scrollBy(0, window.innerHeight * 2);
    await new Promise((r) => setTimeout(r, 800));
    scanCells();

    if (collected.size === lastCount) {
      stableRounds++;
    } else {
      stableRounds = 0;
      lastCount = collected.size;
    }
  }

  // Scroll back to top
  window.scrollTo(0, 0);

  return Array.from(collected.values());
})();
