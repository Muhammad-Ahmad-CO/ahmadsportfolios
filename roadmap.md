# Mascot integration
- [x] Install and verify documented avatar API and save supplied definition.
- [x] Add persistent, click-through mascot with wake/idle/sleep and visibility pause.
- [x] Connect existing form validation and successful submission reactions.
- [x] Verify desktop/mobile rendering and lifecycle behavior.

The supplied animation set uses waking and confused (with a subtle shake) for wake-up and validation errors. Cursor-follow is omitted because the documented component API does not expose head tracking. Browser checks passed for both sizes, sleep/wake, validation, celebration events and visibility pause; no runtime errors were observed.