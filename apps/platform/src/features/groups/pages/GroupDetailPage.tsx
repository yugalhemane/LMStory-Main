import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow,
  Badge,
  Input
} from 'ui';
import { useGroup, useGroupMembers, useAddMember, useRemoveMember } from '../api/group.queries';

export function GroupDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { data: group, isLoading } = useGroup(id!);
  const { data: membersData } = useGroupMembers(id!);
  
  const addMutation = useAddMember();
  const removeMutation = useRemoveMember();

  const [newUserId, setNewUserId] = useState('');

  if (isLoading) return <div className="p-xl text-center">Loading...</div>;
  if (!group) return <div className="p-xl text-center text-error">Group not found</div>;

  const handleAdd = async () => {
    if (!newUserId) return;
    try {
      await addMutation.mutateAsync({ groupId: group.id, userId: newUserId });
      setNewUserId('');
    } catch (e) {
      console.error(e);
      alert('Failed to add user. Verify the ID is a valid tenant user UUID.');
    }
  };

  return (
    <div className="p-margin-desktop max-w-[1440px] mx-auto w-full space-y-lg">
      <div className="flex items-center gap-md">
        <Button variant="ghost" size="icon" onClick={() => navigate('/groups')}>
          <span className="material-symbols-outlined">arrow_back</span>
        </Button>
        <div>
          <div className="flex items-center gap-sm">
            <h1 className="text-headline-lg font-headline-lg text-on-surface">{group.name}</h1>
            <Badge variant="secondary">{group.code}</Badge>
            {group.isActive ? (
              <Badge className="bg-tertiary-fixed text-on-tertiary-fixed">ACTIVE</Badge>
            ) : (
              <Badge variant="destructive">INACTIVE</Badge>
            )}
          </div>
          <p className="text-body-sm text-on-surface-variant mt-1">
            {group.type} Group • {group.memberCount} members
          </p>
        </div>
      </div>

      <div className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <div className="p-lg border-b border-outline-variant bg-surface-bright flex justify-between items-center">
          <h2 className="text-title-md font-title-md">Group Members</h2>
          
          <div className="flex gap-sm">
            <Input 
              placeholder="Paste User UUID..." 
              value={newUserId}
              onChange={e => setNewUserId(e.target.value)}
              className="w-64"
            />
            <Button onClick={handleAdd} disabled={!newUserId || addMutation.isPending}>
              Add Member
            </Button>
          </div>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow className="bg-surface-container-low">
              <TableHead>User Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Joined At</TableHead>
              <TableHead className="w-24"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {membersData?.data?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-xl text-on-surface-variant">No members in this group.</TableCell>
              </TableRow>
            ) : (
              membersData?.data?.map((member: any) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.firstName} {member.lastName}</TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>{new Date(member.joinedAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      className="text-error hover:text-error hover:bg-error/10"
                      onClick={() => removeMutation.mutate({ groupId: group.id, userId: member.id })}
                    >
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
