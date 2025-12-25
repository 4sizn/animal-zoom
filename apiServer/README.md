# Animal Zoom API Server

Video conferencing API server for Animal Zoom application. Built with NestJS, TypeScript, PostgreSQL, and WebSocket support.

## 🚀 Features

- 🔐 **Authentication**: JWT + Guest user support
- 🏠 **Room Management**: Create, join, and manage video conference rooms
- 💬 **Real-time Communication**: WebSocket-based chat and state synchronization
- 🎨 **Customization**: Avatar and room appearance customization
- 📦 **Resource Management**: GLB model file management with S3 integration
- 📚 **API Documentation**: Interactive Swagger UI
- ✅ **Testing**: 78 unit tests with high coverage

## 📋 Quick Start

### Prerequisites

- Node.js 18+ or Bun 1.0+
- PostgreSQL 14+
- AWS S3 bucket (optional, for resource management)

### Installation

```bash
# Install dependencies
bun install

# Setup environment variables
cp .env.example .env
```

### Environment Configuration

Create `.env` file:

```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=password
DATABASE_NAME=animal_zoom

# JWT
JWT_SECRET=your-super-secret-key-change-this-in-production
JWT_EXPIRES_IN=24h

# Server
PORT=3000

# AWS S3 (optional)
AWS_REGION=us-east-1
AWS_BUCKET_NAME=your-bucket
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
```

### Running

```bash
# Development
bun run start:dev

# Production
bun run build
bun run start:prod
```

**Access Points:**
- API: http://localhost:3000
- Swagger UI: http://localhost:3000/api
- Health Check: http://localhost:3000/health

## 📚 API Documentation

Interactive API documentation available at http://localhost:3000/api

### Authentication Endpoints

#### Register
```http
POST /auth/register
Content-Type: application/json

{
  "username": "user123",
  "email": "user@example.com",
  "password": "password123",
  "displayName": "John Doe"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Create Guest
```http
POST /auth/guest
Content-Type: application/json

{
  "displayName": "Guest User"
}
```

### Room Management

#### Create Room
```http
POST /rooms
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "My Room",
  "maxParticipants": 50
}
```

#### Join Room
```http
POST /rooms/{roomCode}/join
Authorization: Bearer {token}
```

### WebSocket Events

Connect with JWT token:

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  auth: { token: 'your-jwt-token' }
});

// Join room
socket.emit('room:join', { roomCode: 'ABC123' });

// Listen for events
socket.on('room:joined', (data) => console.log(data));
socket.on('chat:message', (data) => console.log(data));
socket.on('state:update', (data) => console.log(data));

// Send chat message
socket.emit('chat:message', {
  roomCode: 'ABC123',
  message: 'Hello!'
});

// Sync avatar state
socket.emit('state:sync', {
  roomCode: 'ABC123',
  position: { x: 0, y: 0, z: 0 },
  rotation: { x: 0, y: 0, z: 0 }
});
```

## 🧪 Testing

```bash
# Run all tests (78 tests)
bun test

# Run with coverage
bun test --coverage

# Run linting
bun run lint
```

## 🏗️ Project Structure

```
apiServer/
├── src/
│   ├── auth/              # JWT + Guest authentication
│   ├── room/              # Room CRUD operations
│   ├── gateway/           # WebSocket gateway
│   ├── avatar/            # Avatar customization
│   ├── room-config/       # Room appearance config
│   ├── resource/          # S3 resource management
│   ├── database/          # Kysely database module
│   └── main.ts            # Application bootstrap
├── test/                  # E2E tests
└── docs/                  # Documentation
```

## 💾 Database Schema

### Tables

- **users**: User accounts (registered + guest)
- **rooms**: Video conference rooms
- **room_participants**: User-room relationships

### Key Fields

**Users Table:**
- `id`, `type` (registered/guest), `username`, `email`
- `avatarCustomization` (JSONB): model, colors, accessories

**Rooms Table:**
- `id`, `code` (6-char unique), `name`, `status`
- `customization` (JSONB): lighting, colors, furniture

## 🔒 Security

- ✅ JWT authentication with configurable expiry
- ✅ bcrypt password hashing (10 salt rounds)
- ✅ Input validation with class-validator
- ✅ SQL injection prevention (Kysely)
- ✅ File upload validation (GLB only, 50MB max)
- ✅ S3 presigned URLs (1-hour expiry)
- ✅ CORS enabled

## 📊 Performance

- Response time: p95 < 200ms
- Concurrent users: 50 per room tested
- Database: Connection pooling
- WebSocket: Sticky sessions ready

## 🐳 Docker Deployment

```dockerfile
FROM oven/bun:1
WORKDIR /app

COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

EXPOSE 3000
CMD ["bun", "run", "start:prod"]
```

## 🛠️ Development

```bash
# Create migration
bun run migration:create

# Run migrations
bun run migration:run

# Format code
bun run format

# Lint
bun run lint
```

## 📝 API Modules

| Module | Endpoints | Features |
|--------|-----------|----------|
| **Auth** | `/auth/*` | Register, Login, Guest, JWT |
| **Rooms** | `/rooms/*` | CRUD, Join/Leave, Participants |
| **Avatars** | `/avatars/*` | Get/Update customization |
| **Room Configs** | `/room-configs/*` | Lighting, Colors, Furniture |
| **Resources** | `/resources/*` | S3 upload, List, Delete GLB |

## 🌐 WebSocket Events

### Client → Server
- `room:join` - Join a room
- `room:leave` - Leave a room
- `chat:message` - Send chat message
- `state:sync` - Sync avatar state
- `room:getParticipants` - Get participant list

### Server → Client
- `connected` - Connection established
- `room:joined` - Joined room successfully
- `user:joined` - Another user joined
- `user:left` - User left room
- `chat:message` - Chat message received
- `state:update` - Avatar state updated
- `avatar:updated` - Avatar customization changed
- `room:updated` - Room config changed

## 🚨 Troubleshooting

### Database connection error
```bash
# Verify PostgreSQL is running
pg_isready

# Check DATABASE_HOST and credentials in .env
```

### WebSocket not connecting
```bash
# Verify JWT token is valid
# Check CORS settings in main.ts
# Ensure port 3000 is accessible
```

### S3 upload failing
```bash
# Verify AWS credentials in .env
# Check bucket exists and region is correct
# Verify IAM permissions for S3
```

## 📄 License

MIT

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open pull request

---

**Built with NestJS 11.x + TypeScript + Kysely + Socket.io**
