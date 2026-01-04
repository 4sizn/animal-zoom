/**
 * ViewerArea Component
 * Wrapper for @animal-zoom/3d-viewer integration with Babylon.js
 */

import { useRef, useEffect, useState } from 'react';
import { ParticipantInfo } from '@/types/room';
import { use3DParticipants } from '@/hooks/use3DParticipants';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SceneBuilder } from '@animal-zoom/3d-viewer';

interface ViewerAreaProps {
  participants: ParticipantInfo[];
  currentUserId: string;
}

export function ViewerArea({ participants, currentUserId }: ViewerAreaProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneBuilderRef = useRef<SceneBuilder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [webGLSupported, setWebGLSupported] = useState(true);

  // Check WebGL support
  useEffect(() => {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
      setWebGLSupported(false);
      setError('WebGL is not supported in your browser. 3D viewer requires WebGL.');
    }
  }, []);

  // Initialize 3D scene with SceneBuilder
  useEffect(() => {
    if (!canvasRef.current || !webGLSupported || sceneBuilderRef.current) return;

    console.log('[ViewerArea] Initializing 3D viewer with SceneBuilder...');

    try {
      // Create SceneBuilder instance
      const sceneBuilder = new SceneBuilder(canvasRef.current);
      sceneBuilderRef.current = sceneBuilder;

      console.log('[ViewerArea] 3D viewer initialized successfully');
    } catch (err) {
      console.error('[ViewerArea] Failed to initialize 3D viewer:', err);
      setError('Failed to initialize 3D viewer');
    }

    return () => {
      if (sceneBuilderRef.current) {
        console.log('[ViewerArea] Disposing SceneBuilder');
        sceneBuilderRef.current.dispose();
        sceneBuilderRef.current = null;
      }
    };
  }, [webGLSupported]);

  // Manage 3D participants (sync with store)
  const scene = sceneBuilderRef.current?.scene || null;
  use3DParticipants(participants, scene, currentUserId);

  // Handle canvas resize
  useEffect(() => {
    const handleResize = () => {
      if (sceneBuilderRef.current) {
        sceneBuilderRef.current.engine.resize();
      }
    };

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

  return (
    <div ref={containerRef} className="w-full h-full relative">
      {/* Canvas for 3D rendering */}
      <canvas
        ref={canvasRef}
        className="w-full h-full outline-none"
        tabIndex={0}
      />
    </div>
  );
}
