import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Phone } from 'lucide-react';
import { Button, Input } from '@/components/common';
import { useAuthStore } from '@/stores/authStore';
import { isValidEmail, validatePassword } from '@/utils/helpers';

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess, onSwitchToLogin }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    phone?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const { register, isLoading, error, clearError } = useAuthStore();

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (phone && !/^[0-9]{10}$/.test(phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.errors[0];
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validateForm()) return;

    try {
      await register({
        email,
        password,
        fullName: fullName.trim(),
        phone: phone.trim() || undefined,
      });
      onSuccess?.();
    } catch {
      // Error is handled by the store
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Global Error */}
      {error && (
        <div className="p-4 bg-error-50 border border-error-200 rounded-xl animate-fade-in">
          <p className="text-sm text-error-600">{error}</p>
        </div>
      )}

      {/* Full Name Input */}
      <Input
        type="text"
        name="fullName"
        label="Full name"
        placeholder="John Doe"
        value={fullName}
        onChange={(e) => {
          setFullName(e.target.value);
          if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: undefined }));
        }}
        error={errors.fullName}
        leftIcon={<User className="w-5 h-5" />}
        autoComplete="name"
        disabled={isLoading}
      />

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

      {/* Phone Input (Optional) */}
      <Input
        type="tel"
        name="phone"
        label="Phone number (optional)"
        placeholder="9876543210"
        value={phone}
        onChange={(e) => {
          setPhone(e.target.value);
          if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
        }}
        error={errors.phone}
        leftIcon={<Phone className="w-5 h-5" />}
        autoComplete="tel"
        disabled={isLoading}
      />

      {/* Password Input */}
      <div>
        <Input
          type={showPassword ? 'text' : 'password'}
          name="password"
          label="Password"
          placeholder="Create a strong password"
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
          autoComplete="new-password"
          disabled={isLoading}
        />
        {password && !errors.password && (
          <div className="mt-2 space-y-1">
            <PasswordRequirement met={password.length >= 8} text="At least 8 characters" />
            <PasswordRequirement met={/[A-Z]/.test(password)} text="One uppercase letter" />
            <PasswordRequirement met={/[a-z]/.test(password)} text="One lowercase letter" />
            <PasswordRequirement met={/[0-9]/.test(password)} text="One number" />
          </div>
        )}
      </div>

      {/* Confirm Password Input */}
      <Input
        type={showConfirmPassword ? 'text' : 'password'}
        name="confirmPassword"
        label="Confirm password"
        placeholder="Confirm your password"
        value={confirmPassword}
        onChange={(e) => {
          setConfirmPassword(e.target.value);
          if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
        }}
        error={errors.confirmPassword}
        leftIcon={<Lock className="w-5 h-5" />}
        rightIcon={
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="hover:text-secondary-600 transition-colors"
          >
            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        }
        autoComplete="new-password"
        disabled={isLoading}
      />

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        isLoading={isLoading}
        rightIcon={<ArrowRight className="w-5 h-5" />}
        className="mt-6"
      >
        Create account
      </Button>

      {/* Switch to Login */}
      {onSwitchToLogin && (
        <p className="text-center text-sm text-secondary-600">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="link"
          >
            Sign in
          </button>
        </p>
      )}

      {/* Terms */}
      <p className="text-center text-xs text-secondary-500">
        By creating an account, you agree to our{' '}
        <Link to="/terms" className="link">Terms of Service</Link>
        {' '}and{' '}
        <Link to="/privacy" className="link">Privacy Policy</Link>
      </p>
    </form>
  );
};

// Password requirement indicator component
const PasswordRequirement: React.FC<{ met: boolean; text: string }> = ({ met, text }) => (
  <div className={`flex items-center gap-2 text-xs ${met ? 'text-success-600' : 'text-secondary-400'}`}>
    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${met ? 'bg-success-100' : 'bg-secondary-100'}`}>
      {met && (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      )}
    </div>
    <span>{text}</span>
  </div>
);

export default RegisterForm;
