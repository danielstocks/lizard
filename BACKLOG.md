# Backlog


## Next
- Feature: Basic Multiplayer
  - Todo: Game Lobby


## In Progress
- Feature: Play single player game in Web UI
  - Tood: Make sure CLI game and tests work
  - Todo: Basic scoresheet
  - Done: Suite rendering (black+red) in game log: structured data
  - Done: Fix mutating state bug
  - Done: Simulate bot "thinking" time (5-10s?)
  - Done: Use SSE to subscribe to game state updates
  - Done: Print trick winners in game log
  - Done: Use core game logic to highlight playable cards
  - Done: Render K + Q + J + A cards
  - Done: Fix failing tests
  - Done: Game Log
  - Done: Baic Error handling from API
  - Done: Setup Vite + Preact Boilerplate


## Roadmap 
- Feature: Implement "prison rules"
- Feature: Randomize dealer offset at start of game
- Feature: Dealer choses trump card if trump card is LIZARD
- Feature: Make a bot that can actually play :D (Not just random)
- Feature: Multiplayer chat
- Chore: More efficient & atomic SSE updates
- Chore: Refactor CSS and use CSS Hooks.
- Feature: Persist games in DB (SQLite)
- Bug: Forced to play snake when i can play any card
    On the table: [ 'S14', 'C8' ]
    Your hand: [ 'SNAKE', 'D6' ]
    What card do you want to play?
    => D6
    invalid play: D6
- Bug: DA card lost to D8 card
- Feature: Deploy to public production environment


## Done
- Feature: Play game via HTTP (single player)
- Feature: Game Server App (stateless, in memory-store)
- Bug: Added unique ids for Snake (SNAKE) cards, not be confused with Spades (S)
- Feature: Rotate dealer every new round
- Bug: Last round there is no trump card (deck is empty)
- Feature: Calculate scores and declare winner
- Chore: Refactor and write unit tests for core game logic
- Feature: Play against bot player(s)
- Feature: Play entire game of multiple rounds in CLI (stateful)
- Feature: Play single round in CLI (stateful)
- Feature: Core Game Logic
