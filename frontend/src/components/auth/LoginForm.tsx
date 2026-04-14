import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import { Button, Input } from '@/components/common';
import { useAuthStore } from '@/stores/authStore';
import { isValidEmail } from '@/utils/helpers';

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const { login, isLoading, error, clearError } = useAuthStore();

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validateForm()) return;

    try {
      await login({ email, password });
      onSuccess?.();
    } catch {
      // Error is handled by the store
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Global Error */}
      {error && (
        <div className="p-4 bg-error-50 border border-error-200 rounded-xl animate-fade-in">
          <p className="text-sm text-error-600">{error}</p>
        </div>
      )}

      {/* Email Input */}
      <Input
        type="email"
        name="email"
        label="Email address"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
        }}
        error={errors.email}
        leftIcon={<Mail className="w-5 h-5" />}
        autoComplete="email"
        disabled={isLoading}
      />

      {/* Password Input */}
      <Input
        type={showPassword ? 'text' : 'password'}
        name="password"
        label="Password"
        placeholder="Enter your password"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
        }}
        error={errors.password}
        leftIcon={<Lock className="w-5 h-5" />}
        rightIcon={
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="hover:text-secondary-600 transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        }
        autoComplete="current-password"
        disabled={isLoading}
      />

      {/* Forgot Password Link */}
      <div className="flex justify-end">
        <Link to="/forgot-password" className="link text-sm">
          Forgot password?
        </Link>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        isLoading={isLoading}
        rightIcon={<ArrowRight className="w-5 h-5" />}
      >
        Sign in
      </Button>

      {/* Switch to Register */}
      {onSwitchToRegister && (
        <p className="text-center text-sm text-secondary-600">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="link"
          >
            Create one
          </button>
        </p>
      )}
    </form>
  );
};

export default LoginForm;
