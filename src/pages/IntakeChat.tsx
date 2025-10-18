import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Send, FileText, Download, CheckCircle } from "lucide-react";

const messages = [
  {
    id: 1,
    sender: "bot",
    content: "Hello! I'm your AI Intake Agent. I'm here to help qualify your project requirements and generate a proposal. Let's start with some basic information about your project.",
    timestamp: "2:30 PM"
  },
  {
    id: 2,
    sender: "user",
    content: "Hi! We need a new e-commerce website for our business.",
    timestamp: "2:31 PM"
  },
  {
    id: 3,
    sender: "bot",
    content: "Great! An e-commerce website is a substantial project. Let me ask you a few questions to better understand your requirements:\n\n1. What type of products will you be selling?\n2. What's your expected timeline?\n3. Do you have a budget range in mind?\n4. Will you need any integrations (payment processors, inventory management, etc.)?",
    timestamp: "2:31 PM"
  }
];

export default function IntakeChat() {
  const [newMessage, setNewMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setIsGenerating(true);
      // Simulate AI response
      setTimeout(() => {
        setIsGenerating(false);
        setNewMessage("");
      }, 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">AI Intake Chat</h1>
          <p className="text-muted-foreground">
            Let our AI agent qualify your lead and generate a proposal
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            View Proposal
          </Button>
          <Button className="btn-primary">
            <Download className="w-4 h-4 mr-2" />
            Export Chat
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Interface */}
        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="border-b border-border">
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-primary" />
                Intake Agent
              </CardTitle>
              <CardDescription>
                AI-powered lead qualification and proposal generation
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.sender === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-foreground"
                      }`}
                    >
                      <p className="whitespace-pre-line">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">{message.timestamp}</p>
                    </div>
                  </div>
                ))}
                {isGenerating && (
                  <div className="flex justify-start">
                    <div className="bg-secondary text-foreground rounded-lg p-3 max-w-[80%]">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="border-t border-border p-4">
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 bg-secondary border-0 focus:ring-2 focus:ring-primary"
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || isGenerating}
                    className="btn-primary"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Proposal Preview */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Proposal Preview
              </CardTitle>
              <CardDescription>
                AI-generated proposal based on conversation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <h4 className="font-semibold mb-2">E-commerce Website Development</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Based on our conversation, here's what we understand about your project:
                  </p>
                  <ul className="text-sm space-y-1">
                    <li>• E-commerce platform for product sales</li>
                    <li>• Timeline: To be determined</li>
                    <li>• Budget: To be discussed</li>
                    <li>• Integrations: TBD</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <Button className="w-full" variant="outline">
                    <FileText className="w-4 h-4 mr-2" />
                    View Full Proposal
                  </Button>
                  <Button className="w-full btn-primary">
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Qualification Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Qualification Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Project Type</span>
                  <span className="text-sm text-green-500">✓ Identified</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Timeline</span>
                  <span className="text-sm text-yellow-500">⏳ Pending</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Budget</span>
                  <span className="text-sm text-yellow-500">⏳ Pending</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Requirements</span>
                  <span className="text-sm text-yellow-500">⏳ Pending</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
