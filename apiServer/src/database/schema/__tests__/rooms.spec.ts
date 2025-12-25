import { Room, NewRoom, RoomUpdate, RoomStatus } from '../rooms';

describe('Room Schema Types', () => {
  it('should define RoomStatus enum', () => {
    const activeStatus: RoomStatus = 'active';
    const inactiveStatus: RoomStatus = 'inactive';

    expect(activeStatus).toBe('active');
    expect(inactiveStatus).toBe('inactive');
  });

  it('should allow creating NewRoom object', () => {
    const newRoom: NewRoom = {
      code: 'ABC123',
      name: 'Test Room',
      status: 'active',
      currentParticipants: 0,
      maxParticipants: 50,
      updatedAt: new Date(),
    };

    expect(newRoom.code).toBe('ABC123');
    expect(newRoom.maxParticipants).toBe(50);
  });

  it('should allow creating RoomUpdate object', () => {
    const update: RoomUpdate = {
      currentParticipants: 5,
      lastActivityAt: new Date(),
      updatedAt: new Date(),
    };

    expect(update.currentParticipants).toBe(5);
  });

  it('should support room customization', () => {
    const room: Partial<Room> = {
      customization: {
        environment: {
          wallMaterial: { color: '#ffffff' },
          floorMaterial: { color: '#cccccc' },
          furniture: [{ type: 'chair', position: [0, 0, 0] }],
        },
        lighting: {
          preset: 'bright',
        },
      },
    };

    expect(room.customization?.environment?.wallMaterial?.color).toBe(
      '#ffffff',
    );
    expect(room.customization?.lighting?.preset).toBe('bright');
  });
});
