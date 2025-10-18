import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  GitBranch, 
  Settings, 
  Palette, 
  FileText,
  Zap,
  Rocket,
  Shield,
  Globe,
  Database,
  Code,
  Server,
  Cloud,
  Monitor
} from "lucide-react";
import { useTemplates } from '@/hooks/useProjectProvisioningTemplates';
import { useRequests, useUpdateRequestStatus, useActiveRequests, useCreateRequest } from '@/hooks/useProjectProvisioningRequests';
import { useLogsByRequestId } from '@/hooks/useProjectProvisioningLogs';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Wizard step configuration
const WIZARD_STEPS = [
  {
    id: 'template',
    title: 'Stack Template',
    description: 'Choose your technology stack and template',
    icon: Code,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10'
  },
  {
    id: 'repository',
    title: 'Repository Setup',
    description: 'Configure Git repository and branch settings',
    icon: GitBranch,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10'
  },
  {
    id: 'environment',
    title: 'Environment & Secrets',
    description: 'Set up environment variables and secrets',
    icon: Settings,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10'
  },
  {
    id: 'infrastructure',
    title: 'Infrastructure',
    description: 'Configure deployment and hosting options',
    icon: Cloud,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10'
  },
  {
    id: 'portal',
    title: 'Client Portal',
    description: 'Customize client portal branding and settings',
    icon: Palette,
    color: 'text-pink-500',
    bgColor: 'bg-pink-500/10'
  },
  {
    id: 'review',
    title: 'Review & Deploy',
    description: 'Review configuration and start provisioning',
    icon: Rocket,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10'
  }
];

// Mock data for demonstration
const mockTemplates = [
  {
    id: '1',
    name: 'Next.js Full-Stack',
    description: 'Modern React app with Next.js, TypeScript, and Tailwind CSS',
    category: 'web',
    tech_stack: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Prisma', 'PostgreSQL'],
    infrastructure_provider: 'vercel',
    usage_count: 150,
    is_public: true
  },
  {
    id: '2',
    name: 'React Native Mobile',
    description: 'Cross-platform mobile app with React Native and Expo',
    category: 'mobile',
    tech_stack: ['React Native', 'Expo', 'TypeScript', 'NativeWind', 'Supabase'],
    infrastructure_provider: 'expo',
    usage_count: 89,
    is_public: true
  },
  {
    id: '3',
    name: 'Node.js API',
    description: 'RESTful API with Express.js, TypeScript, and MongoDB',
    category: 'api',
    tech_stack: ['Node.js', 'Express', 'TypeScript', 'MongoDB', 'JWT', 'Swagger'],
    infrastructure_provider: 'aws',
    usage_count: 67,
    is_public: true
  },
  {
    id: '4',
    name: 'AI-Powered App',
    description: 'Application with OpenAI integration and vector database',
    category: 'ai',
    tech_stack: ['Next.js', 'OpenAI', 'Pinecone', 'LangChain', 'TypeScript'],
    infrastructure_provider: 'vercel',
    usage_count: 45,
    is_public: true
  }
];

interface ProvisioningFormData {
  templateId: string | null;
  projectName: string;
  repositoryName: string;
  repositoryDescription: string;
  branchName: string;
  environmentVariables: Record<string, string>;
  secrets: Record<string, string>;
  infrastructureProvider: string;
  infrastructureConfig: Record<string, any>;
  portalBranding: {
    primaryColor: string;
    secondaryColor: string;
    logo: string;
    companyName: string;
  };
}

const initialFormData: ProvisioningFormData = {
  templateId: null,
  projectName: '',
  repositoryName: '',
  repositoryDescription: '',
  branchName: 'main',
  environmentVariables: {},
  secrets: {},
  infrastructureProvider: 'vercel',
  infrastructureConfig: {},
  portalBranding: {
    primaryColor: '#53B7FF',
    secondaryColor: '#2FE6A6',
    logo: '',
    companyName: ''
  }
};

