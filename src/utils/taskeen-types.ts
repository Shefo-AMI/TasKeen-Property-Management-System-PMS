// Taskeen P.M.S. TypeScript Types

export type PlanType = 'free' | 'pro';
export type SubscriptionStatus = 'active' | 'inactive' | 'cancelled' | 'past_due' | 'trialing';
export type PaymentProvider = 'stripe' | 'paypal';
export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type ProjectStatus = 'active' | 'archived' | 'completed';
export type MemberRole = 'owner' | 'admin' | 'member' | 'viewer';

export interface CustomerProfile {
  id: string;
  email: string;
  full_name: string;
  company_name?: string;
  plan_type: PlanType;
  subscription_status: SubscriptionStatus;
  subscription_id?: string;
  stripe_customer_id?: string;
  paypal_subscription_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_type: PlanType;
  status: SubscriptionStatus;
  payment_provider?: PaymentProvider;
  external_subscription_id?: string;
  amount?: number;
  currency: string;
  billing_period?: 'monthly' | 'yearly';
  current_period_start?: string;
  current_period_end?: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  color?: string;
  start_date?: string;
  end_date?: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  task_count?: number;
  member_count?: number;
}

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  email: string;
  name: string;
  role: MemberRole;
  joined_at: string;
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority?: TaskPriority;
  assigned_to?: string;
  assigned_to_name?: string;
  due_date?: string;
  position: number;
  labels?: string[];
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface TimeEntry {
  id: string;
  task_id: string;
  user_id: string;
  start_time: string;
  end_time?: string;
  duration_minutes?: number;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface AdminRole {
  id: string;
  user_id: string;
  is_super_admin: boolean;
  created_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  created_at: string;
}

// Plan Features
export interface PlanFeatures {
  name: string;
  price: number;
  interval: string;
  features: string[];
  maxProjects: number | null; // null = unlimited
  maxTeamMembers: number | null; // null = unlimited
  hasTimeTracking: boolean;
  hasCustomReports: boolean;
  hasApiAccess: boolean;
  hasVisualEditor: boolean;
}

export const FREE_PLAN: PlanFeatures = {
  name: 'Free',
  price: 0,
  interval: 'forever',
  features: [
    'Basic Task Management',
    'Up to 3 Active Projects',
    'Up to 5 Team Members',
    'Basic Dashboard',
    'Task Assignment & Status Tracking'
  ],
  maxProjects: 3,
  maxTeamMembers: 5,
  hasTimeTracking: false,
  hasCustomReports: false,
  hasApiAccess: false,
  hasVisualEditor: false,
};

export const PRO_PLAN: PlanFeatures = {
  name: 'Pro',
  price: 15,
  interval: 'month',
  features: [
    'Visual Kanban Board',
    'Unlimited Projects',
    'Unlimited Team Members',
    'Time Tracking',
    'Custom Reports & Export (PDF, Word)',
    'API/Webhook Access',
    'Priority Support'
  ],
  maxProjects: null,
  maxTeamMembers: null,
  hasTimeTracking: true,
  hasCustomReports: true,
  hasApiAccess: true,
  hasVisualEditor: true,
};

// Helper function to check feature access
export function hasFeatureAccess(profile: CustomerProfile, feature: keyof PlanFeatures): boolean {
  const plan = profile.plan_type === 'pro' ? PRO_PLAN : FREE_PLAN;
  return plan[feature] as boolean;
}

export function canAddProject(profile: CustomerProfile, currentCount: number): boolean {
  const plan = profile.plan_type === 'pro' ? PRO_PLAN : FREE_PLAN;
  if (plan.maxProjects === null) return true;
  return currentCount < plan.maxProjects;
}

export function canAddTeamMember(profile: CustomerProfile, currentCount: number): boolean {
  const plan = profile.plan_type === 'pro' ? PRO_PLAN : FREE_PLAN;
  if (plan.maxTeamMembers === null) return true;
  return currentCount < plan.maxTeamMembers;
}
