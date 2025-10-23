import React, { useState, useCallback } from 'react';
import { Heart, Plus, Reply, MessageSquare } from 'lucide-react';

interface Note {
  id: string;
  content: string;
  author: string;
  timestamp: Date;
  isLiked: boolean;
  likes: number;
  replies: Note[];
  parentId?: string;
}

interface NotesPanelProps {
  notes: Note[];
  onNotesChange: (notes: Note[]) => void;
}

export const NotesPanel: React.FC<NotesPanelProps> = ({ notes, onNotesChange }) => {
  const [newNoteContent, setNewNoteContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const addNote = useCallback(() => {
    if (newNoteContent.trim().length === 0) return;
    if (newNoteContent.length > 512) {
      alert('Note cannot exceed 512 characters');
      return;
    }

    const newNote: Note = {
      id: `note-${Date.now()}`,
      content: newNoteContent.trim(),
      author: 'You',
      timestamp: new Date(),
      isLiked: false,
      likes: 0,
      replies: []
    };

    onNotesChange([...notes, newNote]);
    setNewNoteContent('');
  }, [newNoteContent, notes, onNotesChange]);

  const addReply = useCallback((parentId: string) => {
    if (replyContent.trim().length === 0) return;
    if (replyContent.length > 512) {
      alert('Reply cannot exceed 512 characters');
      return;
    }

    const newReply: Note = {
      id: `reply-${Date.now()}`,
      content: replyContent.trim(),
      author: 'You',
      timestamp: new Date(),
      isLiked: false,
      likes: 0,
      replies: [],
      parentId
    };

    const updatedNotes = notes.map(note => {
      if (note.id === parentId) {
        return { ...note, replies: [...note.replies, newReply] };
      }
      return note;
    });

    onNotesChange(updatedNotes);
    setReplyContent('');
    setReplyingTo(null);
  }, [replyContent, notes, onNotesChange]);

  const toggleLike = useCallback((noteId: string, isReply: boolean = false, parentId?: string) => {
    const updatedNotes = notes.map(note => {
      if (isReply && parentId === note.id) {
        return {
          ...note,
          replies: note.replies.map(reply => {
            if (reply.id === noteId) {
              return {
                ...reply,
                isLiked: !reply.isLiked,
                likes: reply.isLiked ? reply.likes - 1 : reply.likes + 1
              };
            }
            return reply;
          })
        };
      } else if (!isReply && note.id === noteId) {
        return {
          ...note,
          isLiked: !note.isLiked,
          likes: note.isLiked ? note.likes - 1 : note.likes + 1
        };
      }
      return note;
    });

    onNotesChange(updatedNotes);
  }, [notes, onNotesChange]);

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return timestamp.toLocaleDateString();
  };

  const renderNote = (note: Note, isReply: boolean = false) => (
    <div 
      key={note.id}
      style={{
        padding: 'var(--space-12)',
        background: 'var(--bg-elev-1)',
        border: '1px solid var(--stroke)',
        borderRadius: 'var(--radius-sm)',
        marginBottom: 'var(--space-8)',
        position: 'relative'
      }}
    >
      {/* Note Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-8)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
          <div style={{ 
            width: 24, 
            height: 24, 
            borderRadius: '50%', 
            background: 'var(--accent)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            fontSize: 'var(--fs-10)',
            fontWeight: 600,
            color: 'white'
          }}>
            {note.author.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 'var(--fs-11)', fontWeight: 600, color: 'var(--text-primary)' }}>
              {note.author}
            </div>
            <div style={{ fontSize: 'var(--fs-10)', color: 'var(--text-tertiary)' }}>
              {formatTimestamp(note.timestamp)}
            </div>
          </div>
        </div>
        
        {/* Like Button */}
        <button
          onClick={() => toggleLike(note.id, isReply, note.parentId)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-4)',
            padding: 'var(--space-4) var(--space-8)',
            background: 'transparent',
            border: '1px solid var(--stroke)',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            transition: 'all var(--dur-1) var(--ease-standard)',
            color: note.isLiked ? '#ff4757' : 'var(--text-secondary)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--bg-elev-1)';
            e.currentTarget.style.borderColor = note.isLiked ? '#ff4757' : 'var(--accent)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.borderColor = 'var(--stroke)';
          }}
        >
          <Heart size={12} fill={note.isLiked ? '#ff4757' : 'none'} />
          {note.likes > 0 && <span style={{ fontSize: 'var(--fs-10)' }}>{note.likes}</span>}
        </button>
      </div>

      {/* Note Content */}
      <div style={{ 
        fontSize: 'var(--fs-12)', 
        color: 'var(--text-primary)', 
        lineHeight: 1.5,
        marginBottom: 'var(--space-8)'
      }}>
        {note.content}
      </div>

      {/* Note Actions */}
      {!isReply && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-12)' }}>
          <button
            onClick={() => setReplyingTo(replyingTo === note.id ? null : note.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-4)',
              padding: 'var(--space-4) var(--space-8)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              fontSize: 'var(--fs-11)',
              transition: 'color var(--dur-1) var(--ease-standard)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            <Reply size={12} />
            Reply
          </button>
        </div>
      )}

      {/* Reply Input */}
      {replyingTo === note.id && (
        <div style={{ marginTop: 'var(--space-12)', paddingTop: 'var(--space-12)', borderTop: '1px solid var(--stroke)' }}>
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Write a reply..."
            maxLength={512}
            style={{
              width: '100%',
              minHeight: 60,
              padding: 'var(--space-8)',
              fontSize: 'var(--fs-12)',
              background: 'var(--bg-elev-2)',
              border: '1px solid var(--stroke)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-primary)',
              fontFamily: 'inherit',
              resize: 'vertical',
              marginBottom: 'var(--space-8)'
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 'var(--fs-10)', color: 'var(--text-tertiary)' }}>
              {replyContent.length}/512 characters
            </span>
            <div style={{ display: 'flex', gap: 'var(--space-8)' }}>
              <button
                onClick={() => {
                  setReplyingTo(null);
                  setReplyContent('');
                }}
                style={{
                  padding: 'var(--space-6) var(--space-12)',
                  background: 'transparent',
                  border: '1px solid var(--stroke)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  fontSize: 'var(--fs-11)',
                  color: 'var(--text-secondary)'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => addReply(note.id)}
                disabled={replyContent.trim().length === 0}
                style={{
                  padding: 'var(--space-6) var(--space-12)',
                  background: 'var(--accent)',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  cursor: replyContent.trim().length === 0 ? 'not-allowed' : 'pointer',
                  fontSize: 'var(--fs-11)',
                  color: 'white',
                  opacity: replyContent.trim().length === 0 ? 0.5 : 1
                }}
              >
                Reply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Replies */}
      {note.replies.length > 0 && (
        <div style={{ marginTop: 'var(--space-12)', paddingLeft: 'var(--space-16)' }}>
          {note.replies.map(reply => renderNote(reply, true))}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
      <h3 style={{ fontSize: 'var(--fs-13)', fontWeight: 600, color: 'var(--text-primary)' }}>
        Notes ({notes.length})
      </h3>

      {/* Add New Note */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
        <textarea
          value={newNoteContent}
          onChange={(e) => setNewNoteContent(e.target.value)}
          placeholder="Add a note about your project..."
          maxLength={512}
          style={{
            width: '100%',
            minHeight: 80,
            padding: 'var(--space-12)',
            fontSize: 'var(--fs-12)',
            background: 'var(--bg-elev-1)',
            border: '1px solid var(--stroke)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-primary)',
            fontFamily: 'inherit',
            resize: 'vertical'
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 'var(--fs-10)', color: 'var(--text-tertiary)' }}>
            {newNoteContent.length}/512 characters
          </span>
          <button
            onClick={addNote}
            disabled={newNoteContent.trim().length === 0}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-6)',
              padding: 'var(--space-8) var(--space-12)',
              background: 'var(--accent)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              cursor: newNoteContent.trim().length === 0 ? 'not-allowed' : 'pointer',
              fontSize: 'var(--fs-11)',
              fontWeight: 500,
              color: 'white',
              opacity: newNoteContent.trim().length === 0 ? 0.5 : 1
            }}
          >
            <Plus size={14} />
            Add Note
          </button>
        </div>
      </div>

      {/* Notes List */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {notes.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: 'var(--space-24)', 
            color: 'var(--text-tertiary)',
            fontSize: 'var(--fs-12)'
          }}>
            <MessageSquare size={24} style={{ marginBottom: 'var(--space-8)', opacity: 0.5 }} />
            <div>No notes yet. Add your first note above!</div>
          </div>
        ) : (
          notes.map(note => renderNote(note))
        )}
      </div>
    </div>
  );
};
