/**
 * JoinMeeting Page
 * Entry point for participants to join a meeting
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useMeetingStore } from '@/stores/meetingStore';
import { useToast } from '@/hooks/use-toast';
import { Loader2, LogIn } from 'lucide-react';

export function JoinMeeting() {
  const { meetingCode: urlMeetingCode } = useParams<{ meetingCode?: string }>();
  const [meetingCode, setMeetingCode] = useState(urlMeetingCode || '');
  const [userName, setUserName] = useState('');
  const [step, setStep] = useState<'code' | 'name'>(urlMeetingCode ? 'name' : 'code');
  const [validatingCode, setValidatingCode] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();
  const { isLoading } = useMeetingStore();

  useEffect(() => {
    // If meeting code is in URL, validate it
    if (urlMeetingCode) {
      validateMeetingCode(urlMeetingCode);
    }
  }, [urlMeetingCode]);

  const validateMeetingCode = async (code: string) => {
    setValidatingCode(true);
    try {
      // TODO: Validate meeting code via API
      // const room = await roomsApi.getRoom(code);

      // For now, just accept any code
      await new Promise(resolve => setTimeout(resolve, 500));
      setMeetingCode(code);
      setStep('name');
      setValidatingCode(false);
    } catch (error) {
      toast({
        title: 'Invalid meeting code',
        description: 'Please check the code and try again',
        variant: 'destructive',
      });
      setValidatingCode(false);
      setStep('code');
    }
  };

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingCode.trim()) {
      toast({
        title: 'Meeting code required',
        description: 'Please enter a meeting code',
        variant: 'destructive',
      });
      return;
    }
    validateMeetingCode(meetingCode.trim().toUpperCase());
  };

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) {
      toast({
        title: 'Name required',
        description: 'Please enter your name',
        variant: 'destructive',
      });
      return;
    }

    if (userName.trim().length < 2 || userName.trim().length > 50) {
      toast({
        title: 'Invalid name',
        description: 'Name must be between 2 and 50 characters',
        variant: 'destructive',
      });
      return;
    }

    try {
      await useMeetingStore.getState().joinMeeting(meetingCode, {
        userName: userName.trim(),
      });

      toast({
        title: 'Joining meeting...',
        description: 'Redirecting to preview',
      });

      // Navigate to participant preview
      const meeting = useMeetingStore.getState().meeting;
      if (meeting) {
        navigate(`/meeting/${meeting.id}/participant-preview`);
      }
    } catch (error) {
      toast({
        title: 'Failed to join meeting',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Join a Meeting</h1>
        <p className="text-muted-foreground">
          {step === 'code'
            ? 'Enter the meeting code to get started'
            : 'Enter your name to join the meeting'}
        </p>
      </div>

      {/* Meeting Code Step */}
      {step === 'code' && (
        <Card>
          <CardHeader>
            <CardTitle>Enter Meeting Code</CardTitle>
            <CardDescription>
              The meeting code is provided by the host
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCodeSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="meeting-code" className="text-sm font-medium">
                  Meeting Code
                </label>
                <Input
                  id="meeting-code"
                  placeholder="ABC-123-DEF"
                  value={meetingCode}
                  onChange={(e) => setMeetingCode(e.target.value.toUpperCase())}
                  disabled={validatingCode || isLoading}
                  className="text-center text-lg font-mono tracking-wider"
                  maxLength={15}
                  autoFocus
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/')}
                  disabled={validatingCode || isLoading}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={validatingCode || isLoading || !meetingCode.trim()}
                  className="flex-1"
                >
                  {validatingCode ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Validating...
                    </>
                  ) : (
                    <>
                      Continue
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Identity Check Step */}
      {step === 'name' && (
        <Card>
          <CardHeader>
            <CardTitle>Enter Your Name</CardTitle>
            <CardDescription>
              Meeting: <code className="text-primary font-mono">{meetingCode}</code>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleNameSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="user-name" className="text-sm font-medium">
                  Your Name
                </label>
                <Input
                  id="user-name"
                  placeholder="John Doe"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  disabled={isLoading}
                  maxLength={50}
                  autoFocus
                />
                <p className="text-xs text-muted-foreground">
                  This name will be visible to other participants
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setStep('code');
                    setUserName('');
                  }}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || !userName.trim()}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" />
                      Join Meeting
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Helper Text */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground text-center">
            Don't have a meeting code?{' '}
            <button
              onClick={() => navigate('/')}
              className="text-primary hover:underline font-medium"
            >
              Create a new meeting
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
