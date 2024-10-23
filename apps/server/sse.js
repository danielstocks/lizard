// @ts-check

// clientManager.js
const clients = [];

// Function to add a new client (connection)
export function addClient(client) {
  clients.push(client);
}

// Function to remove a client (connection)
export function removeClient(client) {
  const index = clients.indexOf(client);
  if (index !== -1) {
    clients.splice(index, 1);
  }
}

/**
 * @typedef {Object} BroadcastMessage
 * @property {string} type - Indicates the type of message
 * @property {object} payload - The message payload
 *
 * Function to broadcast data to all connected clients
 * @param {BroadcastMessage} data
 */
export function broadcast(data) {
  clients.forEach((client) => {
    client.write(`data: ${JSON.stringify(data)}\n\n`);
  });
}
