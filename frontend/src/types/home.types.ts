// Enums
export enum MemberRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
}

export enum MembershipStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  SUSPENDED = 'suspended',
}

export enum SplitType {
  EQUAL = 'equal',
  PERCENTAGE = 'percentage',
  EXACT = 'exact',
  RATIO = 'ratio',
}

export enum ExpenseStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  SETTLED = 'settled',
  CANCELLED = 'cancelled',
}

// Home Types
export interface Home {
  id: string;
  name: string;
  description: string | null;
  invite_code: string;
  currency: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface HomeWithMembership extends Home {
  user_role: MemberRole;
  user_status: MembershipStatus;
  member_count: number;
}

export interface HomeCreate {
  name: string;
  description?: string;
  currency?: string;
}

export interface HomeUpdate {
  name?: string;
  description?: string;
  currency?: string;
  is_active?: boolean;
}

// Membership Types
export interface Member {
  id: string;
  user_id: string;
  home_id: string;
  role: MemberRole;
  status: MembershipStatus;
  nickname: string | null;
  joined_at: string;
  user_email?: string;
  user_name?: string;
  user_avatar?: string;
}

export interface MembershipCreate {
  invite_code: string;
}

export interface MembershipUpdate {
  role?: MemberRole;
  status?: MembershipStatus;
  nickname?: string;
}

// Expense Types
export interface ExpenseSplit {
  id: string;
  expense_id: string;
  membership_id: string;
  amount: number;
  percentage: number | null;
  ratio: number | null;
  is_settled: boolean;
  settled_at: string | null;
}

export interface Expense {
  id: string;
  home_id: string;
  paid_by_membership_id: string | null;
  title: string;
  description: string | null;
  total_amount: number;
  currency: string;
  split_type: SplitType;
  status: ExpenseStatus;
  expense_date: string;
  settled_at: string | null;
  receipt_url: string | null;
  created_at: string;
  updated_at: string;
  splits: ExpenseSplit[];
}

export interface ExpenseSplitCreate {
  membership_id: string;
  amount?: number;
  percentage?: number;
  ratio?: number;
}

export interface ExpenseCreate {
  title: string;
  description?: string;
  total_amount: number;
  currency?: string;
  split_type?: SplitType;
  expense_date?: string;
  receipt_url?: string;
  splits?: ExpenseSplitCreate[];
}

export interface ExpenseUpdate {
  title?: string;
  description?: string;
  total_amount?: number;
  currency?: string;
  split_type?: SplitType;
  status?: ExpenseStatus;
  expense_date?: string;
  receipt_url?: string;
}

// Balance Types
export interface Balance {
  membership_id: string;
  user_name: string | null;
  total_paid: number;
  total_owed: number;
  balance: number; // positive = owed money, negative = owes money
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}
