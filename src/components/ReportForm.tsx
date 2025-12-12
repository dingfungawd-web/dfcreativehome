import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ReportFormData, PAYMENT_METHODS, DATA_TYPES, RESPONSIBILITY_OPTIONS, URGENCY_OPTIONS, TEAMS, COLLEAGUES } from '@/types/report';
import { Loader2, Building, Wrench, Package } from 'lucide-react';

interface ReportFormProps {
  initialData?: Partial<ReportFormData>;
  onSubmit: (data: ReportFormData) => Promise<void>;
  isSubmitting: boolean;
  submitLabel?: string;
}

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const updateField = <K extends keyof ReportFormData>(field: K, value: ReportFormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
                    {COLLEAGUES.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Installation Section */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Wrench className="h-5 w-5 text-primary" />
            安裝資料
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>地址</Label>
              <Input
                value={formData.install_address}
                onChange={(e) => updateField('install_address', e.target.value)}
                placeholder="輸入地址"
              />
            </div>
            <div className="space-y-2">
              <Label>付款方式</Label>
              <Select value={formData.install_payment_method} onValueChange={(v) => updateField('install_payment_method', v)}>
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
                value={formData.install_amount}
                onChange={(e) => updateField('install_amount', Number(e.target.value))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>開料數</Label>
              <Input
                type="number"
                value={formData.install_material_open}
                onChange={(e) => updateField('install_material_open', Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>補料數</Label>
              <Input
                type="number"
                value={formData.install_material_replenish}
                onChange={(e) => updateField('install_material_replenish', Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>度尺同事</Label>
              <Select value={formData.measure_colleague} onValueChange={(v) => updateField('measure_colleague', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="選擇同事" />
                </SelectTrigger>
                <SelectContent>
                  {COLLEAGUES.map(c => (
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
                value={formData.install_doors}
                onChange={(e) => updateField('install_doors', Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>安裝窗數</Label>
              <Input
                type="number"
                value={formData.install_windows}
                onChange={(e) => updateField('install_windows', Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>安裝鋁料數</Label>
              <Input
                type="number"
                value={formData.install_aluminum}
                onChange={(e) => updateField('install_aluminum', Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>拆舊拆拉釘窗花數</Label>
              <Input
                type="number"
                value={formData.install_old_removed}
                onChange={(e) => updateField('install_old_removed', Number(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>備註</Label>
            <Textarea
              value={formData.install_notes}
              onChange={(e) => updateField('install_notes', e.target.value)}
              placeholder="輸入備註"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Order Section */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Package className="h-5 w-5 text-primary" />
            訂料資料
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>地址</Label>
              <Input
                value={formData.order_address}
                onChange={(e) => updateField('order_address', e.target.value)}
                placeholder="輸入地址"
              />
            </div>
            <div className="space-y-2">
              <Label>付款方式</Label>
              <Select value={formData.order_payment_method} onValueChange={(v) => updateField('order_payment_method', v)}>
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
                value={formData.order_amount}
                onChange={(e) => updateField('order_amount', Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>訂料數據</Label>
              <Select value={formData.order_data_type} onValueChange={(v) => updateField('order_data_type', v)}>
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
                value={formData.order_material_open}
                onChange={(e) => updateField('order_material_open', Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>補料數</Label>
              <Input
                type="number"
                value={formData.order_material_replenish}
                onChange={(e) => updateField('order_material_replenish', Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>重訂數</Label>
              <Input
                type="number"
                value={formData.order_reorder}
                onChange={(e) => updateField('order_reorder', Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>度尺同事</Label>
              <Select value={formData.order_measure_colleague} onValueChange={(v) => updateField('order_measure_colleague', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="選擇同事" />
                </SelectTrigger>
                <SelectContent>
                  {COLLEAGUES.map(c => (
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
                value={formData.order_reorder_location}
                onChange={(e) => updateField('order_reorder_location', e.target.value)}
                placeholder="輸入位置"
              />
            </div>
            <div className="space-y-2">
              <Label>責任選項</Label>
              <Select value={formData.responsibility_option} onValueChange={(v) => updateField('responsibility_option', v)}>
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
              <Select value={formData.urgency} onValueChange={(v) => updateField('urgency', v)}>
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
                value={formData.order_install_doors}
                onChange={(e) => updateField('order_install_doors', Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>安裝窗數</Label>
              <Input
                type="number"
                value={formData.order_install_windows}
                onChange={(e) => updateField('order_install_windows', Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>安裝鋁料數</Label>
              <Input
                type="number"
                value={formData.order_install_aluminum}
                onChange={(e) => updateField('order_install_aluminum', Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>拆舊拆拉釘窗花數</Label>
              <Input
                type="number"
                value={formData.order_old_removed}
                onChange={(e) => updateField('order_old_removed', Number(e.target.value))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>訂料備註</Label>
              <Textarea
                value={formData.order_notes}
                onChange={(e) => updateField('order_notes', e.target.value)}
                placeholder="輸入備註"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>安裝難處反映</Label>
              <Textarea
                value={formData.install_difficulty}
                onChange={(e) => updateField('install_difficulty', e.target.value)}
                placeholder="輸入安裝難處"
                rows={2}
              />
            </div>
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
