import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  FileText, 
  MessageSquare, 
  CreditCard, 
  Settings, 
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  Upload,
  Plus,
  Filter,
  Search,
  Palette,
  Bell,
  Shield
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useClientPortalByProject } from '@/hooks/useClientPortal';
import { usePortalDocumentsByProject } from '@/hooks/usePortalDocuments';
import { usePortalThreadedComments } from '@/hooks/usePortalComments';
import { usePortalSettingsByProject } from '@/hooks/usePortalSettings';
import { DocumentCard } from '@/components/portal/DocumentCard';
import { CommentThread } from '@/components/portal/CommentThread';
import { BillingCard } from '@/components/portal/BillingCard';
import { ProjectTimeline } from '@/components/portal/ProjectTimeline';
import { PortalHeader } from '@/components/portal/PortalHeader';

export default function ClientPortal() {
  const { projectId } = useParams<{ projectId: string }>();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch portal data using custom hooks
  const { data: portal, isLoading: portalLoading } = useClientPortalByProject(projectId!);
  const { data: documents, isLoading: documentsLoading } = usePortalDocumentsByProject(projectId!);
  const { data: comments, isLoading: commentsLoading } = usePortalThreadedComments(projectId!);
  const { data: settings, isLoading: settingsLoading } = usePortalSettingsByProject(projectId!);

  if (portalLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="animate-pulse space-y-6 p-6">
          <div className="h-8 bg-secondary rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-secondary rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!portal) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
              <h2 className="text-xl font-semibold">Portal Not Found</h2>
              <p className="text-muted-foreground">
                The requested client portal could not be found or is not accessible.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredDocuments = documents?.filter(doc => 
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const filteredComments = comments?.filter(comment => 
    comment.content.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-background">
      <PortalHeader portal={portal} />
      
      <div className="container mx-auto px-6 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents and comments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Comment
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="comments">Comments</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Project Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="metric-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Project Progress</CardTitle>
                  <CheckCircle className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">75%</div>
                  <Progress value={75} className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-2">
                    3 of 4 milestones completed
                  </p>
                </CardContent>
              </Card>

              <Card className="metric-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Next Milestone</CardTitle>
                  <Calendar className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Dec 25</div>
                  <p className="text-xs text-muted-foreground">
                    Final delivery
                  </p>
                  <Badge variant="secondary" className="mt-2">
                    <Clock className="h-3 w-3 mr-1" />
                    5 days remaining
                  </Badge>
                </CardContent>
              </Card>

              <Card className="metric-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
                  <MessageSquare className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">
                    Comments this week
                  </p>
                  <Badge variant="outline" className="mt-2">
                    3 new today
                  </Badge>
                </CardContent>
              </Card>
            </div>

            {/* Project Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Project Timeline</CardTitle>
                <CardDescription>
                  Track project milestones and key deliverables
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProjectTimeline projectId={projectId!} />
              </CardContent>
            </Card>

            {/* Recent Documents */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Documents</CardTitle>
                <CardDescription>
                  Latest files and deliverables
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {documents?.slice(0, 6).map((document) => (
                    <DocumentCard key={document.id} document={document} />
                  ))}
                </div>
                {documents && documents.length > 6 && (
                  <div className="mt-4 text-center">
                    <Button variant="outline" onClick={() => setActiveTab('documents')}>
                      View All Documents
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Documents & Deliverables</CardTitle>
                    <CardDescription>
                      Access all project files, reports, and deliverables
                    </CardDescription>
                  </div>
                  <Button>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload File
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {documentsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="h-32 bg-secondary rounded-lg animate-pulse"></div>
                    ))}
                  </div>
                ) : filteredDocuments.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredDocuments.map((document) => (
                      <DocumentCard key={document.id} document={document} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Documents Yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Documents will appear here once they're uploaded to the project.
                    </p>
                    <Button>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload First Document
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Comments Tab */}
          <TabsContent value="comments" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Comments & Feedback</CardTitle>
                    <CardDescription>
                      Share feedback and communicate with the team
                    </CardDescription>
                  </div>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Comment
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {commentsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-24 bg-secondary rounded-lg animate-pulse"></div>
                    ))}
                  </div>
                ) : filteredComments.length > 0 ? (
                  <div className="space-y-4">
                    {filteredComments.map((comment) => (
                      <CommentThread key={comment.id} comment={comment} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Comments Yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start the conversation by adding your first comment.
                    </p>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Comment
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Billing & Renewals</CardTitle>
                <CardDescription>
                  View invoices, payment history, and manage renewals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BillingCard projectId={projectId!} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Portal Settings
                </CardTitle>
                <CardDescription>
                  Configure your client portal appearance and behavior
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      <Palette className="h-4 w-4" />
                      Appearance
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                        <span className="text-sm font-medium">Show Timeline</span>
                        <div className="h-6 w-11 bg-secondary rounded-full flex items-center justify-end px-1">
                          <div className="h-4 w-4 bg-primary rounded-full"></div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                        <span className="text-sm font-medium">Show Documents</span>
                        <div className="h-6 w-11 bg-primary rounded-full flex items-center justify-end px-1">
                          <div className="h-4 w-4 bg-background rounded-full"></div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                        <span className="text-sm font-medium">Show Comments</span>
                        <div className="h-6 w-11 bg-primary rounded-full flex items-center justify-end px-1">
                          <div className="h-4 w-4 bg-background rounded-full"></div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                        <span className="text-sm font-medium">Show Billing</span>
                        <div className="h-6 w-11 bg-primary rounded-full flex items-center justify-end px-1">
                          <div className="h-4 w-4 bg-background rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Permissions
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                        <span className="text-sm font-medium">Allow Comments</span>
                        <div className="h-6 w-11 bg-primary rounded-full flex items-center justify-end px-1">
                          <div className="h-4 w-4 bg-background rounded-full"></div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                        <span className="text-sm font-medium">Allow Downloads</span>
                        <div className="h-6 w-11 bg-primary rounded-full flex items-center justify-end px-1">
                          <div className="h-4 w-4 bg-background rounded-full"></div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                        <span className="text-sm font-medium">Require Approval</span>
                        <div className="h-6 w-11 bg-secondary rounded-full flex items-center justify-start px-1">
                          <div className="h-4 w-4 bg-muted-foreground rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Notifications
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                      <span className="text-sm font-medium">Auto Notify</span>
                      <div className="h-6 w-11 bg-primary rounded-full flex items-center justify-end px-1">
                        <div className="h-4 w-4 bg-background rounded-full"></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                      <span className="text-sm font-medium">Email Notifications</span>
                      <div className="h-6 w-11 bg-primary rounded-full flex items-center justify-end px-1">
                        <div className="h-4 w-4 bg-background rounded-full"></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                      <span className="text-sm font-medium">Slack Notifications</span>
                      <div className="h-6 w-11 bg-secondary rounded-full flex items-center justify-start px-1">
                        <div className="h-4 w-4 bg-muted-foreground rounded-full"></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                      <span className="text-sm font-medium">Webhook URL</span>
                      <Input 
                        placeholder="https://hooks.slack.com/..." 
                        className="w-48 text-xs"
                        disabled
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Portal Status</h4>
                      <p className="text-sm text-muted-foreground">
                        Last accessed: {portal.last_accessed_at ? 
                          new Date(portal.last_accessed_at).toLocaleDateString() : 
                          'Never'
                        }
                      </p>
                    </div>
                    <Badge 
                      variant={portal.is_active ? "default" : "secondary"}
                      className={portal.is_active ? "bg-green-500/10 text-green-500 border-green-500/20" : ""}
                    >
                      {portal.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
