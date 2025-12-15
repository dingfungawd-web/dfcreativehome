import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ReportFormData, PAYMENT_METHODS, DATA_TYPES, RESPONSIBILITY_OPTIONS, URGENCY_OPTIONS, TEAMS, INSTALLERS, MEASURERS } from '@/types/report';
import { Loader2, Building, CheckCircle, AlertCircle, Plus, Trash2 } from 'lucide-react';

interface ReportFormProps {
  initialData?: Partial<ReportFormData>;
  onSubmit: (data: ReportFormData) => Promise<void>;
  isSubmitting: boolean;
  submitLabel?: string;
}

interface CompletedCase {
  id: string;
  address: string;
  payment_method: string;
  amount: number;
  notes: string;
  material_open: number;
  material_replenish: number;
  measure_colleague: string;
  doors: number;
  windows: number;
  aluminum: number;
  old_removed: number;
}

interface FollowUpCase {
  id: string;
  address: string;
  payment_method: string;
  amount: number;
  data_type: string;
  material_open: number;
  material_replenish: number;
  reorder: number;
  measure_colleague: string;
  reorder_location: string;
  notes: string;
  responsibility_option: string;
  urgency: string;
  doors: number;
  windows: number;
  aluminum: number;
  old_removed: number;
}

const createEmptyCompletedCase = (): CompletedCase => ({
  id: crypto.randomUUID(),
  address: '',
  payment_method: 'FPS',
  amount: 0,
  notes: '',
  material_open: 0,
  material_replenish: 0,
  measure_colleague: '',
  doors: 0,
  windows: 0,
  aluminum: 0,
  old_removed: 0,
});

const createEmptyFollowUpCase = (): FollowUpCase => ({
  id: crypto.randomUUID(),
  address: '',
  payment_method: 'FPS',
  amount: 0,
  data_type: 'NewData',
  material_open: 0,
  material_replenish: 0,
  reorder: 0,
  measure_colleague: '',
  reorder_location: '',
  notes: '',
  responsibility_option: 'NONE',
  urgency: 'Normal',
  doors: 0,
  windows: 0,
  aluminum: 0,
  old_removed: 0,
});

const defaultFormData: ReportFormData = {
  report_date: new Date().toISOString().split('T')[0],
  team: '',
  installer_1: '',
  installer_2: '',
  installer_3: '',
  installer_4: '',
  install_address: '',
  install_payment_method: 'FPS',
  install_amount: 0,
  install_notes: '',
  install_material_open: 0,
  install_material_replenish: 0,
  measure_colleague: '',
  install_doors: 0,
  install_windows: 0,
  install_aluminum: 0,
  install_old_removed: 0,
  order_address: '',
  order_payment_method: 'FPS',
  order_amount: 0,
  order_data_type: 'NewData',
  order_material_open: 0,
  order_material_replenish: 0,
  order_reorder: 0,
  order_measure_colleague: '',
  order_reorder_location: '',
  order_notes: '',
  responsibility_option: 'NONE',
  urgency: 'Normal',
  install_difficulty: '',
  order_install_doors: 0,
  order_install_windows: 0,
  order_install_aluminum: 0,
  order_old_removed: 0,
};

