import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useHomeStore } from '@/stores/homeStore';
import { Button, Card } from '@/components/common';
import { ExpenseForm } from '@/components/expense';
import {
  LogOut, User, Wallet, Plus, Home as HomeIcon, Settings,
  Users, Copy, Check, ArrowRight, Trash2, Edit
} from 'lucide-react';
import toast from 'react-hot-toast';
import { HomeWithMembership, MemberRole, ExpenseCreate } from '@/types/home.types';

// Quick Action Card Component
const QuickActionCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  onClick?: () => void;
}> = ({ icon, title, description, color, onClick }) => (
  <div 
    onClick={onClick}
    className={`${color} rounded-2xl p-6 text-white cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-lg`}
  >
    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
      {icon}
    </div>
    <h3 className="text-lg font-semibold mb-1">{title}</h3>
    <p className="text-white/80 text-sm">{description}</p>
  </div>
);

// Home Card Component
const HomeCard: React.FC<{
  home: HomeWithMembership;
  onSelect: () => void;
  onDelete: () => void;
}> = ({ home, onSelect, onDelete }) => {
  const roleColors = {
    [MemberRole.OWNER]: 'bg-primary-100 text-primary-700',
    [MemberRole.ADMIN]: 'bg-accent-100 text-accent-700',
    [MemberRole.MEMBER]: 'bg-secondary-100 text-secondary-700',
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
      <div onClick={onSelect} className="flex flex-col h-full">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
            <HomeIcon className="w-6 h-6 text-primary-600" />
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${roleColors[home.user_role]}`}>
            {home.user_role.charAt(0).toUpperCase() + home.user_role.slice(1)}
          </span>
        </div>
        
        <h3 className="text-lg font-semibold text-secondary-900 mb-1">{home.name}</h3>
        {home.description && (
          <p className="text-secondary-500 text-sm mb-4 line-clamp-2">{home.description}</p>
        )}
        
        <div className="mt-auto flex items-center justify-between pt-4 border-t border-secondary-100">
          <div className="flex items-center gap-2 text-secondary-500 text-sm">
            <Users className="w-4 h-4" />
            <span>{home.member_count} member{home.member_count !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-secondary-400">{home.currency}</span>
            {home.user_role === MemberRole.OWNER && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="p-1 text-secondary-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

// Create Home Modal
const CreateHomeModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, description: string, currency: string) => void;
  isLoading: boolean;
}> = ({ isOpen, onClose, onSubmit, isLoading }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [currency, setCurrency] = useState('USD');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(name, description, currency);
    setName('');
    setDescription('');
    setCurrency('USD');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-secondary-900 mb-4">Create a New Home</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Home Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-secondary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="e.g., Apartment 4B"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-secondary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="e.g., Monthly expenses for our apartment"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-4 py-2 border border-secondary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="INR">INR (₹)</option>
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              className="flex-1"
            >
              Create Home
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Join Home Modal
const JoinHomeModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (inviteCode: string) => void;
  isLoading: boolean;
}> = ({ isOpen, onClose, onSubmit, isLoading }) => {
  const [inviteCode, setInviteCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(inviteCode);
    setInviteCode('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-secondary-900 mb-4">Join a Home</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Invite Code
            </label>
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              className="w-full px-4 py-2 border border-secondary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-center tracking-wider"
              placeholder="XXXXXXXXXXXXXXXX"
              maxLength={16}
              required
            />
            <p className="text-xs text-secondary-500 mt-1">
              Enter the 16-character invite code shared by the home owner
            </p>
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              className="flex-1"
            >
              Join Home
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Home Detail View
const HomeDetailView: React.FC<{
  home: HomeWithMembership;
  onBack: () => void;
}> = ({ home, onBack }) => {
  const { fetchMembers, members, fetchExpenses, expenses, fetchBalances, balances,
          regenerateInviteCode, createExpense, settleSplit, isLoading } = useHomeStore();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'expenses' | 'members' | 'balances'>('expenses');
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    fetchMembers(home.id);
    fetchExpenses(home.id);
    fetchBalances(home.id);
  }, [home.id]);

  // Get current user's membership ID
  const currentMember = members.find((m) => m.user_id === user?.id);

  const handleCopyCode = async () => {
    try {
      const newCode = await regenerateInviteCode(home.id);
      await navigator.clipboard.writeText(newCode);
      setCopied(true);
      toast.success('Invite code copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy invite code');
    }
  };

  const handleCreateExpense = async (data: ExpenseCreate) => {
    try {
      await createExpense(home.id, data);
      setShowExpenseForm(false);
      toast.success('Expense added successfully!');
    } catch (error) {
      toast.error('Failed to create expense');
    }
  };

  const handleSettleSplit = async (expenseId: string, splitId: string) => {
    try {
      await settleSplit(home.id, expenseId, splitId);
      toast.success('Split settled!');
    } catch (error) {
      toast.error('Failed to settle split');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            ← Back
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-secondary-900">{home.name}</h2>
            {home.description && (
              <p className="text-secondary-500">{home.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-secondary-100 rounded-lg px-4 py-2 flex items-center gap-2">
            <span className="font-mono text-sm">{home.invite_code}</span>
            <button
              onClick={handleCopyCode}
              className="p-1 hover:bg-secondary-200 rounded transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-secondary-200">
        {(['expenses', 'members', 'balances'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-secondary-500 hover:text-secondary-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'expenses' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Expenses</h3>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setShowExpenseForm(true)}
            >
              Add Expense
            </Button>
          </div>
          {expenses.length === 0 ? (
            <Card className="p-8 text-center">
              <Wallet className="w-12 h-12 text-secondary-300 mx-auto mb-4" />
              <p className="text-secondary-500">No expenses yet. Add your first expense!</p>
            </Card>
          ) : (
            <div className="space-y-2">
              {expenses.map((expense) => {
                // Find user's split in this expense
                const userSplit = expense.splits.find((s) => s.membership_id === currentMember?.id);
                
                return (
                  <Card key={expense.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-secondary-900">{expense.title}</h4>
                        <p className="text-sm text-secondary-500">
                          {new Date(expense.expense_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-secondary-900">
                          {home.currency} {expense.total_amount.toFixed(2)}
                        </p>
                        <p className={`text-xs ${
                          expense.status === 'settled' ? 'text-green-500' : 'text-amber-500'
                        }`}>
                          {expense.status}
                        </p>
                      </div>
                    </div>
                    
                    {/* Show user's split if exists */}
                    {userSplit && !userSplit.is_settled && expense.status !== 'settled' && (
                      <div className="mt-3 pt-3 border-t border-secondary-100 flex items-center justify-between">
                        <div className="text-sm">
                          <span className="text-secondary-500">Your share: </span>
                          <span className="font-medium text-secondary-900">
                            {home.currency} {userSplit.amount.toFixed(2)}
                          </span>
                        </div>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleSettleSplit(expense.id, userSplit.id)}
                        >
                          Mark as Settled
                        </Button>
                      </div>
                    )}
                    
                    {userSplit?.is_settled && (
                      <div className="mt-3 pt-3 border-t border-secondary-100">
                        <span className="text-xs text-green-600 font-medium">
                          ✓ You've settled your share
                        </span>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'members' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Members ({members.length})</h3>
          <div className="grid gap-2">
            {members.map((member) => (
              <Card key={member.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-secondary-900">
                      {member.user_name || member.user_email}
                    </p>
                    <p className="text-sm text-secondary-500">{member.user_email}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  member.role === MemberRole.OWNER ? 'bg-primary-100 text-primary-700' :
                  member.role === MemberRole.ADMIN ? 'bg-accent-100 text-accent-700' :
                  'bg-secondary-100 text-secondary-700'
                }`}>
                  {member.role}
                </span>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'balances' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Balances</h3>
          {balances.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-secondary-500">No balance data available</p>
            </Card>
          ) : (
            <div className="grid gap-2">
              {balances.map((balance) => (
                <Card key={balance.membership_id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-primary-600" />
                    </div>
                    <p className="font-medium text-secondary-900">
                      {balance.user_name || 'Unknown'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      balance.balance > 0 ? 'text-green-600' : 
                      balance.balance < 0 ? 'text-red-600' : 'text-secondary-600'
                    }`}>
                      {balance.balance > 0 ? '+' : ''}{home.currency} {balance.balance.toFixed(2)}
                    </p>
                    <p className="text-xs text-secondary-500">
                      {balance.balance > 0 ? 'is owed' : balance.balance < 0 ? 'owes' : 'settled'}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Expense Form Modal */}
      {showExpenseForm && (
        <ExpenseForm
          members={members}
          currentMemberId={currentMember?.id || null}
          currency={home.currency}
          onSubmit={handleCreateExpense}
          onCancel={() => setShowExpenseForm(false)}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

// Main HomePage Component
const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { homes, fetchHomes, createHome, joinHome, deleteHome, isLoading, error } = useHomeStore();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedHome, setSelectedHome] = useState<HomeWithMembership | null>(null);

  useEffect(() => {
    fetchHomes();
  }, []);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleCreateHome = async (name: string, description: string, currency: string) => {
    try {
      await createHome({ name, description, currency });
      setShowCreateModal(false);
      toast.success('Home created successfully!');
    } catch (error) {
      toast.error('Failed to create home');
    }
  };

  const handleJoinHome = async (inviteCode: string) => {
    try {
      await joinHome(inviteCode);
      setShowJoinModal(false);
      toast.success('Successfully joined the home!');
    } catch (error) {
      toast.error('Failed to join home. Check the invite code.');
    }
  };

  const handleDeleteHome = async (homeId: string) => {
    if (window.confirm('Are you sure you want to delete this home? This action cannot be undone.')) {
      try {
        await deleteHome(homeId);
        toast.success('Home deleted successfully');
      } catch (error) {
        toast.error('Failed to delete home');
      }
    }
  };

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
        {selectedHome ? (
          <HomeDetailView home={selectedHome} onBack={() => setSelectedHome(null)} />
        ) : (
          <>
            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-secondary-900 mb-2">
                Welcome back, {user?.fullName?.split(' ')[0]}! 👋
              </h1>
              <p className="text-secondary-600">
                Manage your expense sharing groups
              </p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <QuickActionCard
                icon={<Plus className="w-6 h-6" />}
                title="Create Home"
                description="Start a new expense group"
                color="bg-primary-500"
                onClick={() => setShowCreateModal(true)}
              />
              <QuickActionCard
                icon={<HomeIcon className="w-6 h-6" />}
                title="Join Home"
                description="Use an invite code"
                color="bg-accent-500"
                onClick={() => setShowJoinModal(true)}
              />
            </div>

            {/* Homes List */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-secondary-900 mb-4">Your Homes</h2>
              {homes.length === 0 ? (
                <Card className="p-12 text-center">
                  <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <HomeIcon className="w-10 h-10 text-primary-500" />
                  </div>
                  <h3 className="text-xl font-bold text-secondary-900 mb-3">
                    No homes yet
                  </h3>
                  <p className="text-secondary-600 mb-6 max-w-md mx-auto">
                    Create a home to start tracking and splitting expenses with friends, family, or roommates.
                  </p>
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => setShowCreateModal(true)}
                    leftIcon={<Plus className="w-5 h-5" />}
                  >
                    Create Your First Home
                  </Button>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {homes.map((home) => (
                    <HomeCard
                      key={home.id}
                      home={home}
                      onSelect={() => setSelectedHome(home)}
                      onDelete={() => handleDeleteHome(home.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Modals */}
      <CreateHomeModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateHome}
        isLoading={isLoading}
      />
      <JoinHomeModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onSubmit={handleJoinHome}
        isLoading={isLoading}
      />
    </div>
  );
};

export default HomePage;
