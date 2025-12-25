import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { INestApplicationContext } from '@nestjs/common';
export declare class WsJwtAdapter extends IoAdapter {
    private app;
    private jwtService;
    constructor(app: INestApplicationContext);
    createIOServer(port: number, options?: ServerOptions): any;
}
