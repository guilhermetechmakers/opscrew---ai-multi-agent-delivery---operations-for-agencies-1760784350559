import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  GitBranch, 
  Github, 
  Gitlab, 
  Code,
  CheckCircle,
  AlertCircle,
  Settings,
  Shield,
  Lock,
  Globe
} from "lucide-react";
import { cn } from '@/lib/utils';
import { useEnabledGitProviders } from '@/hooks/useGitProviders';

interface RepositorySetupStepProps {
  formData: {
    projectName: string;
    repositoryName: string;
    repositoryDescription: string;
    branchName: string;
  };
  onFormDataChange: (updates: Partial<RepositorySetupStepProps['formData']>) => void;
}

export function RepositorySetupStep({ formData, onFormDataChange }: RepositorySetupStepProps) {
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [isPrivate, setIsPrivate] = useState(true);
  const [enableWebhooks, setEnableWebhooks] = useState(true);
  const [enableBranchProtection, setEnableBranchProtection] = useState(true);
  const [enableIssues, setEnableIssues] = useState(true);
  const [enableWiki, setEnableWiki] = useState(false);

  const { data: gitProviders, isLoading: providersLoading } = useEnabledGitProviders();

  // Auto-generate repository name from project name
  useEffect(() => {
    if (formData.projectName && !formData.repositoryName) {
      const repoName = formData.projectName
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      onFormDataChange({ repositoryName: repoName });
    }
  }, [formData.projectName, formData.repositoryName, onFormDataChange]);

  const getProviderIcon = (providerType: string) => {
    switch (providerType) {
      case 'github': return <Github className="w-5 h-5" />;
      case 'gitlab': return <Gitlab className="w-5 h-5" />;
      case 'bitbucket': return <Code className="w-5 h-5" />;
      default: return <GitBranch className="w-5 h-5" />;
    }
  };

  const getProviderColor = (providerType: string) => {
    switch (providerType) {
      case 'github': return 'text-gray-900 dark:text-gray-100';
      case 'gitlab': return 'text-orange-500';
      case 'bitbucket': return 'text-blue-500';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Git Provider Selection */}
      <div className="space-y-4">
        <div>
          <Label className="text-base font-medium">Git Provider</Label>
          <p className="text-sm text-muted-foreground mt-1">
            Choose your Git hosting provider for repository management
          </p>
        </div>

        {providersLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {gitProviders?.map((provider) => (
              <Card
                key={provider.id}
                className={cn(
                  "cursor-pointer transition-all duration-200 hover:shadow-lg",
                  selectedProvider === provider.id && "ring-2 ring-primary shadow-lg"
                )}
                onClick={() => setSelectedProvider(provider.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={cn("p-2 rounded-lg bg-muted", getProviderColor(provider.provider_type))}>
                      {getProviderIcon(provider.provider_type)}
                    </div>
                    <div>
                      <h3 className="font-semibold">{provider.display_name}</h3>
                      <p className="text-sm text-muted-foreground">{provider.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mt-3">
                    {provider.supports_webhooks && (
                      <Badge variant="outline" className="text-xs">Webhooks</Badge>
                    )}
                    {provider.supports_branch_protection && (
                      <Badge variant="outline" className="text-xs">Branch Protection</Badge>
                    )}
                    {provider.supports_issues && (
                      <Badge variant="outline" className="text-xs">Issues</Badge>
                    )}
                    {provider.supports_pull_requests && (
                      <Badge variant="outline" className="text-xs">Pull Requests</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Repository Configuration */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Repository Configuration</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="projectName">Project Name</Label>
              <Input
                id="projectName"
                value={formData.projectName}
                onChange={(e) => onFormDataChange({ projectName: e.target.value })}
                placeholder="Enter project name"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="repositoryName">Repository Name</Label>
              <Input
                id="repositoryName"
                value={formData.repositoryName}
                onChange={(e) => onFormDataChange({ repositoryName: e.target.value })}
                placeholder="Enter repository name"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Repository URL: {selectedProvider ? 'https://' : ''}{selectedProvider ? 'provider.com' : 'provider'}/{formData.repositoryName || 'repository-name'}
              </p>
            </div>

            <div>
              <Label htmlFor="branchName">Default Branch</Label>
              <Input
                id="branchName"
                value={formData.branchName}
                onChange={(e) => onFormDataChange({ branchName: e.target.value })}
                placeholder="main"
                className="mt-1"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="repositoryDescription">Description</Label>
              <Textarea
                id="repositoryDescription"
                value={formData.repositoryDescription}
                onChange={(e) => onFormDataChange({ repositoryDescription: e.target.value })}
                placeholder="Enter repository description"
                className="mt-1"
                rows={3}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Private Repository</Label>
                  <p className="text-sm text-muted-foreground">
                    Keep your code private and secure
                  </p>
                </div>
                <Switch
                  checked={isPrivate}
                  onCheckedChange={setIsPrivate}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Webhooks</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically trigger deployments
                  </p>
                </div>
                <Switch
                  checked={enableWebhooks}
                  onCheckedChange={setEnableWebhooks}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Settings */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-4">Advanced Settings</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Security & Protection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Branch Protection</Label>
                  <p className="text-sm text-muted-foreground">
                    Require pull request reviews
                  </p>
                </div>
                <Switch
                  checked={enableBranchProtection}
                  onCheckedChange={setEnableBranchProtection}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Project Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Issues</Label>
                  <p className="text-sm text-muted-foreground">
                    Track bugs and feature requests
                  </p>
                </div>
                <Switch
                  checked={enableIssues}
                  onCheckedChange={setEnableIssues}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Wiki</Label>
                  <p className="text-sm text-muted-foreground">
                    Project documentation
                  </p>
                </div>
                <Switch
                  checked={enableWiki}
                  onCheckedChange={setEnableWiki}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Validation */}
      {formData.projectName && formData.repositoryName && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Repository will be created as <strong>{isPrivate ? 'private' : 'public'}</strong> with 
            {enableWebhooks && ' webhooks enabled'}, 
            {enableBranchProtection && ' branch protection enabled'}, and
            {enableIssues && ' issues enabled'}.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
