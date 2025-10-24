import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Building2, Users, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { registerAllAlzahiUsers } from '../utils/register-alzahi-users';
import { ALZAHI_COMPANY, ALZAHI_USERS, ALZAHI_PROPERTIES } from '../utils/alzahi-company-setup';

interface AlzahiSetupWizardProps {
  onComplete: () => void;
  onSkip?: () => void;
}

export function AlzahiSetupWizard({ onComplete, onSkip }: AlzahiSetupWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [setupResults, setSetupResults] = useState<any>(null);

  const steps = [
    { title: 'Welcome', icon: Building2 },
    { title: 'Company Info', icon: Building2 },
    { title: 'Create Users', icon: Users },
    { title: 'Setup Properties', icon: Building2 },
    { title: 'Complete', icon: CheckCircle },
  ];

  const handleCreateUsers = async () => {
    setIsProcessing(true);
    try {
      toast.info('Creating ALZAHI user accounts...');
      const results = await registerAllAlzahiUsers();
      setSetupResults(results);
      
      const successCount = results.filter((r: any) => r.success).length;
      if (successCount > 0) {
        toast.success(`Successfully created ${successCount} user accounts!`);
        setCurrentStep(3);
      } else {
        toast.error('Failed to create user accounts. They may already exist.');
      }
    } catch (error: any) {
      toast.error('Error creating users: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <img 
                src={ALZAHI_COMPANY.logo} 
                alt={ALZAHI_COMPANY.name}
                className="w-24 h-24 mx-auto mb-4 rounded-lg shadow-lg object-cover"
              />
              <h2 className="text-2xl font-bold mb-2">Welcome to TasKeen P.M.S</h2>
              <p className="text-muted-foreground">
                Let's set up your ALZAHI Property Management account
              </p>
            </div>
            <Button onClick={() => setCurrentStep(1)} className="w-full" size="lg">
              Get Started
            </Button>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Company Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between p-3 bg-muted rounded-lg">
                <span className="font-medium">Company Name:</span>
                <span className="text-right">{ALZAHI_COMPANY.name}</span>
              </div>
              <div className="flex justify-between p-3 bg-muted rounded-lg">
                <span className="font-medium">Address:</span>
                <span className="text-right text-sm">{ALZAHI_COMPANY.address.fullAddress}</span>
              </div>
              <div className="flex justify-between p-3 bg-muted rounded-lg">
                <span className="font-medium">Total Properties:</span>
                <span>{ALZAHI_PROPERTIES.length}</span>
              </div>
              <div className="flex justify-between p-3 bg-muted rounded-lg">
                <span className="font-medium">Total Units:</span>
                <span>{ALZAHI_PROPERTIES.reduce((sum, p) => sum + p.totalUnits, 0)}</span>
              </div>
            </div>
            <Button onClick={() => setCurrentStep(2)} className="w-full">
              Continue
            </Button>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Create User Accounts</h3>
            <p className="text-muted-foreground">
              We'll create {ALZAHI_USERS.length} user accounts for your team:
            </p>
            <div className="space-y-2">
              {ALZAHI_USERS.map((user, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">{user.fullName}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <Badge variant={user.role === 'company_admin' ? 'default' : 'secondary'}>
                    {user.role === 'company_admin' ? 'Manager' : 'Maintenance'}
                  </Badge>
                </div>
              ))}
            </div>
            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm">
                <strong>Note:</strong> All users will use password: <code className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">al-zahi2012</code>
              </p>
            </div>
            <Button 
              onClick={handleCreateUsers} 
              className="w-full" 
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating Accounts...
                </>
              ) : (
                'Create User Accounts'
              )}
            </Button>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Setup Complete!</h3>
            
            {setupResults && (
              <div className="space-y-2">
                <p className="font-medium">User Account Status:</p>
                {setupResults.map((result: any, index: number) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                    {result.success ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                    )}
                    <span className="text-sm">{result.email}</span>
                    <Badge variant={result.success ? 'default' : 'secondary'} className="ml-auto">
                      {result.success ? 'Created' : 'Exists'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}

            <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border border-green-200 dark:border-green-800 space-y-2">
              <p className="font-medium text-green-800 dark:text-green-200">Properties Added:</p>
              {ALZAHI_PROPERTIES.map((prop, index) => (
                <div key={index} className="text-sm text-green-700 dark:text-green-300">
                  • {prop.name} - {prop.totalUnits} units
                </div>
              ))}
            </div>

            <div className="space-y-2 border-t pt-4">
              <p className="font-medium">Quick Login Credentials:</p>
              <div className="text-sm space-y-1 bg-muted p-3 rounded">
                <p><strong>Manager:</strong> nour@al-zahi.ae / al-zahi2012</p>
                <p><strong>Manager:</strong> mawia@al-zahi.ae / al-zahi2012</p>
                <p><strong>Maintenance:</strong> tareq@al-zahi.ae / al-zahi2012</p>
                <p><strong>Maintenance:</strong> ayham@al-zahi.ae / al-zahi2012</p>
              </div>
            </div>

            <Button onClick={onComplete} className="w-full" size="lg">
              Go to Login
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  index <= currentStep ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}>
                  {index < currentStep ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <step.icon className="h-4 w-4" />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-1 mx-1 ${
                    index < currentStep ? 'bg-primary' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <Progress value={(currentStep / (steps.length - 1)) * 100} className="mb-2" />
          <CardTitle>ALZAHI Property Management Setup</CardTitle>
          <CardDescription>
            Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
          {onSkip && currentStep === 0 && (
            <Button variant="ghost" onClick={onSkip} className="w-full mt-2">
              Skip Setup
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
