# ShowCast

Control ShowCast presentation software via TCP.

## Setup

1. In ShowCast, go to **Edit → Network Settings** and enable the TCP server (default port 5100).
2. In Companion, add a **ShowCast** connection and enter the host, port, and password (leave password blank if none is set).

## Actions

| Action | Description |
|--------|-------------|
| Go Live & Advance | Go live with the current page and advance the rundown |
| Page Back | Step back one page |
| Clear Live | Clear the live output |
| Go Live: Specific Page | Go live with a specific page by UUID |
| Rundown: Next | Advance the rundown cursor |
| Rundown: Go To Index | Jump to a specific rundown index (0-based) |
| Audio: Play Playlist | Start a specific playlist |
| Audio: Stop All | Stop all audio playback |
| Scheduler: Start | Start the scheduler |
| Scheduler: Stop | Stop the scheduler |
| Output: Blank | Blank a specific output |
| Output: Unblank | Unblank a specific output |
| Refresh State | Request a fresh state push from ShowCast |

## Feedbacks

| Feedback | Condition |
|----------|-----------|
| Page Is Live | A page is currently live |
| Audio Playing | Audio is currently playing |
| Scheduler Running | The scheduler is active |
| Output Blanked | A specific output is blanked |

## Variables

| Variable | Description |
|----------|-------------|
| `$(showcast:live_page_name)` | Name of the current live page |
| `$(showcast:live_page_id)` | UUID of the current live page |
| `$(showcast:rundown_position)` | Current rundown position (1-based) |
| `$(showcast:rundown_total)` | Total rundown items |
| `$(showcast:rundown_current_name)` | Name of the current rundown item |
| `$(showcast:audio_track_name)` | Currently playing track name |
| `$(showcast:audio_playing)` | Whether audio is playing (true/false) |
| `$(showcast:scheduler_running)` | Whether the scheduler is active (true/false) |
