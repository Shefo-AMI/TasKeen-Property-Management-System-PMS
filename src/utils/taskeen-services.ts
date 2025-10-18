import { supabase } from './supabase/client';
import type {
  CustomerProfile,
  Subscription,
  Project,
  ProjectMember,
  Task,
  TimeEntry,
  ContactMessage,
} from './taskeen-types';

/**
 * Customer Profile Services
 */
export const profileService = {
  async getCurrent(): Promise<CustomerProfile | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('customer_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw error;
    return data;
  },

  async update(updates: Partial<CustomerProfile>): Promise<CustomerProfile> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('customer_profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async upgradeToPro(subscriptionId: string, provider: 'stripe' | 'paypal'): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const updates: Partial<CustomerProfile> = {
      plan_type: 'pro',
      subscription_status: 'active',
      subscription_id: subscriptionId,
    };

    if (provider === 'stripe') {
      updates.stripe_customer_id = subscriptionId;
    } else {
      updates.paypal_subscription_id = subscriptionId;
    }

    await this.update(updates);
  },
};

/**
 * Project Services
 */
export const projectService = {
  async getAll(userId: string): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        tasks:tasks(count),
        members:project_members(count)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(p => ({
      ...p,
      task_count: p.tasks?.[0]?.count || 0,
      member_count: p.members?.[0]?.count || 0,
    }));
  },

  async getById(id: string): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project> {
    const { data, error} = await supabase
      .from('projects')
      .insert([project])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Project>): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async archive(id: string): Promise<Project> {
    return this.update(id, { is_archived: true, status: 'archived' });
  },

  async unarchive(id: string): Promise<Project> {
    return this.update(id, { is_archived: false, status: 'active' });
  },
};

/**
 * Task Services
 */
export const taskService = {
  async getByProject(projectId: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('project_id', projectId)
      .order('position', { ascending: true });

    if (error) throw error;
    return data;
  },

  async create(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .insert([task])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Task>): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async updateStatus(id: string, status: 'todo' | 'in_progress' | 'done'): Promise<Task> {
    return this.update(id, { status });
  },

  async reorderTasks(tasks: { id: string; position: number }[]): Promise<void> {
    // Update positions for all tasks
    const updates = tasks.map(({ id, position }) =>
      supabase
        .from('tasks')
        .update({ position })
        .eq('id', id)
    );

    await Promise.all(updates);
  },
};

/**
 * Project Member Services
 */
export const memberService = {
  async getByProject(projectId: string): Promise<ProjectMember[]> {
    const { data, error } = await supabase
      .from('project_members')
      .select('*')
      .eq('project_id', projectId)
      .order('joined_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  async add(member: Omit<ProjectMember, 'id' | 'joined_at'>): Promise<ProjectMember> {
    const { data, error } = await supabase
      .from('project_members')
      .insert([member])
      .select()
      .single();

    if (error) {
      if (error.message.includes('limited to 5 team members')) {
        throw new Error('Free plan limited to 5 team members. Upgrade to Pro for unlimited members.');
      }
      throw error;
    }
    return data;
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase
      .from('project_members')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async updateRole(id: string, role: 'owner' | 'admin' | 'member' | 'viewer'): Promise<ProjectMember> {
    const { data, error } = await supabase
      .from('project_members')
      .update({ role })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

/**
 * Time Entry Services (Pro Feature)
 */
export const timeService = {
  async getByTask(taskId: string): Promise<TimeEntry[]> {
    const { data, error } = await supabase
      .from('task_time_entries')
      .select('*')
      .eq('task_id', taskId)
      .order('start_time', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getByProject(projectId: string): Promise<TimeEntry[]> {
    const { data, error } = await supabase
      .from('task_time_entries')
      .select(`
        *,
        task:tasks!inner(project_id)
      `)
      .eq('task.project_id', projectId)
      .order('start_time', { ascending: false });

    if (error) throw error;
    return data;
  },

  async start(taskId: string, userId: string, description?: string): Promise<TimeEntry> {
    const { data, error } = await supabase
      .from('task_time_entries')
      .insert([{
        task_id: taskId,
        user_id: userId,
        start_time: new Date().toISOString(),
        description,
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async stop(id: string): Promise<TimeEntry> {
    const endTime = new Date();
    
    // Get the entry to calculate duration
    const { data: entry } = await supabase
      .from('task_time_entries')
      .select('start_time')
      .eq('id', id)
      .single();

    if (!entry) throw new Error('Time entry not found');

    const startTime = new Date(entry.start_time);
    const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000);

    const { data, error } = await supabase
      .from('task_time_entries')
      .update({
        end_time: endTime.toISOString(),
        duration_minutes: durationMinutes,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('task_time_entries')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

/**
 * Subscription Services
 */
export const subscriptionService = {
  async getCurrent(userId: string): Promise<Subscription | null> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No subscription found
      throw error;
    }
    return data;
  },

  async create(subscription: Omit<Subscription, 'id' | 'created_at' | 'updated_at'>): Promise<Subscription> {
    const { data, error } = await supabase
      .from('subscriptions')
      .insert([subscription])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Subscription>): Promise<Subscription> {
    const { data, error } = await supabase
      .from('subscriptions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async cancel(id: string): Promise<Subscription> {
    return this.update(id, {
      status: 'cancelled',
      cancel_at_period_end: true,
    });
  },
};

/**
 * Contact Message Services
 */
export const contactService = {
  async submit(message: Omit<ContactMessage, 'id' | 'status' | 'created_at'>): Promise<ContactMessage> {
    const { data, error } = await supabase
      .from('taskeen_pms_messages')
      .insert([{ ...message, status: 'unread' }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getAll(): Promise<ContactMessage[]> {
    const { data, error } = await supabase
      .from('taskeen_pms_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async markAsRead(id: string): Promise<void> {
    const { error } = await supabase
      .from('taskeen_pms_messages')
      .update({ status: 'read' })
      .eq('id', id);

    if (error) throw error;
  },
};

/**
 * Admin Services
 */
export const adminService = {
  async getAllCustomers(): Promise<CustomerProfile[]> {
    const { data, error } = await supabase
      .from('customer_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getAllSubscriptions(): Promise<Subscription[]> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getStats() {
    const [customersData, subscriptionsData, projectsData] = await Promise.all([
      supabase.from('customer_profiles').select('plan_type'),
      supabase.from('subscriptions').select('status, amount'),
      supabase.from('projects').select('id'),
    ]);

    const totalCustomers = customersData.data?.length || 0;
    const freeUsers = customersData.data?.filter(c => c.plan_type === 'free').length || 0;
    const proUsers = customersData.data?.filter(c => c.plan_type === 'pro').length || 0;
    const activeSubscriptions = subscriptionsData.data?.filter(s => s.status === 'active').length || 0;
    const totalRevenue = subscriptionsData.data?.reduce((sum, s) => sum + (s.amount || 0), 0) || 0;
    const totalProjects = projectsData.data?.length || 0;

    return {
      totalCustomers,
      freeUsers,
      proUsers,
      activeSubscriptions,
      totalRevenue,
      totalProjects,
    };
  },
};
