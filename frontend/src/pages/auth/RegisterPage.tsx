import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Wallet } from 'lucide-react';
import { RegisterForm } from '@/components/auth';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen auth-bg flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-accent-500 via-primary-500 to-primary-600 p-12 flex-col justify-between relative overflow-hidden">
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
            Start splitting expenses today
          </h1>
          <p className="text-lg text-white/80 mb-8">
            Join thousands of users who trust SplitWise to manage their shared expenses. Free to use, forever.
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-6">
            <div>
              <div className="text-3xl font-bold text-white">10K+</div>
              <div className="text-white/60 text-sm">Active Users</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">₹50L+</div>
              <div className="text-white/60 text-sm">Expenses Tracked</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">5K+</div>
              <div className="text-white/60 text-sm">Homes Created</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-white/60 text-sm">
          © 2024 SplitWise. All rights reserved.
        </div>
      </div>

      {/* Right side - Register Form */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center">
              <Wallet className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-secondary-900">SplitWise</span>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-secondary-900 mb-2">Create your account</h2>
            <p className="text-secondary-600">Get started with SplitWise for free</p>
          </div>

          {/* Register Form Card */}
          <div className="bg-white rounded-2xl shadow-soft p-8">
            <RegisterForm
              onSuccess={() => navigate('/dashboard')}
              onSwitchToLogin={() => navigate('/login')}
            />
          </div>

          {/* Additional Links */}
          <div className="mt-6 text-center">
            <p className="text-sm text-secondary-500">
              Already have an account?{' '}
              <Link to="/login" className="link">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
