/**
 * Meeting Summary Page
 * Comms Agent interface for meeting recordings, summaries, and ticket creation
 */

import { useState } from "react";
import { motion } from "motion/react";
import { 
  Upload, 
  Video, 
  FileText, 
  Calendar, 
  Clock, 
  CheckCircle, 
  Plus,
  Download,
  Send,
  MessageSquare,
  Zap,
  Bot,
  ArrowRight,
  Search,
  Filter,
  MoreVertical
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMeetings, useMeetingSummaries } from "@/hooks/useMeetings";
import { useTickets } from "@/hooks/useTickets";
import { toast } from "sonner";

export default function MeetingSummary() {
  const [selectedMeeting, setSelectedMeeting] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "client" | "internal" | "stakeholder">("all");

  // Data fetching
  const { data: meetings, isLoading: meetingsLoading } = useMeetings();
  const { data: summaries, isLoading: summariesLoading } = useMeetingSummaries();
  const { data: tickets, isLoading: ticketsLoading } = useTickets();

  // Filter meetings based on search and type
  const filteredMeetings = meetings?.filter(meeting => {
    const matchesSearch = meeting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         meeting.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || meeting.meeting_type === filterType;
    return matchesSearch && matchesType;
  }) || [];

  const selectedMeetingData = selectedMeeting ? 
    meetings?.find(m => m.id === selectedMeeting) : null;

  const selectedSummary = selectedMeeting ? 
    summaries?.find(s => s.meeting_id === selectedMeeting) : null;

  const meetingTickets = selectedMeeting ? 
    tickets?.filter(t => t.meeting_id === selectedMeeting) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Meeting Summary</h1>
          <p className="text-muted-foreground mt-2">
            Upload recordings, generate summaries, and convert feedback to tickets
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button className="btn-primary">
            <Upload className="w-4 h-4 mr-2" />
            Upload Recording
          </Button>
          <Button variant="outline">
            <Video className="w-4 h-4 mr-2" />
            Schedule Meeting
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search meetings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="bg-card border border-border rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">All Types</option>
            <option value="client">Client</option>
            <option value="internal">Internal</option>
            <option value="stakeholder">Stakeholder</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Meetings List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Recent Meetings
              </CardTitle>
              <CardDescription>
                {filteredMeetings.length} meetings found
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-96 overflow-y-auto">
                {meetingsLoading ? (
                  <div className="p-4 space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-16 bg-muted rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : filteredMeetings.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No meetings found</p>
                    <p className="text-sm">Upload a recording or schedule a meeting</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredMeetings.map((meeting) => (
                      <motion.div
                        key={meeting.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`p-4 cursor-pointer transition-all duration-200 ${
                          selectedMeeting === meeting.id
                            ? "bg-primary/10 border-l-4 border-primary"
                            : "hover:bg-muted/50"
                        }`}
                        onClick={() => setSelectedMeeting(meeting.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">{meeting.title}</h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              {meeting.meeting_type} • {meeting.participants?.length || 0} participants
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                {meeting.status}
                              </Badge>
                              {meeting.scheduled_at && (
                                <span className="text-xs text-muted-foreground">
                                  {new Date(meeting.scheduled_at).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                          <MoreVertical className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          {selectedMeetingData ? (
            <Tabs defaultValue="summary" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="transcript">Transcript</TabsTrigger>
                <TabsTrigger value="tickets">Tickets</TabsTrigger>
                <TabsTrigger value="client">Client Update</TabsTrigger>
              </TabsList>

              {/* Summary Tab */}
              <TabsContent value="summary" className="space-y-4">
                <SummaryComponent 
                  meeting={selectedMeetingData}
                  summary={selectedSummary}
                  tickets={meetingTickets}
                />
              </TabsContent>

              {/* Transcript Tab */}
              <TabsContent value="transcript" className="space-y-4">
                <TranscriptComponent meetingId={selectedMeetingData.id} />
              </TabsContent>

              {/* Tickets Tab */}
              <TabsContent value="tickets" className="space-y-4">
                <TicketsComponent 
                  meetingId={selectedMeetingData.id}
                  tickets={meetingTickets}
                />
              </TabsContent>

              {/* Client Update Tab */}
              <TabsContent value="client" className="space-y-4">
                <ClientUpdateComponent 
                  meeting={selectedMeetingData}
                  summary={selectedSummary}
                />
              </TabsContent>
            </Tabs>
          ) : (
            <Card className="h-96 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Select a Meeting</h3>
                <p>Choose a meeting from the list to view its summary and details</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// Summary Component with Feedback-to-Ticket Converter
function SummaryComponent({ 
  meeting, 
  summary, 
  tickets 
}: { 
  meeting: any; 
  summary: any; 
  tickets: any[]; 
}) {
  const [feedback, setFeedback] = useState("");
  const createTicketFromFeedback = useTickets().useCreateTicketFromFeedback();

  const handleCreateTicket = async () => {
    if (!feedback.trim()) return;

    try {
      await createTicketFromFeedback.mutateAsync({
        meetingId: meeting.id,
        meetingSummaryId: summary?.id || "",
        feedback: feedback.trim(),
        ticketData: {
          user_id: meeting.user_id,
          project_id: meeting.project_id,
          priority: "medium",
          ticket_type: "task"
        }
      });
      
      toast.success("Ticket created successfully");
      setFeedback("");
    } catch (error) {
      toast.error("Failed to create ticket");
    }
  };

  return (
    <div className="space-y-4">
      {/* Meeting Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                {meeting.title}
              </CardTitle>
              <CardDescription className="mt-1">
                {meeting.meeting_type} • {meeting.participants?.length || 0} participants
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{meeting.status}</Badge>
              {meeting.duration_minutes && (
                <Badge variant="secondary">
                  <Clock className="w-3 h-3 mr-1" />
                  {meeting.duration_minutes}m
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {meeting.description && (
            <p className="text-sm text-muted-foreground">{meeting.description}</p>
          )}
        </CardContent>
      </Card>

      {/* AI Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            AI Summary
            {summary?.confidence_score && (
              <Badge variant="outline" className="ml-auto">
                {Math.round(summary.confidence_score * 100)}% confidence
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {summary ? (
            <div className="space-y-4">
              <div className="prose prose-sm max-w-none">
                <p>{summary.summary}</p>
              </div>
              
              {summary.key_points && summary.key_points.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Key Points</h4>
                  <ul className="space-y-1">
                    {summary.key_points.map((point: string, index: number) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {summary.action_items && summary.action_items.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Action Items</h4>
                  <ul className="space-y-1">
                    {summary.action_items.map((item: string, index: number) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <ArrowRight className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No summary available</p>
              <p className="text-sm">Upload a recording to generate an AI summary</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Feedback to Ticket Converter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Convert Feedback to Ticket
          </CardTitle>
          <CardDescription>
            Add feedback or comments to create a new ticket
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Feedback/Comment</label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Enter feedback, comments, or action items..."
              className="w-full min-h-[100px] p-3 border border-border rounded-lg bg-card text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              {feedback.length} characters
            </div>
            <Button 
              onClick={handleCreateTicket}
              disabled={!feedback.trim() || createTicketFromFeedback.isPending}
              className="btn-primary"
            >
              {createTicketFromFeedback.isPending ? (
                <>
                  <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Ticket
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Related Tickets */}
      {tickets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Related Tickets ({tickets.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">{ticket.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {ticket.ticket_type} • {ticket.priority} priority
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {ticket.status}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Transcript Component
function TranscriptComponent({ meetingId }: { meetingId: string }) {
  const { data: transcript, isLoading } = useMeetings().useMeetingTranscript(meetingId);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-5/6"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!transcript) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No transcript available</p>
          <p className="text-sm">Upload a recording to generate a transcript</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Meeting Transcript
          {transcript.confidence_score && (
            <Badge variant="outline" className="ml-auto">
              {Math.round(transcript.confidence_score * 100)}% confidence
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          {transcript.word_count && `${transcript.word_count} words`}
          {transcript.duration_seconds && ` • ${Math.round(transcript.duration_seconds / 60)} minutes`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="prose prose-sm max-w-none">
          <p className="whitespace-pre-wrap">{transcript.processed_transcript || transcript.raw_transcript}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// Tickets Component
function TicketsComponent({ meetingId, tickets }: { meetingId: string; tickets: any[] }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Tickets from this Meeting</h3>
        <Button className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Create Ticket
        </Button>
      </div>

      {tickets.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No tickets created from this meeting</p>
            <p className="text-sm">Use the feedback converter to create tickets</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <Card key={ticket.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium">{ticket.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{ticket.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {ticket.ticket_type}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {ticket.priority}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {ticket.status}
                      </Badge>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Client Update Component
function ClientUpdateComponent({ meeting, summary }: { meeting: any; summary: any }) {
  const [clientUpdate, setClientUpdate] = useState(summary?.client_summary || "");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateUpdate = async () => {
    setIsGenerating(true);
    // Simulate AI generation
    setTimeout(() => {
      setClientUpdate(`Meeting Summary for ${meeting.title}\n\nKey outcomes and next steps from our discussion.`);
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="w-5 h-5" />
          Client Update
        </CardTitle>
        <CardDescription>
          Generate and send a professional update to the client
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Update Content</label>
          <textarea
            value={clientUpdate}
            onChange={(e) => setClientUpdate(e.target.value)}
            placeholder="Generate a client-friendly update based on the meeting..."
            className="w-full min-h-[200px] p-3 border border-border rounded-lg bg-card text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={handleGenerateUpdate}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Generating...
              </>
            ) : (
              <>
                <Bot className="w-4 h-4 mr-2" />
                Generate with AI
              </>
            )}
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button className="btn-primary">
              <Send className="w-4 h-4 mr-2" />
              Send to Client
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
