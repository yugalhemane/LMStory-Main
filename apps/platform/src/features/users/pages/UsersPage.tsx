import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi, CreateUserRequest } from 'api';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  Button, Input, Badge, Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
  DialogTrigger, Label
} from 'ui';
import { Search, Plus, Trash, UserX, UserCheck, UploadCloud, Users, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  department: z.string().optional(),
  designation: z.string().optional(),
});
type CreateUserFormValues = z.infer<typeof createUserSchema>;

export function UsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['users', { page, search }],
    queryFn: () => userApi.listUsers({ page, limit: 10, search }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => userApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setDeleteConfirmId(null);
    },
    onError: (err: any) => setErrorMsg(err.response?.data?.message || 'Failed to delete user'),
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => userApi.deactivateUser(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
    onError: (err: any) => setErrorMsg(err.response?.data?.message || 'Failed to deactivate user'),
  });

  const activateMutation = useMutation({
    mutationFn: (id: string) => userApi.activateUser(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
    onError: (err: any) => setErrorMsg(err.response?.data?.message || 'Failed to activate user'),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateUserRequest) => userApi.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsAddOpen(false);
      reset();
    },
    onError: (err: any) => setErrorMsg(err.response?.data?.message || 'Failed to create user'),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema)
  });

  const onSubmit = (formData: CreateUserFormValues) => {
    setErrorMsg(null);
    createMutation.mutate(formData);
  };

  const getStatusBadge = (user: any) => {
    if (user.isActive) {
      return (
        <div className="flex items-center gap-1.5 text-emerald-600 font-semibold text-sm">
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          Active
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1.5 text-muted-foreground font-semibold text-sm">
        <div className="w-2 h-2 rounded-full bg-muted-foreground"></div>
        Inactive
      </div>
    );
  };

  return (
    <div className="p-4 md:p-8 max-w-[1440px] mx-auto space-y-8 bg-background min-h-[calc(100vh-4rem)]">
      {errorMsg && (
        <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-lg text-sm font-medium border border-destructive/20 shadow-sm">
          {errorMsg}
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">User Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage organizational hierarchy, roles, and platform access.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="flex items-center gap-2 bg-background cursor-not-allowed opacity-70" title="Coming Soon">
            <UploadCloud className="w-4 h-4" />
            CSV Import
          </Button>
          <Dialog open={isAddOpen} onOpenChange={(open) => {
            setIsAddOpen(open);
            if (!open) {
              reset();
              setErrorMsg(null);
            }
          }}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-sm">
                <Plus className="w-4 h-4" /> Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="text-xl">Add New User</DialogTitle>
                <DialogDescription>Create a new user account manually.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">First Name</Label>
                    <Input {...register('firstName')} className="bg-background" />
                    {errors.firstName && <span className="text-xs text-destructive">{errors.firstName.message}</span>}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Last Name</Label>
                    <Input {...register('lastName')} className="bg-background" />
                    {errors.lastName && <span className="text-xs text-destructive">{errors.lastName.message}</span>}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Email</Label>
                  <Input type="email" {...register('email')} className="bg-background" />
                  {errors.email && <span className="text-xs text-destructive">{errors.email.message}</span>}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Department (Optional)</Label>
                  <Input {...register('department')} className="bg-background" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Password</Label>
                  <Input type="password" {...register('password')} className="bg-background" />
                  {errors.password && <span className="text-xs text-destructive">{errors.password.message}</span>}
                </div>
                <div className="flex justify-end space-x-3 pt-4 border-t border-border">
                  <Button variant="outline" type="button" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={createMutation.isPending} className="bg-secondary text-secondary-foreground">
                    {createMutation.isPending ? 'Creating...' : 'Create User'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Overview (Bento Style) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card p-4 border border-border rounded-xl flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Users</p>
            <p className="text-2xl font-bold text-foreground">
              {isLoading ? '...' : (data?.data?.meta?.total || 0)}
            </p>
          </div>
        </div>
        <div className="bg-card p-4 border border-border rounded-xl flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Active Now</p>
            {/* Using totalItems as placeholder for active since we don't have this metric specifically */}
            <p className="text-2xl font-bold text-foreground">—</p>
          </div>
        </div>
        <div className="bg-card p-4 border border-border rounded-xl flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pending Invites</p>
            <p className="text-2xl font-bold text-foreground">—</p>
          </div>
        </div>
        <div className="bg-card p-4 border border-border rounded-xl flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Inactive</p>
            <p className="text-2xl font-bold text-foreground">—</p>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 flex flex-wrap items-center justify-between gap-4 border-b border-border bg-muted/30">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              className="pl-9 bg-background"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-9 cursor-not-allowed opacity-70" title="Coming soon">
              Filter
            </Button>
            <Button variant="outline" size="sm" className="h-9 cursor-not-allowed opacity-70" title="Coming soon">
              Export
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-12">
            <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : !data || data.data.data.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center">
            <Users className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-lg font-medium">No users found.</p>
            <p className="text-sm mt-1">Adjust your search or add a new user.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-semibold uppercase text-xs tracking-wider">User Details</TableHead>
                  <TableHead className="font-semibold uppercase text-xs tracking-wider">Department</TableHead>
                  <TableHead className="font-semibold uppercase text-xs tracking-wider">Group</TableHead>
                  <TableHead className="font-semibold uppercase text-xs tracking-wider">Role</TableHead>
                  <TableHead className="font-semibold uppercase text-xs tracking-wider">Status</TableHead>
                  <TableHead className="font-semibold uppercase text-xs tracking-wider text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.data.map((user) => (
                  <TableRow key={user.id} className="hover:bg-muted/50 transition-colors group">
                    <TableCell className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-bold border border-secondary/20">
                          {user.firstName?.[0]}{user.lastName?.[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{user.firstName} {user.lastName}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{user.department || '—'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">—</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-secondary/10 text-secondary border-transparent">
                        Learner
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(user)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {user.isActive ? (
                          <Button variant="ghost" size="icon" title="Deactivate" className="h-8 w-8 hover:bg-warning/10 hover:text-warning" disabled={deactivateMutation.isPending} onClick={() => deactivateMutation.mutate(user.id)}>
                            <UserX className="w-4 h-4" />
                          </Button>
                        ) : (
                          <Button variant="ghost" size="icon" title="Activate" className="h-8 w-8 hover:bg-success/10 hover:text-success" disabled={activateMutation.isPending} onClick={() => activateMutation.mutate(user.id)}>
                            <UserCheck className="w-4 h-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" title="Delete" className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive" onClick={() => setDeleteConfirmId(user.id)}>
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        
        {data && data.data.meta.totalPages > 1 && (
          <div className="p-4 border-t border-border flex items-center justify-between bg-muted/20">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-medium text-foreground">{(page - 1) * 10 + 1}</span> to <span className="font-medium text-foreground">{Math.min(page * 10, data.data.meta.total)}</span> of <span className="font-medium text-foreground">{data.data.meta.total}</span> users
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="bg-background"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page === data.data.meta.totalPages}
                onClick={() => setPage(p => p + 1)}
                className="bg-background"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
            <Button variant="destructive" disabled={deleteMutation.isPending} onClick={() => deleteConfirmId && deleteMutation.mutate(deleteConfirmId)}>
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
