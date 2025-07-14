import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { showSuccessAlert, showErrorAlert, showWarningAlert } from '../services/alerts';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: ''
  });
  const navigate = useNavigate();

  // Validation rules
  const validateName = (name) => {
    const trimmedName = name.trim();
    const specialCharPattern = /[<>"'&;{}()@#$%^*+=|\\/]/;
    const numberPattern = /^\d/;
    const maxLength = 50;
    const minLength = 2;

    if (!trimmedName) {
      return 'Full name is required';
    }
    if (trimmedName.length < minLength) {
      return `Name must be at least ${minLength} characters long`;
    }
    if (trimmedName.length > maxLength) {
      return `Name must not exceed ${maxLength} characters`;
    }
    if (numberPattern.test(trimmedName)) {
      return 'Name cannot start with a number';
    }
    if (specialCharPattern.test(trimmedName)) {
      return 'Name cannot contain special characters';
    }
    if (!/^[a-zA-Z\s.-]+$/.test(trimmedName)) {
      return 'Name can only contain letters, spaces, dots, and hyphens';
    }
    return '';
  };

  const validateEmail = (email) => {
    const trimmedEmail = email.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const specialCharPattern = /[^a-zA-Z0-9@._-]/; // Only allow alphanumeric, @, dot, underscore, hyphen
    const maxLength = 100;

    if (!trimmedEmail) {
      return 'Email address is required';
    }
    if (trimmedEmail.length > maxLength) {
      return `Email must not exceed ${maxLength} characters`;
    }
    if (specialCharPattern.test(trimmedEmail)) {
      return 'Email can only contain letters, numbers, @, dots, underscores, and hyphens';
    }
    if (!emailPattern.test(trimmedEmail)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const validatePassword = (password) => {
    const minLength = 6;
    const maxLength = 128;
    const specialCharPattern = /[<>"'&;{}()]/;

    if (!password) {
      return 'Password is required';
    }
    if (password.length < minLength) {
      return `Password must be at least ${minLength} characters long`;
    }
    if (password.length > maxLength) {
      return `Password must not exceed ${maxLength} characters`;
    }
    if (specialCharPattern.test(password)) {
      return 'Password cannot contain: < > " \' & ; { } ( )';
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/(?=.*\d)/.test(password)) {
      return 'Password must contain at least one number';
    }
    return '';
  };

  // Real-time validation handlers with character blocking
  const handleNameChange = (e) => {
    let value = e.target.value;
    
    // Filter out forbidden special characters immediately
    const forbiddenChars = /[<>"'&;{}()@#$%^*+=|\\/]/g;
    const filteredValue = value.replace(forbiddenChars, '');
    
    // If special characters were removed, show warning
    if (value !== filteredValue) {
      showWarningAlert('Invalid Characters Removed', 'Special characters are not allowed in name');
    }
    
    setName(filteredValue);
    const error = validateName(filteredValue);
    setErrors(prev => ({ ...prev, name: error }));
  };

  const handleEmailChange = (e) => {
    let value = e.target.value;
    
    // Filter out all special characters except @, dot, underscore, hyphen
    const forbiddenChars = /[^a-zA-Z0-9@._-]/g;
    const filteredValue = value.replace(forbiddenChars, '');
    
    // If special characters were removed, show warning
    if (value !== filteredValue) {
      showWarningAlert('Invalid Characters Removed', 'Only letters, numbers, @, dots, underscores, and hyphens are allowed in email');
    }
    
    setEmail(filteredValue);
    const error = validateEmail(filteredValue);
    setErrors(prev => ({ ...prev, email: error }));
  };

  const handlePasswordChange = (e) => {
    let value = e.target.value;
    
    // Filter out forbidden special characters
    const forbiddenChars = /[<>"'&;{}()]/g;
    const filteredValue = value.replace(forbiddenChars, '');
    
    // If special characters were removed, show warning
    if (value !== filteredValue) {
      showWarningAlert('Invalid Characters Removed', 'Special characters < > " \' & ; { } ( ) are not allowed in password');
    }
    
    setPassword(filteredValue);
    const error = validatePassword(filteredValue);
    setErrors(prev => ({ ...prev, password: error }));
  };

  // Block special characters on keydown with visual feedback
  const handleNameKeyDown = (e) => {
    const specialChars = ['<', '>', '"', "'", '&', ';', '{', '}', '(', ')', '@', '#', '$', '%', '^', '*', '+', '=', '|', '\\', '/'];
    
    if (specialChars.includes(e.key)) {
      e.preventDefault();
      e.stopPropagation();
      
      // Visual feedback - red flash
      const target = e.target;
      target.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.6)';
      target.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
      target.style.transform = 'scale(1.02)';
      
      setTimeout(() => {
        target.style.boxShadow = '';
        target.style.backgroundColor = '';
        target.style.transform = '';
      }, 300);
      
      showWarningAlert('Character Blocked!', `"${e.key}" is not allowed in name`);
      return false;
    }
  };

  const handleEmailKeyDown = (e) => {
    // Allow only alphanumeric characters, @, dot, underscore, hyphen, and control keys
    const allowedPattern = /[a-zA-Z0-9@._-]/;
    const controlKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Enter', 'Tab', 'Home', 'End'];
    
    if (!allowedPattern.test(e.key) && !controlKeys.includes(e.key)) {
      e.preventDefault();
      e.stopPropagation();
      
      // Visual feedback - red flash
      const target = e.target;
      target.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.6)';
      target.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
      target.style.transform = 'scale(1.02)';
      
      setTimeout(() => {
        target.style.boxShadow = '';
        target.style.backgroundColor = '';
        target.style.transform = '';
      }, 300);
      
      showWarningAlert('Character Blocked!', `"${e.key}" is not allowed in email. Only letters, numbers, @, dots, underscores, and hyphens are allowed.`);
      return false;
    }
  };

  const handlePasswordKeyDown = (e) => {
    const specialChars = ['<', '>', '"', "'", '&', ';', '{', '}', '(', ')'];
    
    if (specialChars.includes(e.key)) {
      e.preventDefault();
      e.stopPropagation();
      
      // Visual feedback - red flash
      const target = e.target;
      target.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.6)';
      target.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
      target.style.transform = 'scale(1.02)';
      
      setTimeout(() => {
        target.style.boxShadow = '';
        target.style.backgroundColor = '';
        target.style.transform = '';
      }, 300);
      
      showWarningAlert('Character Blocked!', `"${e.key}" is not allowed in password`);
      return false;
    }
  };

  // Handle paste events to filter special characters
  const handleNamePaste = (e) => {
    e.preventDefault();
    const pastedText = (e.clipboardData || window.clipboardData).getData('text');
    const filteredText = pastedText.replace(/[<>"'&;{}()@#$%^*+=|\\/]/g, '');
    
    if (pastedText !== filteredText) {
      showWarningAlert('Characters Filtered', 'Special characters were removed from pasted text');
    }
    
    const newValue = name + filteredText;
    const truncatedValue = newValue.substring(0, 50);
    
    setName(truncatedValue);
    const error = validateName(truncatedValue);
    setErrors(prev => ({ ...prev, name: error }));
  };

  const handleEmailPaste = (e) => {
    e.preventDefault();
    const pastedText = (e.clipboardData || window.clipboardData).getData('text');
    const filteredText = pastedText.replace(/[^a-zA-Z0-9@._-]/g, '');
    
    if (pastedText !== filteredText) {
      showWarningAlert('Characters Filtered', 'Only letters, numbers, @, dots, underscores, and hyphens are allowed in email');
    }
    
    const newValue = email + filteredText;
    const truncatedValue = newValue.substring(0, 100);
    
    setEmail(truncatedValue);
    const error = validateEmail(truncatedValue);
    setErrors(prev => ({ ...prev, email: error }));
  };

  const handlePasswordPaste = (e) => {
    e.preventDefault();
    const pastedText = (e.clipboardData || window.clipboardData).getData('text');
    const filteredText = pastedText.replace(/[<>"'&;{}()]/g, '');
    
    if (pastedText !== filteredText) {
      showWarningAlert('Characters Filtered', 'Special characters were removed from pasted text');
    }
    
    const newValue = password + filteredText;
    const truncatedValue = newValue.substring(0, 128);
    
    setPassword(truncatedValue);
    const error = validatePassword(truncatedValue);
    setErrors(prev => ({ ...prev, password: error }));
  };

  // Validate all fields before submission
  const validateAllFields = () => {
    const nameError = validateName(name);
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    setErrors({
      name: nameError,
      email: emailError,
      password: passwordError
    });

    return !nameError && !emailError && !passwordError;
  };

  const handleRegister = async () => {
    if (!validateAllFields()) {
      showWarningAlert('Validation Error', 'Please fix the errors before submitting');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/auth/register', {
        name: name.trim(),
        email: email.trim(),
        password: password.trim(),
      });
      await showSuccessAlert('Success!', 'Account created successfully! You can now login.');
      navigate('/');
    } catch (err) {
      showErrorAlert('Registration Failed', err.response?.data?.error || 'Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-primary">Create Account</h2>
          <p className="mt-2 text-sm text-secondary">Join us and start managing your tasks</p>
        </div>
        <div className="card py-6 sm:py-8 px-4 sm:px-6">
          <div className="space-y-4 sm:space-y-6">
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Full Name *
                <span className="text-xs text-secondary ml-2">
                  
                </span>
              </label>
              <input 
                type="text"
                className={`input-field min-h-[44px] transition-all duration-200 ${
                  errors.name 
                    ? 'border-red-500 dark:border-red-400 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-200 dark:border-gray-700 focus:ring-blue-500 focus:border-blue-500'
                }`}
                placeholder="Enter your full name" 
                value={name}
                onChange={handleNameChange}
                onKeyDown={handleNameKeyDown}
                onPaste={handleNamePaste}
                maxLength={50}
                autoComplete="name"
              />
              {errors.name && (
                <p className="text-red-500 dark:text-red-400 text-xs mt-1 animate-pulse">
                  {errors.name}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Email Address *
                <span className="text-xs text-secondary ml-2">
                  
                </span>
              </label>
              <input 
                type="email"
                className={`input-field min-h-[44px] transition-all duration-200 ${
                  errors.email 
                    ? 'border-red-500 dark:border-red-400 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-200 dark:border-gray-700 focus:ring-blue-500 focus:border-blue-500'
                }`}
                placeholder="Enter your email address " 
                value={email}
                onChange={handleEmailChange}
                onKeyDown={handleEmailKeyDown}
                onPaste={handleEmailPaste}
                maxLength={100}
                autoComplete="email"
              />
              {errors.email && (
                <p className="text-red-500 dark:text-red-400 text-xs mt-1 animate-pulse">
                   {errors.email}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Password *
                <span className="text-xs text-secondary ml-2">
                 
                </span>
              </label>
              <input 
                type="password"
                className={`input-field min-h-[44px] transition-all duration-200 ${
                  errors.password 
                    ? 'border-red-500 dark:border-red-400 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-200 dark:border-gray-700 focus:ring-blue-500 focus:border-blue-500'
                }`}
                placeholder="Create a strong password" 
                value={password}
                onChange={handlePasswordChange}
                onKeyDown={handlePasswordKeyDown}
                onPaste={handlePasswordPaste}
                maxLength={128}
                autoComplete="new-password"
              />
              {errors.password && (
                <p className="text-red-500 dark:text-red-400 text-xs mt-1 animate-pulse">
                  {errors.password}
                </p>
              )}
              
              
            </div>
            <button 
              className="w-full btn-secondary" 
              onClick={handleRegister}
            >
              Create Account
            </button>
          </div>
        </div>
        <div className="text-center">
          <p className="text-sm text-secondary">
            Already have an account? 
            <button 
              onClick={() => navigate('/')} 
              className="text-emerald-500 dark:text-emerald-400 ml-1 underline hover:text-emerald-600 transition-colors"
            >
              Sign in here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
