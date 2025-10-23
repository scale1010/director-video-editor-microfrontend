import React, { useState, useRef, useCallback } from 'react';
import { GripVertical, ArrowLeft, Upload, Monitor, FileText, FolderOpen, CloudUpload, ChevronDown, Download, Settings } from 'lucide-react';
import { EditorState, Frame, Project } from '../types';
import { WorkspacePropertiesPanel } from './WorkspacePropertiesPanel';

interface FloatingActionBarProps {
  editorState: EditorState;
  onExport: () => void;
  onBackToBoard?: () => void;
  onRender?: () => void;
  onNew?: () => void;
  onOpen?: () => void;
  onSave?: () => void;
  frame?: Frame;
  onFrameUpdate?: (frameId: string, updates: Partial<Frame>) => void;
  project?: Project;
  onProjectUpdate?: (updates: Partial<Project>) => void;
  onUpdateAllFrames?: (updates: Partial<{ size: { w: number; h: number } }>) => void;
  theme?: 'dark' | 'light';
  onThemeChange?: (theme: 'dark' | 'light') => void;
}

export const FloatingActionBar: React.FC<FloatingActionBarProps> = ({
  editorState,
  onExport,
  onBackToBoard,
  onRender,
  onNew,
  onOpen,
  onSave,
  frame,
  onFrameUpdate,
  project,
  onProjectUpdate,
  onUpdateAllFrames,
  theme = 'dark',
  onThemeChange
}) => {
  const [position, setPosition] = useState({ x: 24, y: 24 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showDimensionDropdown, setShowDimensionDropdown] = useState(false);
  const [showFileDropdown, setShowFileDropdown] = useState(false);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileDropdownRef = useRef<HTMLDivElement>(null);
  const settingsDropdownRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === barRef.current || (e.target as HTMLElement).closest('[data-drag-handle]')) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
      e.preventDefault();
    }
  }, [position]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      
      // Constrain to viewport bounds
      const maxX = window.innerWidth - (barRef.current?.offsetWidth || 200);
      const maxY = window.innerHeight - (barRef.current?.offsetHeight || 60);
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    }
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Close dropdowns when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showDimensionDropdown && dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDimensionDropdown(false);
      }
      if (showFileDropdown && fileDropdownRef.current && !fileDropdownRef.current.contains(e.target as Node)) {
        setShowFileDropdown(false);
      }
      if (showSettingsDropdown && settingsDropdownRef.current && !settingsDropdownRef.current.contains(e.target as Node)) {
        setShowSettingsDropdown(false);
      }
    };

    if (showDimensionDropdown || showFileDropdown || showSettingsDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showDimensionDropdown, showFileDropdown, showSettingsDropdown]);

  return (
    <div 
      ref={barRef}
      className="floating-action-bar"
      onMouseDown={handleMouseDown}
      style={{
        position: 'fixed',
        top: position.y,
        right: position.x,
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-4)',
        padding: 'var(--space-8)',
        background: 'var(--bg-elev-2)',
        border: '1px solid var(--stroke)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
        zIndex: 100,
        backdropFilter: 'blur(12px)',
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none'
      }}
    >
      {/* Drag Handle */}
      <div 
        data-drag-handle
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 16,
          height: 16,
          cursor: 'grab',
          opacity: 0.6,
          marginRight: 'var(--space-4)'
        }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
        onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
      >
        <GripVertical size={12} />
      </div>

      {/* Separator */}
      <div style={{ width: 1, height: 24, background: 'var(--stroke)', margin: '0 var(--space-4)' }} />

      {/* Board View: File Actions Dropdown + Export */}
      {editorState.mode === 'board' && (
        <>
          {/* File Actions Dropdown */}
          <div style={{ position: 'relative' }} ref={fileDropdownRef}>
            <button
              onClick={() => setShowFileDropdown(!showFileDropdown)}
              className="btn btn--icon"
              title="File Actions"
              style={{
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <FileText size={16} />
            </button>
            
            {showFileDropdown && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: 'var(--space-4)',
                  background: 'var(--bg-elev-2)',
                  border: '1px solid var(--stroke)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                  zIndex: 50,
                  minWidth: 160,
                  overflow: 'hidden'
                }}
              >
                <button
                  onClick={() => {
                    onNew?.();
                    setShowFileDropdown(false);
                  }}
                  style={{
                    width: '100%',
                    padding: 'var(--space-12)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-8)',
                    fontSize: 'var(--fs-12)',
                    color: 'var(--text-primary)',
                    transition: 'background var(--dur-1) var(--ease-standard)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-elev-1)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <FileText size={14} />
                  New Board
                </button>
                
                <button
                  onClick={() => {
                    onOpen?.();
                    setShowFileDropdown(false);
                  }}
                  style={{
                    width: '100%',
                    padding: 'var(--space-12)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-8)',
                    fontSize: 'var(--fs-12)',
                    color: 'var(--text-primary)',
                    transition: 'background var(--dur-1) var(--ease-standard)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-elev-1)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <FolderOpen size={14} />
                  Open Board
                </button>
                
                <button
                  onClick={() => {
                    onSave?.();
                    setShowFileDropdown(false);
                  }}
                  style={{
                    width: '100%',
                    padding: 'var(--space-12)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-8)',
                    fontSize: 'var(--fs-12)',
                    color: 'var(--text-primary)',
                    transition: 'background var(--dur-1) var(--ease-standard)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-elev-1)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <CloudUpload size={14} />
                  Save Board
                </button>
              </div>
            )}
          </div>

          {/* Settings Dropdown */}
          {project && onProjectUpdate && onUpdateAllFrames && (
            <div style={{ position: 'relative' }} ref={settingsDropdownRef}>
              <button
                onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
                className="btn btn--icon"
                title="Board Settings"
                style={{
                  width: 36,
                  height: 36,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Settings size={16} />
              </button>
              
              {showSettingsDropdown && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: 'var(--space-4)',
                    background: 'var(--bg-elev-2)',
                    border: '1px solid var(--stroke)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                    zIndex: 50,
                    minWidth: 320,
                    maxWidth: 400,
                    maxHeight: 600,
                    overflow: 'auto'
                  }}
                >
                  <WorkspacePropertiesPanel 
                    project={project} 
                    onProjectUpdate={onProjectUpdate}
                    onUpdateAllFrames={onUpdateAllFrames}
                    theme={theme}
                    onThemeChange={onThemeChange}
                  />
                </div>
              )}
            </div>
          )}

          {/* Separator */}
          <div style={{ width: 1, height: 24, background: 'var(--stroke)', margin: '0 var(--space-2)' }} />

          {/* Export Button */}
          <button
            onClick={onExport}
            className="btn btn--primary"
            title="Export Board"
            style={{
              height: 36,
              padding: '0 var(--space-12)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-8)',
              fontSize: 'var(--fs-12)',
              fontWeight: 500
            }}
          >
            <Download size={14} />
            Export
          </button>
        </>
      )}

      {/* Frame View: Back + Dimensions + Render */}
      {editorState.mode === 'frame' && (
        <>
          {/* Back to Board Button */}
          <button
            onClick={onBackToBoard}
            className="btn btn--secondary"
            title="Back to Board"
            style={{
              height: 36,
              padding: '0 var(--space-12)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-6)',
              fontSize: 'var(--fs-12)',
              fontWeight: 500
            }}
          >
            <ArrowLeft size={14} />
            Board
          </button>

          {/* Separator */}
          <div style={{ width: 1, height: 24, background: 'var(--stroke)', margin: '0 var(--space-4)' }} />
          
          {/* Dimension Selection Dropdown */}
          {frame && onFrameUpdate && (
            <div style={{ position: 'relative' }} ref={dropdownRef}>
              <button
                onClick={() => setShowDimensionDropdown(!showDimensionDropdown)}
                className="btn btn--icon"
                title="Dimensions"
                style={{
                  width: 36,
                  height: 36,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Monitor size={16} />
              </button>
              
              {showDimensionDropdown && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: 'var(--space-4)',
                    background: 'var(--bg-elev-2)',
                    border: '1px solid var(--stroke)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                    zIndex: 50,
                    minWidth: 200,
                    maxHeight: 300,
                    overflow: 'auto'
                  }}
                >
                  {[
                    { value: "1920x1080", label: "1920×1080 (HD)" },
                    { value: "3840x2160", label: "3840×2160 (4K)" },
                    { value: "1080x1080", label: "1080×1080 (Square)" },
                    { value: "1080x1920", label: "1080×1920 (Mobile)" },
                    { value: "1080x1920", label: "1080×1920 (Instagram Reel)" },
                    { value: "1080x1080", label: "1080×1080 (Instagram Post)" },
                    { value: "1280x720", label: "1280×720 (YouTube Thumbnail)" },
                    { value: "1920x1080", label: "1920×1080 (YouTube Video)" },
                    { value: "1200x630", label: "1200×630 (Facebook Cover)" },
                    { value: "1500x500", label: "1500×500 (Twitter Header)" },
                    { value: "1200x627", label: "1200×627 (LinkedIn Post)" },
                    { value: "1080x1920", label: "1080×1920 (TikTok)" },
                    { value: "1000x1500", label: "1000×1500 (Pinterest Pin)" }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        const [width, height] = option.value.split('x').map(Number);
                        onFrameUpdate(frame.id, { size: { w: width, h: height } });
                        setShowDimensionDropdown(false);
                      }}
                      style={{
                        width: '100%',
                        padding: 'var(--space-12)',
                        background: `${frame.size.w}x${frame.size.h}` === option.value ? 'var(--accent)' : 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-8)',
                        fontSize: 'var(--fs-12)',
                        color: `${frame.size.w}x${frame.size.h}` === option.value ? 'var(--text-on-accent)' : 'var(--text-primary)',
                        transition: 'background var(--dur-1) var(--ease-standard)'
                      }}
                      onMouseEnter={(e) => {
                        if (`${frame.size.w}x${frame.size.h}` !== option.value) {
                          e.currentTarget.style.background = 'var(--bg-elev-1)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (`${frame.size.w}x${frame.size.h}` !== option.value) {
                          e.currentTarget.style.background = 'transparent';
                        }
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Separator */}
          <div style={{ width: 1, height: 24, background: 'var(--stroke)', margin: '0 var(--space-4)' }} />

          {/* Render Button */}
          <button
            onClick={onRender}
            className="btn btn--primary"
            title="Render Frame"
            style={{
              height: 36,
              padding: '0 var(--space-12)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-8)',
              fontSize: 'var(--fs-12)',
              fontWeight: 500
            }}
          >
            <Upload size={14} />
            Render
          </button>
        </>
      )}
    </div>
  );
};

