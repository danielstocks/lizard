# Backlog


## Next
- Fix Bugs
- Feature: Announce current dealer in log
- Feature: Basic Multiplayer
  - Todo: Game Lobby
  - Todo: Authentication
  - Feature: Persist games in DB (SQLite)


## In Progress
- Feature: Play single player game in Web UI
  - Todo: Make sure CLI game still works
  - Done: Fix tests
  - Done: Basic scoresheet
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
- Feature: Multiplayer chat
- Bug: Forced to play snake when i can play any card
  ```
  On the table: [ 'S14', 'C8' ]
  Your hand: [ 'SNAKE', 'D6' ]
  What card do you want to play?
  => D6
  invalid play: D6
  ```
- Bug: Wrong winner?
  ```
  Scooby Doo played ♣K
  Daniel played ♣7
  Button played ♥10
  - Trick Winner: Daniel
  ```
- Feature: Deploy to public production environment
- Feature: Make a bot that can actually play :D (Not just random)


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
