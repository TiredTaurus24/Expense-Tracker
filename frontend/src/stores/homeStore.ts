import { create } from 'zustand';
import {
  Home,
  HomeWithMembership,
  Member,
  Expense,
  Balance,
  HomeCreate,
  HomeUpdate,
  MembershipCreate,
  ExpenseCreate,
  ExpenseUpdate,
  ExpenseStatus,
} from '@/types/home.types';
import { homeApi, membershipApi, expenseApi } from '@/services/homeService';

interface HomeState {
  // State
  homes: HomeWithMembership[];
  currentHome: HomeWithMembership | null;
  members: Member[];
  expenses: Expense[];
  balances: Balance[];
  isLoading: boolean;
  error: string | null;

  // Home actions
  fetchHomes: () => Promise<void>;
  fetchHome: (homeId: string) => Promise<void>;
  createHome: (data: HomeCreate) => Promise<Home>;
  updateHome: (homeId: string, data: HomeUpdate) => Promise<void>;
  deleteHome: (homeId: string) => Promise<void>;
  regenerateInviteCode: (homeId: string) => Promise<string>;
  setCurrentHome: (home: HomeWithMembership | null) => void;

  // Membership actions
  joinHome: (inviteCode: string) => Promise<Member>;
  fetchMembers: (homeId: string) => Promise<void>;
  updateMemberRole: (homeId: string, memberId: string, role: string) => Promise<void>;
  removeMember: (homeId: string, memberId: string) => Promise<void>;
  leaveHome: (homeId: string) => Promise<void>;

  // Expense actions
  fetchExpenses: (homeId: string, status?: ExpenseStatus) => Promise<void>;
  fetchExpense: (homeId: string, expenseId: string) => Promise<Expense>;
  createExpense: (homeId: string, data: ExpenseCreate) => Promise<Expense>;
  updateExpense: (homeId: string, expenseId: string, data: ExpenseUpdate) => Promise<void>;
  deleteExpense: (homeId: string, expenseId: string) => Promise<void>;
  settleSplit: (homeId: string, expenseId: string, splitId: string) => Promise<void>;

  // Balance actions
  fetchBalances: (homeId: string) => Promise<void>;

  // Utility
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  homes: [],
  currentHome: null,
  members: [],
  expenses: [],
  balances: [],
  isLoading: false,
  error: null,
};

export const useHomeStore = create<HomeState>((set, get) => ({
  ...initialState,

  // Home actions
  fetchHomes: async () => {
    set({ isLoading: true, error: null });
    try {
      const homes = await homeApi.getHomes();
      set({ homes, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  fetchHome: async (homeId: string) => {
    set({ isLoading: true, error: null });
    try {
      const home = await homeApi.getHome(homeId);
      set({ currentHome: home, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  createHome: async (data: HomeCreate) => {
    set({ isLoading: true, error: null });
    try {
      const home = await homeApi.createHome(data);
      // Refresh homes list
      const homes = await homeApi.getHomes();
      set({ homes, isLoading: false });
      return home;
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  updateHome: async (homeId: string, data: HomeUpdate) => {
    set({ isLoading: true, error: null });
    try {
      await homeApi.updateHome(homeId, data);
      // Refresh homes list
      const homes = await homeApi.getHomes();
      set({ homes, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  deleteHome: async (homeId: string) => {
    set({ isLoading: true, error: null });
    try {
      await homeApi.deleteHome(homeId);
      const homes = get().homes.filter((h) => h.id !== homeId);
      set({ homes, currentHome: null, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  regenerateInviteCode: async (homeId: string) => {
    set({ isLoading: true, error: null });
    try {
      const home = await homeApi.regenerateInviteCode(homeId);
      set({ isLoading: false });
      return home.invite_code;
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  setCurrentHome: (home: HomeWithMembership | null) => {
    set({ currentHome: home });
  },

  // Membership actions
  joinHome: async (inviteCode: string) => {
    set({ isLoading: true, error: null });
    try {
      const member = await membershipApi.joinHome({ invite_code: inviteCode });
      // Refresh homes list
      const homes = await homeApi.getHomes();
      set({ homes, isLoading: false });
      return member;
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  fetchMembers: async (homeId: string) => {
    set({ isLoading: true, error: null });
    try {
      const members = await membershipApi.getMembers(homeId);
      set({ members, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  updateMemberRole: async (homeId: string, memberId: string, role: string) => {
    set({ isLoading: true, error: null });
    try {
      await membershipApi.updateMember(homeId, memberId, { role: role as any });
      // Refresh members
      const members = await membershipApi.getMembers(homeId);
      set({ members, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  removeMember: async (homeId: string, memberId: string) => {
    set({ isLoading: true, error: null });
    try {
      await membershipApi.removeMember(homeId, memberId);
      const members = get().members.filter((m) => m.id !== memberId);
      set({ members, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  leaveHome: async (homeId: string) => {
    set({ isLoading: true, error: null });
    try {
      await membershipApi.leaveHome(homeId);
      const homes = get().homes.filter((h) => h.id !== homeId);
      set({ homes, currentHome: null, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  // Expense actions
  fetchExpenses: async (homeId: string, status?: ExpenseStatus) => {
    set({ isLoading: true, error: null });
    try {
      const expenses = await expenseApi.getExpenses(homeId, { status });
      set({ expenses, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  fetchExpense: async (homeId: string, expenseId: string) => {
    set({ isLoading: true, error: null });
    try {
      const expense = await expenseApi.getExpense(homeId, expenseId);
      set({ isLoading: false });
      return expense;
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  createExpense: async (homeId: string, data: ExpenseCreate) => {
    set({ isLoading: true, error: null });
    try {
      const expense = await expenseApi.createExpense(homeId, data);
      // Refresh expenses
      const expenses = await expenseApi.getExpenses(homeId);
      set({ expenses, isLoading: false });
      return expense;
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  updateExpense: async (homeId: string, expenseId: string, data: ExpenseUpdate) => {
    set({ isLoading: true, error: null });
    try {
      await expenseApi.updateExpense(homeId, expenseId, data);
      // Refresh expenses
      const expenses = await expenseApi.getExpenses(homeId);
      set({ expenses, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  deleteExpense: async (homeId: string, expenseId: string) => {
    set({ isLoading: true, error: null });
    try {
      await expenseApi.deleteExpense(homeId, expenseId);
      const expenses = get().expenses.filter((e) => e.id !== expenseId);
      set({ expenses, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  settleSplit: async (homeId: string, expenseId: string, splitId: string) => {
    set({ isLoading: true, error: null });
    try {
      await expenseApi.settleSplit(homeId, expenseId, splitId);
      // Refresh expenses
      const expenses = await expenseApi.getExpenses(homeId);
      set({ expenses, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  // Balance actions
  fetchBalances: async (homeId: string) => {
    set({ isLoading: true, error: null });
    try {
      const balances = await expenseApi.getBalances(homeId);
      set({ balances, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  // Utility
  clearError: () => set({ error: null }),

  reset: () => set(initialState),
}));

export default useHomeStore;
