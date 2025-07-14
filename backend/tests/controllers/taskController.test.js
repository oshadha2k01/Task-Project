const request = require('supertest');
const express = require('express');
const taskRoutes = require('../../routes/taskRoutes');
const User = require('../../models/User');
const Task = require('../../models/Task');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());
app.use('/api/tasks', taskRoutes);

describe('Task Controller', () => {
  let testUser;
  let authToken;

  beforeEach(async () => {
    testUser = new User({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    });
    await testUser.save();

    authToken = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET || 'testsecret');
  });

  describe('POST /api/tasks', () => {
    test('should create a new task', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'This is a test task',
        status: 'pending',
        priority: 'high',
        dueDate: '2025-12-31'
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', authToken)
        .send(taskData)
        .expect(201);

      expect(response.body.title).toBe(taskData.title);
      expect(response.body.description).toBe(taskData.description);
      expect(response.body.status).toBe(taskData.status);
      expect(response.body.priority).toBe(taskData.priority);
      expect(response.body.userId).toBe(testUser._id.toString());

      // Verify task was created in database
      const task = await Task.findById(response.body._id);
      expect(task).toBeTruthy();
    });

    test('should create task with default values', async () => {
      const taskData = {
        title: 'Minimal Task'
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', authToken)
        .send(taskData)
        .expect(201);

      expect(response.body.status).toBe('pending');
      expect(response.body.priority).toBe('medium');
      expect(response.body.description).toBe('');
    });

    test('should not create task without title', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', authToken)
        .send({})
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    test('should not create task without authentication', async () => {
      const taskData = {
        title: 'Test Task'
      };

      const response = await request(app)
        .post('/api/tasks')
        .send(taskData)
        .expect(401);

      expect(response.body.error).toBe('No token provided');
    });
  });

  describe('GET /api/tasks', () => {
    beforeEach(async () => {
      // Create test tasks
      const tasks = [
        { title: 'Task 1', status: 'pending', userId: testUser._id },
        { title: 'Task 2', status: 'completed', userId: testUser._id },
        { title: 'Task 3', status: 'in-progress', userId: testUser._id }
      ];
      await Task.insertMany(tasks);
    });

    test('should get all user tasks', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body).toHaveLength(3);
      expect(response.body[0].title).toBe('Task 1');
      expect(response.body[1].title).toBe('Task 2');
      expect(response.body[2].title).toBe('Task 3');
    });

    test('should not get tasks without authentication', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .expect(401);

      expect(response.body.error).toBe('No token provided');
    });

    test('should only return tasks for authenticated user', async () => {
      // Create another user with tasks
      const otherUser = new User({
        username: 'otheruser',
        email: 'other@example.com',
        password: 'password123'
      });
      await otherUser.save();

      await new Task({ title: 'Other User Task', userId: otherUser._id }).save();

      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body).toHaveLength(3); // Only original user's tasks
      expect(response.body.every(task => task.userId === testUser._id.toString())).toBe(true);
    });
  });

  describe('PUT /api/tasks/:id', () => {
    let testTask;

    beforeEach(async () => {
      testTask = new Task({
        title: 'Original Task',
        status: 'pending',
        priority: 'medium',
        userId: testUser._id
      });
      await testTask.save();
    });

    test('should update task successfully', async () => {
      const updateData = {
        title: 'Updated Task',
        status: 'completed',
        priority: 'high'
      };

      const response = await request(app)
        .put(`/api/tasks/${testTask._id}`)
        .set('Authorization', authToken)
        .send(updateData)
        .expect(200);

      expect(response.body.title).toBe(updateData.title);
      expect(response.body.status).toBe(updateData.status);
      expect(response.body.priority).toBe(updateData.priority);

      // Verify update in database
      const updatedTask = await Task.findById(testTask._id);
      expect(updatedTask.title).toBe(updateData.title);
    });

    test('should not update task without authentication', async () => {
      const response = await request(app)
        .put(`/api/tasks/${testTask._id}`)
        .send({ title: 'Updated Task' })
        .expect(401);

      expect(response.body.error).toBe('No token provided');
    });

    test('should not update non-existent task', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      const response = await request(app)
        .put(`/api/tasks/${fakeId}`)
        .set('Authorization', authToken)
        .send({ title: 'Updated Task' })
        .expect(404);

      expect(response.body.error).toBe('Task not found');
    });

    test('should not update other user\'s task', async () => {
      // Create another user and their task
      const otherUser = new User({
        username: 'otheruser',
        email: 'other@example.com',
        password: 'password123'
      });
      await otherUser.save();

      const otherTask = new Task({
        title: 'Other User Task',
        userId: otherUser._id
      });
      await otherTask.save();

      const response = await request(app)
        .put(`/api/tasks/${otherTask._id}`)
        .set('Authorization', authToken)
        .send({ title: 'Hacked Task' })
        .expect(404);

      expect(response.body.error).toBe('Task not found');
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    let testTask;

    beforeEach(async () => {
      testTask = new Task({
        title: 'Task to Delete',
        userId: testUser._id
      });
      await testTask.save();
    });

    test('should delete task successfully', async () => {
      const response = await request(app)
        .delete(`/api/tasks/${testTask._id}`)
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.message).toBe('Task deleted');

      // Verify deletion in database
      const deletedTask = await Task.findById(testTask._id);
      expect(deletedTask).toBeNull();
    });

    test('should not delete task without authentication', async () => {
      const response = await request(app)
        .delete(`/api/tasks/${testTask._id}`)
        .expect(401);

      expect(response.body.error).toBe('No token provided');
    });

    test('should not delete non-existent task', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      const response = await request(app)
        .delete(`/api/tasks/${fakeId}`)
        .set('Authorization', authToken)
        .expect(404);

      expect(response.body.error).toBe('Task not found');
    });

    test('should not delete other user\'s task', async () => {
      // Create another user and their task
      const otherUser = new User({
        username: 'otheruser',
        email: 'other@example.com',
        password: 'password123'
      });
      await otherUser.save();

      const otherTask = new Task({
        title: 'Other User Task',
        userId: otherUser._id
      });
      await otherTask.save();

      const response = await request(app)
        .delete(`/api/tasks/${otherTask._id}`)
        .set('Authorization', authToken)
        .expect(404);

      expect(response.body.error).toBe('Task not found');
    });
  });
});
