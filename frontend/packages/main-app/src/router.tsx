import { createBrowserRouter, redirect } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { HostPreview } from './pages/HostPreview';
import { JoinMeeting } from './pages/JoinMeeting';
import { ParticipantPreview } from './pages/ParticipantPreview';
import { WaitingRoom } from './pages/WaitingRoom';
import { LiveSession } from './pages/LiveSession';
import { SimpleGuest } from './pages/SimpleGuest';
import { useRoomStore } from './stores/roomStore';

// Loader for session page - ensures user is properly authenticated and room is live
async function sessionLoader({ params }: { params: { roomId?: string } }) {
  const { roomId } = params;

  if (!roomId) {
    console.log('No roomId, redirecting to home');
    return redirect('/');
  }

  const { room, currentUser } = useRoomStore.getState();

  console.log('Session Loader:', {
    roomId,
    room,
    currentUser,
    roomState: room?.state,
    joinState: currentUser?.joinState
  });

  // If no room info (e.g., after refresh), redirect to participant preview
  // The preview page will handle re-fetching data or redirecting further
  if (!room || room.id !== roomId) {
    console.log('No room data, redirecting to participant preview');
    return redirect(`/room/${roomId}/participant-preview`);
  }

  // Check if room is live
  if (room.state !== 'LIVE') {
    console.log('Redirecting to preview: room not live');
    // Redirect to appropriate preview page
    if (currentUser?.isHost) {
      return redirect(`/room/${roomId}/host-preview`);
    } else {
      return redirect(`/room/${roomId}/participant-preview`);
    }
  }

  // Check if user has joined
  if (!currentUser || currentUser.joinState !== 'JOINED') {
    console.log('Redirecting to preview: user not joined');
    // Redirect to appropriate preview page
    if (currentUser?.isHost) {
      return redirect(`/room/${roomId}/host-preview`);
    } else {
      return redirect(`/room/${roomId}/participant-preview`);
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
        path: 'join/:roomCode',
        element: <JoinMeeting />,
      },
      {
        path: 'simple-guest',
        element: <SimpleGuest />,
      },
      {
        path: 'room/:roomId',
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
