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

  var GLOBE_SVG =
    '<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="#4065AF" d="M352 256c0 22.2-1.2 43.6-3.3 64H163.3c-2.2-20.4-3.3-41.8-3.3-64s1.2-43.6 3.3-64h185.3c2.2 20.4 3.3 41.8 3.3 64zm28.8-64h123.1c5.3 20.5 8.1 41.9 8.1 64s-2.8 43.5-8.1 64H380.8c2.1-20.6 3.2-42 3.2-64s-1.1-43.4-3.2-64zm112.6-32H376.7c-10-63.9-29.8-117.4-55.3-151.6 78.3 20.7 142 77.5 171.9 151.6zm-149.1 0H167.7c6.1-36.4 15.5-68.6 27-94.7 10.5-23.6 22.2-40.7 33.5-51.5C239.4 3.2 248.7 0 256 0s16.6 3.2 27.8 13.8c11.3 10.8 23 27.9 33.5 51.5 11.6 26 20.9 58.2 27 94.7zm-209 0H18.6C48.6 85.9 112.2 29.1 190.6 8.4 165.1 42.6 145.3 96.1 135.3 160zM8.1 192h123.1c-2.1 20.6-3.2 42-3.2 64s1.1 43.4 3.2 64H8.1C2.8 299.5 0 278.1 0 256s2.8-43.5 8.1-64zM194.7 446.6c-11.6-26-20.9-58.2-27-94.6h176.6c-6.1 36.4-15.5 68.6-27 94.6-10.5 23.6-22.2 40.7-33.5 51.5C272.6 508.8 263.3 512 256 512s-16.6-3.2-27.8-13.8c-11.3-10.8-23-27.9-33.5-51.5zM135.3 352c10 63.9 29.8 117.4 55.3 151.6C112.2 482.9 48.6 426.1 18.6 352h116.7zm358.1 0c-30 74.1-93.6 130.9-171.9 151.6 25.5-34.2 45.2-87.7 55.3-151.6h116.7z"/></svg>';

  var TWITTER_SVG =
    '<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="#4065AF" d="M459.4 151.7c.3 4.5.3 9.1.3 13.6 0 138.7-105.6 298.6-298.6 298.6-59.5 0-114.7-17.2-161.1-47.1 8.4 1 16.6 1.3 25.3 1.3 49.1 0 94.2-16.6 130.3-44.8-46.1-1-84.8-31.2-98.1-72.8 6.5 1 13 1.6 19.8 1.6 9.4 0 18.8-1.3 27.6-3.6-48.1-9.7-84.1-52-84.1-103v-1.3c14 7.8 30.2 12.7 47.4 13.3-28.3-18.8-46.8-51-46.8-87.4 0-19.5 5.2-37.4 14.3-53 51.7 63.7 129.3 105.3 216.4 109.8-1.6-7.8-2.6-15.9-2.6-24 0-57.8 46.8-104.9 104.9-104.9 30.2 0 57.5 12.7 76.7 33.1 23.7-4.5 46.5-13.3 66.6-25.3-7.8 24.4-24.4 44.8-46.1 57.8 21.1-2.3 41.6-8.1 60.4-16.2-14.3 20.8-32.2 39.3-52.6 54.3z"/></svg>';

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

  // Per-candidate headshot crop overrides (default is object-position: top).
  var PHOTO_POSITION_OVERRIDES = {
    "Janeese Lewis George": "center",
  };

  function cardHTML(c, index) {
    var html =
      '<article class="wdm-card" data-level="' + escapeHTML(c.level) + '">';

    // Star "WON!" badge — kept for future general-election wins.
    // if (c.won) {
    //   html +=
    //     '<div class="wdm-winner-badge"><div class="star-bg"></div><span>WON!</span></div>';
    // }

    html += '<div class="wdm-card-photo">';
    if (c.headshot) {
      var photoPos = PHOTO_POSITION_OVERRIDES[c.name];
      html +=
        '<img src="' +
        escapeHTML(c.headshot) +
        '" alt="' +
        escapeHTML(c.name) +
        ' headshot"' +
        (photoPos
          ? ' style="object-position:' + escapeHTML(photoPos) + ';"'
          : "") +
        ' onerror="this.onerror=null;this.src=\'assets/placeholder.png\';" />';
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
        '<a class="wdm-social-icon" href="' +
        escapeHTML(c.website) +
        '" target="_blank" rel="noopener noreferrer" aria-label="' +
        escapeHTML(c.name) +
        ' campaign website">' +
        GLOBE_SVG +
        "</a>";
    }
    if (c.x) {
      html +=
        '<a class="wdm-social-icon" href="' +
        escapeHTML(c.x) +
        '" target="_blank" rel="noopener noreferrer" aria-label="' +
        escapeHTML(c.name) +
        ' on X (Twitter)">' +
        TWITTER_SVG +
        "</a>";
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
        '<div class="wdm-primary-bar">Primary Election on ' +
        escapeHTML(c.primaryDateRaw) +
        "</div>";
    } else if (c.won) {
      html += '<div class="wdm-won-bar">Won Primary</div>';
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
            upcomingPrimary:
              !won && primaryDate !== null && primaryDate > today
                ? primaryDate.getTime()
                : null,
            showVoteBar: !won && primaryDate !== null && primaryDate > today,
            website: (r[6] || "").trim(),
            facebook: (r[7] || "").trim(),
            instagram: (r[8] || "").trim(),
            x: (r[9] || "").trim(),
            tiktok: (r[10] || "").trim(),
            headshot: (r[11] || "").trim(),
          };
        })
        .sort(function (a, b) {
          var aUp = a.upcomingPrimary !== null;
          var bUp = b.upcomingPrimary !== null;
          if (aUp !== bUp) return aUp ? -1 : 1;
          if (aUp && bUp && a.upcomingPrimary !== b.upcomingPrimary) {
            return a.upcomingPrimary - b.upcomingPrimary;
          }
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
