import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Clock,
  FileText,
  Settings,
  LogOut,
  Plus,
  Crown,
  Menu,
  X,
  Sun,
  Moon,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { profileService, projectService } from '../utils/taskeen-services';
import type { CustomerProfile, Project } from '../utils/taskeen-types';
import { FREE_PLAN, PRO_PLAN, hasFeatureAccess } from '../utils/taskeen-types';

interface TaskeenCustomerDashboardProps {
  onLogout: () => void;
}

export function TaskeenCustomerDashboard({ onLogout }: TaskeenCustomerDashboardProps) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const [profileData, projectsData] = await Promise.all([
        profileService.getCurrent(),
        loadProjects(),
      ]);

      if (profileData) {
        setProfile(profileData);
      }
      setProjects(projectsData);
    } catch (error: any) {
      console.error('Error loading dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadProjects = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      
      const data = await projectService.getAll(user.id);
      return data;
    } catch (error) {
      console.error('Error loading projects:', error);
      return [];
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleUpgradeToPro = () => {
    navigate('/pricing');
  };

  const currentPlan = profile?.plan_type === 'pro' ? PRO_PLAN : FREE_PLAN;
  const activeProjects = projects.filter(p => !p.is_archived);
  const canAddProject = profile ? activeProjects.length < (currentPlan.maxProjects || Infinity) : false;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex ${darkMode ? 'dark' : ''}`}>
      {/* Sidebar - Desktop */}
      <aside className={`hidden lg:flex flex-col w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center">
              <span className="text-white font-bold text-xl">T</span>
            </div>
            <span className="text-xl font-bold dark:text-white">Taskeen</span>
          </div>
          {profile && (
            <div className="mt-4">
              <Badge className={`${profile.plan_type === 'pro' ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white' : 'bg-gray-200 text-gray-700'}`}>
                {profile.plan_type === 'pro' ? (
                  <><Crown className="h-3 w-3 mr-1" /> Pro Plan</>
                ) : (
                  'Free Plan'
                )}
              </Badge>
            </div>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Button
            variant={activeTab === 'dashboard' ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard className="h-4 w-4 mr-2" />
            Dashboard
          </Button>

          <Button
            variant={activeTab === 'projects' ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setActiveTab('projects')}
          >
            <FolderKanban className="h-4 w-4 mr-2" />
            Projects
          </Button>

          {profile?.plan_type === 'pro' && (
            <>
              <Button
                variant={activeTab === 'kanban' ? 'secondary' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveTab('kanban')}
              >
                <Zap className="h-4 w-4 mr-2" />
                Kanban Board
                <Badge className="ml-auto bg-gradient-to-r from-purple-600 to-cyan-500 text-white text-xs">Pro</Badge>
              </Button>

              <Button
                variant={activeTab === 'time' ? 'secondary' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveTab('time')}
              >
                <Clock className="h-4 w-4 mr-2" />
                Time Tracking
                <Badge className="ml-auto bg-gradient-to-r from-purple-600 to-cyan-500 text-white text-xs">Pro</Badge>
              </Button>

              <Button
                variant={activeTab === 'reports' ? 'secondary' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveTab('reports')}
              >
                <FileText className="h-4 w-4 mr-2" />
                Reports
                <Badge className="ml-auto bg-gradient-to-r from-purple-600 to-cyan-500 text-white text-xs">Pro</Badge>
              </Button>
            </>
          )}

          <Button
            variant={activeTab === 'settings' ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setActiveTab('settings')}
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </nav>

        {profile?.plan_type === 'free' && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <Card className="bg-gradient-to-br from-purple-600 to-cyan-500 text-white border-0">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Crown className="h-5 w-5" />
                  <span className="font-semibold">Upgrade to Pro</span>
                </div>
                <p className="text-sm text-white/90">
                  Unlock unlimited projects, time tracking, and more
                </p>
                <Button
                  className="w-full bg-white text-purple-600 hover:bg-gray-100"
                  onClick={handleUpgradeToPro}
                >
                  Upgrade Now - $15/mo
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center text-white font-semibold">
              {profile?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium dark:text-white truncate">{profile?.full_name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{profile?.email}</p>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={onLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen bg-gray-50 dark:bg-gray-800">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center">
              <span className="text-white font-bold">T</span>
            </div>
            <span className="font-bold dark:text-white">Taskeen</span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleDarkMode}
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </header>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4">
            <nav className="space-y-2">
              <Button
                variant={activeTab === 'dashboard' ? 'secondary' : 'ghost'}
                className="w-full justify-start"
                onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}
              >
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Dashboard
              </Button>

              <Button
                variant={activeTab === 'projects' ? 'secondary' : 'ghost'}
                className="w-full justify-start"
                onClick={() => { setActiveTab('projects'); setMobileMenuOpen(false); }}
              >
                <FolderKanban className="h-4 w-4 mr-2" />
                Projects
              </Button>

              {profile?.plan_type === 'pro' && (
                <>
                  <Button
                    variant={activeTab === 'kanban' ? 'secondary' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => { setActiveTab('kanban'); setMobileMenuOpen(false); }}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Kanban Board
                  </Button>

                  <Button
                    variant={activeTab === 'time' ? 'secondary' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => { setActiveTab('time'); setMobileMenuOpen(false); }}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Time Tracking
                  </Button>

                  <Button
                    variant={activeTab === 'reports' ? 'secondary' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => { setActiveTab('reports'); setMobileMenuOpen(false); }}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Reports
                  </Button>
                </>
              )}

              <Button
                variant={activeTab === 'settings' ? 'secondary' : 'ghost'}
                className="w-full justify-start"
                onClick={() => { setActiveTab('settings'); setMobileMenuOpen(false); }}
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </nav>
          </div>
        )}

        {/* Desktop Header */}
        <header className="hidden lg:flex bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 items-center justify-between">
          <h1 className="text-2xl font-bold dark:text-white">
            {activeTab === 'dashboard' && 'Dashboard Overview'}
            {activeTab === 'projects' && 'My Projects'}
            {activeTab === 'kanban' && 'Kanban Board'}
            {activeTab === 'time' && 'Time Tracking'}
            {activeTab === 'reports' && 'Reports & Analytics'}
            {activeTab === 'settings' && 'Settings'}
          </h1>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleDarkMode}
              className="rounded-full"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {activeTab === 'dashboard' && (
            <DashboardOverview
              profile={profile}
              projects={projects}
              onCreateProject={() => setActiveTab('projects')}
            />
          )}

          {activeTab === 'projects' && (
            <ProjectsList
              projects={projects}
              profile={profile}
              canAddProject={canAddProject}
              onRefresh={loadDashboardData}
            />
          )}

          {activeTab === 'kanban' && profile?.plan_type === 'pro' && (
            <KanbanBoard projects={projects} />
          )}

          {activeTab === 'time' && profile?.plan_type === 'pro' && (
            <TimeTracking projects={projects} />
          )}

          {activeTab === 'reports' && profile?.plan_type === 'pro' && (
            <ReportsSection projects={projects} />
          )}

          {activeTab === 'settings' && (
            <SettingsPage profile={profile} onRefresh={loadDashboardData} />
          )}
        </main>
      </div>
    </div>
  );
}

