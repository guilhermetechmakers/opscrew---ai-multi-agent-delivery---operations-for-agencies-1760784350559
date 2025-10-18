import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { 
  Bot, 
  Send, 
  FileText, 
  Download, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  Users, 
  Target,
  Settings,
  MessageSquare,
  Paperclip,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Plus,
  X,
  AlertCircle,
  CheckCircle2,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

// Types for the enhanced intake chat
interface ChatMessage {
  id: string;
  sender: "user" | "agent" | "system";
  content: string;
  timestamp: string;
  messageType: "text" | "suggestion" | "form" | "attachment" | "system_prompt";
  confidenceScore?: number;
  requiresApproval?: boolean;
  approvalStatus?: "not_required" | "pending" | "approved" | "rejected";
  attachments?: Array<{ name: string; url: string; type: string }>;
  suggestedReplies?: string[];
  metadata?: Record<string, any>;
}

interface QualificationData {
  projectType: string;
  projectScope: string;
  budgetRange: string;
  timeline: string;
  stakeholders: string[];
  requirements: string[];
  qualificationScore: number;
  status: "in_progress" | "qualified" | "unqualified" | "needs_review";
}

interface ProposalData {
  title: string;
  content: string;
  version: number;
  status: "drafting" | "ready" | "sent" | "signed" | "rejected";
  variables: Record<string, any>;
  esignStatus: "not_sent" | "sent" | "signed" | "declined" | "expired";
}

const initialMessages: ChatMessage[] = [
  {
    id: "1",
    sender: "agent",
    content: "Hello! I'm your AI Intake Agent. I'm here to help qualify your project requirements and generate a proposal. Let's start with some basic information about your project.",
    timestamp: "2:30 PM",
    messageType: "text",
    confidenceScore: 0.95,
    suggestedReplies: [
      "We need a new website",
      "We want to build a mobile app",
      "We need help with our existing system",
      "We're looking for consulting services"
    ]
  }
];

export default function IntakeChat() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [qualificationData, setQualificationData] = useState<QualificationData>({
    projectType: "",
    projectScope: "",
    budgetRange: "",
    timeline: "",
    stakeholders: [],
    requirements: [],
    qualificationScore: 0,
    status: "in_progress"
  });
  const [proposalData, setProposalData] = useState<ProposalData>({
    title: "",
    content: "",
    version: 1,
    status: "drafting",
    variables: {},
    esignStatus: "not_sent"
  });
  const [showProposalDrawer, setShowProposalDrawer] = useState(false);
  const [showAdminControls, setShowAdminControls] = useState(false);
  const [agentPersona, setAgentPersona] = useState("professional");
  const [isApprovalMode, setIsApprovalMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isGenerating) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      messageType: "text"
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage("");
    setIsGenerating(true);

    // Simulate AI response with realistic delay
    setTimeout(() => {
      const agentResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "agent",
        content: generateAIResponse(newMessage),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        messageType: "text",
        confidenceScore: Math.random() * 0.3 + 0.7, // 0.7-1.0
        suggestedReplies: generateSuggestedReplies(newMessage)
      };

      setMessages(prev => [...prev, agentResponse]);
      setIsGenerating(false);
      
      // Update qualification data based on conversation
      updateQualificationData(newMessage);
    }, 1500 + Math.random() * 1000);
  };

  const generateAIResponse = (userMessage: string): string => {
    const responses = [
      "That's very interesting! Can you tell me more about your specific requirements?",
      "I understand. What's your expected timeline for this project?",
      "Great! What's your budget range for this type of project?",
      "Excellent. Who are the key stakeholders I should be aware of?",
      "I see. What technical requirements do you have in mind?",
      "Perfect. Let me gather some additional details to create a comprehensive proposal for you."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const generateSuggestedReplies = (userMessage: string): string[] => {
    const suggestions = [
      "Our budget is around $50,000 - $100,000",
      "We need this completed in 3-6 months",
      "We're a startup with 10 employees",
      "We need mobile and web versions",
      "We want to integrate with our existing CRM",
      "We need ongoing support and maintenance"
    ];
    return suggestions.slice(0, 3);
  };

  const updateQualificationData = (message: string) => {
    // Simple keyword detection for demo purposes
    if (message.toLowerCase().includes("budget") || message.toLowerCase().includes("$")) {
      setQualificationData(prev => ({ ...prev, budgetRange: "Identified" }));
    }
    if (message.toLowerCase().includes("timeline") || message.toLowerCase().includes("month")) {
      setQualificationData(prev => ({ ...prev, timeline: "Identified" }));
    }
    if (message.toLowerCase().includes("stakeholder") || message.toLowerCase().includes("team")) {
      setQualificationData(prev => ({ ...prev, stakeholders: ["Identified"] }));
    }
  };

  const handleSuggestedReply = (reply: string) => {
    setNewMessage(reply);
  };

  const handleApproveMessage = (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, approvalStatus: "approved" as const }
        : msg
    ));
    toast.success("Message approved");
  };

  const handleRejectMessage = (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, approvalStatus: "rejected" as const }
        : msg
    ));
    toast.error("Message rejected");
  };

  const generateProposal = () => {
    setProposalData(prev => ({
      ...prev,
      title: `${qualificationData.projectType} Project Proposal`,
      content: `Based on our conversation, here's a comprehensive proposal for your ${qualificationData.projectType} project...`,
      status: "ready",
      variables: {
        projectType: qualificationData.projectType,
        budget: qualificationData.budgetRange,
        timeline: qualificationData.timeline
      }
    }));
    setShowProposalDrawer(true);
    toast.success("Proposal generated successfully");
  };

  const sendForESign = () => {
    setProposalData(prev => ({ ...prev, esignStatus: "sent" }));
    toast.success("Proposal sent for e-signature");
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">AI Intake Chat</h1>
          <p className="text-muted-foreground">
            Let our AI agent qualify your lead and generate a proposal
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowAdminControls(!showAdminControls)}
          >
            <Settings className="w-4 h-4 mr-2" />
            Admin Controls
          </Button>
          <Button 
            variant="outline"
            onClick={() => setShowProposalDrawer(true)}
            disabled={proposalData.status === "drafting"}
          >
            <FileText className="w-4 h-4 mr-2" />
            View Proposal
          </Button>
          <Button className="btn-primary">
            <Download className="w-4 h-4 mr-2" />
            Export Chat
          </Button>
        </div>
      </div>

      {/* Admin Controls Panel */}
      <AnimatePresence>
        {showAdminControls && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Admin Controls
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Agent Persona</label>
                    <select 
                      value={agentPersona}
                      onChange={(e) => setAgentPersona(e.target.value)}
                      className="w-full p-2 border rounded-md bg-background"
                    >
                      <option value="professional">Professional</option>
                      <option value="friendly">Friendly</option>
                      <option value="technical">Technical</option>
                      <option value="consultative">Consultative</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={isApprovalMode ? "default" : "outline"}
                      onClick={() => setIsApprovalMode(!isApprovalMode)}
                      size="sm"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approval Mode
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setMessages(initialMessages)}
                      size="sm"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Reset Chat
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Enhanced Chat Interface */}
        <div className="lg:col-span-2">
          <Card className="h-[700px] flex flex-col">
            <CardHeader className="border-b border-border">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="w-5 h-5 text-primary" />
                    Intake Agent
                    {qualificationData.status === "qualified" && (
                      <Badge variant="default" className="ml-2">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Qualified
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    AI-powered lead qualification and proposal generation
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    Confidence: {Math.round((messages[messages.length - 1]?.confidenceScore || 0) * 100)}%
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0">
              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  <AnimatePresence>
                    {messages.map((message, index) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.1 }}
                        className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-4 ${
                            message.sender === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary text-foreground"
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <div className="flex-1">
                              <p className="whitespace-pre-line">{message.content}</p>
                              <div className="flex items-center justify-between mt-2">
                                <p className="text-xs opacity-70">{message.timestamp}</p>
                                {message.confidenceScore && (
                                  <Badge variant="outline" className="text-xs">
                                    {Math.round(message.confidenceScore * 100)}% confidence
                                  </Badge>
                                )}
                              </div>
                            </div>
                            {message.requiresApproval && message.approvalStatus === "pending" && (
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleApproveMessage(message.id)}
                                  className="h-6 w-6 p-0"
                                >
                                  <ThumbsUp className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRejectMessage(message.id)}
                                  className="h-6 w-6 p-0"
                                >
                                  <ThumbsDown className="w-3 h-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                          
                          {/* Suggested Replies */}
                          {message.suggestedReplies && message.suggestedReplies.length > 0 && (
                            <div className="mt-3 space-y-2">
                              <p className="text-xs opacity-70">Suggested replies:</p>
                              <div className="flex flex-wrap gap-2">
                                {message.suggestedReplies.map((reply, idx) => (
                                  <Button
                                    key={idx}
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleSuggestedReply(reply)}
                                    className="text-xs h-7"
                                  >
                                    {reply}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {isGenerating && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="bg-secondary text-foreground rounded-lg p-4 max-w-[80%]">
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm">AI is thinking...</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
                <div ref={messagesEndRef} />
              </ScrollArea>

              {/* Enhanced Input */}
              <div className="border-t border-border p-4">
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="min-h-[60px] resize-none bg-secondary border-0 focus:ring-2 focus:ring-primary"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute right-2 top-2 h-6 w-6 p-0"
                      >
                        <Paperclip className="w-4 h-4" />
                      </Button>
                    </div>
                    <Button 
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || isGenerating}
                      className="btn-primary self-end"
                    >
                      {isGenerating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Sidebar */}
        <div className="space-y-4">
          {/* Qualification Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Qualification Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Overall Progress</span>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(qualificationData.qualificationScore * 100)}%
                    </span>
                  </div>
                  <Progress value={qualificationData.qualificationScore * 100} className="h-2" />
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Project Type</span>
                    <Badge variant={qualificationData.projectType ? "default" : "secondary"}>
                      {qualificationData.projectType ? "✓ Identified" : "⏳ Pending"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Timeline</span>
                    <Badge variant={qualificationData.timeline ? "default" : "secondary"}>
                      {qualificationData.timeline ? "✓ Identified" : "⏳ Pending"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Budget</span>
                    <Badge variant={qualificationData.budgetRange ? "default" : "secondary"}>
                      {qualificationData.budgetRange ? "✓ Identified" : "⏳ Pending"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Stakeholders</span>
                    <Badge variant={qualificationData.stakeholders.length > 0 ? "default" : "secondary"}>
                      {qualificationData.stakeholders.length > 0 ? "✓ Identified" : "⏳ Pending"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Proposal Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Proposal Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <h4 className="font-semibold mb-2">{proposalData.title || "Draft Proposal"}</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    {proposalData.content || "Proposal will be generated based on our conversation..."}
                  </p>
                  <Badge variant="outline" className="mb-3">
                    Version {proposalData.version}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => setShowProposalDrawer(true)}
                    disabled={proposalData.status === "drafting"}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Full Proposal
                  </Button>
                  <Button 
                    className="w-full" 
                    onClick={generateProposal}
                    disabled={proposalData.status === "ready"}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    {proposalData.status === "drafting" ? "Generate Proposal" : "Regenerate"}
                  </Button>
                  {proposalData.status === "ready" && (
                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={sendForESign}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Send for E-Sign
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Export Chat
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset Session
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="w-4 h-4 mr-2" />
                  Agent Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Proposal Preview Drawer */}
      <Drawer open={showProposalDrawer} onOpenChange={setShowProposalDrawer}>
        <DrawerContent className="max-h-[80vh]">
          <DrawerHeader>
            <DrawerTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Proposal Preview
            </DrawerTitle>
          </DrawerHeader>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">{proposalData.title}</h2>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </div>
              
              <div className="prose max-w-none">
                <div className="bg-secondary/50 p-6 rounded-lg">
                  {proposalData.content || "Proposal content will appear here..."}
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowProposalDrawer(false)}>
                  Close
                </Button>
                <Button onClick={sendForESign}>
                  Send for E-Signature
                </Button>
              </div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
