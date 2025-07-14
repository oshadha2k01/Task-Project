const Task = require('../../models/Task');
const User = require('../../models/User');

describe('Task Model', () => {
  let testUser;

  beforeEach(async () => {
    testUser = new User({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    });
    await testUser.save();
  });

  describe('Task Creation', () => {
    test('should create a new task with valid data', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'This is a test task',
        status: 'pending',
        priority: 'medium',
        dueDate: new Date('2025-12-31'),
        userId: testUser._id
      };

      const task = new Task(taskData);
      const savedTask = await task.save();

      expect(savedTask._id).toBeDefined();
      expect(savedTask.title).toBe(taskData.title);
      expect(savedTask.description).toBe(taskData.description);
      expect(savedTask.status).toBe(taskData.status);
      expect(savedTask.priority).toBe(taskData.priority);
      expect(savedTask.userId.toString()).toBe(testUser._id.toString());
      expect(savedTask.createdAt).toBeDefined();
      expect(savedTask.updatedAt).toBeDefined();
    });

    test('should create task with default values', async () => {
      const taskData = {
        title: 'Minimal Task',
        userId: testUser._id
      };

      const task = new Task(taskData);
      const savedTask = await task.save();

      expect(savedTask.status).toBe('pending');
      expect(savedTask.priority).toBe('medium');
      expect(savedTask.description).toBe('');
    });

    test('should require title and userId', async () => {
      const task = new Task({});
      await expect(task.save()).rejects.toThrow();
    });

    test('should validate status enum', async () => {
      const taskData = {
        title: 'Test Task',
        status: 'invalid-status',
        userId: testUser._id
      };

      const task = new Task(taskData);
      await expect(task.save()).rejects.toThrow();
    });

    test('should validate priority enum', async () => {
      const taskData = {
        title: 'Test Task',
        priority: 'invalid-priority',
        userId: testUser._id
      };

      const task = new Task(taskData);
      await expect(task.save()).rejects.toThrow();
    });
  });

  describe('Task Updates', () => {
    test('should update task status', async () => {
      const task = new Task({
        title: 'Test Task',
        status: 'pending',
        userId: testUser._id
      });
      await task.save();

      task.status = 'completed';
      const updatedTask = await task.save();

      expect(updatedTask.status).toBe('completed');
      expect(updatedTask.updatedAt.getTime()).toBeGreaterThan(updatedTask.createdAt.getTime());
    });

    test('should update task priority', async () => {
      const task = new Task({
        title: 'Test Task',
        priority: 'low',
        userId: testUser._id
      });
      await task.save();

      task.priority = 'high';
      const updatedTask = await task.save();

      expect(updatedTask.priority).toBe('high');
    });
  });

  describe('Task Queries', () => {
    beforeEach(async () => {
      // Create multiple tasks for testing
      const tasks = [
        { title: 'Task 1', status: 'pending', priority: 'high', userId: testUser._id },
        { title: 'Task 2', status: 'completed', priority: 'medium', userId: testUser._id },
        { title: 'Task 3', status: 'in-progress', priority: 'low', userId: testUser._id }
      ];

      await Task.insertMany(tasks);
    });

    test('should find tasks by user', async () => {
      const userTasks = await Task.find({ userId: testUser._id });
      expect(userTasks).toHaveLength(3);
    });

    test('should find tasks by status', async () => {
      const pendingTasks = await Task.find({ userId: testUser._id, status: 'pending' });
      expect(pendingTasks).toHaveLength(1);
      expect(pendingTasks[0].title).toBe('Task 1');
    });

    test('should find tasks by priority', async () => {
      const highPriorityTasks = await Task.find({ userId: testUser._id, priority: 'high' });
      expect(highPriorityTasks).toHaveLength(1);
      expect(highPriorityTasks[0].title).toBe('Task 1');
    });
  });
});
