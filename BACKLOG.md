# Project Backlog


## Task: Game UX/UI

- Improved card design
  - Show numbers and suit in corners.
  - Hide snake and lizard value (doesn't affect game)
- Show player 0 (you) at bottom, rest at top.
- Improve estimation phase UI
- Center play Area.
- Animate cards bein played (fly-in)

## Task: Core Game

- Deal with lizard as trump card
- Deal with snake as trump card
- Q: if lizard is played first, does the second card dictate forced suit?
- Implement Prison Rules
- Implement correct turn order (eg shift 1 pos to right efter each new round)
  - In estimation phase
  - In play phase


## Task: Game Lobby

Allow for a user to create a new "game".
- Creates a shareable (public) URL to allow players to connect.
- Up to 5 players can connect, if game is full show message: "lobby is full".
- Create a chat/game log: Show events when players enter/exit room.
- Allow users to type messages to each other.


## Task: Start Game

- Allow host to "start game" if there at least 3 players in lobby.
- If a user leaves the game, the game is forfeit.
- End game, announce winner.


## Task: Refactoring

- TypeScript
- Update boardgame and replace custom shuffle method