# Learning path visual checks

Screenshots were captured from the current branch using `workspace-preview-v18.js` fixture data and Playwright. No real account was used and no answer or XP was recorded. The course data and UI came from the repository; the four answer-history states below were simulated locally.

| State | 390px mobile | 1280px desktop |
| --- | --- | --- |
| New learner | [Screenshot](new-390.png) | [Screenshot](new-1280.png) |
| In progress, saved at `u8-l2` | [Screenshot](middle-390.png) | [Screenshot](middle-1280.png) |
| Every linked question answered at least once | [Screenshot](complete-390.png) | [Screenshot](complete-1280.png) |
| Course data fails to load | [Screenshot](error-390.png) | [Screenshot](error-1280.png) |

The screenshots were inspected for clipping and overlap at both viewport widths. The mobile bottom navigation is fixed and the learning path scrolls behind it. Fixture checks also confirmed no horizontal overflow or browser script errors. Real account persistence and server history were not verified.
