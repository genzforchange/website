---
name: script.js top-level fragility
description: Why page-specific JS lives in separate files instead of being appended to script.js
---
The shared `script.js` throws an uncaught top-level error in some browsers (`$(...).on(...) is not a function` near the mobile-menu handler), which kills any code appended after it in the same file.

**Why:** Code appended to the end of script.js silently never ran on the endorsements page; the fix was moving it to its own file (`wdm-endorsements.js`) loaded after script.js.

**How to apply:** Put new page logic in a separate script file referenced from the page's HTML rather than appending to script.js; also note the site is fully static (python http.server), so data loads use fetch of repo CSV/JSON files.
