import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ReportFormData, PAYMENT_METHODS, DATA_TYPES, RESPONSIBILITY_OPTIONS, URGENCY_OPTIONS, INSTALLERS, MEASURERS } from '@/types/report';
import { Loader2, Building, CheckCircle, AlertCircle, Plus, Trash2, X } from 'lucide-react';

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
  amount: string;
  notes: string;
  material_open: string;
  material_replenish: string;
  measure_colleague: string;
  doors: string;
  windows: string;
  aluminum: string;
  old_removed: string;
}

interface FollowUpCase {
  id: string;
  address: string;
  payment_method: string;
  amount: string;
  data_type: string;
  material_open: string;
  material_replenish: string;
  reorder: string;
  measure_colleague: string;
  reorder_location: string;
  notes: string;
  responsibility_option: string;
  urgency: string;
  install_difficulty: string;
  doors: string;
  windows: string;
  aluminum: string;
  old_removed: string;
}

const createEmptyCompletedCase = (): CompletedCase => ({
  id: crypto.randomUUID(),
  address: '',
  payment_method: '',
  amount: '',
  notes: '',
  material_open: '',
  material_replenish: '',
  measure_colleague: '',
  doors: '',
  windows: '',
  aluminum: '',
  old_removed: '',
});

const createEmptyFollowUpCase = (): FollowUpCase => ({
  id: crypto.randomUUID(),
  address: '',
  payment_method: '',
  amount: '',
  data_type: '',
  material_open: '',
  material_replenish: '',
  reorder: '',
  measure_colleague: '',
  reorder_location: '',
  notes: '',
  responsibility_option: '',
  urgency: '',
  install_difficulty: '',
  doors: '',
  windows: '',
  aluminum: '',
  old_removed: '',
});

const defaultFormData: ReportFormData = {
  report_date: new Date().toISOString().split('T')[0],
  team: '',
  installer_1: '',
  installer_2: '',
  installer_3: '',
  installer_4: '',
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
};

// Helper to parse number, returns 0 for empty/invalid
const parseNum = (val: string): number => {
  if (!val || val.trim() === '') return 0;
  const num = parseFloat(val);
  return isNaN(num) ? 0 : Math.max(0, num);
};

// Helper to format number for display
const formatNum = (val: number | undefined | null): string => {
  if (val === undefined || val === null || val === 0) return '';
  return String(val);
};

