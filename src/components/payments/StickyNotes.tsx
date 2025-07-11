import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useDirectorCaleb } from '@/hooks/use-director-caleb';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { X, StickyNote } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface StickyNote {
  id: string;
  content: string;
  user_id: string;
  user_role: string;
  record_type: string;
  record_id: string;
  position_x: number;
  position_y: number;
  color: string;
  created_at: string;
  updated_at: string;
}

interface StickyNotesProps {
  recordType: 'payment' | 'loan' | 'expense' | 'delivery';
  recordId: string;
  className?: string;
}

const StickyNotes: React.FC<StickyNotesProps> = ({ recordType, recordId, className = '' }) => {
  const [notes, setNotes] = useState<StickyNote[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const { user } = useAuth();
  const { isDirectorCaleb, isLoading } = useDirectorCaleb();
  const { toast } = useToast();

  useEffect(() => {
    if (user && recordId) {
      loadNotes();
    }
  }, [user, recordId, recordType]);

  const loadNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('sticky_notes')
        .select('*')
        .eq('record_type', recordType)
        .eq('record_id', recordId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error('Error loading notes:', error);
      toast({
        title: "Error",
        description: "Failed to load notes",
        variant: "destructive",
      });
    }
  };

  const addNote = async () => {
    if (!isDirectorCaleb || !user) {
      toast({
        title: "Not Authorized",
        description: "Only Director Caleb can add notes",
        variant: "destructive",
      });
      return;
    }

    try {
      const newNote = {
        user_id: user.id,
        user_role: 'director',
        record_type: recordType,
        record_id: recordId,
        content: '',
        position_x: 0,
        position_y: notes.length * 120,
      };

      const { error } = await supabase
        .from('sticky_notes')
        .insert([newNote]);

      if (error) throw error;
      await loadNotes();
      
      toast({
        title: "Success",
        description: "Note added successfully",
      });
    } catch (error) {
      console.error('Error adding note:', error);
      toast({
        title: "Error",
        description: "Failed to add note",
        variant: "destructive",
      });
    }
  };

  const updateNote = async (id: string, content: string) => {
    try {
      const { error } = await supabase
        .from('sticky_notes')
        .update({ content })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating note:', error);
      toast({
        title: "Error",
        description: "Failed to update note",
        variant: "destructive",
      });
    }
  };

  const deleteNote = async (id: string) => {
    try {
      const { error } = await supabase
        .from('sticky_notes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setNotes(notes.filter(note => note.id !== id));
      
      toast({
        title: "Success",
        description: "Note deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting note:', error);
      toast({
        title: "Error",
        description: "Failed to delete note",
        variant: "destructive",
      });
    }
  };

  if (!user) return null;

  const noteCount = notes.length;

  return (
    <div className={`relative ${className}`}>
      {/* Toggle Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsVisible(!isVisible)}
        className="relative"
      >
        <StickyNote className="h-4 w-4 mr-1" />
        Notes
        {noteCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {noteCount}
          </span>
        )}
      </Button>

      {/* Notes Panel */}
      {isVisible && (
        <div className="absolute top-12 right-0 z-50 w-80 max-h-96 overflow-y-auto">
          <Card className="p-4 shadow-lg border bg-background">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-sm">Notes</h3>
              <div className="flex gap-2">
                {isDirectorCaleb && !isLoading && (
                  <Button size="sm" onClick={addNote} variant="outline">
                    Add Note
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsVisible(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto">
              {notes.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-4">
                  No notes yet
                </p>
              ) : (
                notes.map((note) => (
                  <Card key={note.id} className="p-3 bg-yellow-50 border-l-4 border-l-yellow-400">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs text-muted-foreground font-medium">
                        {note.user_role} • {new Date(note.created_at).toLocaleDateString()}
                      </span>
                      {isDirectorCaleb && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteNote(note.id)}
                          className="h-6 w-6 p-0 hover:bg-red-100"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    <Textarea
                      value={note.content}
                      onChange={(e) => {
                        const newContent = e.target.value;
                        setNotes(prev =>
                          prev.map(n => n.id === note.id ? { ...n, content: newContent } : n)
                        );
                      }}
                      onBlur={(e) => updateNote(note.id, e.target.value)}
                      placeholder="Add your note..."
                      className="min-h-[60px] bg-transparent border-none resize-none text-sm"
                      disabled={note.user_id !== user.id}
                    />
                  </Card>
                ))
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default StickyNotes;