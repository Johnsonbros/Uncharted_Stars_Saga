# Audiobook Player UX Flows

## Library → Player → Resume
1. User lands on Library.
2. User selects a chapter card.
3. Player opens with chapter metadata and play button.
4. Playback starts; position updates every 10 seconds.
5. User exits player; position saved.
6. Returning to Library shows “Resume” badge.
7. Selecting chapter resumes from last saved position.

## Mini Player Behavior
- Collapsed player shows chapter title, play/pause, and progress bar.
- Tapping expands to full player view.

## Edge Cases
- If signed URL expires mid-playback, refresh token and resume at last checkpoint.
- If entitlement expires, block playback with upgrade prompt.
