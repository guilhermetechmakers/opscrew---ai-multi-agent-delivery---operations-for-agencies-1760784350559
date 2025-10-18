import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FolderOpen, 
  Plus, 
  Filter, 
  Search,
  Calendar,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  Play
} from "lucide-react";

const projects = [
  {
    id: 1,
    name: "E-commerce Platform",
    status: "In Progress",
    progress: 75,
    team: ["John", "Sarah", "Mike"],
    dueDate: "2024-02-15",
    priority: "High",
    tasks: 12,
    completed: 9
  },
  {
    id: 2,
    name: "Mobile App Redesign",
    status: "Review",
    progress: 90,
    team: ["Alice", "Bob"],
    dueDate: "2024-02-10",
    priority: "Medium",
    tasks: 8,
    completed: 7
  },
  {
    id: 3,
    name: "API Integration",
    status: "Planning",
    progress: 25,
    team: ["Charlie"],
    dueDate: "2024-03-01",
    priority: "Low",
    tasks: 15,
    completed: 4
  }
];

const tasks = [
  {
    id: 1,
    title: "Design user authentication flow",
    status: "In Progress",
    assignee: "Sarah",
    priority: "High",
    dueDate: "2024-02-08"
  },
  {
    id: 2,
    title: "Implement payment gateway",
    status: "To Do",
    assignee: "Mike",
    priority: "High",
    dueDate: "2024-02-12"
  },
  {
    id: 3,
    title: "Create product catalog",
    status: "Done",
    assignee: "John",
    priority: "Medium",
    dueDate: "2024-02-05"
  },
  {
    id: 4,
    title: "Set up database schema",
    status: "In Progress",
    assignee: "Alice",
    priority: "High",
    dueDate: "2024-02-09"
  }
];

export default function ProjectBoard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Project Board</h1>
          <p className="text-muted-foreground">
            Manage your projects and track progress
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card key={project.id} className="card-hover animate-fade-in-up">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{project.name}</CardTitle>
                <Badge 
                  variant={project.priority === "High" ? "destructive" : project.priority === "Medium" ? "default" : "secondary"}
                >
                  {project.priority}
                </Badge>
              </div>
              <CardDescription>
                {project.status} • Due {new Date(project.dueDate).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Progress */}
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span>Progress</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Tasks */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Tasks</span>
                  <span>{project.completed}/{project.tasks}</span>
                </div>

                {/* Team */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Team:</span>
                  <div className="flex -space-x-2">
                    {project.team.map((member, index) => (
                      <div 
                        key={index}
                        className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs text-primary-foreground border-2 border-background"
                      >
                        {member[0]}
                      </div>
                    ))}
                  </div>
                </div>

                <Button className="w-full" variant="outline">
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Kanban Board */}
      <Card className="animate-fade-in-up">
        <CardHeader>
          <CardTitle>Task Board</CardTitle>
          <CardDescription>
            Drag and drop tasks between columns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* To Do */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                <h3 className="font-semibold">To Do</h3>
                <Badge variant="secondary">{tasks.filter(t => t.status === "To Do").length}</Badge>
              </div>
              {tasks.filter(task => task.status === "To Do").map((task) => (
                <Card key={task.id} className="p-3">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">{task.title}</h4>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{task.assignee}</span>
                      <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                    </div>
                    <Badge 
                      size="sm"
                      variant={task.priority === "High" ? "destructive" : "secondary"}
                    >
                      {task.priority}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>

            {/* In Progress */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <h3 className="font-semibold">In Progress</h3>
                <Badge variant="secondary">{tasks.filter(t => t.status === "In Progress").length}</Badge>
              </div>
              {tasks.filter(task => task.status === "In Progress").map((task) => (
                <Card key={task.id} className="p-3">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">{task.title}</h4>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{task.assignee}</span>
                      <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                    </div>
                    <Badge 
                      size="sm"
                      variant={task.priority === "High" ? "destructive" : "secondary"}
                    >
                      {task.priority}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>

            {/* Done */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <h3 className="font-semibold">Done</h3>
                <Badge variant="secondary">{tasks.filter(t => t.status === "Done").length}</Badge>
              </div>
              {tasks.filter(task => task.status === "Done").map((task) => (
                <Card key={task.id} className="p-3">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">{task.title}</h4>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{task.assignee}</span>
                      <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                    </div>
                    <Badge 
                      size="sm"
                      variant="outline"
                      className="text-green-500 border-green-500"
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Completed
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
