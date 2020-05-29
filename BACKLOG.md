# Project Backlog

Ongoing tasks highlighted *in bold*

## Known Bugs
N/A


## Epic: Game UX/UI
- Animate cards being played (fly-in)
- Animate trick won (fly out cards to winner)
- Add sound effects (shuffle, deal, play card)
- Assign a color to each player: eg pink, yellow, red, green


## Epic: Core Game
- Implement "Secret State" - player hands.
- Deal with lizard as trump card => Draw another card.
- Deal with snake as trump card => No trum card
- Q: if lizard is played first, does the second card dictate forced suit?


## Epic: Game Lobby
Allow for a user to create a new "game".
- Creates a shareable (public) URL to allow players to connect to lobby.
- Up to 6 players can connect, if game is full show message: "lobby is full".
- Create a chat/game log: Show events when players enter/exit room.
- Allow users to type messages to each other, use player color to highlight messages.
- Allow host to "start game" if there at least 3 players in lobby.


## Epic: Refactoring
- Update boardgame and replace home-grown shuffle
- Consider TypeScript