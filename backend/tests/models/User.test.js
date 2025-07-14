const User = require('../../models/User');
const bcrypt = require('bcrypt');

describe('User Model', () => {
  describe('User Creation', () => {
    test('should create a new user with valid data', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.username).toBe(userData.username);
      expect(savedUser.email).toBe(userData.email);
      expect(savedUser.password).not.toBe(userData.password); // Should be hashed
      expect(savedUser.twoFactorSecret).toBeUndefined();
      expect(savedUser.twoFactorEnabled).toBe(false);
      expect(savedUser.backupCodes).toEqual([]);
    });

    test('should not create user with duplicate email', async () => {
      const userData = {
        username: 'testuser1',
        email: 'test@example.com',
        password: 'password123'
      };

      await new User(userData).save();

      const duplicateUser = new User({
        username: 'testuser2',
        email: 'test@example.com',
        password: 'password456'
      });

      await expect(duplicateUser.save()).rejects.toThrow();
    });

    test('should require all mandatory fields', async () => {
      const user = new User({});
      
      await expect(user.save()).rejects.toThrow();
    });

    test('should validate email format', async () => {
      const userData = {
        username: 'testuser',
        email: 'invalid-email',
        password: 'password123'
      };

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow();
    });
  });

  describe('Password Management', () => {
    test('should hash password before saving', async () => {
      const plainPassword = 'password123';
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: plainPassword
      };

      const user = new User(userData);
      await user.save();

      expect(user.password).not.toBe(plainPassword);
      expect(await bcrypt.compare(plainPassword, user.password)).toBe(true);
    });

    test('should not hash password if not modified', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      const user = new User(userData);
      await user.save();
      
      const originalPassword = user.password;
      user.username = 'newusername';
      await user.save();

      expect(user.password).toBe(originalPassword);
    });
  });

  describe('Two-Factor Authentication', () => {
    test('should enable 2FA with secret and backup codes', async () => {
      const user = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });
      await user.save();

      user.twoFactorSecret = 'secret123';
      user.twoFactorEnabled = true;
      user.backupCodes = ['code1', 'code2', 'code3'];
      await user.save();

      expect(user.twoFactorEnabled).toBe(true);
      expect(user.twoFactorSecret).toBe('secret123');
      expect(user.backupCodes).toHaveLength(3);
    });

    test('should disable 2FA and clear related data', async () => {
      const user = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        twoFactorSecret: 'secret123',
        twoFactorEnabled: true,
        backupCodes: ['code1', 'code2']
      });
      await user.save();

      user.twoFactorEnabled = false;
      user.twoFactorSecret = undefined;
      user.backupCodes = [];
      await user.save();

      expect(user.twoFactorEnabled).toBe(false);
      expect(user.twoFactorSecret).toBeUndefined();
      expect(user.backupCodes).toEqual([]);
    });
  });
});