export default function ProjectProvisioning() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');
  
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<ProvisioningFormData>(initialFormData);
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [provisioningRequestId, setProvisioningRequestId] = useState<string | null>(null);

  // Hooks
  const { data: templates, isLoading: templatesLoading } = useTemplates();
  const { data: activeRequests } = useActiveRequests();
  const createRequestMutation = useCreateRequest();
  const updateRequestStatusMutation = useUpdateRequestStatus();
  const { data: logs } = useLogsByRequestId(provisioningRequestId || '');

  // Use mock data if API fails
  const displayTemplates = templates || mockTemplates;

  // Check if there's an active provisioning request
  useEffect(() => {
    if (activeRequests && activeRequests.length > 0) {
      const activeRequest = activeRequests.find(req => req.project_id === projectId);
      if (activeRequest) {
        setProvisioningRequestId(activeRequest.id);
        setIsProvisioning(true);
        setCurrentStep(5); // Go to review step
      }
    }
  }, [activeRequests, projectId]);

  const handleNext = () => {
    if (currentStep < WIZARD_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFormDataChange = (updates: Partial<ProvisioningFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleStartProvisioning = async () => {
    if (!projectId) {
      toast.error('Project ID is required');
      return;
    }

    try {
      setIsProvisioning(true);
      
      // Create provisioning request
      const request = await createRequestMutation.mutateAsync({
        user_id: 'current-user-id', // This should come from auth context
        project_id: projectId,
        template_id: formData.templateId,
        request_config: {
          project_name: formData.projectName,
          repository_name: formData.repositoryName,
          repository_description: formData.repositoryDescription,
          branch_name: formData.branchName
        },
        repository_settings: {
          name: formData.repositoryName,
          description: formData.repositoryDescription,
          branch: formData.branchName,
          private: true
        },
        environment_settings: {
          variables: formData.environmentVariables,
          secrets: formData.secrets
        },
        infrastructure_settings: {
          provider: formData.infrastructureProvider,
          config: formData.infrastructureConfig
        },
        portal_settings: {
          branding: formData.portalBranding
        },
        status: 'pending'
      });

      setProvisioningRequestId(request.id);
      
      // Simulate provisioning process
      simulateProvisioningProcess(request.id);
      
      toast.success('Provisioning started successfully!');
    } catch (error) {
      console.error('Failed to start provisioning:', error);
      toast.error('Failed to start provisioning. Please try again.');
      setIsProvisioning(false);
    }
  };

  const simulateProvisioningProcess = async (requestId: string) => {
    const steps = [
      { progress: 20, status: 'in_progress', message: 'Creating repository...' },
      { progress: 40, status: 'in_progress', message: 'Setting up environment...' },
      { progress: 60, status: 'in_progress', message: 'Configuring infrastructure...' },
      { progress: 80, status: 'in_progress', message: 'Setting up client portal...' },
      { progress: 100, status: 'completed', message: 'Provisioning completed!' }
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      try {
        await updateRequestStatusMutation.mutateAsync({
          id: requestId,
          status: steps[i].status,
          progress: steps[i].progress
        });
      } catch (error) {
        console.error('Failed to update request status:', error);
      }
    }

    setIsProvisioning(false);
    toast.success('Project provisioning completed successfully!');
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <TemplateSelectionStep 
          templates={displayTemplates} 
          isLoading={templatesLoading}
          selectedTemplateId={formData.templateId}
          onTemplateSelect={(templateId) => handleFormDataChange({ templateId })}
        />;
      case 1:
        return <RepositorySetupStep 
          formData={formData}
          onFormDataChange={handleFormDataChange}
        />;
      case 2:
        return <EnvironmentSecretsStep 
          formData={formData}
          onFormDataChange={handleFormDataChange}
        />;
      case 3:
        return <InfrastructureStep 
          formData={formData}
          onFormDataChange={handleFormDataChange}
        />;
      case 4:
        return <ClientPortalStep 
          formData={formData}
          onFormDataChange={handleFormDataChange}
        />;
      case 5:
        return <ReviewDeployStep 
          formData={formData}
          isProvisioning={isProvisioning}
          logs={logs || []}
          onStartProvisioning={handleStartProvisioning}
        />;
      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return formData.templateId !== null;
      case 1:
        return formData.projectName.trim() !== '' && formData.repositoryName.trim() !== '';
      case 2:
        return true; // Environment step is optional
      case 3:
        return formData.infrastructureProvider !== '';
      case 4:
        return true; // Portal step is optional
      case 5:
        return !isProvisioning;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                Project Provisioning
              </h1>
              <p className="text-muted-foreground text-lg mt-2">
                Set up your project infrastructure, repositories, and client portal
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard/projects')}
              className="hover:bg-secondary/80"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Projects
            </Button>
          </div>
        </motion.div>

        {/* Progress Indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            {WIZARD_STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300",
                  index <= currentStep 
                    ? `${step.bgColor} border-current ${step.color}` 
                    : "bg-muted border-muted-foreground text-muted-foreground"
                )}>
                  {index < currentStep ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    (() => {
                      const IconComponent = step.icon;
                      return <IconComponent className="w-5 h-5" />;
                    })()
                  )}
                </div>
                {index < WIZARD_STEPS.length - 1 && (
                  <div className={cn(
                    "w-16 h-0.5 mx-2 transition-colors duration-300",
                    index < currentStep ? "bg-primary" : "bg-muted"
                  )} />
                )}
              </div>
            ))}
          </div>
          <Progress value={(currentStep / (WIZARD_STEPS.length - 1)) * 100} className="h-2" />
        </motion.div>

        {/* Step Content */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <Card className="min-h-[600px]">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center",
                  WIZARD_STEPS[currentStep].bgColor
                )}>
                  {(() => {
                    const IconComponent = WIZARD_STEPS[currentStep].icon;
                    return <IconComponent className={cn("w-6 h-6", WIZARD_STEPS[currentStep].color)} />;
                  })()}
                </div>
                <div>
                  <CardTitle className="text-2xl">{WIZARD_STEPS[currentStep].title}</CardTitle>
                  <CardDescription className="text-base">
                    {WIZARD_STEPS[currentStep].description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="wait">
                {renderStepContent()}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex items-center justify-between"
        >
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="hover:bg-secondary/80"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {WIZARD_STEPS.length}
            </span>
          </div>

          {currentStep < WIZARD_STEPS.length - 1 ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="btn-primary"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleStartProvisioning}
              disabled={!canProceed() || isProvisioning}
              className="btn-primary"
            >
              {isProvisioning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Provisioning...
                </>
              ) : (
                <>
                  <Rocket className="w-4 h-4 mr-2" />
                  Start Provisioning
                </>
              )}
            </Button>
          )}
        </motion.div>
      </div>
    </div>
  );
}

