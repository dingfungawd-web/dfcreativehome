import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Report, ReportFormData, CompletedCaseData, FollowUpCaseData } from '@/types/report';
import type { Json } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import ReportForm from '@/components/ReportForm';
import ReportList from '@/components/ReportList';
import { 
  ClipboardList, Plus, LogOut, User, X, Loader2, List 
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

function generateReportCode(): string {
  const now = new Date();
  const date = now.toISOString().split('T')[0].replace(/-/g, '');
  const time = now.toTimeString().slice(0, 5).replace(':', '');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${date}-${time}-${random}`;
}

export default function Index() {
  const navigate = useNavigate();
  const { user, username, loading, signOut } = useAuth();
  const { toast } = useToast();
  
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [activeTab, setActiveTab] = useState<string>('new-report');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchReports();
    }
  }, [user]);

  const fetchReports = async () => {
    if (!user) return;
    
    setIsLoadingReports(true);
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: '載入失敗',
        description: '無法載入報告列表',
        variant: 'destructive',
      });
    } else {
      setReports(data as unknown as Report[]);
    }
    setIsLoadingReports(false);
  };

  const syncToGoogleSheet = async (
    basicInfo: {
      name: string;
      report_code: string;
      report_date: string;
      team: string;
      installer_1: string;
      installer_2: string;
      installer_3: string;
      installer_4: string;
    },
    completedCases: CompletedCaseData[],
    followUpCases: FollowUpCaseData[]
  ) => {
    try {
      // Create rows for each case - each completed case and follow-up case gets its own row
      const rows: Record<string, any>[] = [];
      
      // Add rows for completed cases (已完成個案)
      completedCases.forEach(c => {
        rows.push({
          name: basicInfo.name,
          report_code: basicInfo.report_code,
          report_date: basicInfo.report_date,
          team: basicInfo.team,
          installer_1: basicInfo.installer_1,
          installer_2: basicInfo.installer_2,
          installer_3: basicInfo.installer_3,
          installer_4: basicInfo.installer_4,
          // Completed case fields (columns H-R)
          install_address: c.address,
          install_payment_method: c.payment_method,
          install_amount: c.amount,
          install_notes: c.notes,
          install_material_open: c.material_open,
          install_material_replenish: c.material_replenish,
          measure_colleague: c.measure_colleague,
          install_doors: c.doors,
          install_windows: c.windows,
          install_aluminum: c.aluminum,
          install_old_removed: c.old_removed,
          // Empty follow-up fields for completed cases
          order_address: '',
          order_payment_method: '',
          order_amount: 0,
          order_data_type: '',
          order_material_open: 0,
          order_material_replenish: 0,
          order_reorder: 0,
          order_measure_colleague: '',
          order_reorder_location: '',
          order_notes: '',
          responsibility_option: '',
          urgency: '',
          install_difficulty: '',
          order_install_doors: 0,
          order_install_windows: 0,
          order_install_aluminum: 0,
          order_old_removed: 0,
        });
      });
      
      // Add rows for follow-up cases (需跟進個案)
      followUpCases.forEach(c => {
        rows.push({
          name: basicInfo.name,
          report_code: basicInfo.report_code,
          report_date: basicInfo.report_date,
          team: basicInfo.team,
          installer_1: basicInfo.installer_1,
          installer_2: basicInfo.installer_2,
          installer_3: basicInfo.installer_3,
          installer_4: basicInfo.installer_4,
          // Empty completed case fields for follow-up cases
          install_address: '',
          install_payment_method: '',
          install_amount: 0,
          install_notes: '',
          install_material_open: 0,
          install_material_replenish: 0,
          measure_colleague: '',
          install_doors: 0,
          install_windows: 0,
          install_aluminum: 0,
          install_old_removed: 0,
          // Follow-up case fields (columns S-AI)
          order_address: c.address,
          order_payment_method: c.payment_method,
          order_amount: c.amount,
          order_data_type: c.data_type,
          order_material_open: c.material_open,
          order_material_replenish: c.material_replenish,
          order_reorder: c.reorder,
          order_measure_colleague: c.measure_colleague,
          order_reorder_location: c.reorder_location,
          order_notes: c.notes,
          responsibility_option: c.responsibility_option,
          urgency: c.urgency,
          install_difficulty: c.install_difficulty,
          order_install_doors: c.doors,
          order_install_windows: c.windows,
          order_install_aluminum: c.aluminum,
          order_old_removed: c.old_removed,
        });
      });

      // If no cases at all, still sync basic info
      if (rows.length === 0) {
        console.log('No cases to sync');
        return;
      }

      const { data, error } = await supabase.functions.invoke('sync-to-sheet', {
        body: { rows }
      });
      
      if (error) {
        console.error('Google Sheet sync error:', error);
      } else {
        console.log('Google Sheet sync success:', data);
      }
    } catch (err) {
      console.error('Failed to sync to Google Sheet:', err);
    }
  };

  const handleSubmit = async (formData: ReportFormData) => {
    if (!user) return;
    
    setIsSubmitting(true);

    // Extract cases from formData
    const { completedCases, followUpCases, ...dbFormData } = formData;
    
    // Get username for Google Sheet sync
    const currentUsername =
      username ||
      (user?.email?.endsWith('@internal.local')
        ? user.email.split('@')[0]
        : user?.email || '');

    if (editingReport) {
      // Update existing report with cases stored as JSON
      const { error } = await supabase
        .from('reports')
        .update({
          ...dbFormData,
          completed_cases: (completedCases || []) as unknown as Json,
          follow_up_cases: (followUpCases || []) as unknown as Json,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingReport.id);

      if (error) {
        toast({
          title: '更新失敗',
          description: '無法更新報告',
          variant: 'destructive',
        });
      } else {
        toast({
          title: '更新成功',
          description: '報告已更新',
        });
        
        // Sync to Google Sheet - each case gets its own row
        syncToGoogleSheet(
          {
            name: currentUsername,
            report_code: editingReport.report_code,
            report_date: formData.report_date,
            team: formData.team,
            installer_1: formData.installer_1,
            installer_2: formData.installer_2,
            installer_3: formData.installer_3,
            installer_4: formData.installer_4,
          },
          completedCases || [],
          followUpCases || []
        );
        
        setEditingReport(null);
        setActiveTab('my-reports');
        fetchReports();
      }
    } else {
      // Create new report with cases stored as JSON
      const reportCode = generateReportCode();
      const { error } = await supabase
        .from('reports')
        .insert([{
          user_id: user.id,
          username: currentUsername,
          report_code: reportCode,
          report_date: dbFormData.report_date,
          team: dbFormData.team,
          installer_1: dbFormData.installer_1,
          installer_2: dbFormData.installer_2,
          installer_3: dbFormData.installer_3,
          installer_4: dbFormData.installer_4,
          install_address: dbFormData.install_address,
          install_payment_method: dbFormData.install_payment_method,
          install_amount: dbFormData.install_amount,
          install_notes: dbFormData.install_notes,
          install_material_open: dbFormData.install_material_open,
          install_material_replenish: dbFormData.install_material_replenish,
          measure_colleague: dbFormData.measure_colleague,
          install_doors: dbFormData.install_doors,
          install_windows: dbFormData.install_windows,
          install_aluminum: dbFormData.install_aluminum,
          install_old_removed: dbFormData.install_old_removed,
          order_address: dbFormData.order_address,
          order_payment_method: dbFormData.order_payment_method,
          order_amount: dbFormData.order_amount,
          order_data_type: dbFormData.order_data_type,
          order_material_open: dbFormData.order_material_open,
          order_material_replenish: dbFormData.order_material_replenish,
          order_reorder: dbFormData.order_reorder,
          order_measure_colleague: dbFormData.order_measure_colleague,
          order_reorder_location: dbFormData.order_reorder_location,
          order_notes: dbFormData.order_notes,
          responsibility_option: dbFormData.responsibility_option,
          urgency: dbFormData.urgency,
          install_difficulty: dbFormData.install_difficulty,
          order_install_doors: dbFormData.order_install_doors,
          order_install_windows: dbFormData.order_install_windows,
          order_install_aluminum: dbFormData.order_install_aluminum,
          order_old_removed: dbFormData.order_old_removed,
          completed_cases: (completedCases || []) as unknown as Json,
          follow_up_cases: (followUpCases || []) as unknown as Json,
        }]);

      if (error) {
        toast({
          title: '提交失敗',
          description: '無法提交報告',
          variant: 'destructive',
        });
      } else {
        toast({
          title: '提交成功',
          description: '報告已成功提交',
        });
        
        // Sync to Google Sheet - each case gets its own row
        syncToGoogleSheet(
          {
            name: currentUsername,
            report_code: reportCode,
            report_date: formData.report_date,
            team: formData.team,
            installer_1: formData.installer_1,
            installer_2: formData.installer_2,
            installer_3: formData.installer_3,
            installer_4: formData.installer_4,
          },
          completedCases || [],
          followUpCases || []
        );
        
        fetchReports();
      }
    }
    
    setIsSubmitting(false);
  };
  const handleEdit = (report: Report) => {
    setEditingReport(report);
    setActiveTab('new-report');
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    const { error } = await supabase
      .from('reports')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: '刪除失敗',
        description: '無法刪除報告',
        variant: 'destructive',
      });
    } else {
      toast({
        title: '刪除成功',
        description: '報告已刪除',
      });
      fetchReports();
    }
    setIsDeleting(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleCancelEdit = () => {
    setEditingReport(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/logo.jpg" 
              alt="Logo" 
              className="w-10 h-10 rounded-xl object-cover"
            />
            <div>
              <h1 className="font-semibold text-foreground">工作報告系統</h1>
              <p className="text-xs text-muted-foreground">管理您的安裝報告</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{username}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="new-report" className="gap-2">
              <Plus className="h-4 w-4" />
              {editingReport ? '編輯報告' : '新增報告'}
            </TabsTrigger>
            <TabsTrigger value="my-reports" className="gap-2">
              <List className="h-4 w-4" />
              我的報告
            </TabsTrigger>
          </TabsList>

          <TabsContent value="new-report">
            {editingReport && (
              <div className="mb-4 p-3 bg-muted rounded-lg flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  正在編輯報告：{editingReport.report_code}
                </span>
                <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                  <X className="h-4 w-4 mr-1" />
                  取消編輯
                </Button>
              </div>
            )}
            <ReportForm 
              initialData={editingReport ? {
                report_date: editingReport.report_date,
                team: editingReport.team || '',
                installer_1: editingReport.installer_1 || '',
                installer_2: editingReport.installer_2 || '',
                installer_3: editingReport.installer_3 || '',
                installer_4: editingReport.installer_4 || '',
                install_address: editingReport.install_address || '',
                install_payment_method: editingReport.install_payment_method || '',
                install_amount: editingReport.install_amount,
                install_notes: editingReport.install_notes || '',
                install_material_open: editingReport.install_material_open,
                install_material_replenish: editingReport.install_material_replenish,
                measure_colleague: editingReport.measure_colleague || '',
                install_doors: editingReport.install_doors,
                install_windows: editingReport.install_windows,
                install_aluminum: editingReport.install_aluminum,
                install_old_removed: editingReport.install_old_removed,
                order_address: editingReport.order_address || '',
                order_payment_method: editingReport.order_payment_method || '',
                order_amount: editingReport.order_amount,
                order_data_type: editingReport.order_data_type || '',
                order_material_open: editingReport.order_material_open,
                order_material_replenish: editingReport.order_material_replenish,
                order_reorder: editingReport.order_reorder,
                order_measure_colleague: editingReport.order_measure_colleague || '',
                order_reorder_location: editingReport.order_reorder_location || '',
                order_notes: editingReport.order_notes || '',
                responsibility_option: editingReport.responsibility_option || '',
                urgency: editingReport.urgency || '',
                install_difficulty: editingReport.install_difficulty || '',
                order_install_doors: editingReport.order_install_doors,
                order_install_windows: editingReport.order_install_windows,
                order_install_aluminum: editingReport.order_install_aluminum,
                order_old_removed: editingReport.order_old_removed,
                // Pass stored cases for editing
                completedCases: editingReport.completed_cases,
                followUpCases: editingReport.follow_up_cases,
              } : undefined}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              submitLabel={editingReport ? '更新報告' : '提交報告'}
            />
          </TabsContent>

          <TabsContent value="my-reports">
            <div className="mb-6">
              <h2 className="text-xl font-semibold">我的報告</h2>
              <p className="text-sm text-muted-foreground">查看和管理您提交的所有報告</p>
            </div>

            {isLoadingReports ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <ReportList 
                reports={reports} 
                onEdit={handleEdit} 
                onDelete={handleDelete}
                isDeleting={isDeleting}
              />
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
