class ConnectedPlayers {

    #mapPlayers

    constructor() {
        this.#mapPlayers = new Map();
    }

    // player is a socket
    addPlayer(player) {
        this.#mapPlayers.set(player.userId, player);
    }

    isPlayerConnected(playerId) {
        return this.#mapPlayers.has(playerId);
    }

    removePlayer(playerId) {
        this.#mapPlayers.delete(playerId);
    }

    getSocketPlayer(playerId) {
        return this.#mapPlayers.get(playerId);
    }

    sendToPlayer(playerId, event, data) {
        this.#mapPlayers.get(playerId).emit(event, data);
    }
}


export default ConnectedPlayers;
