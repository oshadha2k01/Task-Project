import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import NavBar from '../components/NavBar';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { showSuccessAlert, showErrorAlert, showConfirmAlert, showWarningAlert } from '../services/alerts';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDueDate, setEditDueDate] = useState(new Date());
  const [filterStatus, setFilterStatus] = useState('all'); // all, pending, completed
  const [filterPriority, setFilterPriority] = useState('all'); // all, low, medium, high
  const [sortBy, setSortBy] = useState('dueDate'); // dueDate, title, status, priority
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const fetchTasks = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/tasks', {
        headers: { Authorization: localStorage.getItem('token') },
      });
      setTasks(res.data);
    } catch (err) {
      if (err.response?.status === 401) {
        showErrorAlert('Session Expired', 'Please login again');
        localStorage.removeItem('token');
        navigate('/');
      } else {
        showErrorAlert('Error', 'Failed to fetch tasks');
      }
    }
  };

  const navigateToAddTask = () => {
    navigate('/add-task');
  };

  const startEditTask = (task) => {
    setEditingTask(task._id);
    setEditTitle(task.title);
    setEditDueDate(new Date(task.dueDate));
  };

  const cancelEditTask = () => {
    setEditingTask(null);
    setEditTitle('');
    setEditDueDate(new Date());
  };

  const updateTask = async (taskId) => {
    if (!editTitle.trim()) {
      showWarningAlert('Warning', 'Please enter a task title');
      return;
    }

    try {
      await axios.put(
        `http://localhost:5000/api/tasks/${taskId}`,
        { title: editTitle, dueDate: editDueDate },
        { headers: { Authorization: localStorage.getItem('token') } }
      );
      setEditingTask(null);
      setEditTitle('');
      setEditDueDate(new Date());
      fetchTasks();
      showSuccessAlert('Success!', 'Task updated successfully');
    } catch (err) {
      showErrorAlert('Error', 'Failed to update task');
    }
  };

  const toggleTaskStatus = async (taskId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';
      await axios.put(
        `http://localhost:5000/api/tasks/${taskId}`,
        { status: newStatus },
        { headers: { Authorization: localStorage.getItem('token') } }
      );
      fetchTasks();
      showSuccessAlert('Success!', `Task marked as ${newStatus}`);
    } catch (err) {
      showErrorAlert('Error', 'Failed to update task');
    }
  };

  const deleteTask = async (taskId) => {
    const result = await showConfirmAlert('Are you sure?', 'This task will be permanently deleted');
    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:5000/api/tasks/${taskId}`, {
          headers: { Authorization: localStorage.getItem('token') }
        });
        fetchTasks();
        showSuccessAlert('Deleted!', 'Task has been deleted successfully');
      } catch (err) {
        showErrorAlert('Error', 'Failed to delete task');
      }
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Filter and sort tasks
  const getFilteredAndSortedTasks = () => {
    let filteredTasks = tasks;

    // Apply search filter
    if (searchTerm.trim()) {
      filteredTasks = filteredTasks.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.status === filterStatus);
    }

    // Apply priority filter
    if (filterPriority !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.priority === filterPriority);
    }

    // Apply sorting
    const sortedTasks = [...filteredTasks].sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'status':
          if (a.status === b.status) return 0;
          return a.status === 'pending' ? -1 : 1;
        case 'dueDate':
        default:
          return new Date(a.dueDate) - new Date(b.dueDate);
      }
    });

    return sortedTasks;
  };

  const filteredAndSortedTasks = getFilteredAndSortedTasks();

  return (
    <div className="min-h-screen bg-surface">
      <NavBar />
      <div className="pt-20 p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            {/* Add Task Button - Right Side */}
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              transition={{ duration: 0.6 }}
            >
              <button 
                onClick={navigateToAddTask}
                className="btn-primary px-4 py-2 text-sm font-medium flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
              >
                <span className="text-lg">+</span>
                Add New Task
              </button>
            </motion.div>
          </div>

        <div className="space-y-4">
          {/* Search and Filter Controls */}
          <div className="card p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Search Tasks
                </label>
                <input
                  type="text"
                  placeholder="Search by title or description..."
                  className="input-field"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Filter by Status */}
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Filter by Status
                </label>
                <select
                  className="input-field"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Tasks</option>
                  <option value="pending">Pending Only</option>
                  <option value="completed">Completed Only</option>
                </select>
              </div>

              {/* Sort by */}
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Sort by
                </label>
                <select
                  className="input-field"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="dueDate">Due Date</option>
                  <option value="title">Title (A-Z)</option>
                  <option value="status">Status</option>
                </select>
              </div>
            </div>

            {/* Results Summary */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-secondary">
              <span>
                Showing {filteredAndSortedTasks.length} of {tasks.length} tasks
              </span>
              {searchTerm && (
                <span>
                  Search: "{searchTerm}"
                </span>
              )}
              {filterStatus !== 'all' && (
                <span>
                  Filter: {filterStatus === 'pending' ? 'Pending' : 'Completed'}
                </span>
              )}
              <span>
                Sort: {sortBy === 'dueDate' ? 'Due Date' : sortBy === 'title' ? 'Title' : 'Status'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-primary">Your Tasks ({filteredAndSortedTasks.length})</h3>
            {tasks.length > 0 && (
              <div className="text-sm text-secondary">
                {tasks.filter(task => task.status === 'completed').length} completed
              </div>
            )}
          </div>
          
          {filteredAndSortedTasks.length === 0 ? (
            <div className="card p-8 text-center">
              {tasks.length === 0 ? (
                <h4 className="text-lg font-medium text-primary mb-2">No tasks yet</h4>
              ) : (
                <div>
                  <h4 className="text-lg font-medium text-primary mb-2">No tasks match your filters</h4>
                  <p className="text-secondary">Try adjusting your search or filter criteria</p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setFilterStatus('all');
                      setSortBy('dueDate');
                    }}
                    className="btn-info px-4 py-2 mt-3"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredAndSortedTasks.map((task) => (
                <motion.div 
                  key={task._id} 
                  whileHover={{ scale: 1.01 }} 
                  className={`card p-4 ${
                    task.status === 'completed' ? 'opacity-75' : ''
                  }`}
                >
                  {editingTask === task._id ? (
                    // Edit Mode
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-primary mb-2">
                          Task Title
                        </label>
                        <input
                          className="input-field"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          placeholder="Enter task title..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-primary mb-2">
                          Due Date
                        </label>
                        <Calendar onChange={setEditDueDate} value={editDueDate} className="mb-2" />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateTask(task._id)}
                          className="btn-secondary px-4 py-2"
                        >
                          Save Changes
                        </button>
                        <button
                          onClick={cancelEditTask}
                          className="btn-warning px-4 py-2"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className={`text-lg font-semibold text-primary ${
                          task.status === 'completed' ? 'line-through' : ''
                        }`}>
                          {task.title}
                        </h4>
                        <p className="text-sm text-secondary mt-1">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </p>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-2 ${
                          task.status === 'completed' 
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-100' 
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-800 dark:text-amber-100'
                        }`}>
                          {task.status === 'completed' ? 'Completed' : 'Pending'}
                        </span>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => startEditTask(task)}
                          className="btn-info px-3 py-1 text-sm"
                          disabled={task.status === 'completed'}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => toggleTaskStatus(task._id, task.status)}
                          className={`px-3 py-1 text-sm rounded transition ${
                            task.status === 'completed'
                              ? 'btn-warning'
                              : 'btn-secondary'
                          }`}
                        >
                          {task.status === 'completed' ? 'Mark Pending' : 'Mark Complete'}
                        </button>
                        <button
                          onClick={() => deleteTask(task._id)}
                          className="btn-error px-3 py-1 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
