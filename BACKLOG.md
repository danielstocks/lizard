# Project Backlog


## Known Bugs
No regressions or bugs currently identified.


## Task: Game UX/UI
- Elevate playable card on hover
- After trick completed:
  - Elevate and zoom winning card
  - Dim losing cards
  - Pause for 3 seconds before starting next trick.
- Render opponents around the table (& highlight current turn)
- Animate cards being played (fly-in)
- Animate trick won (fly out cards to winner)


## Task: Core Game
- Write tests: prison rules.
- Implement "Secret State" - player hands.
- Deal with lizard as trump card
- Deal with snake as trump card
- Q: if lizard is played first, does the second card dictate forced suit?


## Task: Game Lobby
Allow for a user to create a new "game".
- Creates a shareable (public) URL to allow players to connect.
- Up to 6 players can connect, if game is full show message: "lobby is full".
- Create a chat/game log: Show events when players enter/exit room.
- Allow users to type messages to each other.
- Allow host to "start game" if there at least 3 players in lobby.


## Task: Refactoring
- Refactor game.js - extract pure functions to core.
- Update boardgame and replace home-grown shuffle
- Consider TypeScript