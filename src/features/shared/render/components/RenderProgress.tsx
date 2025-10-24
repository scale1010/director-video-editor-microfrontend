import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  Square, 
  Download, 
  Eye, 
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { useRenderStore } from '../store/use-render-store';
import { RenderJob, RenderJobStatusResponse } from '../services/renderApi';

interface RenderProgressProps {
  renderJob: RenderJob;
  onClose?: () => void;
  onViewOutput?: (outputUrl: string) => void;
}

export const RenderProgress: React.FC<RenderProgressProps> = ({
  renderJob,
  onClose,
  onViewOutput
}) => {
  const { getRenderJobStatus, cancelRenderJob, retryRenderJob } = useRenderStore();
  const [status, setStatus] = useState<RenderJobStatusResponse | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  // Poll for status updates
  useEffect(() => {
    if (renderJob.status === 'initiated' || renderJob.status === 'in_progress') {
      setIsPolling(true);
      const interval = setInterval(async () => {
        try {
          const newStatus = await getRenderJobStatus(renderJob.id);
          if (newStatus) {
            setStatus(newStatus);
            if (newStatus.status === 'completed' || newStatus.status === 'failed' || newStatus.status === 'cancelled') {
              setIsPolling(false);
              clearInterval(interval);
            }
          }
        } catch (error) {
          console.error('Failed to get render status:', error);
        }
      }, 2000); // Poll every 2 seconds

      return () => {
        clearInterval(interval);
        setIsPolling(false);
      };
    }
  }, [renderJob.id, renderJob.status, getRenderJobStatus]);

  const handleCancel = async () => {
    try {
      await cancelRenderJob(renderJob.id);
    } catch (error) {
      console.error('Failed to cancel render job:', error);
    }
  };

  const handleRetry = async () => {
    try {
      await retryRenderJob(renderJob.id);
    } catch (error) {
      console.error('Failed to retry render job:', error);
    }
  };

  const handleDownload = () => {
    if (status?.output_url) {
      const link = document.createElement('a');
      link.href = status.output_url;
      link.download = `render-${renderJob.id}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleViewOutput = () => {
    if (status?.output_url && onViewOutput) {
      onViewOutput(status.output_url);
    }
  };

  const getStatusIcon = () => {
    switch (status?.status || renderJob.status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'cancelled':
        return <Square className="w-5 h-5 text-gray-500" />;
      case 'in_progress':
        return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'initiated':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <Play className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status?.status || renderJob.status) {
      case 'completed':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      case 'cancelled':
        return 'bg-gray-500';
      case 'in_progress':
        return 'bg-blue-500';
      case 'initiated':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          <div>
            <h3 className="font-semibold">
              {renderJob.type === 'frame' ? 'Frame' : 'Board'} Render
            </h3>
            <p className="text-sm text-gray-500">
              {renderJob.type === 'frame' ? 'Frame' : 'Board'} ID: {renderJob.source_id.slice(-8)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge className={getStatusColor()}>
            {status?.status || renderJob.status}
          </Badge>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          )}
        </div>
      </div>

      {/* Progress */}
      {(status?.status === 'in_progress' || renderJob.status === 'in_progress') && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{Math.round((status?.progress || renderJob.progress) * 100)}%</span>
          </div>
          <Progress 
            value={(status?.progress || renderJob.progress) * 100} 
            className="w-full"
          />
          {status?.estimated_completion && (
            <p className="text-xs text-gray-500">
              Estimated completion: {new Date(status.estimated_completion).toLocaleTimeString()}
            </p>
          )}
        </div>
      )}

      {/* Output Info */}
      {status?.status === 'completed' && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Duration:</span>
              <span className="ml-2">{formatDuration(status.output_duration)}</span>
            </div>
            <div>
              <span className="text-gray-500">File Size:</span>
              <span className="ml-2">{formatFileSize(status.output_file_size)}</span>
            </div>
            {status.output_size && (
              <div className="col-span-2">
                <span className="text-gray-500">Resolution:</span>
                <span className="ml-2">
                  {status.output_size.width} × {status.output_size.height}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex space-x-2">
            <Button size="sm" onClick={handleViewOutput}>
              <Eye className="w-4 h-4 mr-2" />
              View
            </Button>
            <Button size="sm" variant="outline" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {status?.status === 'failed' && status.error_message && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3">
          <p className="text-sm text-red-700 dark:text-red-300">
            {status.error_message}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between">
        <div className="flex space-x-2">
          {(status?.status === 'in_progress' || renderJob.status === 'in_progress') && (
            <Button size="sm" variant="outline" onClick={handleCancel}>
              <Square className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          )}
          
          {status?.status === 'failed' && (
            <Button size="sm" variant="outline" onClick={handleRetry}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          )}
        </div>

        <div className="text-xs text-gray-500">
          Created: {new Date(renderJob.created_at).toLocaleString()}
        </div>
      </div>
    </div>
  );
};
