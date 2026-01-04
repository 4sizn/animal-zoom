/**
 * Artillery Load Test Helper Functions
 *
 * This file provides custom functions used in the load test scenarios.
 */

// Store room codes created during the test
const roomCodes = [];

/**
 * Generate a random 6-character hex string (like room codes)
 */
function randomString() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

/**
 * Generate a random hex color (6 hex digits)
 */
function randomHexColor() {
  return Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
}

/**
 * Get a random room code from the pool
 * If no rooms exist, generate a fake one (will cause 404, which is acceptable)
 */
function getRandomRoomCode(context, events, done) {
  if (roomCodes.length > 0) {
    const randomIndex = Math.floor(Math.random() * roomCodes.length);
    context.vars.roomCode = roomCodes[randomIndex];
  } else {
    // No rooms available, set a fake code
    context.vars.roomCode = 'FAKE01';
  }
  return done();
}

/**
 * Store room code in the shared pool
 */
function storeRoomCode(context, events, done) {
  if (context.vars.roomCode && !roomCodes.includes(context.vars.roomCode)) {
    roomCodes.push(context.vars.roomCode);

    // Limit pool size to prevent memory issues
    if (roomCodes.length > 100) {
      roomCodes.shift();
    }
  }
  return done();
}

/**
 * Custom template function: Generate random string
 */
function $randomString() {
  return randomString();
}

/**
 * Custom template function: Generate random hex color
 */
function $randomHexColor() {
  return randomHexColor();
}

// Export functions for Artillery
module.exports = {
  randomString,
  randomHexColor,
  getRandomRoomCode,
  storeRoomCode,
  $randomString,
  $randomHexColor,
};
