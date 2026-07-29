---
name: aspect-ratio cards vs intrinsic image size
description: Why fixed-aspect flex cards grew unevenly and how to keep photos from inflating them
---
Rule: in a fixed `aspect-ratio` flex-column card, the photo area must use `flex: 1 1 0; min-height: 0;` and the `<img>` should be absolutely positioned inside a relative wrapper.

**Why:** with `flex-basis: auto`, the img's intrinsic dimensions set the photo's content size; tall/square source images then push the card past its aspect-ratio height, making one card taller than its row neighbors (seen on the endorsements grid).

**How to apply:** whenever adding image areas to uniform card grids, zero out the flex-basis and take the image out of flow so remote image dimensions can never affect layout.
