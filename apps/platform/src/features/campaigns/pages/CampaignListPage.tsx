import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Button, 
  Input, 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow,
} from 'ui';
import { useCampaigns } from '../api/campaign.queries';
import { CampaignStatus } from 'api';
import { Search, Plus, Calendar } from 'lucide-react';

const statusStyles: Record<CampaignStatus, { bg: string, text: string, dot: string }> = {
  DRAFT: { bg: 'bg-muted', text: 'text-muted-foreground', dot: 'bg-muted-foreground' },
  SCHEDULED: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', dot: 'bg-blue-500' },
  ACTIVE: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
  PAUSED: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', dot: 'bg-amber-500' },
  COMPLETED: { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-700 dark:text-indigo-400', dot: 'bg-indigo-500' },
  ARCHIVED: { bg: 'bg-muted', text: 'text-muted-foreground', dot: 'bg-muted-foreground' }
};

export function CampaignListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  
  const { data: campaignsData, isLoading } = useCampaigns({ search, limit: 50 });

  return (
    <div className="p-4 md:p-8 max-w-[1440px] mx-auto w-full space-y-6 bg-background min-h-[calc(100vh-4rem)]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Campaigns</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage learning campaigns and assignments.</p>
        </div>
        <Button onClick={() => navigate('/campaigns/new')} className="flex items-center gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-sm">
          <Plus className="w-4 h-4" />
          New Campaign
        </Button>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input 
              placeholder="Search campaigns..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-background w-full" 
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-9 cursor-not-allowed opacity-70" title="Coming soon">
              Filter
            </Button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center p-12">
            <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : campaignsData?.data?.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center">
            <span className="material-symbols-outlined text-4xl mb-4 opacity-20">campaign</span>
            <p className="text-lg font-medium text-foreground">No campaigns found.</p>
            <p className="text-sm mt-1">Adjust your search or create a new campaign.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-semibold uppercase text-xs tracking-wider">Campaign Details</TableHead>
                  <TableHead className="font-semibold uppercase text-xs tracking-wider">Status</TableHead>
                  <TableHead className="font-semibold uppercase text-xs tracking-wider">Schedule</TableHead>
                  <TableHead className="font-semibold uppercase text-xs tracking-wider text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaignsData?.data?.map(campaign => (
                  <TableRow 
                    key={campaign.id} 
                    className="cursor-pointer hover:bg-muted/50 transition-colors group" 
                    onClick={() => navigate(campaign.status === 'DRAFT' ? `/campaigns/new?id=${campaign.id}` : `/campaigns/${campaign.id}`)}
                  >
                    <TableCell className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary border border-secondary/20 shrink-0">
                          <span className="material-symbols-outlined">campaign</span>
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{campaign.name}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-xs">{campaign.description || 'No description provided.'}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyles[campaign.status].bg} ${statusStyles[campaign.status].text}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${statusStyles[campaign.status].dot}`}></div>
                        {campaign.status}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{campaign.startDate ? new Date(campaign.startDate).toLocaleDateString() : 'TBD'}</span>
                        </div>
                        <span className="text-muted-foreground/50">→</span>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{campaign.endDate ? new Date(campaign.endDate).toLocaleDateString() : 'TBD'}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
