import { useNotifications, useMarkNotificationAsRead, useMarkAllNotificationsAsRead } from '../hooks/useNotificationQueries';
import { Button, Table, TableBody, TableCell, TableRow } from 'ui';
import { Bell, Check, CheckCircle2 } from 'lucide-react';

// Custom relative time formatter to avoid external dependencies
function formatTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export function LearnerNotificationsPage() {
  const { data, isLoading } = useNotifications(1, 50);
  const markReadMutation = useMarkNotificationAsRead();
  const markAllReadMutation = useMarkAllNotificationsAsRead();

  if (isLoading) {
    return (
      <div className="p-4 md:p-8 max-w-[1440px] mx-auto w-full">
        <h1 className="text-2xl font-bold tracking-tight mb-4">Inbox</h1>
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  const notifications = data?.data || [];
  const unreadCount = notifications.filter(n => n.status === 'UNREAD').length;

  const getSeverityStyles = (type: string) => {
    switch(type.toUpperCase()) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-700';
      case 'WARNING':
        return 'bg-amber-100 text-amber-700';
      case 'SUCCESS':
        return 'bg-emerald-100 text-emerald-700';
      default:
        return 'bg-blue-100 text-blue-700';
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-[1440px] mx-auto w-full space-y-6 bg-background min-h-[calc(100vh-4rem)]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Inbox</h1>
          {unreadCount > 0 && (
            <span className="bg-secondary text-primary-foreground text-xs font-bold px-2.5 py-0.5 rounded-full">
              {unreadCount} Unread
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => markAllReadMutation.mutate()} 
            disabled={unreadCount === 0 || markAllReadMutation.isPending}
            className="flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Mark all as read
          </Button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="flex border-b border-border bg-muted/30">
          <button className="px-6 py-3 text-sm font-semibold text-secondary border-b-2 border-secondary">All</button>
          <button className="px-6 py-3 text-sm font-medium text-muted-foreground hover:text-foreground cursor-not-allowed opacity-70" title="Coming Soon">Unread</button>
          <button className="px-6 py-3 text-sm font-medium text-muted-foreground hover:text-foreground cursor-not-allowed opacity-70" title="Coming Soon">System</button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableBody>
              {notifications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                    <Bell className="w-8 h-8 mx-auto mb-3 opacity-20" />
                    No notifications to display.
                  </TableCell>
                </TableRow>
              ) : (
                notifications.map(notification => (
                  <TableRow 
                    key={notification.id} 
                    className={`group transition-colors ${notification.status === 'UNREAD' ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-muted/50'}`}
                  >
                    <TableCell className="w-24 pl-6">
                      <div className="flex items-center gap-2">
                        {notification.status === 'UNREAD' ? (
                          <div className="w-2.5 h-2.5 rounded-full bg-secondary shadow-[0_0_8px_rgba(var(--secondary),0.5)]"></div>
                        ) : (
                          <div className="w-2.5 h-2.5 rounded-full border border-muted-foreground/30"></div>
                        )}
                        <span className={`text-sm ${notification.status === 'UNREAD' ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                          {notification.status === 'UNREAD' ? 'Unread' : 'Read'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="w-32">
                      <span className={`px-2.5 py-1 text-[11px] rounded-full font-bold uppercase tracking-wider ${getSeverityStyles(notification.type)}`}>
                        {notification.type}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-md">
                      <div className="pr-4">
                        <p className={`text-sm truncate ${notification.status === 'UNREAD' ? 'font-semibold text-foreground' : 'text-foreground'}`}>
                          {notification.title}
                        </p>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{notification.body}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap text-xs text-muted-foreground">
                      {formatTimeAgo(notification.createdAt)}
                    </TableCell>
                    <TableCell className="text-right pr-6 w-16">
                      {notification.status === 'UNREAD' ? (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-secondary hover:bg-secondary/10 transition-all"
                          onClick={() => markReadMutation.mutate(notification.id)}
                          disabled={markReadMutation.isPending}
                          title="Mark as read"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      ) : (
                        <div className="w-8 h-8"></div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
