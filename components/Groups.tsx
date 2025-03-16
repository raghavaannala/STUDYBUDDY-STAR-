import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from 'src/components/ui/button';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import { Card } from 'src/components/ui/card';
import { Users, Pencil, Trash2 } from 'lucide-react';

interface Group {
  _id: string;
  name: string;
  description: string;
  createdBy: string;
}

interface StudyGroup {
  id: string;
  name: string;
  interest: string;
  members: number;
  createdAt: Date;
}

export default function Groups() {
  const { data: session } = useSession();
  const [groups, setGroups] = useState<Group[]>([]);
  const [newGroup, setNewGroup] = useState({ 
    name: '', 
    description: '', 
    interest: 'programming',
    members: 1 
  });
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    const res = await fetch('/api/groups');
    const data = await res.json();
    setGroups(data);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create the study group
    const studyGroup: StudyGroup = {
      id: Date.now().toString(),
      name: newGroup.name,
      interest: newGroup.interest,
      members: newGroup.members,
      createdAt: new Date()
    };

    // Save to localStorage
    const savedGroups = JSON.parse(localStorage.getItem('userStudyGroups') || '[]');
    const updatedGroups = [...savedGroups, studyGroup];
    localStorage.setItem('userStudyGroups', JSON.stringify(updatedGroups));

    // Notify sidebar of the update
    window.dispatchEvent(new Event('studyGroupsUpdated'));

    // Save to API
    await fetch('/api/groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newGroup)
    });

    // Reset form and refresh groups
    setNewGroup({ 
      name: '', 
      description: '', 
      interest: 'programming',
      members: 1 
    });
    fetchGroups();
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGroup) return;
    
    await fetch(`/api/groups/${editingGroup._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingGroup)
    });

    // Update in localStorage
    const savedGroups = JSON.parse(localStorage.getItem('userStudyGroups') || '[]');
    const updatedGroups = savedGroups.map((group: StudyGroup) => 
      group.id === editingGroup._id 
        ? { ...group, name: editingGroup.name, description: editingGroup.description }
        : group
    );
    localStorage.setItem('userStudyGroups', JSON.stringify(updatedGroups));
    window.dispatchEvent(new Event('studyGroupsUpdated'));

    setEditingGroup(null);
    fetchGroups();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/groups/${id}`, { method: 'DELETE' });
    
    // Remove from localStorage
    const savedGroups = JSON.parse(localStorage.getItem('userStudyGroups') || '[]');
    const updatedGroups = savedGroups.filter((group: StudyGroup) => group.id !== id);
    localStorage.setItem('userStudyGroups', JSON.stringify(updatedGroups));
    window.dispatchEvent(new Event('studyGroupsUpdated'));

    fetchGroups();
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center gap-3 mb-8">
        <Users className="h-8 w-8 text-primary" />
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
          Create Study Group
        </h2>
      </div>
      
      <Card className="p-6 mb-8">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Group Name</Label>
              <Input
                id="name"
                placeholder="Enter group name"
                value={newGroup.name}
                onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="interest">Interest Area</Label>
              <select
                id="interest"
                className="w-full p-2 rounded-md border border-input bg-background"
                value={newGroup.interest}
                onChange={(e) => setNewGroup({ ...newGroup, interest: e.target.value })}
                required
              >
                <option value="programming">Programming</option>
                <option value="math">Mathematics</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Describe your study group"
              value={newGroup.description}
              onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
              required
            />
          </div>

          <Button type="submit" className="w-full">
            Create Group
          </Button>
        </form>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {groups.map((group) => (
          <Card key={group._id} className="p-4">
            {editingGroup?._id === group._id ? (
              <form onSubmit={handleUpdate} className="space-y-4">
                <Input
                  value={editingGroup.name}
                  onChange={(e) => setEditingGroup({ ...editingGroup, name: e.target.value })}
                  className="mb-2"
                />
                <Input
                  value={editingGroup.description}
                  onChange={(e) => setEditingGroup({ ...editingGroup, description: e.target.value })}
                  className="mb-2"
                />
                <div className="flex gap-2">
                  <Button type="submit" variant="default">Save</Button>
                  <Button type="button" variant="outline" onClick={() => setEditingGroup(null)}>
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div>
                <h3 className="text-xl font-semibold mb-2">{group.name}</h3>
                <p className="text-muted-foreground mb-4">{group.description}</p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingGroup(group)}
                  >
                    <Pencil className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(group._id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
} 