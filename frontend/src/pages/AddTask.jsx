import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import NavBar from "../components/NavBar";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import {
  showSuccessAlert,
  showErrorAlert,
  showWarningAlert,
} from "../services/alerts";
import { useNavigate } from "react-router-dom";

export default function AddTask() {
  const [newTask, setNewTask] = useState("");
  const [dueDate, setDueDate] = useState(new Date());
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState({
    title: "",
    description: "",
    dueDate: "",
  });
  const navigate = useNavigate();

  // Validation rules
  const validateTitle = (title) => {
    const trimmedTitle = title.trim();
    const specialCharPattern = /[^a-zA-Z0-9\s]/;
    const maxLength = 100;
    const minLength = 2;

    if (!trimmedTitle) {
      return "Task title is required";
    }
    if (trimmedTitle.length < minLength) {
      return `Title must be at least ${minLength} characters long`;
    }
    if (trimmedTitle.length > maxLength) {
      return `Title must not exceed ${maxLength} characters`;
    }
    if (specialCharPattern.test(trimmedTitle)) {
      return "Title can only contain letters, numbers, and spaces";
    }
    return "";
  };

  const validateDescription = (desc) => {
    const trimmedDesc = desc.trim();
    const specialCharPattern = /[^a-zA-Z0-9\s]/;
    const maxLength = 500;

    if (trimmedDesc.length > maxLength) {
      return `Description must not exceed ${maxLength} characters`;
    }
    if (specialCharPattern.test(trimmedDesc)) {
      return "Description can only contain letters, numbers, and spaces";
    }
    return "";
  };

  const validateDueDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return "Due date cannot be in the past";
    }
    return "";
  };

  const handleTitleChange = (e) => {
    let value = e.target.value;

    const specialCharPattern = /[^a-zA-Z0-9\s]/g;
    const filteredValue = value.replace(specialCharPattern, "");

    if (value !== filteredValue) {
      showWarningAlert(
        "Invalid Characters Removed",
        "Only letters, numbers, and spaces are allowed in task title"
      );
    }

    setNewTask(filteredValue);
    const error = validateTitle(filteredValue);
    setErrors((prev) => ({ ...prev, title: error }));
  };

  const handleDescriptionChange = (e) => {
    let value = e.target.value;

    const specialCharPattern = /[^a-zA-Z0-9\s]/g;
    const filteredValue = value.replace(specialCharPattern, "");

    if (value !== filteredValue) {
      showWarningAlert(
        "Invalid Characters Removed",
        "Only letters, numbers, and spaces are allowed in description"
      );
    }

    setDescription(filteredValue);
    const error = validateDescription(filteredValue);
    setErrors((prev) => ({ ...prev, description: error }));
  };

  const handleTitleKeyDown = (e) => {
    const allowedPattern = /[a-zA-Z0-9\s]/;

    if (
      !allowedPattern.test(e.key) &&
      e.key !== "Backspace" &&
      e.key !== "Delete" &&
      e.key !== "ArrowLeft" &&
      e.key !== "ArrowRight" &&
      e.key !== "Enter" &&
      e.key !== "Tab"
    ) {
      e.preventDefault();
      e.stopPropagation();

      const target = e.target;
      target.style.boxShadow = "0 0 0 3px rgba(239, 68, 68, 0.6)";
      target.style.backgroundColor = "rgba(239, 68, 68, 0.1)";
      target.style.transform = "scale(1.02)";

      setTimeout(() => {
        target.style.boxShadow = "";
        target.style.backgroundColor = "";
        target.style.transform = "";
      }, 300);

      showWarningAlert(
        "Character Blocked!",
        `Only letters, numbers, and spaces are allowed in task title`
      );
      return false;
    }
  };

  const handleDescriptionKeyDown = (e) => {
    const allowedPattern = /[a-zA-Z0-9\s]/;

    if (
      !allowedPattern.test(e.key) &&
      e.key !== "Backspace" &&
      e.key !== "Delete" &&
      e.key !== "ArrowLeft" &&
      e.key !== "ArrowRight" &&
      e.key !== "Enter" &&
      e.key !== "Tab"
    ) {
      e.preventDefault();
      e.stopPropagation();

      const target = e.target;
      target.style.boxShadow = "0 0 0 3px rgba(239, 68, 68, 0.6)";
      target.style.backgroundColor = "rgba(239, 68, 68, 0.1)";
      target.style.transform = "scale(1.01)";

      setTimeout(() => {
        target.style.boxShadow = "";
        target.style.backgroundColor = "";
        target.style.transform = "";
      }, 300);

      showWarningAlert(
        "Character Blocked!",
        `Only letters, numbers, and spaces are allowed in description`
      );
      return false;
    }
  };

  const handleDueDateChange = (date) => {
    setDueDate(date);
    const error = validateDueDate(date);
    setErrors((prev) => ({ ...prev, dueDate: error }));
  };

  const handleTitlePaste = (e) => {
    e.preventDefault();
    const pastedText = (e.clipboardData || window.clipboardData).getData(
      "text"
    );
    const filteredText = pastedText.replace(/[^a-zA-Z0-9\s]/g, "");

    if (pastedText !== filteredText) {
      showWarningAlert(
        "Characters Filtered",
        "Only letters, numbers, and spaces were kept from pasted text"
      );
    }

    const newValue = newTask + filteredText;
    const truncatedValue = newValue.substring(0, 100);

    setNewTask(truncatedValue);
    const error = validateTitle(truncatedValue);
    setErrors((prev) => ({ ...prev, title: error }));
  };

  const handleDescriptionPaste = (e) => {
    e.preventDefault();
    const pastedText = (e.clipboardData || window.clipboardData).getData(
      "text"
    );
    const filteredText = pastedText.replace(/[^a-zA-Z0-9\s]/g, "");

    if (pastedText !== filteredText) {
      showWarningAlert(
        "Characters Filtered",
        "Only letters, numbers, and spaces were kept from pasted text"
      );
    }

    const newValue = description + filteredText;
    const truncatedValue = newValue.substring(0, 500);

    setDescription(truncatedValue);
    const error = validateDescription(truncatedValue);
    setErrors((prev) => ({ ...prev, description: error }));
  };

  // Validate all fields
  const validateAllFields = () => {
    const titleError = validateTitle(newTask);
    const descError = validateDescription(description);
    const dateError = validateDueDate(dueDate);

    setErrors({
      title: titleError,
      description: descError,
      dueDate: dateError,
    });

    return !titleError && !descError && !dateError;
  };

  const createTask = async () => {
    if (!validateAllFields()) {
      showWarningAlert(
        "Validation Error",
        "Please fix the errors before submitting"
      );
      return;
    }

    try {
      await axios.post(
        "http://localhost:5000/api/tasks",
        { title: newTask.trim(), description: description.trim(), dueDate },
        { headers: { Authorization: localStorage.getItem("token") } }
      );

      showSuccessAlert("Success!", "Task created successfully");
      navigate("/dashboard");
    } catch (err) {
      if (err.response?.status === 401) {
        showErrorAlert("Session Expired", "Please login again");
        localStorage.removeItem("token");
        navigate("/");
      } else {
        showErrorAlert("Error", "Failed to create task");
      }
    }
  };

  const goBack = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-surface">
      <NavBar />
      <div className="pt-20 p-4">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <button
              onClick={goBack}
              className="btn-secondary px-4 py-2 flex items-center gap-2"
            >
              Back to Dashboard
            </button>
            <h2 className="text-3xl font-bold text-primary absolute left-1/2 transform -translate-x-1/2">
              Add New Task
            </h2>
            <div></div>
          </div>

          {/* Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Task Details*/}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="card p-6"
            >
              <h3 className="text-xl font-semibold text-primary mb-6">
                Task Details
              </h3>
              <div className="space-y-6">
                {/* Task Title */}
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Task Title
                    <span className="text-xs text-secondary ml-2"></span>
                  </label>
                  <input
                    className={`input-field transition-all duration-200 ${
                      errors.title
                        ? "border-red-500 dark:border-red-400 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-200 dark:border-gray-700 focus:ring-blue-500 focus:border-blue-500"
                    }`}
                    placeholder="Enter task title"
                    value={newTask}
                    onChange={handleTitleChange}
                    onKeyDown={handleTitleKeyDown}
                    onPaste={handleTitlePaste}
                    onKeyPress={(e) => e.key === "Enter" && createTask()}
                    maxLength={100}
                    autoComplete="off"
                  />
                  {errors.title && (
                    <p className="text-red-500 dark:text-red-400 text-xs mt-1 animate-pulse">
                      {errors.title}
                    </p>
                  )}
                </div>

                {/*Description */}
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Description (Optional)
                    <span className="text-xs text-secondary ml-2"></span>
                  </label>
                  <textarea
                    className={`input-field min-h-[120px] resize-vertical transition-all duration-200 ${
                      errors.description
                        ? "border-red-500 dark:border-red-400 focus:ring-red-500 focus:border-500"
                        : "border-gray-200 dark:border-gray-700 focus:ring-blue-500 focus:border-blue-500"
                    }`}
                    placeholder="Enter task description"
                    value={description}
                    onChange={handleDescriptionChange}
                    onKeyDown={handleDescriptionKeyDown}
                    onPaste={handleDescriptionPaste}
                    rows={5}
                    maxLength={500}
                    autoComplete="off"
                  />
                  {errors.description && (
                    <p className="text-red-500 dark:text-red-400 text-xs mt-1 animate-pulse">
                      {errors.description}
                    </p>
                  )}
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    className={`flex-1 py-2 text-sm font-medium rounded transition-all duration-200 ${
                      Object.values(errors).some((error) => error) ||
                      !newTask.trim()
                        ? "bg-gray-400 dark:bg-gray-600 text-gray-200 cursor-not-allowed"
                        : "btn-primary hover:shadow-lg transform hover:scale-105"
                    }`}
                    onClick={createTask}
                    disabled={
                      Object.values(errors).some((error) => error) ||
                      !newTask.trim()
                    }
                  >
                    {Object.values(errors).some((error) => error)
                      ? "Fix Errors"
                      : "Create Task"}
                  </button>
                  <button
                    onClick={goBack}
                    className="btn-warning px-4 py-2 hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Date*/}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className={`card p-6 transition-colors duration-200 ${
                  errors.dueDate
                    ? "border-red-500 dark:border-red-400"
                    : "border-gray-200 dark:border-gray-700"
                }`}
              >
                <h3 className="text-xl font-semibold text-primary mb-4">
                  Due Date *
                  {errors.dueDate && (
                    <span className="text-red-500 dark:text-red-400 text-sm ml-2"></span>
                  )}
                </h3>
                <div className="flex justify-center mb-4">
                  <Calendar
                    onChange={handleDueDateChange}
                    value={dueDate}
                    className={`w-full ${
                      errors.dueDate ? "border-red-500" : ""
                    }`}
                    minDate={new Date()}
                  />
                </div>
                {errors.dueDate && (
                  <div className="mb-4">
                    <p className="text-red-500 dark:text-red-400 text-sm animate-pulse text-center">
                      {errors.dueDate}
                    </p>
                  </div>
                )}
                <div
                  className={`p-3 rounded-lg ${
                    errors.dueDate
                      ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                      : "bg-indigo-50 dark:bg-indigo-900/20"
                  }`}
                >
                  <p
                    className={`text-sm font-medium ${
                      errors.dueDate
                        ? "text-red-700 dark:text-red-300"
                        : "text-primary"
                    }`}
                  >
                    Selected Date:{" "}
                    {dueDate.toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
