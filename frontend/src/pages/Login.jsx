import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { showSuccessAlert, showErrorAlert, showWarningAlert } from '../services/alerts';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({
    email: '',
    password: ''
  });
  const navigate = useNavigate();

  // Validation rules
  const validateEmail = (email) => {
    const trimmedEmail = email.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const specialCharPattern = /[^a-zA-Z0-9@._-]/; // Only allow alphanumeric, @, dot, underscore, hyphen

    if (!trimmedEmail) {
      return 'Email address is required';
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
    const specialCharPattern = /[<>"'&;{}()]/;

    if (!password) {
      return 'Password is required';
    }
    if (specialCharPattern.test(password)) {
      return 'Password cannot contain: < > " \' & ; { } ( )';
    }
    if (password.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    return '';
  };

  // Real-time validation handlers with character blocking
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
  const handleEmailPaste = (e) => {
    e.preventDefault();
    const pastedText = (e.clipboardData || window.clipboardData).getData('text');
    const filteredText = pastedText.replace(/[^a-zA-Z0-9@._-]/g, '');
    
    if (pastedText !== filteredText) {
      showWarningAlert('Characters Filtered', 'Only letters, numbers, @, dots, underscores, and hyphens are allowed in email');
    }
    
    const newValue = email + filteredText;
    setEmail(newValue);
    const error = validateEmail(newValue);
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
    setPassword(newValue);
    const error = validatePassword(newValue);
    setErrors(prev => ({ ...prev, password: error }));
  };

  // Validate all fields before submission
  const validateAllFields = () => {
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    setErrors({
      email: emailError,
      password: passwordError
    });

    return !emailError && !passwordError;
  };

  const handleLogin = async () => {
    if (!validateAllFields()) {
      showWarningAlert('Validation Error', 'Please fix the errors before submitting');
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', {
        email: email.trim(),
        password: password.trim(),
      });
      localStorage.setItem('token', res.data.token);
      await showSuccessAlert('Success!', 'You have been logged in successfully');
      navigate('/dashboard');
    } catch (err) {
      showErrorAlert('Login Failed', err.response?.data?.error || 'Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-primary">Welcome Back</h2>
          <p className="mt-2 text-sm text-secondary">Please sign in to your account</p>
        </div>
        <div className="card py-8 px-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Email Address *
              </label>
              <input 
                type="email"
                className={`input-field min-h-[44px] transition-all duration-200 ${
                  errors.email 
                    ? 'border-red-500 dark:border-red-400 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-200 dark:border-gray-700 focus:ring-blue-500 focus:border-blue-500'
                }`}
                placeholder="Enter your email" 
                value={email}
                onChange={handleEmailChange}
                onKeyDown={handleEmailKeyDown}
                onPaste={handleEmailPaste}
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
              </label>
              <input 
                type="password"
                className={`input-field min-h-[44px] transition-all duration-200 ${
                  errors.password 
                    ? 'border-red-500 dark:border-red-400 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-200 dark:border-gray-700 focus:ring-blue-500 focus:border-blue-500'
                }`}
                placeholder="Enter your password" 
                value={password}
                onChange={handlePasswordChange}
                onKeyDown={handlePasswordKeyDown}
                onPaste={handlePasswordPaste}
                autoComplete="current-password"
              />
              {errors.password && (
                <p className="text-red-500 dark:text-red-400 text-xs mt-1 animate-pulse">
                  {errors.password}
                </p>
              )}
            </div>
            <button 
              className="w-full btn-primary min-h-[44px] py-3 sm:py-2" 
              onClick={handleLogin}
            >
              Sign In
            </button>
          </div>
        </div>
        <div className="text-center">
          <p className="text-sm text-secondary">
            Don't have an account? 
            <button 
              onClick={() => navigate('/register')} 
              className="text-blue-600 dark:text-blue-400 ml-1 underline hover:text-blue-500 transition-colors"
            >
              Sign up here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
