import { User, NewUser, UserUpdate, UserType } from '../users';

describe('User Schema Types', () => {
  it('should define UserType enum', () => {
    const registeredType: UserType = 'registered';
    const guestType: UserType = 'guest';

    expect(registeredType).toBe('registered');
    expect(guestType).toBe('guest');
  });

  it('should allow creating NewUser object', () => {
    const newUser: NewUser = {
      type: 'guest',
      displayName: 'Guest User',
      avatarCustomization: {
        modelUrl: '/models/avatar.glb',
        colors: {
          primary: '#ff0000',
        },
      },
      updatedAt: new Date(),
    };

    expect(newUser.type).toBe('guest');
    expect(newUser.displayName).toBe('Guest User');
  });

  it('should allow creating UserUpdate object', () => {
    const update: UserUpdate = {
      displayName: 'Updated Name',
      updatedAt: new Date(),
    };

    expect(update.displayName).toBe('Updated Name');
  });

  it('should support avatar customization', () => {
    const user: Partial<User> = {
      avatarCustomization: {
        modelUrl: '/models/character.glb',
        colors: {
          primary: '#ff0000',
          secondary: '#00ff00',
        },
        accessories: ['hat', 'glasses'],
      },
    };

    expect(user.avatarCustomization?.colors?.primary).toBe('#ff0000');
    expect(user.avatarCustomization?.accessories).toHaveLength(2);
  });
});
