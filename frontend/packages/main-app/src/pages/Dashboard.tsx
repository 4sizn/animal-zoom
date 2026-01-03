import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { NewMeetingDialog } from '@/components/NewMeetingDialog';
import { Video, LogIn } from 'lucide-react';

export function Dashboard() {
  const [showNewMeetingDialog, setShowNewMeetingDialog] = useState(false);
  const navigate = useNavigate();

  const handleJoinMeeting = () => {
    navigate('/join');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome to Animal Zoom - Silent Meeting Service
          </p>
        </div>
      </div>

      {/* Main action card */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="md:col-span-2 lg:col-span-2">
          <CardHeader>
            <CardTitle>Start a New Meeting</CardTitle>
            <CardDescription>
              Create a meeting room and invite participants to join
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              size="lg"
              className="w-full md:w-auto"
              onClick={() => setShowNewMeetingDialog(true)}
            >
              <Video className="mr-2 h-4 w-4" />
              New Meeting
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Join a Meeting</CardTitle>
            <CardDescription>
              Enter a meeting code to join an existing room
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={handleJoinMeeting}
            >
              <LogIn className="mr-2 h-4 w-4" />
              Join
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent meetings placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Meetings</CardTitle>
          <CardDescription>Your meeting history will appear here</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No recent meetings. Create your first meeting to get started!
          </p>
        </CardContent>
      </Card>

      {/* New Meeting Dialog */}
      <NewMeetingDialog
        open={showNewMeetingDialog}
        onOpenChange={setShowNewMeetingDialog}
      />
    </div>
  );
}
