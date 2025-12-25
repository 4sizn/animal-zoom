"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WsJwtAdapter = void 0;
const platform_socket_io_1 = require("@nestjs/platform-socket.io");
const jwt_1 = require("@nestjs/jwt");
class WsJwtAdapter extends platform_socket_io_1.IoAdapter {
    app;
    jwtService;
    constructor(app) {
        super(app);
        this.app = app;
        this.jwtService = app.get(jwt_1.JwtService);
    }
    createIOServer(port, options) {
        const server = super.createIOServer(port, {
            ...options,
            cors: {
                origin: '*',
                credentials: true,
            },
        });
        server.use((socket, next) => {
            try {
                const token = socket.handshake.auth.token ||
                    socket.handshake.headers.authorization?.replace('Bearer ', '');
                if (!token) {
                    return next(new Error('Authentication token missing'));
                }
                const payload = this.jwtService.verify(token);
                socket.data.user = payload;
                next();
            }
            catch (error) {
                next(new Error('Authentication failed'));
            }
        });
        return server;
    }
}
exports.WsJwtAdapter = WsJwtAdapter;
//# sourceMappingURL=ws-jwt.adapter.js.map