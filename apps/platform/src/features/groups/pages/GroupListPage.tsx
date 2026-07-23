import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Button, 
  Input,
  Badge,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from 'ui';
import { useGroups, useCreateGroup } from '../api/group.queries';

export function GroupListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', code: '', type: 'STATIC' as any });

  const { data: groupsData, isLoading } = useGroups({ search, limit: 50 });
  const createMutation = useCreateGroup();

  const handleCreate = async () => {
    try {
      const group = await createMutation.mutateAsync(newGroup);
      setIsCreateOpen(false);
      navigate(`/groups/${group.id}`);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-[1440px] mx-auto w-full space-y-6 bg-background min-h-[calc(100vh-4rem)]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Groups</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage target audiences for your campaigns.</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="flex items-center gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-sm">
          <span className="material-symbols-outlined text-[18px]">add</span>
          Create Group
        </Button>
      </div>

      <div className="flex items-center gap-4 border-b border-border pb-6">
        <div className="relative w-full max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">search</span>
          <Input 
            placeholder="Search groups..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card border-border w-full" 
          />
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <Button variant="outline" className="bg-background cursor-not-allowed opacity-70" title="Coming soon">
            Filter
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : groupsData?.data?.length === 0 ? (
        <div className="p-12 text-center text-muted-foreground bg-card border border-border rounded-xl">
          <span className="material-symbols-outlined text-4xl mb-2 opacity-30">group</span>
          <p className="text-lg font-medium">No groups found.</p>
          <p className="text-sm">Create a group to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {groupsData?.data?.map(group => (
            <div key={group.id} className="bg-card border border-border rounded-xl overflow-hidden group hover:border-secondary transition-all hover:shadow-md flex flex-col cursor-pointer" onClick={() => navigate(`/groups/${group.id}`)}>
              <div className="h-2 bg-secondary/10 group-hover:bg-secondary transition-colors"></div>
              <div className="p-5 space-y-4 flex-1">
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center text-secondary border border-border">
                    <span className="material-symbols-outlined">group</span>
                  </div>
                  <Badge variant={group.type === 'DYNAMIC' ? 'default' : 'secondary'} className="text-[10px] uppercase tracking-wider bg-secondary/10 text-secondary border-transparent">
                    {group.type}
                  </Badge>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground line-clamp-1">{group.name}</h3>
                  <p className="text-xs font-mono text-muted-foreground mt-1">{group.code}</p>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <span className="material-symbols-outlined text-[16px]">person</span>
                    <span className="text-sm font-medium">{group.memberCount} Members</span>
                  </div>
                  {group.isActive ? (
                    <div className="w-2 h-2 rounded-full bg-emerald-500" title="Active"></div>
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-muted-foreground" title="Inactive"></div>
                  )}
                </div>
              </div>
              <div className="p-4 bg-muted/30 border-t border-border flex justify-between items-center">
                <button className="text-sm font-medium text-secondary hover:underline decoration-2 underline-offset-4" onClick={(e) => { e.stopPropagation(); navigate(`/groups/${group.id}`); }}>
                  View Details
                </button>
                <button className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" onClick={(e) => { e.stopPropagation(); /* dropdown coming soon */ }}>
                  <span className="material-symbols-outlined text-[18px]">more_vert</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Group</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Group Name *</label>
              <Input 
                value={newGroup.name} 
                onChange={e => setNewGroup({ ...newGroup, name: e.target.value })} 
                placeholder="e.g. Sales Team" 
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Unique Code *</label>
              <Input 
                value={newGroup.code} 
                onChange={e => setNewGroup({ ...newGroup, code: e.target.value })} 
                placeholder="e.g. SALES_TEAM" 
                className="bg-background uppercase"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!newGroup.name || !newGroup.code || createMutation.isPending} className="bg-secondary text-secondary-foreground">
              {createMutation.isPending ? 'Creating...' : 'Create Group'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
