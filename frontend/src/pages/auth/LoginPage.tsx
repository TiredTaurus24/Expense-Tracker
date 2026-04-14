import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Wallet } from 'lucide-react';
import { LoginForm } from '@/components/auth';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen auth-bg flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-500 via-primary-600 to-accent-600 p-12 flex-col justify-between relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Wallet className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">SplitWise</span>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-md">
          <h1 className="text-4xl font-bold text-white mb-6 leading-tight">
            Split expenses with friends, the smart way
          </h1>
          <p className="text-lg text-white/80 mb-8">
            Track shared expenses, split bills effortlessly, and settle up with ease. No more awkward money conversations.
          </p>
          
          {/* Features */}
          <div className="space-y-4">
            <FeatureItem text="Create homes for different groups" />
            <FeatureItem text="Scan receipts with AI-powered parsing" />
            <FeatureItem text="Voice input for quick expense entry" />
            <FeatureItem text="Smart split calculations" />
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-white/60 text-sm">
          © 2024 SplitWise. All rights reserved.
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center">
              <Wallet className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-secondary-900">SplitWise</span>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-secondary-900 mb-2">Welcome back</h2>
            <p className="text-secondary-600">Sign in to your account to continue</p>
          </div>

          {/* Login Form Card */}
          <div className="bg-white rounded-2xl shadow-soft p-8">
            <LoginForm
              onSuccess={() => navigate('/dashboard')}
              onSwitchToRegister={() => navigate('/register')}
            />
          </div>

          {/* Additional Links */}
          <div className="mt-6 text-center">
            <p className="text-sm text-secondary-500">
              By signing in, you agree to our{' '}
              <Link to="/terms" className="link">Terms</Link>
              {' '}and{' '}
              <Link to="/privacy" className="link">Privacy Policy</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Feature item component
const FeatureItem: React.FC<{ text: string }> = ({ text }) => (
  <div className="flex items-center gap-3">
    <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    </div>
    <span className="text-white/90">{text}</span>
  </div>
);

export default LoginPage;
