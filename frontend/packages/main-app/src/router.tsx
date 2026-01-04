import { createBrowserRouter } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { HostPreview } from './pages/HostPreview';
import { JoinMeeting } from './pages/JoinMeeting';
import { ParticipantPreview } from './pages/ParticipantPreview';
import { WaitingRoom } from './pages/WaitingRoom';
import { LiveSession } from './pages/LiveSession';
import { SimpleGuest } from './pages/SimpleGuest';

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
          },
        ],
      },
    ],
  },
]);
