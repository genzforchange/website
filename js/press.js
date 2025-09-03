(() => {
  const ENDPOINT =
    "https://get-statement-data-893947194926.us-central1.run.app/get_press";
  const CONTAINER_SELECTOR = "#press-feed";
  const FALLBACK_IMG = 'assets/placeholder.png';
  const FETCH_TIMEOUT_MS = 12000;

  // date formatting
  function formatDate(iso) {
    try {
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return iso || "";
      const dd = String(d.getDate()).padStart(2, "0");
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      return `${dd} ${months[d.getMonth()]} ${d.getFullYear()}`;
    } catch (_) {
      return iso || "";
    }
  }

  function dedupeByUuid(items) {
    const seen = new Set();
    const out = [];
    for (const it of items) {
      const id = it && typeof it === "object" ? it.uuid : undefined;
      if (!id || seen.has(id)) continue;
      seen.add(id);
      out.push(it);
    }
    return out;
  }

  /** Simple URL validity check to avoid broken anchors. */
  function isValidHttpUrl(value) {
    try {
      const u = new URL(value);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch {
      return false;
    }
  }

  /** Fetch with timeout for better UX on stalled connections. */
  async function fetchJSONWithTimeout(url, timeoutMs) {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { signal: controller.signal, credentials: "omit" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } finally {
      clearTimeout(t);
    }
  }

  function buildCard(item) {
    const {
      date = "",
      imgSrc = "",
      publication = "",
      title = "",
      url = "#",
    } = item || {};

    const card = document.createElement("div");
    card.className = "feed";
    card.dataset.uuid = item?.uuid || "";

    const anchor = document.createElement("a");
    if (isValidHttpUrl(url)) {
      anchor.href = url;
      anchor.target = "_blank"; // Why: Users expect press to open in a new tab.
      anchor.rel = "noopener noreferrer";
      anchor.setAttribute(
        "aria-label",
        `${publication || "Publication"}: ${title || "Article"}`
      );
    } else {
      anchor.href = "#";
      anchor.setAttribute("aria-disabled", "true");
      anchor.style.pointerEvents = "none";
    }

    const bg = document.createElement("div");
    bg.className = "feed-background";

    const preview = document.createElement("div");
    preview.className = "feed-preview";

    const img = document.createElement("img");
    img.className = "feed-img";
    img.loading = "lazy";
    img.decoding = "async";
    img.alt = publication ? `${publication} thumbnail` : "Press thumbnail";
    img.src = imgSrc && imgSrc.trim().length > 0 ? imgSrc : FALLBACK_IMG;
    img.addEventListener("error", () => {
      if (img.src !== location.origin + "/" + FALLBACK_IMG && img.src !== FALLBACK_IMG) {
        img.src = FALLBACK_IMG;
      }
    });

    const textWrap = document.createElement("div");
    textWrap.className = "feed-text";

    const dateEl = document.createElement("p");
    dateEl.className = "feed-date";
    dateEl.textContent = formatDate(date);

    const pubEl = document.createElement("h2");
    pubEl.className = "feed-title";
    pubEl.textContent = publication || "";

    const titleEl = document.createElement("p");
    titleEl.className = "feed-description";
    titleEl.textContent = title || "";

    textWrap.appendChild(dateEl);
    textWrap.appendChild(pubEl);
    textWrap.appendChild(titleEl);

    preview.appendChild(img);
    preview.appendChild(textWrap);

    anchor.appendChild(bg);
    anchor.appendChild(preview);

    card.appendChild(anchor);
    return card;
  }

  async function renderPressFeed() {
    const container = document.querySelector(CONTAINER_SELECTOR);
    if (!container) return;
    const limitAttr = container.getAttribute("data-limit");
    const limit = limitAttr ? Math.max(0, parseInt(limitAttr, 10)) : undefined;

    container.setAttribute("aria-busy", "true");

    try {
      const data = await fetchJSONWithTimeout(ENDPOINT, FETCH_TIMEOUT_MS);
      const list = Array.isArray(data) ? data : [];
      const unique = dedupeByUuid(list);
      unique.sort((a, b) => new Date(b.date) - new Date(a.date));
      const finalItems = typeof limit === "number" ? unique.slice(0, limit) : unique;
      container.innerHTML = "";

      const frag = document.createDocumentFragment();
      for (const item of finalItems) {
        frag.appendChild(buildCard(item));
      }
      container.appendChild(frag);
    } catch (err) {
      console.error("Failed to load press feed:", err);
      const msg = document.createElement("p");
      msg.className = "feed-error";
      msg.role = "status";
      msg.textContent = "Unable to load press coverage right now.";
      container.innerHTML = "";
      container.appendChild(msg);
    } finally {
      container.removeAttribute("aria-busy");
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderPressFeed);
  } else {
    renderPressFeed();
  }
})();
