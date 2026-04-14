import React, { useState, useEffect } from 'react';
import { Button, Card } from '@/components/common';
import { Member, ExpenseCreate, SplitType } from '@/types/home.types';
import { X, Plus, Minus } from 'lucide-react';

interface ExpenseFormProps {
  members: Member[];
  currentMemberId: string | null;
  currency: string;
  onSubmit: (data: ExpenseCreate) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({
  members,
  currentMemberId,
  currency,
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [splitType, setSplitType] = useState<SplitType>(SplitType.EQUAL);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [customSplits, setCustomSplits] = useState<Record<string, { amount: number; percentage: number; ratio: number }>>({});

  // Initialize all members as selected by default
  useEffect(() => {
    setSelectedMembers(members.map((m) => m.id));
    const initialSplits: Record<string, { amount: number; percentage: number; ratio: number }> = {};
    members.forEach((m) => {
      initialSplits[m.id] = { amount: 0, percentage: 0, ratio: 1 };
    });
    setCustomSplits(initialSplits);
  }, [members]);

  // Calculate split amounts for preview
  const calculateSplits = () => {
    const amount = parseFloat(totalAmount) || 0;
    const activeMembers = members.filter((m) => selectedMembers.includes(m.id));
    
    if (amount === 0 || activeMembers.length === 0) return [];

    switch (splitType) {
      case SplitType.EQUAL:
        const equalAmount = amount / activeMembers.length;
        return activeMembers.map((m) => ({
          membership_id: m.id,
          amount: Math.round(equalAmount * 100) / 100,
        }));

      case SplitType.PERCENTAGE:
        return activeMembers.map((m) => ({
          membership_id: m.id,
          amount: Math.round((amount * (customSplits[m.id]?.percentage || 0) / 100) * 100) / 100,
          percentage: customSplits[m.id]?.percentage || 0,
        }));

      case SplitType.EXACT:
        return activeMembers.map((m) => ({
          membership_id: m.id,
          amount: customSplits[m.id]?.amount || 0,
        }));

      case SplitType.RATIO:
        const totalRatio = activeMembers.reduce((sum, m) => sum + (customSplits[m.id]?.ratio || 0), 0);
        return activeMembers.map((m) => ({
          membership_id: m.id,
          amount: totalRatio > 0 ? Math.round((amount * (customSplits[m.id]?.ratio || 0) / totalRatio) * 100) / 100 : 0,
          ratio: customSplits[m.id]?.ratio || 0,
        }));

      default:
        return [];
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const splits = calculateSplits();
    
    onSubmit({
      title,
      description: description || undefined,
      total_amount: parseFloat(totalAmount),
      currency,
      split_type: splitType,
      splits: splitType !== SplitType.EQUAL ? splits : undefined,
    });
  };

  const toggleMember = (memberId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const updateCustomSplit = (memberId: string, field: 'amount' | 'percentage' | 'ratio', value: number) => {
    setCustomSplits((prev) => ({
      ...prev,
      [memberId]: {
        ...prev[memberId],
        [field]: value,
      },
    }));
  };

  const splits = calculateSplits();
  const totalSplit = splits.reduce((sum, s) => sum + s.amount, 0);
  const isValidAmount = Math.abs(totalSplit - parseFloat(totalAmount || '0')) < 0.01;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className="w-full max-w-2xl my-8">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-secondary-900">Add New Expense</h2>
            <button onClick={onCancel} className="p-2 hover:bg-secondary-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-secondary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., Groceries, Dinner, Rent"
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
                  placeholder="Add details about this expense"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Total Amount ({currency}) *
                </label>
                <input
                  type="number"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  className="w-full px-4 py-2 border border-secondary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
            </div>

            {/* Split Type */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Split Type
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {Object.values(SplitType).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSplitType(type)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                      splitType === type
                        ? 'bg-primary-500 text-white'
                        : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Member Selection */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Split Between
              </label>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {members.map((member) => {
                  const isSelected = selectedMembers.includes(member.id);
                  const split = splits.find((s) => s.membership_id === member.id);
                  
                  return (
                    <div
                      key={member.id}
                      className={`p-3 rounded-xl border-2 transition-colors ${
                        isSelected ? 'border-primary-500 bg-primary-50' : 'border-secondary-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleMember(member.id)}
                            className="w-4 h-4 text-primary-500 rounded"
                          />
                          <span className="font-medium text-secondary-900">
                            {member.user_name || member.user_email}
                          </span>
                          {member.id === currentMemberId && (
                            <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">
                              You
                            </span>
                          )}
                        </div>
                        
                        {isSelected && (
                          <div className="flex items-center gap-2">
                            {splitType === SplitType.PERCENTAGE && (
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  value={customSplits[member.id]?.percentage || 0}
                                  onChange={(e) => updateCustomSplit(member.id, 'percentage', parseFloat(e.target.value) || 0)}
                                  className="w-16 px-2 py-1 text-sm border border-secondary-200 rounded-lg"
                                  min="0"
                                  max="100"
                                />
                                <span className="text-sm text-secondary-500">%</span>
                              </div>
                            )}
                            
                            {splitType === SplitType.EXACT && (
                              <div className="flex items-center gap-1">
                                <span className="text-sm text-secondary-500">{currency}</span>
                                <input
                                  type="number"
                                  value={customSplits[member.id]?.amount || 0}
                                  onChange={(e) => updateCustomSplit(member.id, 'amount', parseFloat(e.target.value) || 0)}
                                  className="w-20 px-2 py-1 text-sm border border-secondary-200 rounded-lg"
                                  min="0"
                                  step="0.01"
                                />
                              </div>
                            )}
                            
                            {splitType === SplitType.RATIO && (
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  value={customSplits[member.id]?.ratio || 0}
                                  onChange={(e) => updateCustomSplit(member.id, 'ratio', parseInt(e.target.value) || 0)}
                                  className="w-16 px-2 py-1 text-sm border border-secondary-200 rounded-lg"
                                  min="0"
                                />
                                <span className="text-sm text-secondary-500">parts</span>
                              </div>
                            )}
                            
                            {splitType === SplitType.EQUAL && split && (
                              <span className="text-sm font-medium text-primary-600">
                                {currency} {split.amount.toFixed(2)}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Split Summary */}
            {parseFloat(totalAmount) > 0 && (
              <div className={`p-4 rounded-xl ${isValidAmount ? 'bg-green-50' : 'bg-amber-50'}`}>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Split:</span>
                  <span className={`font-bold ${isValidAmount ? 'text-green-600' : 'text-amber-600'}`}>
                    {currency} {totalSplit.toFixed(2)} / {currency} {parseFloat(totalAmount).toFixed(2)}
                  </span>
                </div>
                {!isValidAmount && splitType !== SplitType.EQUAL && (
                  <p className="text-xs text-amber-600 mt-1">
                    Split amounts don't match the total. Please adjust.
                  </p>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={onCancel}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                disabled={!title || !totalAmount || selectedMembers.length === 0 || !isValidAmount}
                className="flex-1"
              >
                Add Expense
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default ExpenseForm;
