import api from './api';
import {
  Home,
  HomeWithMembership,
  HomeCreate,
  HomeUpdate,
  Member,
  MembershipCreate,
  MembershipUpdate,
  Expense,
  ExpenseCreate,
  ExpenseUpdate,
  Balance,
  ExpenseStatus,
} from '@/types/home.types';

// Home API
export const homeApi = {
  // Get all homes for current user
  getHomes: async (): Promise<HomeWithMembership[]> => {
    const response = await api.get<HomeWithMembership[]>('/homes');
    return response.data;
  },

  // Get a single home
  getHome: async (homeId: string): Promise<HomeWithMembership> => {
    const response = await api.get<HomeWithMembership>(`/homes/${homeId}`);
    return response.data;
  },

  // Create a new home
  createHome: async (data: HomeCreate): Promise<Home> => {
    const response = await api.post<Home>('/homes', data);
    return response.data;
  },

  // Update a home
  updateHome: async (homeId: string, data: HomeUpdate): Promise<Home> => {
    const response = await api.patch<Home>(`/homes/${homeId}`, data);
    return response.data;
  },

  // Delete a home
  deleteHome: async (homeId: string): Promise<void> => {
    await api.delete(`/homes/${homeId}`);
  },

  // Regenerate invite code
  regenerateInviteCode: async (homeId: string): Promise<Home> => {
    const response = await api.post<Home>(`/homes/${homeId}/regenerate`);
    return response.data;
  },
};

// Membership API
export const membershipApi = {
  // Join a home
  joinHome: async (data: MembershipCreate): Promise<Member> => {
    const response = await api.post<Member>('/homes/join', data);
    return response.data;
  },

  // Get home members
  getMembers: async (homeId: string): Promise<Member[]> => {
    const response = await api.get<Member[]>(`/homes/${homeId}/members`);
    return response.data;
  },

  // Update member role
  updateMember: async (homeId: string, memberId: string, data: MembershipUpdate): Promise<Member> => {
    const response = await api.patch<Member>(`/homes/${homeId}/members/${memberId}`, data);
    return response.data;
  },

  // Remove member
  removeMember: async (homeId: string, memberId: string): Promise<void> => {
    await api.delete(`/homes/${homeId}/members/${memberId}`);
  },

  // Leave home
  leaveHome: async (homeId: string): Promise<void> => {
    await api.post(`/homes/${homeId}/leave`);
  },
};

// Expense API
export const expenseApi = {
  // Get home expenses
  getExpenses: async (
    homeId: string,
    params?: { status?: ExpenseStatus; limit?: number; offset?: number }
  ): Promise<Expense[]> => {
    const response = await api.get<Expense[]>(`/homes/${homeId}/expenses`, { params });
    return response.data;
  },

  // Get a single expense
  getExpense: async (homeId: string, expenseId: string): Promise<Expense> => {
    const response = await api.get<Expense>(`/homes/${homeId}/expenses/${expenseId}`);
    return response.data;
  },

  // Create an expense
  createExpense: async (homeId: string, data: ExpenseCreate): Promise<Expense> => {
    const response = await api.post<Expense>(`/homes/${homeId}/expenses`, data);
    return response.data;
  },

  // Update an expense
  updateExpense: async (homeId: string, expenseId: string, data: ExpenseUpdate): Promise<Expense> => {
    const response = await api.patch<Expense>(`/homes/${homeId}/expenses/${expenseId}`, data);
    return response.data;
  },

  // Delete an expense
  deleteExpense: async (homeId: string, expenseId: string): Promise<void> => {
    await api.delete(`/homes/${homeId}/expenses/${expenseId}`);
  },

  // Settle a split
  settleSplit: async (homeId: string, expenseId: string, splitId: string): Promise<void> => {
    await api.post(`/homes/${homeId}/expenses/${expenseId}/splits/${splitId}/settle`);
  },

  // Get balance summary
  getBalances: async (homeId: string): Promise<Balance[]> => {
    const response = await api.get<Balance[]>(`/homes/${homeId}/balances`);
    return response.data;
  },
};

export default {
  home: homeApi,
  membership: membershipApi,
  expense: expenseApi,
};
