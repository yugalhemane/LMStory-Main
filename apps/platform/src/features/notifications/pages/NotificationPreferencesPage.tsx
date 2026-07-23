import { useNotificationPreferences, useUpdateNotificationPreference } from '../hooks/useNotificationQueries';
import { Card, CardHeader, CardTitle, CardContent } from 'ui';

export function NotificationPreferencesPage() {
  const { data: preferences, isLoading } = useNotificationPreferences();
  const updateMutation = useUpdateNotificationPreference();

  if (isLoading) return <div className="p-8">Loading preferences...</div>;

  const handleToggle = (type: string, channel: string, current: boolean) => {
    updateMutation.mutate({ type, channel, isEnabled: !current });
  };

  // Group by type
  const types = ['SYSTEM', 'ALERT', 'MESSAGE', 'REMINDER'];
  const channels = ['IN_APP', 'EMAIL']; // Only exposing partially supported or verified

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Notification Preferences</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Communication Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {types.map(type => (
              <div key={type} className="border-b pb-4 last:border-0">
                <h3 className="font-semibold mb-3 capitalize">{type.toLowerCase()} Notifications</h3>
                <div className="flex gap-6">
                  {channels.map(channel => {
                    const pref = preferences?.find(p => p.type === type && p.channel === channel);
                    const isEnabled = pref ? pref.isEnabled : true; // Default true if not explicitly disabled

                    return (
                      <label key={channel} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isEnabled}
                          onChange={() => handleToggle(type, channel, isEnabled)}
                          disabled={updateMutation.isPending}
                          className="rounded text-primary focus:ring-primary"
                        />
                        <span className="text-sm text-gray-700">{channel === 'IN_APP' ? 'In-App' : 'Email'}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
