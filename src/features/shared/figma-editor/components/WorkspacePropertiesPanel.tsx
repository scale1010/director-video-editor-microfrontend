import React, { useState, useRef, useEffect } from 'react';
import { Project } from '../types';
import { ChevronDown, ChevronRight, Monitor, Smartphone, Tablet, Instagram, Youtube, Facebook, Linkedin, MessageSquare, Image, Settings, Search } from 'lucide-react';

// Custom X (Twitter) Icon Component
const XIcon: React.FC<{ size?: number; style?: React.CSSProperties }> = ({ size = 16, style }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    style={style}
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

// Custom TikTok Icon Component
const TikTokIcon: React.FC<{ size?: number; style?: React.CSSProperties }> = ({ size = 16, style }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    style={style}
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

// Custom Pinterest Icon Component
const PinterestIcon: React.FC<{ size?: number; style?: React.CSSProperties }> = ({ size = 16, style }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    style={style}
  >
    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
  </svg>
);

// Custom Snapchat Icon Component
const SnapchatIcon: React.FC<{ size?: number; style?: React.CSSProperties }> = ({ size = 16, style }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    style={style}
  >
    <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12 1.033-.301.165-.088.344-.104.464-.104.182 0 .359.029.509.09.45.149.734.479.734.838.015.449-.39.839-1.213 1.168-.089.029-.209.075-.344.119-.45.135-1.139.36-1.333.81-.09.224-.061.524.12.868l.015.015c.06.136 1.526 3.475 4.791 4.014.255.044.435.27.42.509 0 .075-.015.149-.045.225-.24.569-1.273.988-3.146 1.271-.059.091-.12.375-.164.57-.029.179-.074.36-.134.553-.076.271-.27.405-.555.405h-.03c-.135 0-.313-.031-.538-.074-.36-.075-.765-.135-1.273-.135-.3 0-.599.015-.913.074-.6.104-1.123.464-1.723.884-.853.599-1.826 1.288-3.294 1.288-.06 0-.119-.015-.18-.015h-.149c-1.468 0-2.427-.675-3.279-1.288-.599-.42-1.107-.779-1.707-.884-.314-.045-.629-.074-.928-.074-.54 0-.958.089-1.272.149-.211.043-.391.074-.54.074-.374 0-.523-.224-.583-.42-.061-.192-.09-.389-.135-.567-.046-.181-.105-.494-.166-.57-1.918-.222-2.95-.642-3.189-1.226-.031-.063-.052-.15-.055-.225-.015-.243.165-.465.42-.509 3.264-.54 4.73-3.879 4.791-4.02l.016-.029c.18-.345.224-.645.119-.869-.195-.434-.884-.658-1.332-.809-.121-.029-.24-.074-.346-.119-1.107-.435-1.257-.93-1.197-1.273.09-.479.674-.793 1.168-.793.146 0 .27.029.383.074.42.194.789.3 1.104.3.234 0 .384-.06.465-.105l-.046-.569c-.098-1.626-.225-3.651.307-4.837C7.392 1.077 10.739.807 11.727.807l.419-.015h.06z"/>
  </svg>
);

interface WorkspacePropertiesPanelProps {
  project: Project;
  onProjectUpdate: (updates: Partial<Project>) => void;
  onUpdateAllFrames?: (updates: Partial<{ size: { w: number; h: number } }>) => void;
  theme?: 'dark' | 'light';
  onThemeChange?: (theme: 'dark' | 'light') => void;
}

export const WorkspacePropertiesPanel: React.FC<WorkspacePropertiesPanelProps> = ({
  project,
  onProjectUpdate,
  onUpdateAllFrames,
  theme = 'dark',
  onThemeChange
}) => {
  const [isExpanded, setIsExpanded] = useState(true); // Always expanded when in floating bar
  const [showPresetDropdown, setShowPresetDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleDefaultSizeChange = (field: 'w' | 'h', value: number) => {
    const newSize = {
      ...project.workspace.defaultSize,
      [field]: value
    };
    
    // Update workspace default size
    onProjectUpdate({
      workspace: {
        ...project.workspace,
        defaultSize: newSize
      }
    });
    
    // Update all existing frames if the function is provided
    if (onUpdateAllFrames) {
      onUpdateAllFrames({
        size: newSize
      });
    }
  };

  const handleBackgroundColorChange = (color: string) => {
    onProjectUpdate({
      workspace: {
        ...project.workspace,
        backgroundColor: color
      }
    });
  };

  const handleGridColorChange = (color: string) => {
    onProjectUpdate({
      workspace: {
        ...project.workspace,
        gridColor: color
      }
    });
  };

  const handlePresetSelect = (preset: { name: string; w: number; h: number }) => {
    // Update workspace default size
    onProjectUpdate({
      workspace: {
        ...project.workspace,
        defaultSize: {
          w: preset.w,
          h: preset.h
        }
      }
    });
    
    // Update all existing frames if the function is provided
    if (onUpdateAllFrames) {
      onUpdateAllFrames({
        size: { w: preset.w, h: preset.h }
      });
    }
    
    setShowPresetDropdown(false);
    setSearchQuery(''); // Clear search when preset is selected
    setSelectedIndex(-1); // Reset selected index
  };

  const presets = [
    // Standard Formats
    { name: 'HD (1920×1080)', w: 1920, h: 1080, icon: Monitor, category: 'Standard' },
    { name: '4K (3840×2160)', w: 3840, h: 2160, icon: Monitor, category: 'Standard' },
    { name: 'Square (1080×1080)', w: 1080, h: 1080, icon: Image, category: 'Standard' },
    { name: 'Mobile Portrait (1080×1920)', w: 1080, h: 1920, icon: Smartphone, category: 'Standard' },
    
    // Social Media - Instagram
    { name: 'Instagram Story (1080×1920)', w: 1080, h: 1920, icon: Instagram, category: 'Instagram' },
    { name: 'Instagram Post (1080×1080)', w: 1080, h: 1080, icon: Instagram, category: 'Instagram' },
    { name: 'Instagram Reels (1080×1920)', w: 1080, h: 1920, icon: Instagram, category: 'Instagram' },
    
    // Social Media - YouTube
    { name: 'YouTube Shorts (1080×1920)', w: 1080, h: 1920, icon: Youtube, category: 'YouTube' },
    { name: 'YouTube Thumbnail (1280×720)', w: 1280, h: 720, icon: Youtube, category: 'YouTube' },
    { name: 'YouTube Video (1920×1080)', w: 1920, h: 1080, icon: Youtube, category: 'YouTube' },
    
    // Social Media - TikTok
    { name: 'TikTok (1080×1920)', w: 1080, h: 1920, icon: TikTokIcon, category: 'TikTok' },
    
    // Social Media - Facebook
    { name: 'Facebook Cover (1200×630)', w: 1200, h: 630, icon: Facebook, category: 'Facebook' },
    { name: 'Facebook Post (1200×630)', w: 1200, h: 630, icon: Facebook, category: 'Facebook' },
    
    // Social Media - X (formerly Twitter)
    { name: 'X Header (1500×500)', w: 1500, h: 500, icon: XIcon, category: 'X (Twitter)' },
    { name: 'X Post (1200×675)', w: 1200, h: 675, icon: XIcon, category: 'X (Twitter)' },
    
    // Social Media - LinkedIn
    { name: 'LinkedIn Post (1200×627)', w: 1200, h: 627, icon: Linkedin, category: 'LinkedIn' },
    
    // Other Platforms
    { name: 'Pinterest Pin (1000×1500)', w: 1000, h: 1500, icon: PinterestIcon, category: 'Pinterest' },
    { name: 'Snapchat (1080×1920)', w: 1080, h: 1920, icon: SnapchatIcon, category: 'Snapchat' }
  ];

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Element;
      if (showPresetDropdown && !target.closest('[data-presets-container]')) {
        setShowPresetDropdown(false);
      }
    };

    if (showPresetDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showPresetDropdown]);

  // Filter and group presets by category
  const filteredPresets = searchQuery 
    ? presets.filter(preset => 
        preset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        preset.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : presets;

  const groupedPresets = filteredPresets.reduce((acc, preset) => {
    if (!acc[preset.category]) {
      acc[preset.category] = [];
    }
    acc[preset.category].push(preset);
    return acc;
  }, {} as Record<string, typeof presets>);

  // Create flat array for keyboard navigation
  const flatFilteredPresets = filteredPresets;

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showPresetDropdown) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        e.stopPropagation();
        setSelectedIndex(prev => 
          prev < flatFilteredPresets.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        e.stopPropagation();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : flatFilteredPresets.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        e.stopPropagation();
        if (selectedIndex >= 0 && selectedIndex < flatFilteredPresets.length) {
          handlePresetSelect(flatFilteredPresets[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        e.stopPropagation();
        setShowPresetDropdown(false);
        setSearchQuery('');
        setSelectedIndex(-1);
        break;
    }
  };

  // Reset selected index when search changes
  useEffect(() => {
    setSelectedIndex(-1);
  }, [searchQuery]);

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: 'var(--space-20)', 
      padding: 'var(--space-16)',
      background: 'var(--bg-elev-1)',
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--stroke)',
      overflow: 'hidden'
    }}>
          {/* Dimension Presets Section */}
          <div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              marginBottom: 'var(--space-12)' 
            }}>
              <label style={{ 
                fontSize: 'var(--fs-12)', 
                fontWeight: 600, 
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-6)'
              }}>
                <Monitor size={14} />
                Frame Dimensions
              </label>
              <div style={{ 
                fontSize: 'var(--fs-10)', 
                color: 'var(--text-tertiary)',
                background: 'var(--bg-elev-2)',
                padding: 'var(--space-4) var(--space-8)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--stroke)'
              }}>
                {project.workspace.defaultSize.w} × {project.workspace.defaultSize.h}
              </div>
            </div>

            {/* Custom Dimensions Input */}
            <div style={{ 
              display: 'flex', 
              gap: 'var(--space-8)', 
              alignItems: 'center',
              marginBottom: 'var(--space-16)',
              padding: 'var(--space-12)',
              background: 'var(--bg-elev-2)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--stroke)'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <label style={{ fontSize: 'var(--fs-10)', color: 'var(--text-tertiary)', fontWeight: 500 }}>Width</label>
                <input
                  type="number"
                  value={project.workspace.defaultSize.w}
                  onChange={(e) => handleDefaultSizeChange('w', parseInt(e.target.value) || 1920)}
                  style={{
                    width: 80,
                    padding: 'var(--space-8) var(--space-10)',
                    fontSize: 'var(--fs-12)',
                    background: 'var(--bg-elev-1)',
                    border: '1px solid var(--stroke)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-primary)',
                    fontWeight: 500,
                    transition: 'border-color var(--dur-1) var(--ease-standard)',
                    WebkitAppearance: 'none',
                    MozAppearance: 'textfield'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--stroke)'}
                />
              </div>
              <div style={{ 
                fontSize: 'var(--fs-14)', 
                color: 'var(--text-tertiary)', 
                marginTop: 'var(--space-20)',
                fontWeight: 500
              }}>×</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <label style={{ fontSize: 'var(--fs-10)', color: 'var(--text-tertiary)', fontWeight: 500 }}>Height</label>
                <input
                  type="number"
                  value={project.workspace.defaultSize.h}
                  onChange={(e) => handleDefaultSizeChange('h', parseInt(e.target.value) || 1080)}
                  style={{
                    width: 80,
                    padding: 'var(--space-8) var(--space-10)',
                    fontSize: 'var(--fs-12)',
                    background: 'var(--bg-elev-1)',
                    border: '1px solid var(--stroke)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-primary)',
                    fontWeight: 500,
                    transition: 'border-color var(--dur-1) var(--ease-standard)',
                    WebkitAppearance: 'none',
                    MozAppearance: 'textfield'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--stroke)'}
                />
              </div>
            </div>

            {/* Presets Section */}
            <div style={{ marginBottom: 'var(--space-24)' }} data-presets-container>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowPresetDropdown(!showPresetDropdown);
                  
                  // Auto-focus search box when dropdown opens
                  if (!showPresetDropdown) {
                    setTimeout(() => {
                      if (searchInputRef.current) {
                        searchInputRef.current.focus();
                      }
                    }, 100);
                  }
                }}
                style={{
                  width: '100%',
                  padding: 'var(--space-12)',
                  background: 'var(--accent)',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  fontSize: 'var(--fs-12)',
                  color: 'var(--text-on-accent)',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 'var(--space-8)',
                  transition: 'all var(--dur-1) var(--ease-standard)',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  marginBottom: showPresetDropdown ? 'var(--space-12)' : 0
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--accent-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'var(--accent)'}
              >
                <Settings size={14} />
                Dimension Presets
                {showPresetDropdown ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
              
              {showPresetDropdown && (
                <div
                  style={{
                    background: 'var(--bg-elev-2)',
                    border: '1px solid var(--stroke)',
                    borderRadius: 'var(--radius-sm)',
                    overflow: 'hidden',
                    maxHeight: 400,
                    overflowY: 'auto'
                  }}
                >
                  {/* Search Box */}
                  <div style={{
                    padding: 'var(--space-12)',
                    borderBottom: '1px solid var(--stroke)',
                    background: 'var(--bg-elev-3)'
                  }}>
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search presets..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={handleKeyDown}
                      title="Use ↑↓ arrows to navigate, Enter to select"
                      style={{
                        width: '100%',
                        padding: 'var(--space-12)',
                        fontSize: 'var(--fs-12)',
                        background: 'var(--bg-elev-1)',
                        border: '1px solid var(--stroke)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-primary)',
                        fontWeight: 500,
                        transition: 'border-color var(--dur-1) var(--ease-standard)',
                        minHeight: 44,
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = 'var(--accent)';
                        // Show tooltip on focus
                        e.target.title = "Use ↑↓ arrows to navigate, Enter to select";
                      }}
                      onBlur={(e) => e.target.style.borderColor = 'var(--stroke)'}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  {Object.keys(groupedPresets).length === 0 ? (
                    <div style={{
                      padding: 'var(--space-20) var(--space-12)',
                      textAlign: 'center',
                      color: 'var(--text-tertiary)',
                      fontSize: 'var(--fs-12)',
                      fontStyle: 'italic'
                    }}>
                      No presets found for "{searchQuery}"
                    </div>
                  ) : (
                    Object.entries(groupedPresets).map(([category, categoryPresets]) => (
                    <div key={category}>
                      <div style={{
                        padding: 'var(--space-10) var(--space-12)',
                        fontSize: 'var(--fs-11)',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        background: 'var(--bg-elev-3)',
                        borderBottom: '1px solid var(--stroke)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        {category}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--space-4)' }}>
                        {categoryPresets.map((preset, index) => {
                          const IconComponent = preset.icon;
                          const isCurrentSelection = project.workspace.defaultSize.w === preset.w && project.workspace.defaultSize.h === preset.h;
                          const isKeyboardSelected = flatFilteredPresets.indexOf(preset) === selectedIndex;
                          const isHighlighted = isKeyboardSelected; // Only highlight keyboard selection, not current selection
                          
                          return (
                            <button
                              key={preset.name}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handlePresetSelect(preset);
                              }}
                              style={{
                                padding: 'var(--space-8) var(--space-10)',
                                background: isHighlighted ? 'var(--accent)' : 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: 'var(--fs-11)',
                                color: isHighlighted ? 'var(--text-on-accent)' : 'var(--text-primary)',
                                textAlign: 'left',
                                transition: 'all var(--dur-1) var(--ease-standard)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--space-6)',
                                borderRadius: 'var(--radius-sm)',
                                margin: 'var(--space-4)',
                                minHeight: 50
                              }}
                              onMouseEnter={(e) => {
                                if (!isHighlighted) {
                                  e.currentTarget.style.background = 'var(--bg-elev-1)';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!isHighlighted) {
                                  e.currentTarget.style.background = 'transparent';
                                }
                              }}
                            >
                              <IconComponent size={14} />
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ 
                                  fontWeight: 500, 
                                  fontSize: 'var(--fs-10)',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
                                }}>
                                  {preset.name}
                                </div>
                                <div style={{ 
                                  fontSize: 'var(--fs-9)', 
                                  opacity: 0.7,
                                  marginTop: 'var(--space-1)'
                                }}>
                                  {preset.w} × {preset.h}
                                </div>
                              </div>
                              {isCurrentSelection && (
                                <div style={{
                                  width: 6,
                                  height: 6,
                                  borderRadius: '50%',
                                  background: 'var(--text-on-accent)'
                                }} />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Canvas Settings Section */}
          <div style={{ marginTop: 'var(--space-24)' }}>
            <label style={{ 
              fontSize: 'var(--fs-12)', 
              fontWeight: 600, 
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-6)',
              marginBottom: 'var(--space-12)'
            }}>
              <Image size={14} />
              Canvas Settings
            </label>

            {/* Background Color */}
            <div style={{ marginBottom: 'var(--space-16)' }}>
              <label style={{ 
                display: 'block', 
                fontSize: 'var(--fs-11)', 
                fontWeight: 500, 
                color: 'var(--text-secondary)', 
                marginBottom: 'var(--space-8)' 
              }}>
                Background Color
              </label>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 'var(--space-8)',
                padding: 'var(--space-8)',
                background: 'var(--bg-elev-2)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--stroke)'
              }}>
                <input
                  type="color"
                  value={project.workspace.backgroundColor}
                  onChange={(e) => handleBackgroundColorChange(e.target.value)}
                  style={{
                    width: 36,
                    height: 36,
                    border: '1px solid var(--stroke)',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    background: 'none',
                    padding: 0
                  }}
                />
                <input
                  type="text"
                  value={project.workspace.backgroundColor}
                  onChange={(e) => handleBackgroundColorChange(e.target.value)}
                  style={{
                    flex: 1,
                    padding: 'var(--space-8) var(--space-10)',
                    fontSize: 'var(--fs-12)',
                    background: 'var(--bg-elev-1)',
                    border: '1px solid var(--stroke)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-primary)',
                    fontFamily: 'monospace',
                    fontWeight: 500,
                    transition: 'border-color var(--dur-1) var(--ease-standard)'
                  }}
                  placeholder="#000000"
                  onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--stroke)'}
                />
              </div>
              <div style={{ 
                fontSize: 'var(--fs-10)', 
                color: 'var(--text-tertiary)', 
                marginTop: 'var(--space-6)',
                fontStyle: 'italic'
              }}>
                Background color of the canvas area
              </div>
            </div>

            {/* Grid Color */}
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: 'var(--fs-11)', 
                fontWeight: 500, 
                color: 'var(--text-secondary)', 
                marginBottom: 'var(--space-8)' 
              }}>
                Grid Color
              </label>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 'var(--space-8)',
                padding: 'var(--space-8)',
                background: 'var(--bg-elev-2)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--stroke)'
              }}>
                <input
                  type="color"
                  value={project.workspace.gridColor}
                  onChange={(e) => handleGridColorChange(e.target.value)}
                  style={{
                    width: 36,
                    height: 36,
                    border: '1px solid var(--stroke)',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    background: 'none',
                    padding: 0
                  }}
                />
                <input
                  type="text"
                  value={project.workspace.gridColor}
                  onChange={(e) => handleGridColorChange(e.target.value)}
                  style={{
                    flex: 1,
                    padding: 'var(--space-8) var(--space-10)',
                    fontSize: 'var(--fs-12)',
                    background: 'var(--bg-elev-1)',
                    border: '1px solid var(--stroke)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-primary)',
                    fontFamily: 'monospace',
                    fontWeight: 500,
                    transition: 'border-color var(--dur-1) var(--ease-standard)'
                  }}
                  placeholder="#333333"
                  onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--stroke)'}
                />
              </div>
              <div style={{ 
                fontSize: 'var(--fs-10)', 
                color: 'var(--text-tertiary)', 
                marginTop: 'var(--space-6)',
                fontStyle: 'italic'
              }}>
                Color of grid dots and lines
              </div>
            </div>
          </div>

          {/* Theme Settings */}
          {onThemeChange && (
            <div style={{ marginTop: 'var(--space-24)' }}>
              <h4 style={{ 
                fontSize: 'var(--fs-12)', 
                fontWeight: 600, 
                color: 'var(--text-primary)',
                marginBottom: 'var(--space-12)'
              }}>
                Theme
              </h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-12)' }}>
                <button
                  onClick={() => {
                    console.log('Light theme clicked, current theme:', theme);
                    onThemeChange?.('light');
                  }}
                  style={{
                    padding: 'var(--space-8) var(--space-12)',
                    background: theme === 'light' ? 'var(--accent)' : 'var(--bg-elev-1)',
                    border: '1px solid var(--stroke)',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    fontSize: 'var(--fs-11)',
                    color: theme === 'light' ? 'var(--text-on-accent)' : 'var(--text-primary)',
                    fontWeight: 500,
                    transition: 'all var(--dur-1) var(--ease-standard)',
                    flex: 1
                  }}
                >
                  Light
                </button>
                <button
                  onClick={() => {
                    console.log('Dark theme clicked, current theme:', theme);
                    onThemeChange?.('dark');
                  }}
                  style={{
                    padding: 'var(--space-8) var(--space-12)',
                    background: theme === 'dark' ? 'var(--accent)' : 'var(--bg-elev-1)',
                    border: '1px solid var(--stroke)',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    fontSize: 'var(--fs-11)',
                    color: theme === 'dark' ? 'var(--text-on-accent)' : 'var(--text-primary)',
                    fontWeight: 500,
                    transition: 'all var(--dur-1) var(--ease-standard)',
                    flex: 1
                  }}
                >
                  Dark
                </button>
              </div>
            </div>
          )}
    </div>
  );
};
