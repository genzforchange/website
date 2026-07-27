// ===================== WE DEMAND MORE — ENDORSEMENTS PAGE =====================

(function () {
  var grid = document.getElementById("wdm-grid");
  if (!grid) return; // only run on the endorsements page

  var emptyMsg = document.getElementById("wdm-empty");
  var resultsLabel = document.getElementById("wdm-results-label");
  var candidates = [];
  var currentFilter = "all";

  // scroll-to-candidates button
  var viewBtn = document.getElementById("wdm-view-candidates");
  if (viewBtn) {
    viewBtn.addEventListener("click", function () {
      var target = document.getElementById("candidates");
      if (target) target.scrollIntoView({ behavior: "smooth" });
    });
  }

  // --- minimal quote-aware CSV parser ---
  function parseCSV(text) {
    var rows = [];
    var row = [];
    var field = "";
    var inQuotes = false;
    for (var i = 0; i < text.length; i++) {
      var c = text[i];
      if (inQuotes) {
        if (c === '"') {
          if (text[i + 1] === '"') {
            field += '"';
            i++;
          } else {
            inQuotes = false;
          }
        } else {
          field += c;
        }
      } else if (c === '"') {
        inQuotes = true;
      } else if (c === ",") {
        row.push(field);
        field = "";
      } else if (c === "\n" || c === "\r") {
        if (c === "\r" && text[i + 1] === "\n") i++;
        row.push(field);
        field = "";
        if (row.length > 1 || row[0] !== "") rows.push(row);
        row = [];
      } else {
        field += c;
      }
    }
    if (field !== "" || row.length) {
      row.push(field);
      if (row.length > 1 || row[0] !== "") rows.push(row);
    }
    return rows;
  }

  function escapeHTML(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function lastName(name) {
    var parts = name.trim().split(/\s+/);
    return (parts[parts.length - 1] || "").toLowerCase();
  }

  // "MM/DD/YYYY" -> Date (local midnight); null when invalid
  function parseDate(str) {
    var m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec((str || "").trim());
    if (!m) return null;
    return new Date(+m[3], +m[1] - 1, +m[2]);
  }

  var FB_SVG =
    '<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="#4065AF" d="M512 256C512 114.6 397.4 0 256 0S0 114.6 0 256c0 127.8 93.6 233.7 216 252.9V330h-65v-74h65v-56.4c0-64.2 38.2-99.6 96.7-99.6 28 0 57.3 5 57.3 5v63h-32.3c-31.8 0-41.7 19.7-41.7 40V256h71l-11.4 74H296v178.9C418.4 489.7 512 383.8 512 256z"/></svg>';

  var STAR_PLACEHOLDERS = [
    "star1.svg",
    "star2.svg",
    "star3.svg",
    "star4.svg",
    "star5.svg",
    "star6.svg",
    "star7.svg",
    "star8.svg",
    "star9.svg",
    "star10.svg",
  ];

  function cardHTML(c, index) {
    var html =
      '<article class="wdm-card" data-level="' + escapeHTML(c.level) + '">';

    if (c.won) {
      html +=
        '<div class="wdm-winner-badge"><div class="star-bg"></div><span>WON!</span></div>';
    }

    html += '<div class="wdm-card-photo">';
    if (c.headshot) {
      html +=
        '<img src="' +
        escapeHTML(c.headshot) +
        '" alt="' +
        escapeHTML(c.name) +
        ' headshot" onerror="this.onerror=null;this.src=\'assets/placeholder.png\';" />';
    } else {
      var star =
        "assets/We Demand More/Stars/" +
        STAR_PLACEHOLDERS[index % STAR_PLACEHOLDERS.length];
      html +=
        '<span class="wdm-art" style="-webkit-mask-image:url(\'' +
        star +
        "');mask-image:url('" +
        star +
        "')\"></span>";
    }
    html += "</div>";

    html += '<div class="wdm-card-body">';
    html += '<div class="wdm-card-name">' + escapeHTML(c.name) + "</div>";
    html += '<div class="wdm-card-office">' + escapeHTML(c.office) + "</div>";
    html +=
      '<div class="wdm-card-district">' + escapeHTML(c.district) + "</div>";

    html += '<div class="wdm-card-links">';
    if (c.website) {
      html +=
        '<a class="wdm-website-btn" href="' +
        escapeHTML(c.website) +
        '" target="_blank" rel="noopener noreferrer">Website <span class="arrow">&rarr;</span></a>';
    }
    if (c.facebook) {
      html +=
        '<a class="wdm-social-icon" href="' +
        escapeHTML(c.facebook) +
        '" target="_blank" rel="noopener noreferrer" aria-label="' +
        escapeHTML(c.name) +
        ' on Facebook">' +
        FB_SVG +
        "</a>";
    }
    if (c.instagram) {
      html +=
        '<a class="wdm-social-icon" href="' +
        escapeHTML(c.instagram) +
        '" target="_blank" rel="noopener noreferrer" aria-label="' +
        escapeHTML(c.name) +
        ' on Instagram"><img src="assets/social-icons/instagram-blue.svg" alt="Instagram" /></a>';
    }
    if (c.tiktok) {
      html +=
        '<a class="wdm-social-icon" href="' +
        escapeHTML(c.tiktok) +
        '" target="_blank" rel="noopener noreferrer" aria-label="' +
        escapeHTML(c.name) +
        ' on TikTok"><img src="assets/social-icons/tiktok-blue.svg" alt="TikTok" /></a>';
    }
    html += "</div>"; // .wdm-card-links
    html += "</div>"; // .wdm-card-body

    if (c.showVoteBar) {
      html +=
        '<div class="wdm-primary-bar">Vote by: ' +
        escapeHTML(c.primaryDateRaw) +
        "</div>";
    }

    html += "</article>";
    return html;
  }

  function render() {
    var visible = candidates.filter(function (c) {
      return currentFilter === "all" || c.level === currentFilter;
    });

    grid.innerHTML = visible
      .map(function (c, i) {
        return cardHTML(c, i);
      })
      .join("");

    if (emptyMsg) emptyMsg.hidden = visible.length > 0;
    if (resultsLabel) {
      resultsLabel.textContent =
        visible.length + " candidate" + (visible.length === 1 ? "" : "s");
    }
  }

  // filter pills
  document.querySelectorAll(".wdm-filter-pill").forEach(function (pill) {
    pill.addEventListener("click", function () {
      document.querySelectorAll(".wdm-filter-pill").forEach(function (p) {
        p.classList.remove("active");
      });
      pill.classList.add("active");
      currentFilter = pill.dataset.filter;
      render();
    });
  });

  fetch("wedemandmore.csv")
    .then(function (r) {
      if (!r.ok)
        throw new Error("Failed to load wedemandmore.csv: " + r.status);
      return r.text();
    })
    .then(function (text) {
      var rows = parseCSV(text);
      var today = new Date();
      today.setHours(0, 0, 0, 0);

      candidates = rows
        .slice(1) // skip header
        .filter(function (r) {
          return (r[0] || "").trim() !== "";
        })
        .map(function (r) {
          var won = (r[4] || "").trim().toUpperCase() === "TRUE";
          var primaryDateRaw = (r[5] || "").trim();
          var primaryDate = parseDate(primaryDateRaw);
          return {
            name: (r[0] || "").trim(),
            district: (r[1] || "").trim(),
            office: (r[2] || "").trim(),
            level: (r[3] || "").trim().toLowerCase(),
            won: won,
            primaryDateRaw: primaryDateRaw,
            showVoteBar: !won && primaryDate !== null && primaryDate > today,
            website: (r[6] || "").trim(),
            facebook: (r[7] || "").trim(),
            instagram: (r[8] || "").trim(),
            tiktok: (r[10] || "").trim(),
            headshot: (r[11] || "").trim(),
          };
        })
        .sort(function (a, b) {
          return (
            lastName(a.name).localeCompare(lastName(b.name)) ||
            a.name.localeCompare(b.name)
          );
        });

      render();
    })
    .catch(function (err) {
      console.error("Endorsements CSV error:", err);
      if (emptyMsg) {
        emptyMsg.hidden = false;
        emptyMsg.textContent =
          "We couldn't load the candidate list. Please refresh the page or check back later.";
      }
    });
})();
