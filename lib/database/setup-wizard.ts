import { testEnumsCreated, ENUM_SETUP_SQL, SETUP_INSTRUCTIONS } from './setup-enums';

export interface SetupStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  action?: () => Promise<boolean>;
  manualInstructions?: string;
  sql?: string;
}

export class DatabaseSetupWizard {
  private steps: SetupStep[] = [
    {
      id: 'enums',
      title: 'Create Database ENUMs',
      description: 'Create all required ENUM types for data validation',
      status: 'pending',
      action: testEnumsCreated,
      manualInstructions: SETUP_INSTRUCTIONS,
      sql: ENUM_SETUP_SQL,
    },
    {
      id: 'tables',
      title: 'Create Database Tables',
      description: 'Create all core tables for the application',
      status: 'pending',
    },
    {
      id: 'rls',
      title: 'Setup Row Level Security',
      description: 'Configure security policies for role-based access',
      status: 'pending',
    },
    {
      id: 'functions',
      title: 'Create Database Functions',
      description: 'Create helper functions and stored procedures',
      status: 'pending',
    },
    {
      id: 'seed',
      title: 'Seed Initial Data',
      description: 'Insert default categories, locations, and system data',
      status: 'pending',
    },
  ];

  // Get all setup steps
  getSteps(): SetupStep[] {
    return [...this.steps];
  }

  // Get current step (first non-completed step)
  getCurrentStep(): SetupStep | null {
    return this.steps.find(step => step.status !== 'completed') || null;
  }

  // Test a specific step
  async testStep(stepId: string): Promise<boolean> {
    const step = this.steps.find(s => s.id === stepId);
    if (!step || !step.action) {
      return false;
    }

    try {
      step.status = 'in_progress';
      const result = await step.action();
      step.status = result ? 'completed' : 'failed';
      return result;
    } catch (error) {
      console.error(`Error testing step ${stepId}:`, error);
      step.status = 'failed';
      return false;
    }
  }

  // Run all tests to check current status
  async checkAllSteps(): Promise<{
    completed: number;
    total: number;
    currentStep: SetupStep | null;
    allCompleted: boolean;
  }> {
    let completed = 0;
    
    for (const step of this.steps) {
      if (step.action) {
        const result = await this.testStep(step.id);
        if (result) {
          completed++;
        }
      }
    }

    const currentStep = this.getCurrentStep();
    const allCompleted = completed === this.steps.filter(s => s.action).length;

    return {
      completed,
      total: this.steps.length,
      currentStep,
      allCompleted,
    };
  }

  // Get setup progress as percentage
  getProgress(): number {
    const completedSteps = this.steps.filter(s => s.status === 'completed').length;
    return Math.round((completedSteps / this.steps.length) * 100);
  }

  // Get step by ID
  getStep(stepId: string): SetupStep | null {
    return this.steps.find(s => s.id === stepId) || null;
  }

  // Mark step as completed manually
  markStepCompleted(stepId: string): void {
    const step = this.steps.find(s => s.id === stepId);
    if (step) {
      step.status = 'completed';
    }
  }

  // Reset all steps
  reset(): void {
    this.steps.forEach(step => {
      step.status = 'pending';
    });
  }

  // Get setup summary
  getSummary(): {
    totalSteps: number;
    completedSteps: number;
    pendingSteps: number;
    failedSteps: number;
    progress: number;
    nextAction: string;
  } {
    const totalSteps = this.steps.length;
    const completedSteps = this.steps.filter(s => s.status === 'completed').length;
    const pendingSteps = this.steps.filter(s => s.status === 'pending').length;
    const failedSteps = this.steps.filter(s => s.status === 'failed').length;
    const progress = this.getProgress();
    
    let nextAction = 'Setup completed!';
    const currentStep = this.getCurrentStep();
    if (currentStep) {
      nextAction = `Next: ${currentStep.title}`;
    }

    return {
      totalSteps,
      completedSteps,
      pendingSteps,
      failedSteps,
      progress,
      nextAction,
    };
  }
}

// Export singleton instance
export const setupWizard = new DatabaseSetupWizard();