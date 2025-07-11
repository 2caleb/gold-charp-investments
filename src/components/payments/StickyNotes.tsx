import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useDirectorCaleb } from '@/hooks/use-director-caleb';
import { useUser } from '@/hooks/use-user';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, StickyNote, MessageCircle, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface StickyNote {
  id: string;
  content: string;
  user_id: string;
  user_role: string;
  record_type: string;
  record_id: string;
  position_x?: number;
  position_y?: number;
  color?: string;
  created_at: string;
  updated_at: string;
  note_type: 'note' | 'comment';
  author_name?: string;
}

interface StickyNotesProps {
  recordType: 'payment' | 'loan' | 'expense' | 'delivery';
  recordId: string;
  className?: string;
}

const StickyNotes: React.FC<StickyNotesProps> = ({ recordType, recordId, className = '' }) => {
  const [notes, setNotes] = useState<StickyNote[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { user } = useAuth();
  const { isDirectorCaleb, isLoading } = useDirectorCaleb();
  const { userProfile } = useUser();
  const { toast } = useToast();

  // Check if user can comment (CEO or Chairperson)
  const userRole = userProfile?.role;
  const canComment = userRole === 'ceo' || userRole === 'chairperson';
  const canAddNote = isDirectorCaleb;

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
      
      // Properly type the data to match our interface
      const typedNotes: StickyNote[] = (data || []).map(item => ({
        ...item,
        note_type: (item.note_type as 'note' | 'comment') || 'note'
      }));
      
      setNotes(typedNotes);
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
    if (!canAddNote || !user || !userProfile) {
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
        note_type: 'note' as const,
        author_name: userProfile.full_name || 'Director Caleb',
        position_x: 0,
        position_y: notes.length * 120,
      };

      const { data, error } = await supabase
        .from('sticky_notes')
        .insert([newNote])
        .select()
        .single();

      if (error) throw error;
      
      // Add the new note to state and start editing it
      if (data) {
        const typedNote: StickyNote = {
          ...data,
          note_type: data.note_type as 'note' | 'comment'
        };
        setNotes(prev => [...prev, typedNote]);
        setEditingId(data.id);
      }
      
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

  const addComment = async () => {
    if (!canComment || !user || !userProfile) {
      toast({
        title: "Not Authorized",
        description: "Only CEO and Chairperson can add comments",
        variant: "destructive",
      });
      return;
    }

    try {
      const newComment = {
        user_id: user.id,
        user_role: userRole || 'user',
        record_type: recordType,
        record_id: recordId,
        content: '',
        note_type: 'comment' as const,
        author_name: userProfile.full_name || userRole?.toUpperCase(),
        position_x: 0,
        position_y: notes.length * 120,
      };

      const { data, error } = await supabase
        .from('sticky_notes')
        .insert([newComment])
        .select()
        .single();

      if (error) throw error;
      
      // Add the new comment to state and start editing it
      if (data) {
        const typedComment: StickyNote = {
          ...data,
          note_type: data.note_type as 'note' | 'comment'
        };
        setNotes(prev => [...prev, typedComment]);
        setEditingId(data.id);
      }
      
      toast({
        title: "Success",
        description: "Comment added successfully",
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Error",
        description: "Failed to add comment",
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
      
      // Update local state
      setNotes(prev => prev.map(note => 
        note.id === id ? { ...note, content } : note
      ));
      
    } catch (error) {
      console.error('Error updating note:', error);
      toast({
        title: "Error",
        description: "Failed to update note",
        variant: "destructive",
      });
      // Reload notes to get the correct state
      loadNotes();
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
        description: "Item deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting note:', error);
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive",
      });
    }
  };

  const canEditItem = (note: StickyNote) => {
    // Director Caleb can edit anything
    if (isDirectorCaleb) return true;
    // CEO/Chairperson can edit their own comments
    if (canComment && note.note_type === 'comment' && note.user_id === user?.id) return true;
    return false;
  };

  const canDeleteItem = (note: StickyNote) => {
    // Only Director Caleb can delete items
    return isDirectorCaleb;
  };

  const getItemStyle = (note: StickyNote) => {
    if (note.note_type === 'note') {
      return 'bg-yellow-50 border-l-4 border-l-yellow-400'; // Notes in yellow
    } else {
      // Comments: blue for CEO, green for Chairperson
      if (note.user_role === 'ceo') {
        return 'bg-blue-50 border-l-4 border-l-blue-400';
      } else if (note.user_role === 'chairperson') {
        return 'bg-green-50 border-l-4 border-l-green-400';
      }
    }
    return 'bg-gray-50 border-l-4 border-l-gray-400';
  };

  const getTypeIcon = (note: StickyNote) => {
    return note.note_type === 'note' ? (
      <StickyNote className="h-3 w-3" />
    ) : (
      <MessageCircle className="h-3 w-3" />
    );
  };

  const getTypeBadge = (note: StickyNote) => {
    const variant = note.note_type === 'note' ? 'default' : 'secondary';
    const label = note.note_type === 'note' ? 'Note' : 'Comment';
    return <Badge variant={variant} className="text-xs">{label}</Badge>;
  };

  if (!user) return null;

  const noteCount = notes.length;
  const noteItems = notes.filter(n => n.note_type === 'note').length;
  const commentItems = notes.filter(n => n.note_type === 'comment').length;

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
        Notes & Comments
        {noteCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {noteCount}
          </span>
        )}
      </Button>

      {/* Notes Panel */}
      {isVisible && (
        <div className="absolute top-12 right-0 z-50 w-96 max-h-96 overflow-y-auto">
          <Card className="p-4 shadow-lg border bg-background">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-semibold text-sm">Notes & Comments</h3>
                <p className="text-xs text-muted-foreground">
                  {noteItems} notes • {commentItems} comments
                </p>
              </div>
              <div className="flex gap-2">
                {canAddNote && !isLoading && (
                  <Button size="sm" onClick={addNote} variant="outline">
                    <StickyNote className="h-3 w-3 mr-1" />
                    Add Note
                  </Button>
                )}
                {canComment && (
                  <Button size="sm" onClick={addComment} variant="outline">
                    <MessageCircle className="h-3 w-3 mr-1" />
                    Comment
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
                  No notes or comments yet
                </p>
              ) : (
                notes.map((note) => (
                  <Card key={note.id} className={`p-3 ${getItemStyle(note)}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(note)}
                        {getTypeBadge(note)}
                        <span className="text-xs text-muted-foreground font-medium">
                          {note.author_name || note.user_role}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(note.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        {canDeleteItem(note) && (
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
                    </div>
                    <Textarea
                      value={note.content}
                      onChange={(e) => {
                        const newContent = e.target.value;
                        setNotes(prev =>
                          prev.map(n => n.id === note.id ? { ...n, content: newContent } : n)
                        );
                      }}
                      onFocus={() => setEditingId(note.id)}
                      onBlur={(e) => {
                        updateNote(note.id, e.target.value);
                        setEditingId(null);
                      }}
                      placeholder={note.note_type === 'note' ? "Add your note..." : "Add your comment..."}
                      className="min-h-[60px] bg-transparent border-none resize-none text-sm focus:ring-0 focus:outline-none"
                      disabled={!canEditItem(note)}
                    />
                    {note.updated_at !== note.created_at && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Edited {new Date(note.updated_at).toLocaleDateString()}
                      </p>
                    )}
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