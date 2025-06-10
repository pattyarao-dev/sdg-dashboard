import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, Save, FileText, Trash2, Edit3 } from 'lucide-react';

// Types for the notes system
interface Note {
  id: string;
  level: 'overview' | 'goal' | 'indicator' | 'project';
  levelId?: string | number;
  title: string;
  content: string;
  timestamp: string;
  lastModified: string;
}

interface NotesContextType {
  currentLevel: string;
  goalId?: number;
  indicatorId?: number;
  projectId?: number;
}

interface NotesPanelProps {
  currentContext: NotesContextType;
  onContextChange: (context: NotesContextType) => void;
}

const NotesPanel: React.FC<NotesPanelProps> = ({ currentContext, onContextChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]); //empty arra for now, need to add a table in the DB
  
  const [activeTab, setActiveTab] = useState('overview');
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteTitle, setNewNoteTitle] = useState('');

  // Generate context-specific note ID
  const generateNoteId = (level: string, levelId?: string | number) => {
    return levelId ? `${level}-${levelId}` : level;
  };

  // Get notes for current context
  const getNotesForContext = (level: string, levelId?: string | number) => {
    return notes.filter(note => 
      note.level === level && 
      (levelId ? note.levelId === levelId : !note.levelId)
    );
  };

  // Get all available tabs based on current context
  const getAvailableTabs = () => {
    const tabs = [
      { key: 'overview', label: 'Overview', level: 'overview' }
    ];

    if (currentContext.goalId) {
      tabs.push({
        key: `goal-${currentContext.goalId}`,
        label: `Goal ${currentContext.goalId}`,
        level: 'goal'
      });
    }

    if (currentContext.indicatorId) {
      tabs.push({
        key: `indicator-${currentContext.indicatorId}`,
        label: `Indicator ${currentContext.indicatorId}`,
        level: 'indicator'
      });
    }

    if (currentContext.projectId) {
      tabs.push({
        key: `project-${currentContext.projectId}`,
        label: `Project ${currentContext.projectId}`,
        level: 'project'
      });
    }

    return tabs;
  };

  // Save note
  const saveNote = () => {
    if (!newNoteTitle.trim() || !newNoteContent.trim()) return;

    const note: Note = {
      id: Date.now().toString(),
      level: activeTab.split('-')[0] as Note['level'],
      levelId: activeTab.includes('-') ? activeTab.split('-')[1] : undefined,
      title: newNoteTitle,
      content: newNoteContent,
      timestamp: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };

    setNotes(prev => [...prev, note]);
    setNewNoteTitle('');
    setNewNoteContent('');
  };

  // Update existing note
  const updateNote = (noteId: string, title: string, content: string) => {
    setNotes(prev => prev.map(note => 
      note.id === noteId 
        ? { ...note, title, content, lastModified: new Date().toISOString() }
        : note
    ));
    setEditingNote(null);
  };

  // Delete note
  const deleteNote = (noteId: string) => {
    setNotes(prev => prev.filter(note => note.id !== noteId));
  };

  // Generate report with all notes
  const generateReport = () => {
    const reportData = {
      timestamp: new Date().toISOString(),
      context: currentContext,
      notes: notes
    };

    // In a real app, this would trigger report generation
    console.log('Generating report with notes:', reportData);
    alert('Report generation started! Notes will be included in the report.');
  };

  const currentNotes = getNotesForContext(
    activeTab.split('-')[0] as Note['level'],
    activeTab.includes('-') ? activeTab.split('-')[1] : undefined
  );

  useEffect(() => {
  if (currentContext.projectId) {
    setActiveTab(`project-${currentContext.projectId}`);
  } else if (currentContext.goalId) {
    setActiveTab(`goal-${currentContext.goalId}`);
  } else if (currentContext.indicatorId) {
    setActiveTab(`indicator-${currentContext.indicatorId}`);
  } else {
    setActiveTab('overview');
  }
}, [currentContext]);

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed right-4 top-4 z-50 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        title="Toggle Notes Panel"
      >
        <Edit3 size={20} />
      </button>

      {/* Notes Panel */}
      <div className={`fixed right-0 top-0 h-full bg-white shadow-xl transition-transform duration-300 z-40 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`} style={{ width: '400px' }}>
        
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Dashboard Notes</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white hover:bg-blue-700 p-1 rounded"
          >
            <X size={20} />
          </button>
        </div>

        {/* Context Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto">
            {getAvailableTabs().map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          
          {/* Add New Note Section */}
          <div className="p-4 border-b border-gray-200">
            <div className="mb-3">
              <input
                type="text"
                placeholder="Note title..."
                value={newNoteTitle}
                onChange={(e) => setNewNoteTitle(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded text-sm"
              />
            </div>
            <div className="mb-3">
              <textarea
                placeholder="Add your qualitative notes here..."
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded text-sm h-20 resize-none"
              />
            </div>
            <button
              onClick={saveNote}
              disabled={!newNoteTitle.trim() || !newNoteContent.trim()}
              className="w-full bg-blue-600 text-white p-2 rounded text-sm hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Save size={16} />
              Save Note
            </button>
          </div>

          {/* Notes List */}
          <div className="flex-1 overflow-y-auto p-4">
            {currentNotes.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <FileText size={48} className="mx-auto mb-4 text-gray-300" />
                <p>No notes for this level yet.</p>
                <p className="text-sm">Add your first note above!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {currentNotes.map(note => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    isEditing={editingNote === note.id}
                    onEdit={() => setEditingNote(note.id)}
                    onSave={(title, content) => updateNote(note.id, title, content)}
                    onCancel={() => setEditingNote(null)}
                    onDelete={() => deleteNote(note.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={generateReport}
              className="w-full bg-green-600 text-white p-2 rounded text-sm hover:bg-green-700 flex items-center justify-center gap-2"
            >
              <FileText size={16} />
              Generate Report with Notes
            </button>
          </div>
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-25 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

// Individual Note Card Component
const NoteCard: React.FC<{
  note: Note;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (title: string, content: string) => void;
  onCancel: () => void;
  onDelete: () => void;
}> = ({ note, isEditing, onEdit, onSave, onCancel, onDelete }) => {
  const [editTitle, setEditTitle] = useState(note.title);
  const [editContent, setEditContent] = useState(note.content);

  const handleSave = () => {
    if (editTitle.trim() && editContent.trim()) {
      onSave(editTitle, editContent);
    }
  };

  const handleCancel = () => {
    setEditTitle(note.title);
    setEditContent(note.content);
    onCancel();
  };

  if (isEditing) {
    return (
      <div className="border border-blue-300 rounded-lg p-3 bg-blue-50">
        <input
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded text-sm mb-2"
        />
        <textarea
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded text-sm h-20 resize-none mb-2"
        />
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
          >
            Save
          </button>
          <button
            onClick={handleCancel}
            className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg p-3 hover:shadow-sm">
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-sm">{note.title}</h4>
        <div className="flex gap-1">
          <button
            onClick={onEdit}
            className="text-gray-400 hover:text-blue-600 p-1"
            title="Edit note"
          >
            <Edit3 size={14} />
          </button>
          <button
            onClick={onDelete}
            className="text-gray-400 hover:text-red-600 p-1"
            title="Delete note"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <p className="text-sm text-gray-700 mb-2">{note.content}</p>
      <div className="text-xs text-gray-500">
        Last modified: {new Date(note.lastModified).toLocaleString()}
      </div>
    </div>
  );
};

export default NotesPanel;