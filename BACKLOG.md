# Project Backlog


## Task: Game Lobby

Allow for a user to create a new "game".
- Creates a shareable (public) URL to allow players to connect.
- Up to 5 players can connect, if game is full show message: "lobby is full".
- Create a chat/game log: Show events when players enter/exit room.
- Allow users to type messages to each other.


## Task: Start Game
- Allow host to "start game" if there at least 3 players in lobby.
- Implement Naive MVP game:
-- Deal 1 card to each user
-- Highest card wins
-- Repeat 5 times.
- If a user leaves the game, the game is forfeit.
- End game after 5 rounds, announce winner.
