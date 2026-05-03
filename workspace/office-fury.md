# NETWORK FIGHT CLUB - 1-Player Fighting Game

## Concept
Street Fighter-style 1-player vs CPU fighting game with slapstick office humor. Player controls a worker fighting challengers in an office setting.

## Controls
| Key | Action |
|-----|--------|
| Arrow Keys | Move left/right, duck |
| R | Jump |
| Space (tap) | Throw Dirty Phone (projectile) |
| F + Space (double-tap) | Kill Move (unlocked after 2 phone hits, cuts opponent power in half) |
| F | Two-Handed Slap (melee attack) |
| V | VRD Slow Down (opponent stunned 5 sec, easy attacks) |

## Game Rules
- **Best of 3 rounds** - first to 2 wins takes the match
- **Kill Move**: Unlocked after 2 successful phone hits. Cuts opponent power in half (their damage output reduced)
- **VRD Slow Down**: Stuns opponent for 5 seconds, allowing free hits
- Health bars for both player and CPU
- CPU difficulty scales with rounds won

## Characters
- **Player**: Office worker (slightly detailed cartoon style)
- **CPU Challenger**: Boss/manager type (progressively harder)

## Move Details
| Move | Damage | Cooldown | Notes |
|------|--------|----------|-------|
| Dirty Phone | 10% | 2 sec | Projectile, 2 hits = Kill Move ready |
| Two-Handed Slap | 15% | 1.5 sec | Melee, quick |
| VRD Slow Down | 0% | 8 sec | Stuns 5 sec, no damage |
| Kill Move | 50% | N/A | Unlocked after 2 phone hits |
| Jump | N/A | N/A | Evasion |

## Visual Style
- Cartoon office aesthetic
- Simple backgrounds (cubicle, break room, parking lot)
- Exaggerated hit reactions
- Screen shake on big hits
- Slow-mo effect on VRD ability

## Technical
- HTML5 Canvas
- Single HTML file (self-contained)
- No external dependencies

## Project
- Assign to: Deckhand
- Build as single HTML file
- Save to: ~/office-fury/index.html
