import React from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/common';
import { LogOut, User, Wallet, Plus, Home, Settings } from 'lucide-react';

const HomePage: React.FC = () => {
  const { user, logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header */}
      <header className="bg-white border-b border-secondary-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-secondary-900">SplitWise</span>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-primary-600" />
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-secondary-900">{user?.fullName}</p>
                  <p className="text-xs text-secondary-500">{user?.email}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                leftIcon={<LogOut className="w-4 h-4" />}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">
            Welcome back, {user?.fullName?.split(' ')[0]}! 👋
          </h1>
          <p className="text-secondary-600">
            Here's an overview of your expense tracking
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <QuickActionCard
            icon={<Plus className="w-6 h-6" />}
            title="Add Expense"
            description="Record a new expense"
            color="bg-primary-500"
          />
          <QuickActionCard
            icon={<Home className="w-6 h-6" />}
            title="Create Home"
            description="Start a new group"
            color="bg-accent-500"
          />
          <QuickActionCard
            icon={<Wallet className="w-6 h-6" />}
            title="View Balances"
            description="See who owes what"
            color="bg-success-500"
          />
          <QuickActionCard
            icon={<Settings className="w-6 h-6" />}
            title="Settings"
            description="Manage your account"
            color="bg-secondary-500"
          />
        </div>

        {/* Empty State */}
        <div className="bg-white rounded-2xl shadow-soft p-12 text-center">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Wallet className="w-10 h-10 text-primary-500" />
          </div>
          <h2 className="text-2xl font-bold text-secondary-900 mb-3">
            No homes yet
          </h2>
          <p className="text-secondary-600 mb-6 max-w-md mx-auto">
            Create a home to start tracking and splitting expenses with friends, family, or roommates.
          </p>
          <Button
            variant="primary"
            size="lg"
            leftIcon={<Plus className="w-5 h-5" />}
          >
            Create your first home
          </Button>
        </div>
      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-secondary-100 sm:hidden">
        <div className="flex items-center justify-around py-3">
          <MobileNavItem icon={<Home className="w-6 h-6" />} label="Home" active />
          <MobileNavItem icon={<Plus className="w-6 h-6" />} label="Add" />
          <MobileNavItem icon={<Wallet className="w-6 h-6" />} label="Balances" />
          <MobileNavItem icon={<User className="w-6 h-6" />} label="Profile" />
        </div>
      </nav>
    </div>
  );
};

// Quick Action Card Component
const QuickActionCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}> = ({ icon, title, description, color }) => (
  <button className="bg-white rounded-xl p-5 text-left shadow-soft hover:shadow-soft-lg transition-all duration-200 hover:-translate-y-0.5 group">
    <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-105 transition-transform`}>
      {icon}
    </div>
    <h3 className="font-semibold text-secondary-900 mb-1">{title}</h3>
    <p className="text-sm text-secondary-500">{description}</p>
  </button>
);

// Mobile Navigation Item Component
const MobileNavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}> = ({ icon, label, active }) => (
  <button className={`flex flex-col items-center gap-1 px-4 py-2 ${active ? 'text-primary-500' : 'text-secondary-400'}`}>
    {icon}
    <span className="text-xs font-medium">{label}</span>
  </button>
);

export default HomePage;
