import { useNotificationTemplates, useDeleteNotificationTemplate } from '../hooks/useNotificationQueries';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell, Button } from 'ui';

export function NotificationTemplatesPage() {
  const { data: templates, isLoading } = useNotificationTemplates();
  const deleteMutation = useDeleteNotificationTemplate();

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) return <div className="p-8">Loading templates...</div>;

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Notification Templates</h1>
        <Button disabled>Create Template (API supported, UI pending)</Button>
      </div>

      <div className="bg-white rounded-lg shadow border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Channel</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {templates?.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No templates found.
                </TableCell>
              </TableRow>
            )}
            {templates?.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-medium">{t.name}</TableCell>
                <TableCell className="font-mono text-sm">{t.code}</TableCell>
                <TableCell>{t.type}</TableCell>
                <TableCell>{t.channel}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded text-xs ${t.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {t.isActive ? 'Active' : 'Inactive'}
                  </span>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(t.id)} className="text-red-600 hover:text-red-800">
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
