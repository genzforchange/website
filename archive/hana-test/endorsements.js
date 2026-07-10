// ENDORSEMENTS PAGE
// Pulls candidate data from endorsements.csv and renders the cards grid.

(function () {

  const CSV_URL = "endorsements.csv";

  const TYPE_STYLES = {
    federal: { bg: "#4065af", fg: "#f8f7f3", label: "FEDERAL" },
    state: { bg: "#5c946f", fg: "#f8f7f3", label: "STATE" },
    local: { bg: "#fcb033", fg: "#231f20", label: "LOCAL" }
  };

  const ICONS = {
    x: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
    instagram: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
    tiktok: "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z",
    facebook: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
  };

  const SOCIAL_NAMES = { x: "X", instagram: "Instagram", tiktok: "TikTok", facebook: "Facebook" };

  let candidates = [];

  // Minimal CSV parser that handles quoted fields, commas and newlines in quotes
  function parseCSV(text) {
    const rows = [];
    let row = [];
    let field = "";
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];

      if (inQuotes) {
        if (char === '"') {
          if (text[i + 1] === '"') {
            field += '"';
            i++;
          } else {
            inQuotes = false;
          }
        } else {
          field += char;
        }
      } else {
        if (char === '"') {
          inQuotes = true;
        } else if (char === ",") {
          row.push(field);
          field = "";
        } else if (char === "\n" || char === "\r") {
          if (char === "\r" && text[i + 1] === "\n") i++;
          row.push(field);
          field = "";
          if (row.length > 1 || row[0] !== "") rows.push(row);
          row = [];
        } else {
          field += char;
        }
      }
    }
    // last field / row
    row.push(field);
    if (row.length > 1 || row[0] !== "") rows.push(row);

    const headers = rows.shift().map(function (h) { return h.trim().toLowerCase(); });
    return rows.map(function (r) {
      const obj = {};
      headers.forEach(function (h, idx) {
        obj[h] = (r[idx] || "").trim();
      });
      return obj;
    });
  }

  function safeUrl(url) {
    if (/^https?:\/\//i.test(url)) return url;
    return "";
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function socialLinksHtml(candidate) {
    let html = "";
    ["x", "instagram", "tiktok", "facebook"].forEach(function (key) {
      const url = safeUrl(candidate[key]);
      if (url) {
        html +=
          '<a class="endorsee-social" href="' + escapeHtml(url) + '" target="_blank" rel="noopener noreferrer" title="' + SOCIAL_NAMES[key] + '">' +
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="#f8f7f3" aria-hidden="true"><path d="' + ICONS[key] + '"></path></svg>' +
          "</a>";
      }
    });
    return html;
  }

  function cardHtml(c) {
    const type = TYPE_STYLES[c.type] || TYPE_STYLES.federal;

    const photoSrc = c.photo && !/^\s*javascript:/i.test(c.photo) ? c.photo : "";
    const photo = photoSrc
      ? '<img src="' + escapeHtml(photoSrc) + '" alt="' + escapeHtml(c.name) + ' headshot">'
      : "";

    const siteUrl = safeUrl(c.campaign_site);
    const siteButton = siteUrl
      ? '<a class="endorsee-site" href="' + escapeHtml(siteUrl) + '" target="_blank" rel="noopener noreferrer">CAMPAIGN SITE &rarr;</a>'
      : "";

    return (
      '<article class="endorsee-card">' +
      '<div class="endorsee-photo">' +
      photo +
      '<span class="endorsee-type" style="background:' + type.bg + ";color:" + type.fg + ';">' + type.label + "</span>" +
      "</div>" +
      '<div class="endorsee-body">' +
      "<h3>" + escapeHtml(c.name) + "</h3>" +
      '<p class="endorsee-district">' + escapeHtml(c.district) + "</p>" +
      '<p class="endorsee-office">' + escapeHtml(c.office) + "</p>" +
      '<div class="endorsee-links">' +
      socialLinksHtml(c) +
      siteButton +
      "</div>" +
      "</div>" +
      "</article>"
    );
  }

  function render(filter) {
    const grid = document.getElementById("endorsements-grid");
    const label = document.getElementById("endorsements-results-label");
    if (!grid) return;

    const filtered = filter === "all"
      ? candidates
      : candidates.filter(function (c) { return c.type === filter; });

    grid.innerHTML = filtered.map(cardHtml).join("");

    const labelMap = { all: "All Elections", federal: "Federal", state: "State", local: "Local" };
    if (label) {
      label.textContent = filtered.length + " endorsee" + (filtered.length === 1 ? "" : "s") + " \u2014 " + (labelMap[filter] || "All Elections");
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    const select = document.getElementById("election-type-filter");

    fetch(CSV_URL)
      .then(function (res) {
        if (!res.ok) throw new Error("Failed to load endorsements.csv (" + res.status + ")");
        return res.text();
      })
      .then(function (text) {
        candidates = parseCSV(text).filter(function (c) { return c.name; });
        render(select ? select.value : "all");
      })
      .catch(function (err) {
        console.error("Endorsements load error:", err);
        const grid = document.getElementById("endorsements-grid");
        if (grid) {
          grid.innerHTML = '<p class="endorsements-error">We couldn\u2019t load our endorsements right now. Please try again later.</p>';
        }
      });

    if (select) {
      select.addEventListener("change", function () {
        render(select.value);
      });
    }
  });

})();
