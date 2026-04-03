import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { noteService, Note } from '../../services/note.service';
import { motion, AnimatePresence } from 'framer-motion';
import { StickyNote, Plus, Edit2, Trash2, Save, X, Clock } from 'lucide-react';
import { Button } from '../ui/button';
import { createPortal } from 'react-dom';

interface VideoNotesProps {
  videoId: string;
  currentTime: number;
}

export const VideoNotes: React.FC<VideoNotesProps> = ({ videoId, currentTime }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [editContent, setEditContent] = useState('');
  const queryClient = useQueryClient();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        left: Math.max(8, rect.right - 384), // 384 is the dropdown width (w-96)
      });
    }
  }, [isOpen]);

  const { data: notes, isLoading } = useQuery({
    queryKey: ['notes', videoId],
    queryFn: () => noteService.getNotesByVideo(videoId),
  });

  const createNoteMutation = useMutation({
    mutationFn: () => noteService.createNote(videoId, newNoteContent, Math.floor(currentTime)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', videoId] });
      setNewNoteContent('');
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      noteService.updateNote(id, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', videoId] });
      setEditingNote(null);
      setEditContent('');
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: (id: string) => noteService.deleteNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', videoId] });
    },
  });

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return h > 0
      ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
      : `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (newNoteContent.trim()) {
      createNoteMutation.mutate();
    }
  };

  const handleUpdateNote = (id: string) => {
    if (editContent.trim()) {
      updateNoteMutation.mutate({ id, content: editContent });
    }
  };

  const startEdit = (note: Note) => {
    setEditingNote(note._id);
    setEditContent(note.content);
  };

  const cancelEdit = () => {
    setEditingNote(null);
    setEditContent('');
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700 relative"
      >
        <StickyNote size={18} />
        <span>Notes</span>
        {notes && notes.data && notes.data.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {notes.data.length}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && createPortal(
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Notes Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              style={{ top: dropdownPosition.top, left: dropdownPosition.left }}
              className="fixed w-96 max-h-[600px] bg-slate-900 border border-slate-700 rounded-lg shadow-2xl z-50 flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-700">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <StickyNote size={20} className="text-purple-400" />
                  My Notes
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* New Note Form */}
              <form onSubmit={handleCreateNote} className="p-4 border-b border-slate-700">
                <div className="flex items-start gap-2 mb-2">
                  <Clock size={16} className="text-purple-400 mt-1" />
                  <span className="text-sm text-gray-400">{formatTime(currentTime)}</span>
                </div>
                <textarea
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  placeholder="Add a note at current timestamp..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-purple-500"
                  rows={3}
                />
                <div className="flex justify-end mt-2">
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!newNoteContent.trim() || createNoteMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    <Plus size={16} />
                    Add Note
                  </Button>
                </div>
              </form>

              {/* Notes List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {isLoading ? (
                  <div className="text-center text-gray-400 py-8">Loading notes...</div>
                ) : notes && notes.data && notes.data.length > 0 ? (
                  notes.data.map((note: Note) => (
                    <motion.div
                      key={note._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-slate-800 rounded-lg p-3"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <button
                          onClick={() => {
                            // Jump to timestamp functionality would go here
                            // You can emit an event or pass a callback
                          }}
                          className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
                        >
                          <Clock size={12} />
                          {formatTime(note.timestamp)}
                        </button>
                        {editingNote !== note._id && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => startEdit(note)}
                              className="text-gray-400 hover:text-blue-400 transition-colors"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => deleteNoteMutation.mutate(note._id)}
                              className="text-gray-400 hover:text-red-400 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </div>

                      {editingNote === note._id ? (
                        <div>
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm resize-none focus:outline-none focus:border-purple-500"
                            rows={3}
                          />
                          <div className="flex justify-end gap-2 mt-2">
                            <button
                              onClick={cancelEdit}
                              className="text-xs text-gray-400 hover:text-white px-2 py-1"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleUpdateNote(note._id)}
                              className="text-xs bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded flex items-center gap-1"
                            >
                              <Save size={12} />
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-300 whitespace-pre-wrap">{note.content}</p>
                      )}

                      <div className="text-xs text-gray-500 mt-2">
                        {new Date(note.updatedAt).toLocaleDateString()}
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center text-gray-400 py-8">
                    <StickyNote size={48} className="mx-auto mb-2 opacity-50" />
                    <p>No notes yet</p>
                    <p className="text-sm mt-1">Add your first note above</p>
                  </div>
                )}
              </div>
            </motion.div>
          </>,
          document.body
        )}
      </AnimatePresence>
    </div>
  );
};

export default VideoNotes;
