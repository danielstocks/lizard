# Backlog

## Next
- Feature: Multiplayer

## In Progress
- Feature: Play game in Web UI (single player)

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

## Roadmap 
- Feature: Implement proper Prison Rules
- Feature: Randomize dealer offset at start of game
- Feature: Dealer choses trump card if trump card is LIZARD
- Feature: Make a bot that can actually play :D (Not just random)
- Feature: Scoresheet (both for CLI and web UI)
- Feature: Persist games in SQLite
- Chore: // @ts-check all the things!
- Bug: I don't have to play Snake here
    On the table: [ 'S14', 'C8' ]
    Your hand: [ 'SNAKE', 'D6' ]
    What card do you want to play?
    => D6
    invalid play: D6
