import { IoAdapter } from '@nestjs/platform-socket.io';
import { JwtService } from '@nestjs/jwt';
export class WsJwtAdapter extends IoAdapter {
    app;
    jwtService;
    constructor(app) {
        super(app);
        this.app = app;
        this.jwtService = app.get(JwtService);
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
//# sourceMappingURL=ws-jwt.adapter.js.map