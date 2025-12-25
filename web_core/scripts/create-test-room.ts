/**
 * Create Test Room Script
 * Utility script to create a test room via API
 */

// Mock import.meta.env for Node/Bun environment
if (typeof (globalThis as any).import === 'undefined') {
  (globalThis as any).import = { meta: { env: {} } };
}

import.meta.env = {
  VITE_API_URL: process.env.VITE_API_URL || 'http://localhost:3000',
  VITE_WS_URL: process.env.VITE_WS_URL || 'http://localhost:3001',
  VITE_API_PREFIX: '',
  VITE_APP_NAME: 'Animal Zoom',
  VITE_APP_VERSION: '1.0.0',
  VITE_DEBUG: 'true',
  VITE_LOG_LEVEL: 'debug' as any,
  VITE_ENABLE_INSPECTOR: 'false',
  VITE_ENABLE_CONSOLE_LOGS: 'true',
};

// Mock localStorage for Node/Bun
if (typeof localStorage === 'undefined') {
  const storage = new Map<string, string>();
  (globalThis as any).localStorage = {
    getItem: (key: string) => storage.get(key) || null,
    setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => storage.delete(key),
    clear: () => storage.clear(),
  };
}

import { authApi, roomsApi } from '../src/api';

async function createTestRoom() {
  try {
    console.log('Creating test room...');

    // First, authenticate as a guest
    console.log('1. Authenticating as guest...');
    const authResponse = await authApi.createGuest({
      displayName: 'Room Creator',
    });
    console.log('   ✅ Authenticated as:', authResponse.user.displayName);

    // Now create the room
    console.log('2. Creating room...');
    const room = await roomsApi.createRoom({
      name: 'Test Room',
      maxParticipants: 10,
    });

    console.log('\n✅ Room created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Room Code:', room.code);
    console.log('Room ID:', room.id);
    console.log('Room Name:', room.name);
    console.log('Max Participants:', room.maxParticipants);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n📋 Use this room code to join:');
    console.log(`   ${room.code}`);
    console.log('\n');

    return room;
  } catch (error: any) {
    console.error('❌ Failed to create room:', error.message);

    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }

    throw error;
  }
}

// Run if executed directly
if (import.meta.main) {
  createTestRoom()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { createTestRoom };
