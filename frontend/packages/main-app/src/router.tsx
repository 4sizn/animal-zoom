import { createBrowserRouter, redirect } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { HostPreview } from './pages/HostPreview';
import { JoinMeeting } from './pages/JoinMeeting';
import { ParticipantPreview } from './pages/ParticipantPreview';
import { WaitingRoom } from './pages/WaitingRoom';
import { LiveSession } from './pages/LiveSession';
import { SimpleGuest } from './pages/SimpleGuest';
import { useMeetingStore } from './stores/meetingStore';

// Loader for session page - ensures user is properly authenticated and meeting is live
async function sessionLoader({ params }: { params: { meetingId?: string } }) {
  const { meetingId } = params;

  if (!meetingId) {
    console.log('No meetingId, redirecting to home');
    return redirect('/');
  }

  const { meeting, currentUser } = useMeetingStore.getState();

  console.log('Session Loader:', {
    meetingId,
    meeting,
    currentUser,
    meetingState: meeting?.state,
    joinState: currentUser?.joinState
  });

  // If no meeting info (e.g., after refresh), redirect to participant preview
  // The preview page will handle re-fetching data or redirecting further
  if (!meeting || meeting.id !== meetingId) {
    console.log('No meeting data, redirecting to participant preview');
    return redirect(`/meeting/${meetingId}/participant-preview`);
  }

  // Check if meeting is live
  if (meeting.state !== 'LIVE') {
    console.log('Redirecting to preview: meeting not live');
    // Redirect to appropriate preview page
    if (currentUser?.isHost) {
      return redirect(`/meeting/${meetingId}/host-preview`);
    } else {
      return redirect(`/meeting/${meetingId}/participant-preview`);
    }
  }

  // Check if user has joined
  if (!currentUser || currentUser.joinState !== 'JOINED') {
    console.log('Redirecting to preview: user not joined');
    // Redirect to appropriate preview page
    if (currentUser?.isHost) {
      return redirect(`/meeting/${meetingId}/host-preview`);
    } else {
      return redirect(`/meeting/${meetingId}/participant-preview`);
    }
  }

  console.log('All checks passed, allowing session access');
  // All checks passed, allow access to session
  return null;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <SimpleGuest />,
      },
      {
        path: 'join',
        element: <JoinMeeting />,
      },
      {
        path: 'join/:meetingCode',
        element: <JoinMeeting />,
      },
      {
        path: 'simple-guest',
        element: <SimpleGuest />,
      },
      {
        path: 'meeting/:meetingId',
        children: [
          {
            path: 'host-preview',
            element: <HostPreview />,
          },
          {
            path: 'participant-preview',
            element: <ParticipantPreview />,
          },
          {
            path: 'waiting',
            element: <WaitingRoom />,
          },
          {
            path: 'session',
            element: <LiveSession />,
            loader: sessionLoader,
          },
        ],
      },
    ],
  },
]);
