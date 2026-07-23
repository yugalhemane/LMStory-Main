import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Input, Textarea, Stepper, MultiSelect, Alert, AlertTitle, AlertDescription } from 'ui';
import { 
  useCreateCampaign, 
  useUpdateCampaign, 
  useCampaign, 
  useAttachCourse, 
  useRemoveCourse,
  useAssignGroup,
  useUnassignGroup,
  usePublishCampaign
} from '../api/campaign.queries';
import { useBulkEnroll } from '../../enrollments/api/enrollment.queries';
import { useCourses } from '../../../hooks/useCourses';
import { useGroups } from '../../groups/api/group.queries';
import { Save, X } from 'lucide-react';

const WIZARD_STEPS = [
  { id: 'details', label: 'Details' },
  { id: 'course', label: 'Course' },
  { id: 'audience', label: 'Audience' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'review', label: 'Review' },
  { id: 'launch', label: 'Launch' },
];

export function CampaignWizardPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const campaignId = searchParams.get('id');
  const initialStep = parseInt(searchParams.get('step') || '0', 10);
  const [currentStep, setCurrentStep] = useState(initialStep);

  const { data: campaign, refetch: refetchCampaign } = useCampaign(campaignId || '');
  
  // Mutations
  const createMutation = useCreateCampaign();
  const updateMutation = useUpdateCampaign();
  const attachCourseMutation = useAttachCourse();
  const removeCourseMutation = useRemoveCourse();
  const assignGroupMutation = useAssignGroup();
  const unassignGroupMutation = useUnassignGroup();
  const publishMutation = usePublishCampaign();
  const enrollMutation = useBulkEnroll();

  // Queries
  const { data: coursesData } = useCourses({ status: 'PUBLISHED', limit: 100 });
  const { data: groupsData } = useGroups({ limit: 100 });

  // State
  const [details, setDetails] = useState({ name: '', description: '' });
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [schedule, setSchedule] = useState({ startDate: '', endDate: '' });

  // Launch State
  const [launchStatus, setLaunchStatus] = useState<'IDLE' | 'PUBLISHING' | 'ENROLLING' | 'SUCCESS' | 'PARTIAL_FAILURE'>('IDLE');
  const [launchError, setLaunchError] = useState('');

  // Hydrate state from campaign if it exists
  useEffect(() => {
    if (campaign) {
      setDetails({ name: campaign.name, description: campaign.description || '' });
      setSelectedCourses(campaign.courses?.map((c: any) => c.courseId) || []);
      setSelectedGroups(campaign.targetGroups?.map((g: any) => g.groupId) || []);
      setSchedule({ 
        startDate: campaign.startDate ? new Date(campaign.startDate).toISOString().slice(0, 16) : '', 
        endDate: campaign.endDate ? new Date(campaign.endDate).toISOString().slice(0, 16) : '' 
      });
    }
  }, [campaign]);

  // Update URL on step change
  useEffect(() => {
    if (campaignId) {
      setSearchParams({ id: campaignId, step: currentStep.toString() });
    }
  }, [currentStep, campaignId, setSearchParams]);

  const handleNext = async () => {
    try {
      if (currentStep === 0) {
        // Step 1: Create or Update Details
        if (!campaignId) {
          const newCampaign = await createMutation.mutateAsync({ ...details });
          setSearchParams({ id: newCampaign.id, step: '1' });
          setCurrentStep(1);
          return;
        } else {
          await updateMutation.mutateAsync({ id: campaignId, data: details });
        }
      } else if (currentStep === 1) {
        // Step 2: Course
        // Synchronize courses
        const existingCourses = campaign?.courses?.map((c: any) => c.courseId) || [];
        const toAdd = selectedCourses.filter((id: string) => !existingCourses.includes(id));
        const toRemove = existingCourses.filter((id: string) => !selectedCourses.includes(id));
        
        for (const id of toRemove) await removeCourseMutation.mutateAsync({ campaignId: campaignId!, courseId: id });
        for (const id of toAdd) await attachCourseMutation.mutateAsync({ campaignId: campaignId!, courseId: id });
      } else if (currentStep === 2) {
        // Step 3: Audience
        const existingGroups = campaign?.targetGroups?.map((g: any) => g.groupId) || [];
        const toAdd = selectedGroups.filter((id: string) => !existingGroups.includes(id));
        const toRemove = existingGroups.filter((id: string) => !selectedGroups.includes(id));
        
        for (const id of toRemove) await unassignGroupMutation.mutateAsync({ campaignId: campaignId!, groupId: id });
        for (const id of toAdd) await assignGroupMutation.mutateAsync({ campaignId: campaignId!, groupId: id });
      } else if (currentStep === 3) {
        // Step 4: Schedule
        await updateMutation.mutateAsync({ 
          id: campaignId!, 
          data: { 
            startDate: schedule.startDate ? new Date(schedule.startDate).toISOString() : undefined,
            endDate: schedule.endDate ? new Date(schedule.endDate).toISOString() : undefined
          } 
        });
      }

      await refetchCampaign();
      setCurrentStep(prev => Math.min(prev + 1, WIZARD_STEPS.length - 1));
    } catch (e: any) {
      console.error(e);
      alert(e.response?.data?.message || 'An error occurred saving your progress.');
    }
  };

  const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  // We need to fetch all group members to expand them for bulk enrollment
  // A simplistic approach for Module 6: we can fetch them on launch
  // Note: For large datasets, backend should handle group expansion, but our contract requires frontend expansion.
  const handleLaunch = async () => {
    try {
      setLaunchStatus('PUBLISHING');
      setLaunchError('');
      
      // 1. Publish Campaign
      await publishMutation.mutateAsync(campaignId!);

      setLaunchStatus('ENROLLING');
      
      // 2. Fetch and expand group members
      const allUserIds = new Set<string>();
      if (campaign?.targetUsers) {
        campaign.targetUsers.forEach((u: any) => allUserIds.add(u.userId));
      }
      
      for (const groupId of selectedGroups) {
        // In a real app we might need pagination here, but for this exercise we assume limit: 10000 covers it
        const res = await fetch(`/api/groups/${groupId}/members?limit=10000`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }).then(r => r.json());
        
        if (res.data) {
          res.data.forEach((m: any) => allUserIds.add(m.id));
        }
      }

      const uniqueUserIds = Array.from(allUserIds);
      
      if (uniqueUserIds.length > 0) {
        await enrollMutation.mutateAsync({ campaignId: campaignId!, userIds: uniqueUserIds });
      }

      setLaunchStatus('SUCCESS');
    } catch (e: any) {
      console.error(e);
      setLaunchError(e.response?.data?.message || 'Failed to complete operation.');
      setLaunchStatus('PARTIAL_FAILURE');
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-[1440px] mx-auto w-full min-h-screen flex flex-col bg-background">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Create New Campaign</h1>
          <p className="text-sm text-muted-foreground mt-1">Configure your automated learning journey step-by-step.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => navigate('/campaigns')} className="flex items-center gap-2 bg-background shadow-sm hover:bg-muted/50">
            <Save className="w-4 h-4" />
            <span className="font-semibold text-sm">Save Draft</span>
          </Button>
          <Button variant="destructive" className="flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 shadow-sm" onClick={() => navigate('/campaigns')}>
            <X className="w-4 h-4" />
            <span className="font-semibold text-sm">Cancel</span>
          </Button>
        </div>
      </div>

      <Stepper steps={WIZARD_STEPS} currentStepIndex={currentStep} className="mb-lg" />

      <div className="grid grid-cols-12 gap-lg flex-1">
        <div className="col-span-12 lg:col-span-8 flex flex-col">
          <section className="bg-white border border-outline-variant rounded-xl p-xl shadow-sm flex-1">
            {/* Step 1: Details */}
            {currentStep === 0 && (
              <div className="space-y-lg animate-in fade-in duration-300">
                <h3 className="text-title-lg font-title-lg mb-lg border-b border-outline-variant pb-md">Campaign Details</h3>
                <div className="space-y-xs">
                  <label className="text-label-md">Campaign Name *</label>
                  <Input 
                    value={details.name}
                    onChange={e => setDetails({ ...details, name: e.target.value })}
                    placeholder="e.g. Q3 Compliance Training"
                  />
                </div>
                <div className="space-y-xs">
                  <label className="text-label-md">Description</label>
                  <Textarea 
                    value={details.description}
                    onChange={e => setDetails({ ...details, description: e.target.value })}
                    placeholder="Outline the goals of this campaign..."
                    rows={4}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Course */}
            {currentStep === 1 && (
              <div className="space-y-lg animate-in fade-in duration-300">
                <h3 className="text-title-lg font-title-lg mb-lg border-b border-outline-variant pb-md">Attach Courses</h3>
                <div className="space-y-xs">
                  <label className="text-label-md">Select Courses *</label>
                  <MultiSelect 
                    options={coursesData?.data?.map((c: any) => ({ value: c.id, label: c.title })) || []}
                    selected={selectedCourses}
                    onChange={setSelectedCourses}
                    placeholder="Search courses..."
                  />
                  <p className="text-label-sm text-on-surface-variant mt-1">Only PUBLISHED courses are available for selection.</p>
                </div>
              </div>
            )}

            {/* Step 3: Audience */}
            {currentStep === 2 && (
              <div className="space-y-lg animate-in fade-in duration-300">
                <h3 className="text-title-lg font-title-lg mb-lg border-b border-outline-variant pb-md">Target Audience</h3>
                <div className="space-y-xs">
                  <label className="text-label-md">Select Groups *</label>
                  <MultiSelect 
                    options={groupsData?.data?.map((g: any) => ({ value: g.id, label: `${g.name} (${g.memberCount} members)` })) || []}
                    selected={selectedGroups}
                    onChange={setSelectedGroups}
                    placeholder="Search groups..."
                  />
                </div>
              </div>
            )}

            {/* Step 4: Schedule */}
            {currentStep === 3 && (
              <div className="space-y-lg animate-in fade-in duration-300">
                <h3 className="text-title-lg font-title-lg mb-lg border-b border-outline-variant pb-md">Schedule</h3>
                <div className="grid grid-cols-2 gap-md">
                  <div className="space-y-xs">
                    <label className="text-label-md">Start Date & Time *</label>
                    <Input 
                      type="datetime-local" 
                      value={schedule.startDate}
                      onChange={e => setSchedule({ ...schedule, startDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-xs">
                    <label className="text-label-md">End Date & Time *</label>
                    <Input 
                      type="datetime-local" 
                      value={schedule.endDate}
                      onChange={e => setSchedule({ ...schedule, endDate: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Review */}
            {currentStep === 4 && (
              <div className="space-y-lg animate-in fade-in duration-300">
                <h3 className="text-title-lg font-title-lg mb-lg border-b border-outline-variant pb-md">Review Campaign</h3>
                
                <div className="bg-surface-container-low p-md rounded-lg space-y-md">
                  <div>
                    <div className="text-label-md text-on-surface-variant">Name</div>
                    <div className="font-medium">{details.name}</div>
                  </div>
                  <div>
                    <div className="text-label-md text-on-surface-variant">Courses</div>
                    <div className="font-medium">{selectedCourses.length} course(s) selected</div>
                  </div>
                  <div>
                    <div className="text-label-md text-on-surface-variant">Audience</div>
                    <div className="font-medium">{selectedGroups.length} group(s) selected</div>
                  </div>
                  <div>
                    <div className="text-label-md text-on-surface-variant">Schedule</div>
                    <div className="font-medium">
                      {schedule.startDate ? new Date(schedule.startDate).toLocaleString() : 'Not set'} - 
                      {schedule.endDate ? new Date(schedule.endDate).toLocaleString() : 'Not set'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 6: Launch */}
            {currentStep === 5 && (
              <div className="space-y-lg animate-in fade-in duration-300 text-center py-xl">
                {launchStatus === 'IDLE' && (
                  <>
                    <span className="material-symbols-outlined text-[64px] text-secondary mb-md">rocket_launch</span>
                    <h3 className="text-headline-md font-headline-md mb-sm">Ready to Launch</h3>
                    <p className="text-body-md text-on-surface-variant max-w-md mx-auto mb-lg">
                      Launching will publish the campaign and immediately enroll the target audience.
                    </p>
                    <Button onClick={handleLaunch} size="lg" className="px-xl">
                      Launch Campaign
                    </Button>
                  </>
                )}
                
                {(launchStatus === 'PUBLISHING' || launchStatus === 'ENROLLING') && (
                  <div className="space-y-md">
                    <span className="material-symbols-outlined text-[64px] text-secondary animate-spin">refresh</span>
                    <h3 className="text-headline-md font-headline-md">
                      {launchStatus === 'PUBLISHING' ? 'Publishing Campaign...' : 'Enrolling Users...'}
                    </h3>
                  </div>
                )}

                {launchStatus === 'SUCCESS' && (
                  <div className="space-y-md">
                    <span className="material-symbols-outlined text-[64px] text-tertiary-fixed-dim">check_circle</span>
                    <h3 className="text-headline-md font-headline-md text-tertiary-fixed-dim">Campaign Launched!</h3>
                    <p className="text-body-md text-on-surface-variant">The campaign is published and users have been enrolled.</p>
                    <Button onClick={() => navigate(`/campaigns/${campaignId}`)}>View Campaign</Button>
                  </div>
                )}

                {launchStatus === 'PARTIAL_FAILURE' && (
                  <div className="space-y-md max-w-lg mx-auto">
                    <Alert variant="destructive">
                      <AlertTitle>Partial Launch Failure</AlertTitle>
                      <AlertDescription>
                        {launchError}
                        <br/><br/>
                        The campaign was successfully published, but an error occurred during bulk enrollment.
                      </AlertDescription>
                    </Alert>
                    <div className="flex gap-sm justify-center mt-md">
                      <Button variant="outline" onClick={() => navigate(`/campaigns/${campaignId}`)}>View Campaign</Button>
                      <Button onClick={handleLaunch}>Retry Enrollment</Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>

          <div className="flex justify-between items-center pt-md mt-md border-t border-outline-variant">
            <Button 
              variant="outline" 
              onClick={handleBack} 
              disabled={currentStep === 0 || launchStatus !== 'IDLE'}
            >
              Back
            </Button>
            
            {currentStep < 5 && (
              <Button 
                onClick={handleNext}
                disabled={
                  (currentStep === 0 && !details.name) ||
                  (currentStep === 1 && selectedCourses.length === 0) ||
                  (currentStep === 2 && selectedGroups.length === 0) ||
                  (currentStep === 3 && (!schedule.startDate || !schedule.endDate))
                }
              >
                Save & Next
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
