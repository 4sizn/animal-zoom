/**
 * ViewerArea Component
 * Wrapper for @animal-zoom/3d-viewer integration with Babylon.js
 */

import { useRef, useEffect, useState } from 'react';
import { ParticipantInfo } from '@/types/meeting';
import { use3DParticipants } from '@/hooks/use3DParticipants';
import { Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ViewerAreaProps {
  participants: ParticipantInfo[];
  currentUserId: string;
}

export function ViewerArea({ participants, currentUserId }: ViewerAreaProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [webGLSupported, setWebGLSupported] = useState(true);

  // Check WebGL support
  useEffect(() => {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
      setWebGLSupported(false);
      setError('WebGL is not supported in your browser. 3D viewer requires WebGL.');
      setIsLoading(false);
    }
  }, []);

  // Initialize 3D scene
  useEffect(() => {
    if (!canvasRef.current || !webGLSupported) return;

    // TODO: Initialize Babylon.js scene using @animal-zoom/3d-viewer
    //
    // Expected integration:
    // import { SceneBuilder } from '@animal-zoom/3d-viewer';
    //
    // const sceneBuilder = new SceneBuilder(canvasRef.current);
    // const scene = sceneBuilder.createScene();
    //
    // // Start render loop
    // sceneBuilder.startRenderLoop();
    //
    // Cleanup:
    // return () => {
    //   sceneBuilder.dispose();
    // };

    // Placeholder: Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, [webGLSupported]);

  // Manage 3D participants (sync with store)
  const scene = null; // TODO: Get scene from SceneBuilder
  use3DParticipants(participants, scene, currentUserId);

  // Handle canvas resize
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const handleResize = () => {
      if (!canvasRef.current || !containerRef.current) return;

      const { width, height } = containerRef.current.getBoundingClientRect();
      canvasRef.current.width = width;
      canvasRef.current.height = height;

      // TODO: Notify Babylon.js engine of resize
      // engine.resize();
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // WebGL not supported fallback
  if (!webGLSupported) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              WebGL Not Supported
            </CardTitle>
            <CardDescription>
              Your browser doesn't support WebGL, which is required for the 3D viewer.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              To use the 3D viewer, please:
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
              <li>Update your browser to the latest version</li>
              <li>Enable hardware acceleration in browser settings</li>
              <li>Ensure your graphics drivers are up to date</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              3D Viewer Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <div>
            <p className="font-semibold">Initializing 3D Viewer</p>
            <p className="text-sm text-muted-foreground">Setting up Babylon.js scene...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full h-full relative">
      {/* Canvas for 3D rendering */}
      <canvas
        ref={canvasRef}
        className="w-full h-full outline-none"
        tabIndex={0}
      />

      {/* Placeholder overlay - Remove once 3D viewer is integrated */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="bg-background/80 backdrop-blur-sm p-6 rounded-lg border text-center max-w-md">
          <h3 className="font-semibold mb-2">3D Viewer Ready</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Integration with @animal-zoom/3d-viewer will display 3D avatars here.
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 bg-muted rounded">
              <p className="font-semibold">{participants.length}</p>
              <p className="text-muted-foreground">Participants</p>
            </div>
            <div className="p-2 bg-muted rounded">
              <p className="font-semibold">Ready</p>
              <p className="text-muted-foreground">Canvas Status</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