// Step Components (simplified for now)
function TemplateSelectionStep({ templates, isLoading, selectedTemplateId, onTemplateSelect }: any) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((template: any) => (
          <Card 
            key={template.id}
            className={cn(
              "cursor-pointer transition-all duration-200 hover:shadow-lg",
              selectedTemplateId === template.id && "ring-2 ring-primary"
            )}
            onClick={() => onTemplateSelect(template.id)}
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Code className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{template.name}</h3>
                  <p className="text-muted-foreground text-sm mt-1">{template.description}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {template.tech_stack.slice(0, 3).map((tech: string) => (
                      <Badge key={tech} variant="secondary" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                    {template.tech_stack.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{template.tech_stack.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function RepositorySetupStep({ formData, onFormDataChange }: any) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Project Name</label>
            <input
              type="text"
              value={formData.projectName}
              onChange={(e) => onFormDataChange({ projectName: e.target.value })}
              className="w-full mt-1 px-3 py-2 bg-secondary border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
              placeholder="Enter project name"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Repository Name</label>
            <input
              type="text"
              value={formData.repositoryName}
              onChange={(e) => onFormDataChange({ repositoryName: e.target.value })}
              className="w-full mt-1 px-3 py-2 bg-secondary border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
              placeholder="Enter repository name"
            />
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Repository Description</label>
            <textarea
              value={formData.repositoryDescription}
              onChange={(e) => onFormDataChange({ repositoryDescription: e.target.value })}
              className="w-full mt-1 px-3 py-2 bg-secondary border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
              placeholder="Enter repository description"
              rows={3}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Branch Name</label>
            <input
              type="text"
              value={formData.branchName}
              onChange={(e) => onFormDataChange({ branchName: e.target.value })}
              className="w-full mt-1 px-3 py-2 bg-secondary border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
              placeholder="main"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function EnvironmentSecretsStep({ formData, onFormDataChange }: any) {
  return (
    <div className="space-y-6">
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Environment variables and secrets will be securely stored and managed by your infrastructure provider.
        </AlertDescription>
      </Alert>
      <div className="text-center py-12">
        <Database className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Environment & Secrets Configuration</h3>
        <p className="text-muted-foreground">
          This step will be implemented with a full configuration interface.
        </p>
      </div>
    </div>
  );
}

function InfrastructureStep({ formData, onFormDataChange }: any) {
  return (
    <div className="space-y-6">
      <div className="text-center py-12">
        <Cloud className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Infrastructure Configuration</h3>
        <p className="text-muted-foreground">
          This step will be implemented with infrastructure provider selection and configuration.
        </p>
      </div>
    </div>
  );
}

function ClientPortalStep({ formData, onFormDataChange }: any) {
  return (
    <div className="space-y-6">
      <div className="text-center py-12">
        <Globe className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Client Portal Branding</h3>
        <p className="text-muted-foreground">
          This step will be implemented with portal customization options.
        </p>
      </div>
    </div>
  );
}

function ReviewDeployStep({ formData, isProvisioning, logs, onStartProvisioning }: any) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Configuration Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Project Name:</span>
              <span>{formData.projectName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Repository:</span>
              <span>{formData.repositoryName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Branch:</span>
              <span>{formData.branchName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Infrastructure:</span>
              <span>{formData.infrastructureProvider}</span>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Provisioning Status</h3>
          {isProvisioning ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-sm">Provisioning in progress...</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
          ) : (
            <div className="text-center py-8">
              <Rocket className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Ready to start provisioning</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