// Input handler that only allows positive numbers
const handleNumericInput = (value: string): string => {
  // Remove any non-numeric characters except decimal point
  const cleaned = value.replace(/[^0-9.]/g, '');
  // Prevent multiple decimal points
  const parts = cleaned.split('.');
  if (parts.length > 2) {
    return parts[0] + '.' + parts.slice(1).join('');
  }
  return cleaned;
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
      payment_method: initialData.install_payment_method || '',
      amount: formatNum(initialData.install_amount),
      notes: initialData.install_notes || '',
      material_open: formatNum(initialData.install_material_open),
      material_replenish: formatNum(initialData.install_material_replenish),
      measure_colleague: initialData.measure_colleague || '',
      doors: formatNum(initialData.install_doors),
      windows: formatNum(initialData.install_windows),
      aluminum: formatNum(initialData.install_aluminum),
      old_removed: formatNum(initialData.install_old_removed),
    } : createEmptyCompletedCase()
  ]);

  const [followUpCases, setFollowUpCases] = useState<FollowUpCase[]>([
    initialData?.order_address ? {
      id: crypto.randomUUID(),
      address: initialData.order_address || '',
      payment_method: initialData.order_payment_method || '',
      amount: formatNum(initialData.order_amount),
      data_type: initialData.order_data_type || '',
      material_open: formatNum(initialData.order_material_open),
      material_replenish: formatNum(initialData.order_material_replenish),
      reorder: formatNum(initialData.order_reorder),
      measure_colleague: initialData.order_measure_colleague || '',
      reorder_location: initialData.order_reorder_location || '',
      notes: initialData.order_notes || '',
      responsibility_option: initialData.responsibility_option || '',
      urgency: initialData.urgency || '',
      install_difficulty: initialData.install_difficulty || '',
      doors: formatNum(initialData.order_install_doors),
      windows: formatNum(initialData.order_install_windows),
      aluminum: formatNum(initialData.order_install_aluminum),
      old_removed: formatNum(initialData.order_old_removed),
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
      install_amount: parseNum(firstCompleted.amount),
      install_notes: firstCompleted.notes,
      install_material_open: parseNum(firstCompleted.material_open),
      install_material_replenish: parseNum(firstCompleted.material_replenish),
      measure_colleague: firstCompleted.measure_colleague,
      install_doors: parseNum(firstCompleted.doors),
      install_windows: parseNum(firstCompleted.windows),
      install_aluminum: parseNum(firstCompleted.aluminum),
      install_old_removed: parseNum(firstCompleted.old_removed),
      order_address: firstFollowUp.address,
      order_payment_method: firstFollowUp.payment_method,
      order_amount: parseNum(firstFollowUp.amount),
      order_data_type: firstFollowUp.data_type,
      order_material_open: parseNum(firstFollowUp.material_open),
      order_material_replenish: parseNum(firstFollowUp.material_replenish),
      order_reorder: parseNum(firstFollowUp.reorder),
      order_measure_colleague: firstFollowUp.measure_colleague,
      order_reorder_location: firstFollowUp.reorder_location,
      order_notes: firstFollowUp.notes,
      responsibility_option: firstFollowUp.responsibility_option,
      urgency: firstFollowUp.urgency,
      install_difficulty: firstFollowUp.install_difficulty,
      order_install_doors: parseNum(firstFollowUp.doors),
      order_install_windows: parseNum(firstFollowUp.windows),
      order_install_aluminum: parseNum(firstFollowUp.aluminum),
      order_old_removed: parseNum(firstFollowUp.old_removed),
    };
    
    await onSubmit(submitData);
  };

  const updateField = <K extends keyof ReportFormData>(field: K, value: ReportFormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateCompletedCase = (id: string, field: keyof CompletedCase, value: string) => {
    setCompletedCases(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const updateFollowUpCase = (id: string, field: keyof FollowUpCase, value: string) => {
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
              <Input
                value={formData.team}
                onChange={(e) => updateField('team', e.target.value)}
                placeholder="輸入分隊"
              />
            </div>
          </div>

          <Separator />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(num => {
              const fieldKey = `installer_${num}` as keyof ReportFormData;
              const currentValue = formData[fieldKey] as string;
              return (
                <div key={num} className="space-y-2">
                  <Label>安裝同事{num}</Label>
                  <div className="flex gap-1">
                    <Select 
                      value={currentValue || '_none'} 
                      onValueChange={(v) => updateField(fieldKey, v === '_none' ? '' : v)}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="選擇同事" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="_none">-- 未選擇 --</SelectItem>
                        {INSTALLERS.map(c => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {currentValue && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon"
                        className="shrink-0 h-10 w-10 text-muted-foreground hover:text-destructive"
                        onClick={() => updateField(fieldKey, '')}
                        title="清除選擇"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Completed Cases (已完成個案) */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CheckCircle className="h-5 w-5 text-primary" />
            已完成個案
          </CardTitle>
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
                      <SelectValue placeholder="選擇付款方式" />
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
                    inputMode="decimal"
                    value={caseItem.amount}
                    onChange={(e) => updateCompletedCase(caseItem.id, 'amount', handleNumericInput(e.target.value))}
                    placeholder="輸入金額"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>開料數</Label>
                  <Input
                    inputMode="numeric"
                    value={caseItem.material_open}
                    onChange={(e) => updateCompletedCase(caseItem.id, 'material_open', handleNumericInput(e.target.value))}
                    placeholder="輸入數量"
                  />
                </div>
                <div className="space-y-2">
                  <Label>補料數</Label>
                  <Input
                    inputMode="numeric"
                    value={caseItem.material_replenish}
                    onChange={(e) => updateCompletedCase(caseItem.id, 'material_replenish', handleNumericInput(e.target.value))}
                    placeholder="輸入數量"
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
                    inputMode="numeric"
                    value={caseItem.doors}
                    onChange={(e) => updateCompletedCase(caseItem.id, 'doors', handleNumericInput(e.target.value))}
                    placeholder="輸入數量"
                  />
                </div>
                <div className="space-y-2">
                  <Label>安裝窗數</Label>
                  <Input
                    inputMode="numeric"
                    value={caseItem.windows}
                    onChange={(e) => updateCompletedCase(caseItem.id, 'windows', handleNumericInput(e.target.value))}
                    placeholder="輸入數量"
                  />
                </div>
                <div className="space-y-2">
                  <Label>安裝鋁料數</Label>
                  <Input
                    inputMode="numeric"
                    value={caseItem.aluminum}
                    onChange={(e) => updateCompletedCase(caseItem.id, 'aluminum', handleNumericInput(e.target.value))}
                    placeholder="輸入數量"
                  />
                </div>
                <div className="space-y-2">
                  <Label>拆舊拆拉釘窗花數</Label>
                  <Input
                    inputMode="numeric"
                    value={caseItem.old_removed}
                    onChange={(e) => updateCompletedCase(caseItem.id, 'old_removed', handleNumericInput(e.target.value))}
                    placeholder="輸入數量"
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
          
          <Button type="button" variant="outline" className="w-full" onClick={addCompletedCase}>
            <Plus className="h-4 w-4 mr-1" />
            新增個案
          </Button>
        </CardContent>
      </Card>

      {/* Follow-up Cases (需跟進個案) */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertCircle className="h-5 w-5 text-primary" />
            需跟進個案
          </CardTitle>
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
                      <SelectValue placeholder="選擇付款方式" />
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
                    inputMode="decimal"
                    value={caseItem.amount}
                    onChange={(e) => updateFollowUpCase(caseItem.id, 'amount', handleNumericInput(e.target.value))}
                    placeholder="輸入金額"
                  />
                </div>
                <div className="space-y-2">
                  <Label>訂料數據</Label>
                  <Select value={caseItem.data_type || '_none'} onValueChange={(v) => updateFollowUpCase(caseItem.id, 'data_type', v === '_none' ? '' : v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="選擇類型（可選）" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none">空白</SelectItem>
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
                    inputMode="numeric"
                    value={caseItem.material_open}
                    onChange={(e) => updateFollowUpCase(caseItem.id, 'material_open', handleNumericInput(e.target.value))}
                    placeholder="輸入數量"
                  />
                </div>
                <div className="space-y-2">
                  <Label>補料數</Label>
                  <Input
                    inputMode="numeric"
                    value={caseItem.material_replenish}
                    onChange={(e) => updateFollowUpCase(caseItem.id, 'material_replenish', handleNumericInput(e.target.value))}
                    placeholder="輸入數量"
                  />
                </div>
                <div className="space-y-2">
                  <Label>重訂數</Label>
                  <Input
                    inputMode="numeric"
                    value={caseItem.reorder}
                    onChange={(e) => updateFollowUpCase(caseItem.id, 'reorder', handleNumericInput(e.target.value))}
                    placeholder="輸入數量"
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
                  <Select value={caseItem.responsibility_option || '_none'} onValueChange={(v) => updateFollowUpCase(caseItem.id, 'responsibility_option', v === '_none' ? '' : v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="選擇選項" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none">空白</SelectItem>
                      {RESPONSIBILITY_OPTIONS.map(r => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>正常/加急</Label>
                  <Select value={caseItem.urgency || '_none'} onValueChange={(v) => updateFollowUpCase(caseItem.id, 'urgency', v === '_none' ? '' : v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="選擇選項" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none">空白</SelectItem>
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
                    inputMode="numeric"
                    value={caseItem.doors}
                    onChange={(e) => updateFollowUpCase(caseItem.id, 'doors', handleNumericInput(e.target.value))}
                    placeholder="輸入數量"
                  />
                </div>
                <div className="space-y-2">
                  <Label>安裝窗數</Label>
                  <Input
                    inputMode="numeric"
                    value={caseItem.windows}
                    onChange={(e) => updateFollowUpCase(caseItem.id, 'windows', handleNumericInput(e.target.value))}
                    placeholder="輸入數量"
                  />
                </div>
                <div className="space-y-2">
                  <Label>安裝鋁料數</Label>
                  <Input
                    inputMode="numeric"
                    value={caseItem.aluminum}
                    onChange={(e) => updateFollowUpCase(caseItem.id, 'aluminum', handleNumericInput(e.target.value))}
                    placeholder="輸入數量"
                  />
                </div>
                <div className="space-y-2">
                  <Label>拆舊拆拉釘窗花數</Label>
                  <Input
                    inputMode="numeric"
                    value={caseItem.old_removed}
                    onChange={(e) => updateFollowUpCase(caseItem.id, 'old_removed', handleNumericInput(e.target.value))}
                    placeholder="輸入數量"
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
                <div className="space-y-2">
                  <Label>安裝難處反映</Label>
                  <Textarea
                    value={caseItem.install_difficulty}
                    onChange={(e) => updateFollowUpCase(caseItem.id, 'install_difficulty', e.target.value)}
                    placeholder="輸入安裝難處"
                    rows={2}
                  />
                </div>
              </div>
            </div>
          ))}
          
          <Button type="button" variant="outline" className="w-full" onClick={addFollowUpCase}>
            <Plus className="h-4 w-4 mr-1" />
            新增個案
          </Button>
        </CardContent>
      </Card>

      <Button type="submit" className="w-full gradient-primary h-12 text-lg" disabled={isSubmitting}>
        {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
        {submitLabel}
      </Button>
    </form>
  );
}
