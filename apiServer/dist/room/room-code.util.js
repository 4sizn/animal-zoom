"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRoomCode = generateRoomCode;
exports.isValidRoomCode = isValidRoomCode;
function generateRoomCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}
function isValidRoomCode(code) {
    return /^[A-Z0-9]{6}$/.test(code);
}
//# sourceMappingURL=room-code.util.js.map