document.addEventListener("DOMContentLoaded", async () => {
  const status = document.getElementById("status");
  const results = document.getElementById("results");
  const summary = document.getElementById("summary");
  const rescanBtn = document.getElementById("rescan");

  rescanBtn.addEventListener("click", () => scan());

  // Try loading cached results first
  try {
    const { cachedUsers, cachedAt } = await chrome.storage.session.get([
      "cachedUsers",
      "cachedAt",
    ]);

    if (cachedUsers && cachedAt) {
      const ago = Math.round((Date.now() - cachedAt) / 60000);
      renderResults(cachedUsers, `Cached from ${ago < 1 ? "just now" : ago + "m ago"}`);
      rescanBtn.style.display = "block";
      return;
    }
  } catch (e) {
    // Storage not available, proceed with fresh scan
  }

  rescanBtn.style.display = "none";
  scan();

  async function scan() {
    status.style.display = "block";
    status.style.color = "#71767b";
    status.textContent = "Auto-scrolling and scanning the page...";
    summary.innerHTML = "";
    results.innerHTML = "";
    rescanBtn.style.display = "none";

    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (!tab?.url || !tab.url.match(/^https:\/\/x\.com\/[^/]+\/following/)) {
        status.textContent =
          "Navigate to x.com/your-username/following first, then click this extension.";
        status.style.color = "#f4212e";
        return;
      }

      const [{ result: users }] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content.js"],
      });

      if (!users || users.length === 0) {
        status.textContent =
          "No users found on page. Make sure the following list is visible.";
        status.style.color = "#ffd400";
        return;
      }

      // Cache results
      try {
        await chrome.storage.session.set({
          cachedUsers: users,
          cachedAt: Date.now(),
        });
      } catch (e) {
        // Cache write failed, results still render fine
      }

      renderResults(users);
      rescanBtn.style.display = "block";
    } catch (err) {
      status.textContent = `Error: ${err.message}`;
      status.style.color = "#f4212e";
    }
  }

  function renderResults(users, cacheLabel) {
    const notFollowing = users.filter((u) => !u.followsBack);
    const followingBack = users.length - notFollowing.length;

    status.style.display = "none";

    summary.innerHTML = `
      <div class="stat-row">
        <span>Scanned</span><strong>${users.length}</strong>
      </div>
      <div class="stat-row">
        <span>Follow you back</span><strong style="color:#00ba7c">${followingBack}</strong>
      </div>
      <div class="stat-row">
        <span>Don't follow back</span><strong style="color:#f4212e">${notFollowing.length}</strong>
      </div>
      ${cacheLabel ? `<div class="cache-label">${cacheLabel}</div>` : ""}
    `;

    if (users.length < 20) {
      summary.innerHTML += `<p class="warning">Only ${users.length} users found — you may need to scroll more to load your full following list.</p>`;
    }

    results.innerHTML = "";

    if (notFollowing.length === 0) {
      results.innerHTML =
        '<p style="text-align:center;color:#00ba7c;padding:16px">Everyone you follow follows you back!</p>';
      return;
    }

    const list = document.createElement("div");
    list.className = "user-list";

    for (const user of notFollowing) {
      const row = document.createElement("a");
      row.className = "user-row";
      row.href = `https://x.com/${user.username}`;
      row.target = "_blank";
      row.rel = "noopener";
      row.innerHTML = `
        <div class="user-info">
          <span class="name">${escapeHtml(user.name)}</span>
          <span class="handle">@${escapeHtml(user.username)}</span>
        </div>
        <svg class="arrow" viewBox="0 0 24 24" width="16" height="16">
          <path fill="currentColor" d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/>
        </svg>
      `;
      list.appendChild(row);
    }

    results.appendChild(list);
  }
});

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
