import { useState } from 'react';
import { Report } from '@/types/report';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from '@/components/ui/table';
import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogTrigger 
} from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Eye, Edit, Trash2, Calendar, MapPin, Users } from 'lucide-react';
import { format } from 'date-fns';

interface ReportListProps {
  reports: Report[];
  onEdit: (report: Report) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

export default function ReportList({ reports, onEdit, onDelete, isDeleting }: ReportListProps) {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  if (reports.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <div className="text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">暫無報告</p>
            <p className="text-sm mt-1">點擊「新增報告」開始建立</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>我的報告 ({reports.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>報告編號</TableHead>
                <TableHead>日期</TableHead>
                <TableHead>分隊</TableHead>
                <TableHead>安裝地址</TableHead>
                <TableHead>金額</TableHead>
                <TableHead>狀態</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id} className="group">
                  <TableCell className="font-mono text-sm">{report.report_code}</TableCell>
                  <TableCell>{format(new Date(report.report_date), 'yyyy-MM-dd')}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{report.team || '-'}</Badge>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {report.install_address || report.order_address || '-'}
                  </TableCell>
                  <TableCell>${(report.install_amount + report.order_amount).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={report.urgency === 'Urgent' ? 'destructive' : 'outline'}>
                      {report.urgency === 'Urgent' ? '加急' : '正常'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => setSelectedReport(report)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>報告詳情 - {report.report_code}</DialogTitle>
                          </DialogHeader>
                          {selectedReport && (
                            <ReportDetails report={selectedReport} />
                          )}
                        </DialogContent>
                      </Dialog>
                      
                      <Button variant="ghost" size="icon" onClick={() => onEdit(report)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>確認刪除？</AlertDialogTitle>
                            <AlertDialogDescription>
                              此操作無法撤銷。確定要刪除此報告嗎？
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>取消</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => onDelete(report.id)}
                              disabled={isDeleting}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              刪除
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function ReportDetails({ report }: { report: Report }) {
  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="space-y-3">
        <h4 className="font-semibold flex items-center gap-2">
          <Users className="h-4 w-4" /> 基本資料
        </h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="text-muted-foreground">日期：</span>{format(new Date(report.report_date), 'yyyy-MM-dd')}</div>
          <div><span className="text-muted-foreground">分隊：</span>{report.team || '-'}</div>
          <div><span className="text-muted-foreground">安裝同事：</span>
            {[report.installer_1, report.installer_2, report.installer_3, report.installer_4]
              .filter(Boolean).join('、') || '-'}
          </div>
        </div>
      </div>

      {/* Installation Info */}
      <div className="space-y-3">
        <h4 className="font-semibold flex items-center gap-2">
          <MapPin className="h-4 w-4" /> 已完成個案
        </h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="text-muted-foreground">地址：</span>{report.install_address || '-'}</div>
          <div><span className="text-muted-foreground">付款方式：</span>{report.install_payment_method || '-'}</div>
          <div><span className="text-muted-foreground">金額：</span>${report.install_amount.toLocaleString()}</div>
          <div><span className="text-muted-foreground">度尺同事：</span>{report.measure_colleague || '-'}</div>
          <div><span className="text-muted-foreground">開料數：</span>{report.install_material_open}</div>
          <div><span className="text-muted-foreground">補料數：</span>{report.install_material_replenish}</div>
          <div><span className="text-muted-foreground">安裝門數：</span>{report.install_doors}</div>
          <div><span className="text-muted-foreground">安裝窗數：</span>{report.install_windows}</div>
          <div><span className="text-muted-foreground">安裝鋁料數：</span>{report.install_aluminum}</div>
          <div><span className="text-muted-foreground">拆舊數：</span>{report.install_old_removed}</div>
        </div>
        {report.install_notes && (
          <div className="text-sm">
            <span className="text-muted-foreground">備註：</span>{report.install_notes}
          </div>
        )}
      </div>

      {/* Order Info */}
      <div className="space-y-3">
        <h4 className="font-semibold">需跟進個案</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="text-muted-foreground">地址：</span>{report.order_address || '-'}</div>
          <div><span className="text-muted-foreground">付款方式：</span>{report.order_payment_method || '-'}</div>
          <div><span className="text-muted-foreground">金額：</span>${report.order_amount.toLocaleString()}</div>
          <div><span className="text-muted-foreground">數據類型：</span>{report.order_data_type || '-'}</div>
          <div><span className="text-muted-foreground">責任：</span>{report.responsibility_option || '-'}</div>
          <div><span className="text-muted-foreground">緊急程度：</span>{report.urgency || '-'}</div>
        </div>
        {report.order_notes && (
          <div className="text-sm">
            <span className="text-muted-foreground">備註：</span>{report.order_notes}
          </div>
        )}
      </div>
    </div>
  );
}
