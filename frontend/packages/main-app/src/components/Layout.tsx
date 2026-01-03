import { Outlet } from 'react-router-dom';
import { Toaster } from './ui/toaster';

export function Layout() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container flex h-16 items-center px-4">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-primary">Animal Zoom</h1>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto py-6">
        <Outlet />
      </main>

      {/* Toast notifications */}
      <Toaster />
    </div>
  );
}
