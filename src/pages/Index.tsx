import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Report, ReportFormData } from '@/types/report';
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
      setReports(data as Report[]);
    }
    setIsLoadingReports(false);
  };

  const syncToGoogleSheet = async (reportData: Record<string, any>) => {
    try {
      const { data, error } = await supabase.functions.invoke('sync-to-sheet', {
        body: { rows: [reportData] }
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
    if (!user || !username) return;
    
    setIsSubmitting(true);

    if (editingReport) {
      // Update existing report
      const { error } = await supabase
        .from('reports')
        .update({
          ...formData,
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
        
        // Sync to Google Sheet
        syncToGoogleSheet({
          name: username,
          report_code: editingReport.report_code,
          ...formData
        });
        
        setEditingReport(null);
        setActiveTab('my-reports');
        fetchReports();
      }
    } else {
      // Create new report
      const reportCode = generateReportCode();
      const { error } = await supabase
        .from('reports')
        .insert({
          user_id: user.id,
          username: username,
          report_code: reportCode,
          ...formData,
        });

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
        
        // Sync to Google Sheet
        syncToGoogleSheet({
          name: username,
          report_code: reportCode,
          ...formData
        });
        
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
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <ClipboardList className="h-5 w-5 text-primary-foreground" />
            </div>
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
                install_payment_method: editingReport.install_payment_method || 'FPS',
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
                order_payment_method: editingReport.order_payment_method || 'FPS',
                order_amount: editingReport.order_amount,
                order_data_type: editingReport.order_data_type || 'NewData',
                order_material_open: editingReport.order_material_open,
                order_material_replenish: editingReport.order_material_replenish,
                order_reorder: editingReport.order_reorder,
                order_measure_colleague: editingReport.order_measure_colleague || '',
                order_reorder_location: editingReport.order_reorder_location || '',
                order_notes: editingReport.order_notes || '',
                responsibility_option: editingReport.responsibility_option || 'NONE',
                urgency: editingReport.urgency || 'Normal',
                install_difficulty: editingReport.install_difficulty || '',
                order_install_doors: editingReport.order_install_doors,
                order_install_windows: editingReport.order_install_windows,
                order_install_aluminum: editingReport.order_install_aluminum,
                order_old_removed: editingReport.order_old_removed,
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
