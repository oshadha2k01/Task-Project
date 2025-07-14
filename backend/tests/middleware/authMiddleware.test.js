const authMiddleware = require('../../middleware/authMiddleware');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');

describe('Auth Middleware', () => {
  let testUser;
  let req, res, next;

  beforeEach(async () => {
    testUser = new User({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    });
    await testUser.save();

    req = {
      headers: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  test('should authenticate user with valid token', async () => {
    const token = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET || 'testsecret');
    req.headers.authorization = token;

    await authMiddleware(req, res, next);

    expect(req.user).toBeDefined();
    expect(req.user._id.toString()).toBe(testUser._id.toString());
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test('should reject request without token', async () => {
    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'No token provided' });
    expect(next).not.toHaveBeenCalled();
  });

  test('should reject request with invalid token', async () => {
    req.headers.authorization = 'invalid-token';

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
    expect(next).not.toHaveBeenCalled();
  });

  test('should reject request with token for non-existent user', async () => {
    const fakeUserId = '507f1f77bcf86cd799439011';
    const token = jwt.sign({ id: fakeUserId }, process.env.JWT_SECRET || 'testsecret');
    req.headers.authorization = token;

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    expect(next).not.toHaveBeenCalled();
  });

  test('should handle expired token', async () => {
    const expiredToken = jwt.sign(
      { id: testUser._id, exp: Math.floor(Date.now() / 1000) - 60 }, // Expired 1 minute ago
      process.env.JWT_SECRET || 'testsecret'
    );
    req.headers.authorization = expiredToken;

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
    expect(next).not.toHaveBeenCalled();
  });

  test('should handle malformed token', async () => {
    req.headers.authorization = 'Bearer malformed.token.here';

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
    expect(next).not.toHaveBeenCalled();
  });
});