export default function ReportForm({ initialData, onSubmit, isSubmitting, submitLabel = '提交報告' }: ReportFormProps) {
  const [formData, setFormData] = useState<ReportFormData>({
    ...defaultFormData,
    ...initialData,
  });

  // Multi-entry states
  const [completedCases, setCompletedCases] = useState<CompletedCase[]>([
    initialData?.install_address ? {
      id: crypto.randomUUID(),
      address: initialData.install_address || '',
      payment_method: initialData.install_payment_method || 'FPS',
      amount: initialData.install_amount || 0,
      notes: initialData.install_notes || '',
      material_open: initialData.install_material_open || 0,
      material_replenish: initialData.install_material_replenish || 0,
      measure_colleague: initialData.measure_colleague || '',
      doors: initialData.install_doors || 0,
      windows: initialData.install_windows || 0,
      aluminum: initialData.install_aluminum || 0,
      old_removed: initialData.install_old_removed || 0,
    } : createEmptyCompletedCase()
  ]);

  const [followUpCases, setFollowUpCases] = useState<FollowUpCase[]>([
    initialData?.order_address ? {
      id: crypto.randomUUID(),
      address: initialData.order_address || '',
      payment_method: initialData.order_payment_method || 'FPS',
      amount: initialData.order_amount || 0,
      data_type: initialData.order_data_type || 'NewData',
      material_open: initialData.order_material_open || 0,
      material_replenish: initialData.order_material_replenish || 0,
      reorder: initialData.order_reorder || 0,
      measure_colleague: initialData.order_measure_colleague || '',
      reorder_location: initialData.order_reorder_location || '',
      notes: initialData.order_notes || '',
      responsibility_option: initialData.responsibility_option || 'NONE',
      urgency: initialData.urgency || 'Normal',
      doors: initialData.order_install_doors || 0,
      windows: initialData.order_install_windows || 0,
      aluminum: initialData.order_install_aluminum || 0,
      old_removed: initialData.order_old_removed || 0,
    } : createEmptyFollowUpCase()
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Use first entries for main form data (database stores single entry)
    const firstCompleted = completedCases[0] || createEmptyCompletedCase();
    const firstFollowUp = followUpCases[0] || createEmptyFollowUpCase();
    
    const submitData: ReportFormData = {
      ...formData,
      install_address: firstCompleted.address,
      install_payment_method: firstCompleted.payment_method,
      install_amount: firstCompleted.amount,
      install_notes: firstCompleted.notes,
      install_material_open: firstCompleted.material_open,
      install_material_replenish: firstCompleted.material_replenish,
      measure_colleague: firstCompleted.measure_colleague,
      install_doors: firstCompleted.doors,
      install_windows: firstCompleted.windows,
      install_aluminum: firstCompleted.aluminum,
      install_old_removed: firstCompleted.old_removed,
      order_address: firstFollowUp.address,
      order_payment_method: firstFollowUp.payment_method,
      order_amount: firstFollowUp.amount,
      order_data_type: firstFollowUp.data_type,
      order_material_open: firstFollowUp.material_open,
      order_material_replenish: firstFollowUp.material_replenish,
      order_reorder: firstFollowUp.reorder,
      order_measure_colleague: firstFollowUp.measure_colleague,
      order_reorder_location: firstFollowUp.reorder_location,
      order_notes: firstFollowUp.notes,
      responsibility_option: firstFollowUp.responsibility_option,
      urgency: firstFollowUp.urgency,
      order_install_doors: firstFollowUp.doors,
      order_install_windows: firstFollowUp.windows,
      order_install_aluminum: firstFollowUp.aluminum,
      order_old_removed: firstFollowUp.old_removed,
    };
    
    await onSubmit(submitData);
  };

  const updateField = <K extends keyof ReportFormData>(field: K, value: ReportFormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateCompletedCase = (id: string, field: keyof CompletedCase, value: string | number) => {
    setCompletedCases(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const updateFollowUpCase = (id: string, field: keyof FollowUpCase, value: string | number) => {
    setFollowUpCases(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const addCompletedCase = () => {
    setCompletedCases(prev => [...prev, createEmptyCompletedCase()]);
  };

  const removeCompletedCase = (id: string) => {
    if (completedCases.length > 1) {
      setCompletedCases(prev => prev.filter(c => c.id !== id));
    }
  };

  const addFollowUpCase = () => {
    setFollowUpCases(prev => [...prev, createEmptyFollowUpCase()]);
  };

  const removeFollowUpCase = (id: string) => {
    if (followUpCases.length > 1) {
      setFollowUpCases(prev => prev.filter(c => c.id !== id));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building className="h-5 w-5 text-primary" />
            基本資料
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>日期</Label>
              <Input
                type="date"
                value={formData.report_date}
                onChange={(e) => updateField('report_date', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>分隊</Label>
              <Select value={formData.team} onValueChange={(v) => updateField('team', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="選擇分隊" />
                </SelectTrigger>
                <SelectContent>
                  {TEAMS.map(team => (
                    <SelectItem key={team} value={team}>{team}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(num => (
              <div key={num} className="space-y-2">
                <Label>安裝同事{num}</Label>
                <Select 
                  value={formData[`installer_${num}` as keyof ReportFormData] as string} 
                  onValueChange={(v) => updateField(`installer_${num}` as keyof ReportFormData, v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="選擇同事" />
                  </SelectTrigger>
                  <SelectContent>
                    {INSTALLERS.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Completed Cases (已完成個案) */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckCircle className="h-5 w-5 text-primary" />
              已完成個案
            </CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addCompletedCase}>
              <Plus className="h-4 w-4 mr-1" />
              新增個案
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {completedCases.map((caseItem, index) => (
            <div key={caseItem.id} className="space-y-4 p-4 border rounded-lg bg-muted/30">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm text-muted-foreground">個案 {index + 1}</span>
                {completedCases.length > 1 && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeCompletedCase(caseItem.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>地址</Label>
                  <Input
                    value={caseItem.address}
                    onChange={(e) => updateCompletedCase(caseItem.id, 'address', e.target.value)}
                    placeholder="輸入地址"
                  />
                </div>
                <div className="space-y-2">
                  <Label>付款方式</Label>
                  <Select value={caseItem.payment_method} onValueChange={(v) => updateCompletedCase(caseItem.id, 'payment_method', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHODS.map(m => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>金額</Label>
                  <Input
                    type="number"
                    value={caseItem.amount}
                    onChange={(e) => updateCompletedCase(caseItem.id, 'amount', Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>開料數</Label>
                  <Input
                    type="number"
                    value={caseItem.material_open}
                    onChange={(e) => updateCompletedCase(caseItem.id, 'material_open', Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>補料數</Label>
                  <Input
                    type="number"
                    value={caseItem.material_replenish}
                    onChange={(e) => updateCompletedCase(caseItem.id, 'material_replenish', Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>度尺同事</Label>
                  <Select value={caseItem.measure_colleague} onValueChange={(v) => updateCompletedCase(caseItem.id, 'measure_colleague', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="選擇同事" />
                    </SelectTrigger>
                    <SelectContent>
                      {MEASURERS.map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>安裝門數</Label>
                  <Input
                    type="number"
                    value={caseItem.doors}
                    onChange={(e) => updateCompletedCase(caseItem.id, 'doors', Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>安裝窗數</Label>
                  <Input
                    type="number"
                    value={caseItem.windows}
                    onChange={(e) => updateCompletedCase(caseItem.id, 'windows', Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>安裝鋁料數</Label>
                  <Input
                    type="number"
                    value={caseItem.aluminum}
                    onChange={(e) => updateCompletedCase(caseItem.id, 'aluminum', Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>拆舊拆拉釘窗花數</Label>
                  <Input
                    type="number"
                    value={caseItem.old_removed}
                    onChange={(e) => updateCompletedCase(caseItem.id, 'old_removed', Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>備註</Label>
                <Textarea
                  value={caseItem.notes}
                  onChange={(e) => updateCompletedCase(caseItem.id, 'notes', e.target.value)}
                  placeholder="輸入備註"
                  rows={2}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Follow-up Cases (需跟進個案) */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertCircle className="h-5 w-5 text-primary" />
              需跟進個案
            </CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addFollowUpCase}>
              <Plus className="h-4 w-4 mr-1" />
              新增個案
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {followUpCases.map((caseItem, index) => (
            <div key={caseItem.id} className="space-y-4 p-4 border rounded-lg bg-muted/30">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm text-muted-foreground">個案 {index + 1}</span>
                {followUpCases.length > 1 && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeFollowUpCase(caseItem.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>地址</Label>
                  <Input
                    value={caseItem.address}
                    onChange={(e) => updateFollowUpCase(caseItem.id, 'address', e.target.value)}
                    placeholder="輸入地址"
                  />
                </div>
                <div className="space-y-2">
                  <Label>付款方式</Label>
                  <Select value={caseItem.payment_method} onValueChange={(v) => updateFollowUpCase(caseItem.id, 'payment_method', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHODS.map(m => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>金額</Label>
                  <Input
                    type="number"
                    value={caseItem.amount}
                    onChange={(e) => updateFollowUpCase(caseItem.id, 'amount', Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>訂料數據</Label>
                  <Select value={caseItem.data_type} onValueChange={(v) => updateFollowUpCase(caseItem.id, 'data_type', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DATA_TYPES.map(t => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>開料數</Label>
                  <Input
                    type="number"
                    value={caseItem.material_open}
                    onChange={(e) => updateFollowUpCase(caseItem.id, 'material_open', Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>補料數</Label>
                  <Input
                    type="number"
                    value={caseItem.material_replenish}
                    onChange={(e) => updateFollowUpCase(caseItem.id, 'material_replenish', Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>重訂數</Label>
                  <Input
                    type="number"
                    value={caseItem.reorder}
                    onChange={(e) => updateFollowUpCase(caseItem.id, 'reorder', Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>度尺同事</Label>
                  <Select value={caseItem.measure_colleague} onValueChange={(v) => updateFollowUpCase(caseItem.id, 'measure_colleague', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="選擇同事" />
                    </SelectTrigger>
                    <SelectContent>
                      {MEASURERS.map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>重訂位置</Label>
                  <Input
                    value={caseItem.reorder_location}
                    onChange={(e) => updateFollowUpCase(caseItem.id, 'reorder_location', e.target.value)}
                    placeholder="輸入位置"
                  />
                </div>
                <div className="space-y-2">
                  <Label>責任選項</Label>
                  <Select value={caseItem.responsibility_option} onValueChange={(v) => updateFollowUpCase(caseItem.id, 'responsibility_option', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RESPONSIBILITY_OPTIONS.map(r => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>正常/加急</Label>
                  <Select value={caseItem.urgency} onValueChange={(v) => updateFollowUpCase(caseItem.id, 'urgency', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {URGENCY_OPTIONS.map(u => (
                        <SelectItem key={u} value={u}>{u}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>安裝門數</Label>
                  <Input
                    type="number"
                    value={caseItem.doors}
                    onChange={(e) => updateFollowUpCase(caseItem.id, 'doors', Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>安裝窗數</Label>
                  <Input
                    type="number"
                    value={caseItem.windows}
                    onChange={(e) => updateFollowUpCase(caseItem.id, 'windows', Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>安裝鋁料數</Label>
                  <Input
                    type="number"
                    value={caseItem.aluminum}
                    onChange={(e) => updateFollowUpCase(caseItem.id, 'aluminum', Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>拆舊拆拉釘窗花數</Label>
                  <Input
                    type="number"
                    value={caseItem.old_removed}
                    onChange={(e) => updateFollowUpCase(caseItem.id, 'old_removed', Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>訂料備註</Label>
                  <Textarea
                    value={caseItem.notes}
                    onChange={(e) => updateFollowUpCase(caseItem.id, 'notes', e.target.value)}
                    placeholder="輸入備註"
                    rows={2}
                  />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Additional Notes */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">其他備註</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>安裝難處反映</Label>
            <Textarea
              value={formData.install_difficulty}
              onChange={(e) => updateField('install_difficulty', e.target.value)}
              placeholder="輸入安裝難處"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Button type="submit" className="w-full gradient-primary h-12 text-lg" disabled={isSubmitting}>
        {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
        {submitLabel}
      </Button>
    </form>
  );
}
