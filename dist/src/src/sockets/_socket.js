"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class TheSocket {
    constructor(server) {
        this.server = server;
    }
    handleConnection(socket, routeName) {
        throw new Error("Method not implemented.");
    }
    middlewareImplementation(next) {
        throw new Error("Method not implemented.");
    }
    getJson(input) {
        return JSON.parse(input);
    }
    sendJson(input) {
        return JSON.stringify(input);
    }
}
exports.default = TheSocket;
//# sourceMappingURL=_socket.js.map