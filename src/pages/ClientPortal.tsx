import { useState, useEffect } from 'react';
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
  Shield,
  TrendingUp,
  Users,
  Activity,
  Zap,
  Star,
  ArrowRight,
  Sparkles,
  Target,
  BarChart3,
  PieChart,
  LineChart,
  X
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
  const [isScrolled, setIsScrolled] = useState(false);
  const [showParticles, setShowParticles] = useState(true);

  // Fetch portal data using custom hooks
  const { data: portal, isLoading: portalLoading } = useClientPortalByProject(projectId!);
  const { data: documents, isLoading: documentsLoading } = usePortalDocumentsByProject(projectId!);
  const { data: comments, isLoading: commentsLoading } = usePortalThreadedComments(projectId!);
  const { data: settings, isLoading: settingsLoading } = usePortalSettingsByProject(projectId!);

  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Simulate loading particles
  useEffect(() => {
    const timer = setTimeout(() => setShowParticles(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (portalLoading) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10"></div>
        
        {/* Loading skeleton with animations */}
        <div className="relative z-10 animate-fade-in space-y-8 p-6">
          {/* Header skeleton */}
          <div className="space-y-4">
            <div className="h-12 bg-gradient-to-r from-secondary/50 to-secondary/30 rounded-xl animate-pulse"></div>
            <div className="h-6 bg-secondary/30 rounded w-1/2 animate-pulse"></div>
          </div>
          
          {/* Cards skeleton with stagger */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div 
                key={i} 
                className="h-40 bg-gradient-to-br from-secondary/40 to-secondary/20 rounded-xl animate-pulse"
                style={{ animationDelay: `${i * 0.1}s` }}
              ></div>
            ))}
          </div>
          
          {/* Content skeleton */}
          <div className="space-y-6">
            <div className="h-64 bg-gradient-to-r from-secondary/30 to-secondary/20 rounded-xl animate-pulse"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <div 
                  key={i} 
                  className="h-32 bg-gradient-to-br from-secondary/30 to-secondary/10 rounded-xl animate-pulse"
                  style={{ animationDelay: `${i * 0.2}s` }}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!portal) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 via-transparent to-destructive/10"></div>
        
        <Card className="w-full max-w-md relative z-10 animate-scale-in">
          <CardContent className="pt-6">
            <div className="text-center space-y-6">
              <div className="relative">
                <AlertCircle className="h-16 w-16 text-destructive mx-auto animate-pulse" />
                <div className="absolute inset-0 bg-destructive/20 rounded-full blur-xl animate-ping"></div>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold gradient-text">Portal Not Found</h2>
                <p className="text-muted-foreground">
                  The requested client portal could not be found or is not accessible.
                </p>
              </div>
              <Button className="btn-primary">
                <ArrowRight className="h-4 w-4 mr-2" />
                Return to Dashboard
              </Button>
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
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated background with particles */}
      {showParticles && (
        <div className="absolute inset-0 bg-grid-pattern opacity-20 animate-pulse"></div>
      )}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10"></div>
      
      <PortalHeader portal={portal} />
      
      <div className="relative z-10 container mx-auto px-6 py-8">
        {/* Hero Section with Search */}
        <div className="mb-12 animate-fade-in">
          <div className="text-center space-y-6 mb-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold gradient-text-animated">
                Welcome to {portal.portal_name}
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Track your project progress, access deliverables, and collaborate with our team
              </p>
            </div>
            
            {/* Enhanced Search and Filters */}
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                <div className="relative flex-1 max-w-lg">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Search documents, comments, and milestones..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-12 text-lg bg-card/80 backdrop-blur-sm border-border/50 focus:border-primary/50 transition-all duration-300"
                  />
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" size="lg" className="hover:bg-secondary/50 transition-all duration-200 hover:scale-105">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button size="lg" className="btn-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Comment
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-5 bg-card/80 backdrop-blur-sm border-border/50 p-1 rounded-xl">
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200">
              <Target className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="documents" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200">
              <FileText className="h-4 w-4 mr-2" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="comments" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200">
              <MessageSquare className="h-4 w-4 mr-2" />
              Comments
            </TabsTrigger>
            <TabsTrigger value="billing" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200">
              <CreditCard className="h-4 w-4 mr-2" />
              Billing
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8 animate-fade-in">
            {/* Enhanced Project Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="metric-card group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Project Progress
                  </CardTitle>
                  <div className="p-2 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors duration-200">
                    <CheckCircle className="h-4 w-4 text-primary" />
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-3xl font-bold gradient-text-primary mb-2">75%</div>
                  <Progress value={75} className="h-2 mb-3" />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">3 of 4 milestones</span>
                    <Badge variant="outline" className="text-xs bg-green-500/10 text-green-500 border-green-500/20">
                      <Sparkles className="h-3 w-3 mr-1" />
                      On Track
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="metric-card group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    Next Milestone
                  </CardTitle>
                  <div className="p-2 rounded-full bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors duration-200">
                    <Clock className="h-4 w-4 text-blue-500" />
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-3xl font-bold text-blue-500 mb-2">Dec 25</div>
                  <p className="text-sm text-muted-foreground mb-3">Final delivery</p>
                  <Badge variant="outline" className="text-xs bg-orange-500/10 text-orange-500 border-orange-500/20">
                    <Clock className="h-3 w-3 mr-1" />
                    5 days remaining
                  </Badge>
                </CardContent>
              </Card>

              <Card className="metric-card group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Activity className="h-4 w-4 text-green-500" />
                    Recent Activity
                  </CardTitle>
                  <div className="p-2 rounded-full bg-green-500/10 group-hover:bg-green-500/20 transition-colors duration-200">
                    <MessageSquare className="h-4 w-4 text-green-500" />
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-3xl font-bold text-green-500 mb-2">12</div>
                  <p className="text-sm text-muted-foreground mb-3">Comments this week</p>
                  <Badge variant="outline" className="text-xs bg-green-500/10 text-green-500 border-green-500/20">
                    <Zap className="h-3 w-3 mr-1" />
                    3 new today
                  </Badge>
                </CardContent>
              </Card>

              <Card className="metric-card group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Users className="h-4 w-4 text-purple-500" />
                    Team Members
                  </CardTitle>
                  <div className="p-2 rounded-full bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors duration-200">
                    <Star className="h-4 w-4 text-purple-500" />
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-3xl font-bold text-purple-500 mb-2">8</div>
                  <p className="text-sm text-muted-foreground mb-3">Active contributors</p>
                  <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-500 border-purple-500/20">
                    <Users className="h-3 w-3 mr-1" />
                    All online
                  </Badge>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Project Timeline */}
            <Card className="glass-card group hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      Project Timeline
                    </CardTitle>
                    <CardDescription className="text-base mt-1">
                      Track project milestones and key deliverables with real-time updates
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                    <Activity className="h-3 w-3 mr-1" />
                    Live Updates
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ProjectTimeline projectId={projectId!} />
              </CardContent>
            </Card>

            {/* Enhanced Recent Documents */}
            <Card className="glass-card group hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <FileText className="h-5 w-5 text-primary" />
                      Recent Documents
                    </CardTitle>
                    <CardDescription className="text-base mt-1">
                      Latest files, reports, and deliverables from your project
                    </CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setActiveTab('documents')}
                    className="hover:bg-primary/10 hover:border-primary/30 transition-all duration-200"
                  >
                    View All
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {documentsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div 
                        key={i} 
                        className="h-32 bg-gradient-to-br from-secondary/40 to-secondary/20 rounded-xl animate-pulse"
                        style={{ animationDelay: `${i * 0.1}s` }}
                      ></div>
                    ))}
                  </div>
                ) : documents && documents.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {documents.slice(0, 6).map((document, index) => (
                      <div 
                        key={document.id}
                        className="animate-fade-in"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <DocumentCard document={document} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="relative mb-6">
                      <FileText className="h-16 w-16 text-muted-foreground mx-auto opacity-50" />
                      <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl"></div>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No Documents Yet</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Documents will appear here once they're uploaded to your project. Check back soon!
                    </p>
                    <Button className="btn-primary">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload First Document
                    </Button>
                  </div>
                )}
                {documents && documents.length > 6 && (
                  <div className="mt-6 text-center">
                    <Button 
                      variant="outline" 
                      onClick={() => setActiveTab('documents')}
                      className="hover:bg-primary/10 hover:border-primary/30 transition-all duration-200"
                    >
                      View All {documents.length} Documents
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-8 animate-fade-in">
            <Card className="glass-card group hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <FileText className="h-6 w-6 text-primary" />
                      Documents & Deliverables
                    </CardTitle>
                    <CardDescription className="text-base mt-1">
                      Access all project files, reports, and deliverables with advanced filtering
                    </CardDescription>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" className="hover:bg-secondary/50 transition-all duration-200">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                    <Button className="btn-primary">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload File
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {documentsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                      <div 
                        key={i} 
                        className="h-40 bg-gradient-to-br from-secondary/40 to-secondary/20 rounded-xl animate-pulse"
                        style={{ animationDelay: `${i * 0.1}s` }}
                      ></div>
                    ))}
                  </div>
                ) : filteredDocuments.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredDocuments.map((document, index) => (
                      <div 
                        key={document.id}
                        className="animate-fade-in"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <DocumentCard document={document} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="relative mb-8">
                      <div className="h-24 w-24 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center mx-auto">
                        <FileText className="h-12 w-12 text-primary" />
                      </div>
                      <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse"></div>
                    </div>
                    <h3 className="text-2xl font-bold mb-3 gradient-text">No Documents Found</h3>
                    <p className="text-muted-foreground mb-8 max-w-md mx-auto text-lg">
                      {searchQuery ? 
                        `No documents match "${searchQuery}". Try adjusting your search terms.` :
                        "Documents will appear here once they're uploaded to your project."
                      }
                    </p>
                    <div className="flex gap-4 justify-center">
                      {searchQuery && (
                        <Button 
                          variant="outline" 
                          onClick={() => setSearchQuery('')}
                          className="hover:bg-secondary/50 transition-all duration-200"
                        >
                          Clear Search
                        </Button>
                      )}
                      <Button className="btn-primary">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload First Document
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Comments Tab */}
          <TabsContent value="comments" className="space-y-8 animate-fade-in">
            <Card className="glass-card group hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <MessageSquare className="h-6 w-6 text-primary" />
                      Comments & Feedback
                    </CardTitle>
                    <CardDescription className="text-base mt-1">
                      Share feedback, ask questions, and communicate with the team in real-time
                    </CardDescription>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" className="hover:bg-secondary/50 transition-all duration-200">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                    <Button className="btn-primary">
                      <Plus className="h-4 w-4 mr-2" />
                      New Comment
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {commentsLoading ? (
                  <div className="space-y-6">
                    {[1, 2, 3, 4].map((i) => (
                      <div 
                        key={i} 
                        className="h-32 bg-gradient-to-r from-secondary/40 to-secondary/20 rounded-xl animate-pulse"
                        style={{ animationDelay: `${i * 0.1}s` }}
                      ></div>
                    ))}
                  </div>
                ) : filteredComments.length > 0 ? (
                  <div className="space-y-6">
                    {filteredComments.map((comment, index) => (
                      <div 
                        key={comment.id}
                        className="animate-fade-in"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <CommentThread comment={comment} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="relative mb-8">
                      <div className="h-24 w-24 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center mx-auto">
                        <MessageSquare className="h-12 w-12 text-primary" />
                      </div>
                      <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse"></div>
                    </div>
                    <h3 className="text-2xl font-bold mb-3 gradient-text">No Comments Yet</h3>
                    <p className="text-muted-foreground mb-8 max-w-md mx-auto text-lg">
                      {searchQuery ? 
                        `No comments match "${searchQuery}". Try adjusting your search terms.` :
                        "Start the conversation by adding your first comment and engage with the team."
                      }
                    </p>
                    <div className="flex gap-4 justify-center">
                      {searchQuery && (
                        <Button 
                          variant="outline" 
                          onClick={() => setSearchQuery('')}
                          className="hover:bg-secondary/50 transition-all duration-200"
                        >
                          Clear Search
                        </Button>
                      )}
                      <Button className="btn-primary">
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Comment
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-8 animate-fade-in">
            <Card className="glass-card group hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <CreditCard className="h-6 w-6 text-primary" />
                      Billing & Renewals
                    </CardTitle>
                    <CardDescription className="text-base mt-1">
                      View invoices, payment history, and manage renewals with detailed analytics
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Up to Date
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <BillingCard projectId={projectId!} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-8 animate-fade-in">
            <Card className="glass-card group hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Settings className="h-6 w-6 text-primary" />
                  Portal Settings
                </CardTitle>
                <CardDescription className="text-base">
                  Configure your client portal appearance, behavior, and security settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Appearance Settings */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Palette className="h-5 w-5 text-primary" />
                    </div>
                    <h4 className="text-lg font-semibold">Appearance</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { label: 'Show Timeline', enabled: true, description: 'Display project timeline on overview' },
                      { label: 'Show Documents', enabled: true, description: 'Enable document access and downloads' },
                      { label: 'Show Comments', enabled: true, description: 'Allow commenting and feedback' },
                      { label: 'Show Billing', enabled: true, description: 'Display billing and payment information' }
                    ].map((setting, index) => (
                      <div 
                        key={setting.label}
                        className="flex items-center justify-between p-4 rounded-xl border border-border/50 hover:border-primary/30 transition-all duration-200 group"
                      >
                        <div className="flex-1">
                          <span className="text-sm font-medium group-hover:text-foreground transition-colors">
                            {setting.label}
                          </span>
                          <p className="text-xs text-muted-foreground mt-1">
                            {setting.description}
                          </p>
                        </div>
                        <div className={`h-6 w-11 rounded-full flex items-center transition-all duration-200 ${
                          setting.enabled ? 'bg-primary' : 'bg-secondary'
                        }`}>
                          <div className={`h-4 w-4 bg-background rounded-full transition-transform duration-200 ${
                            setting.enabled ? 'translate-x-6' : 'translate-x-1'
                          }`}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator className="bg-border/50" />

                {/* Permissions Settings */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-orange-500/10">
                      <Shield className="h-5 w-5 text-orange-500" />
                    </div>
                    <h4 className="text-lg font-semibold">Permissions & Security</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { label: 'Allow Comments', enabled: true, description: 'Enable commenting on documents' },
                      { label: 'Allow Downloads', enabled: true, description: 'Permit file downloads' },
                      { label: 'Require Approval', enabled: false, description: 'Approve comments before publishing' },
                      { label: 'Two-Factor Auth', enabled: true, description: 'Require 2FA for access' }
                    ].map((setting, index) => (
                      <div 
                        key={setting.label}
                        className="flex items-center justify-between p-4 rounded-xl border border-border/50 hover:border-orange-500/30 transition-all duration-200 group"
                      >
                        <div className="flex-1">
                          <span className="text-sm font-medium group-hover:text-foreground transition-colors">
                            {setting.label}
                          </span>
                          <p className="text-xs text-muted-foreground mt-1">
                            {setting.description}
                          </p>
                        </div>
                        <div className={`h-6 w-11 rounded-full flex items-center transition-all duration-200 ${
                          setting.enabled ? 'bg-orange-500' : 'bg-secondary'
                        }`}>
                          <div className={`h-4 w-4 bg-background rounded-full transition-transform duration-200 ${
                            setting.enabled ? 'translate-x-6' : 'translate-x-1'
                          }`}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator className="bg-border/50" />

                {/* Notification Settings */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <Bell className="h-5 w-5 text-blue-500" />
                    </div>
                    <h4 className="text-lg font-semibold">Notifications</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { label: 'Auto Notify', enabled: true, description: 'Automatic notifications for updates' },
                      { label: 'Email Notifications', enabled: true, description: 'Send updates via email' },
                      { label: 'Slack Notifications', enabled: false, description: 'Send updates to Slack channel' },
                      { label: 'SMS Alerts', enabled: false, description: 'Critical updates via SMS' }
                    ].map((setting, index) => (
                      <div 
                        key={setting.label}
                        className="flex items-center justify-between p-4 rounded-xl border border-border/50 hover:border-blue-500/30 transition-all duration-200 group"
                      >
                        <div className="flex-1">
                          <span className="text-sm font-medium group-hover:text-foreground transition-colors">
                            {setting.label}
                          </span>
                          <p className="text-xs text-muted-foreground mt-1">
                            {setting.description}
                          </p>
                        </div>
                        <div className={`h-6 w-11 rounded-full flex items-center transition-all duration-200 ${
                          setting.enabled ? 'bg-blue-500' : 'bg-secondary'
                        }`}>
                          <div className={`h-4 w-4 bg-background rounded-full transition-transform duration-200 ${
                            setting.enabled ? 'translate-x-6' : 'translate-x-1'
                          }`}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Webhook URL */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Webhook URL</label>
                    <div className="flex gap-3">
                      <Input 
                        placeholder="https://hooks.slack.com/services/..." 
                        className="flex-1"
                        disabled
                      />
                      <Button variant="outline" size="sm" disabled>
                        Test
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Configure webhook URL for external integrations
                    </p>
                  </div>
                </div>

                <Separator className="bg-border/50" />

                {/* Portal Status */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-500/10">
                      <Activity className="h-5 w-5 text-green-500" />
                    </div>
                    <h4 className="text-lg font-semibold">Portal Status</h4>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-card/50">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h5 className="font-medium">Portal Status</h5>
                        <Badge 
                          variant={portal.is_active ? "default" : "secondary"}
                          className={portal.is_active ? "bg-green-500/10 text-green-500 border-green-500/20" : ""}
                        >
                          {portal.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Last accessed: {portal.last_accessed_at ? 
                          new Date(portal.last_accessed_at).toLocaleDateString() : 
                          'Never'
                        }
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Created</p>
                      <p className="text-sm font-medium">
                        {new Date(portal.created_at).toLocaleDateString()}
                      </p>
                    </div>
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
