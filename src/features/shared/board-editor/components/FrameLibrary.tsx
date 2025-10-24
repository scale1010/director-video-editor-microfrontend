import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Play, Settings, Copy } from 'lucide-react';
import { frameApi, Frame } from '../../frame-editor/services/frameApi';
import { useFrameStore } from '../../frame-editor/store/use-frame-store';

interface FrameLibraryProps {
  onAddFrame: (frameId: string) => void;
  onEditFrame: (frameId: string) => void;
  onDuplicateFrame: (frameId: string) => void;
  onRenderFrame: (frameId: string) => void;
}

export const FrameLibrary: React.FC<FrameLibraryProps> = ({
  onAddFrame,
  onEditFrame,
  onDuplicateFrame,
  onRenderFrame
}) => {
  const [frames, setFrames] = useState<Frame[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const { createFrame } = useFrameStore();

  // Load frames from library
  useEffect(() => {
    loadFrames();
  }, [searchTerm, selectedTags]);

  const loadFrames = async () => {
    setIsLoading(true);
    try {
      const response = await frameApi.getFrameLibrary({
        search: searchTerm || undefined,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        limit: 50
      });
      setFrames(response.frames);
    } catch (error) {
      console.error('Failed to load frame library:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNewFrame = async () => {
    try {
      const newFrame = await createFrame({
        name: 'New Frame',
        description: 'A new frame',
        size: { width: 1920, height: 1080 },
        duration: 5.0,
        fps: 30,
        background: { type: 'color', value: '#ffffff' },
        workspace_id: 'default' // This should come from context
      });
      
      if (newFrame) {
        onEditFrame(newFrame.id);
      }
    } catch (error) {
      console.error('Failed to create new frame:', error);
    }
  };

  const handleFrameAction = (frameId: string, action: string) => {
    switch (action) {
      case 'add':
        onAddFrame(frameId);
        break;
      case 'edit':
        onEditFrame(frameId);
        break;
      case 'duplicate':
        onDuplicateFrame(frameId);
        break;
      case 'render':
        onRenderFrame(frameId);
        break;
    }
  };

  const getFrameThumbnail = (frame: Frame) => {
    if (frame.thumbnail_url) {
      return frame.thumbnail_url;
    }
    // Generate a simple colored thumbnail based on background
    return `data:image/svg+xml,${encodeURIComponent(`
      <svg width="200" height="150" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="150" fill="${frame.background.value}"/>
        <text x="100" y="75" text-anchor="middle" fill="#666" font-family="Arial" font-size="12">
          ${frame.size.width}x${frame.size.height}
        </text>
      </svg>
    `)}`;
  };

  return (
    <div className="h-full flex flex-col bg-background border-r border-border">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Frame Library</h2>
          <Button
            size="sm"
            onClick={handleCreateNewFrame}
            className="flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Frame
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search frames..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Frame Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {frames.map((frame) => (
              <div
                key={frame.id}
                className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Thumbnail */}
                <div className="aspect-video bg-gray-100 dark:bg-gray-800 relative">
                  <img
                    src={getFrameThumbnail(frame)}
                    alt={frame.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 flex space-x-1">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-6 w-6 p-0"
                      onClick={() => handleFrameAction(frame.id, 'add')}
                      title="Add to board"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-6 w-6 p-0"
                      onClick={() => handleFrameAction(frame.id, 'edit')}
                      title="Edit frame"
                    >
                      <Settings className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {/* Frame Info */}
                <div className="p-3">
                  <h3 className="font-medium text-sm mb-1 truncate">{frame.name}</h3>
                  <p className="text-xs text-gray-500 mb-2">
                    {frame.size.width} × {frame.size.height} • {frame.duration}s
                  </p>
                  
                  {/* Tags */}
                  {frame.metadata.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {frame.metadata.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {frame.metadata.tags.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{frame.metadata.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-xs"
                      onClick={() => handleFrameAction(frame.id, 'edit')}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      onClick={() => handleFrameAction(frame.id, 'duplicate')}
                      title="Duplicate"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      onClick={() => handleFrameAction(frame.id, 'render')}
                      title="Render"
                    >
                      <Play className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
