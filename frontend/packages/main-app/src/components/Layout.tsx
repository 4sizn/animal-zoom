import { Outlet, Link } from 'react-router-dom';
import { Toaster } from './ui/toaster';
import { DebugPanel } from '@animal-zoom/shared';
import { getInstance as getWebSocketController } from '@animal-zoom/shared/socket';
import { useRoomStore } from '@/stores/roomStore';

export function Layout() {
  // Get current user ID from store (may be undefined)
  const { currentUser } = useRoomStore();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container flex h-16 items-center px-4">
          <div className="flex items-center space-x-2">
            <Link to="/">
              <h1 className="text-xl font-bold text-primary cursor-pointer hover:opacity-80 transition-opacity">
                Animal Study Room
              </h1>
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto py-6">
        <Outlet />
      </main>

      {/* Toast notifications */}
      <Toaster />

      {/* Debug Panel - Development Only, available on all pages */}
      {import.meta.env.DEV && (
        <DebugPanel
          userId={currentUser?.id}
          wsController={getWebSocketController()}
        />
      )}
    </div>
  );
}