// Dashboard Overview Component (placeholder - you'll expand this)
function DashboardOverview({ profile, projects, onCreateProject }: any) {
  const activeProjects = projects.filter((p: Project) => !p.is_archived);
  const completedProjects = projects.filter((p: Project) => p.status === 'completed');

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Active Projects</CardDescription>
            <CardTitle className="text-3xl">{activeProjects.length}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Completed Projects</CardDescription>
            <CardTitle className="text-3xl">{completedProjects.length}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Plan</CardDescription>
            <CardTitle className="text-xl">
              {profile?.plan_type === 'pro' ? (
                <span className="bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent">
                  Pro Plan
                </span>
              ) : (
                'Free Plan'
              )}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Recent Projects */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Projects</CardTitle>
          <CardDescription>Your most recently updated projects</CardDescription>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No projects yet</p>
              <Button onClick={onCreateProject}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Project
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.slice(0, 5).map((project: Project) => (
                <div key={project.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: project.color }}></div>
                    <div>
                      <p className="font-medium dark:text-white">{project.name}</p>
                      <p className="text-sm text-gray-500">{project.task_count || 0} tasks</p>
                    </div>
                  </div>
                  <Badge variant="outline">{project.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Placeholder components - You'll need to implement these fully
function ProjectsList({ projects, profile, canAddProject, onRefresh }: any) {
  return <div>Projects List - To be implemented with full CRUD</div>;
}

function KanbanBoard({ projects }: any) {
  return <div>Kanban Board - Pro Feature - To be implemented with drag & drop</div>;
}

function TimeTracking({ projects }: any) {
  return <div>Time Tracking - Pro Feature - To be implemented</div>;
}

function ReportsSection({ projects }: any) {
  return <div>Reports - Pro Feature - To be implemented with PDF/Word export</div>;
}

function SettingsPage({ profile, onRefresh }: any) {
  return <div>Settings - To be implemented with subscription management</div>;
}

// Import supabase for user fetch
import { supabase } from '../utils/supabase/client';
