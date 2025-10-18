import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Search, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="animate-fade-in-up">
          <CardHeader className="text-center">
            <div className="text-6xl font-bold text-primary mb-4">404</div>
            <CardTitle className="text-2xl">Page Not Found</CardTitle>
            <CardDescription>
              The page you're looking for doesn't exist or has been moved.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                Don't worry, it happens to the best of us. Let's get you back on track.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <Button asChild className="btn-primary">
                  <Link to="/">
                    <Home className="w-4 h-4 mr-2" />
                    Go Home
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/dashboard">
                    <Search className="w-4 h-4 mr-2" />
                    Dashboard
                  </Link>
                </Button>
              </div>
              
              <Button 
                variant="ghost" 
                onClick={() => window.history.back()}
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
