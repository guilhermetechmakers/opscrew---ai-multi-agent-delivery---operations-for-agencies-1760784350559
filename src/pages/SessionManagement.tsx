import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  Smartphone, 
  Monitor, 
  Tablet, 
  MapPin, 
  Clock, 
  Shield, 
  Trash2
} from "lucide-react"
import { useSessions, useRevokeSession, useRevokeAllSessions } from "@/hooks/useAuthQueries"
import { useAuth } from "@/hooks/useAuth"
import { motion } from "motion/react"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"

const deviceTypeIcons = {
  desktop: Monitor,
  mobile: Smartphone,
  tablet: Tablet,
  unknown: Monitor
}

const deviceTypeColors = {
  desktop: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  mobile: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  tablet: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  unknown: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
}

export default function SessionManagement() {
  const { user } = useAuth()
  const { data: sessions, isLoading } = useSessions()
  const revokeSessionMutation = useRevokeSession()
  const revokeAllSessionsMutation = useRevokeAllSessions()

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await revokeSessionMutation.mutateAsync(sessionId)
      toast.success("Session revoked successfully")
    } catch (error: any) {
      toast.error(error.message || "Failed to revoke session")
    }
  }

  const handleRevokeAllSessions = async () => {
    try {
      await revokeAllSessionsMutation.mutateAsync()
      toast.success("All sessions revoked successfully")
    } catch (error: any) {
      toast.error(error.message || "Failed to revoke all sessions")
    }
  }

  const getDeviceIcon = (deviceType: string) => {
    const Icon = deviceTypeIcons[deviceType as keyof typeof deviceTypeIcons] || Monitor
    return <Icon className="w-4 h-4" />
  }

  const getDeviceColor = (deviceType: string) => {
    return deviceTypeColors[deviceType as keyof typeof deviceTypeColors] || deviceTypeColors.unknown
  }

  const isCurrentSession = (session: any) => {
    return false
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Active Sessions</h2>
            <p className="text-muted-foreground">Manage your active sessions and devices</p>
          </div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-muted rounded-lg" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-muted rounded w-1/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Active Sessions</h2>
          <p className="text-muted-foreground">Manage your active sessions and devices</p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="text-destructive hover:text-destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Revoke All
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Revoke All Sessions</DialogTitle>
                <DialogDescription>
                  This will sign you out of all devices and sessions. You will need to sign in again.
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end gap-2">
                <Button variant="outline">Cancel</Button>
                <Button 
                  variant="destructive"
                  onClick={handleRevokeAllSessions}
                  disabled={revokeAllSessionsMutation.isPending}
                >
                  {revokeAllSessionsMutation.isPending ? "Revoking..." : "Revoke All"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Alert className="border-primary/20 bg-primary/5">
        <Shield className="h-4 w-4 text-primary" />
        <AlertDescription>
          If you notice any suspicious activity, revoke the session immediately and change your password.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        {sessions?.data?.map((session: any) => (
          <motion.div
            key={session.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative"
          >
            <Card className={`transition-all duration-200 hover:shadow-md ${
              isCurrentSession(session) ? "ring-2 ring-primary/20" : ""
            }`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      isCurrentSession(session) ? "bg-primary/10" : "bg-muted"
                    }`}>
                      {getDeviceIcon(session.device_type)}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">
                          {session.device_name || "Unknown Device"}
                        </h3>
                        {isCurrentSession(session) && (
                          <Badge variant="secondary" className="text-xs">
                            Current
                          </Badge>
                        )}
                        <Badge className={`text-xs ${getDeviceColor(session.device_type)}`}>
                          {session.device_type}
                        </Badge>
                        {session.is_trusted && (
                          <Badge variant="outline" className="text-xs">
                            <Shield className="w-3 h-3 mr-1" />
                            Trusted
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{session.city}, {session.country}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Last active {formatDistanceToNow(new Date(session.last_activity))} ago</span>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {session.browser_name} {session.browser_version} • {session.os_name} {session.os_version}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!isCurrentSession(session) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRevokeSession(session.id)}
                        disabled={revokeSessionMutation.isPending}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Revoke
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {sessions?.data?.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <div className="space-y-2">
              <Shield className="w-12 h-12 text-muted-foreground mx-auto" />
              <h3 className="font-semibold">No Active Sessions</h3>
              <p className="text-sm text-muted-foreground">
                You don't have any active sessions at the moment.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
