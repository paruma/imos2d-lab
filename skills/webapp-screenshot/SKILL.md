---
name: webapp-screenshot
description: Capture an actual web app difference-history screenshot with consistent one-row framing.
---

# Web App Screenshot

Use this skill when a user wants a screenshot of a web app's difference-history/result cards for documentation or comparison.

## Scope

This skill ends when the screenshot file has been captured and its path is reported. It does not upload, paste, or edit Notion or any other external document.

## Capture rules

- Use a real browser through Playwright. Do not recreate the UI with SVG, canvas, ImageMagick, or generated artwork.
- Open the exact app URL supplied by the task, including its grid and direction query parameters.
- Wait for the page to finish loading before capture.
- Capture only the difference-card list (`.stage-list`), not the surrounding section. Exclude the `DIFFERENCE HISTORY` heading, display toggles, and copy controls.
- Hide copy controls by unchecking the first checkbox in the difference-history section when it is enabled. Keep the negative-value emphasis setting unchanged unless the user requests otherwise.
- For documentation images, arrange cards in one horizontal row: force `.stage-list` to `flex-direction: row`, `flex-wrap: nowrap`, and `align-items: flex-start`.
- Use a sufficiently wide viewport so the row is genuinely horizontal. A 2400px-wide viewport is a practical default; increase it if the cards do not fit.
- Do not screenshot the full container width. Measure the union of all `.stage-card` bounding boxes and capture that rectangle with a small margin on all four sides. Use about 12 CSS pixels of padding by default.
- Because the clip can extend below the viewport, use a full-page screenshot with the measured clip rectangle.

## Reusable procedure

1. Ensure the target app is reachable. If a local dev server is needed, start it only for the capture and stop it afterward.
2. Ensure Playwright and Chromium are available in the target environment.
3. Run [`scripts/capture_difference_history.mjs`](scripts/capture_difference_history.mjs) with the exact URL and output path.
4. Inspect the resulting image when visual verification is useful. Confirm that the cards are in one row and that all four margins are small and similar.
5. Report the output path. Do not perform external uploads as part of this skill.

## Common failure modes

- A large right margin means the screenshot used `.stage-list`'s full layout width instead of the union of the cards. Recompute the bounding box and use a clipped screenshot.
- A vertical stack means the flex layout was not forced to one row or the viewport was too narrow.
- A screenshot containing the heading or toggles means the locator was too broad; target `.stage-list` and then clip to the cards.
- A hand-built image is not an acceptable substitute for a browser screenshot.
