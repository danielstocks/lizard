# Project Backlog

Ongoing tasks highlighted *in bold*


## Known Bugs
- N/A


## Epic: Game UX/UI
- *Animate trick won (fly out cards to winner)*
- Add sound effects (shuffle, deal, play card)


## Epic: Core Game
- Implement "Secret State" - player hands.
- Deal with lizard as trump card => Draw another card.
- Deal with snake as trump card => No trump card
- Q: if lizard is played first, does the second card dictate forced suit?


## Epic: Game Lobby
- Allow user to create a shareable URL to allow other players to connect to a game lobby.
- Up to 6 players can connect, if game is full show message: "lobby is full".
- Allow players to pick a name/alias + color
- Allow host to "start game" if there at least 3 players in lobby.


## Epic: Refactoring
- Update boardgame and replace home-grown shuffle
- Consider TypeScript


# Epic: Game Chat
- Allow users to chat to eachother in game
- Move Game.log from game state to chat server state.