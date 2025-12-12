import { useGoogleSheetData } from '@/hooks/useGoogleSheetData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, CheckCircle2, FileSpreadsheet } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

export function GoogleSheetDataDisplay() {
  const { data, headers, loading, error, refetch } = useGoogleSheetData();

  if (loading) {
    return (
      <Card className="shadow-card">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">正在讀取 Google Sheet 資料...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-card border-destructive/50">
        <CardContent className="py-6">
          <p className="text-destructive text-center">{error}</p>
          <Button onClick={refetch} variant="outline" className="mx-auto mt-4 block">
            <RefreshCw className="h-4 w-4 mr-2" />
            重試
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-success/10">
            <CheckCircle2 className="h-5 w-5 text-success" />
          </div>
          <div>
            <CardTitle className="text-lg">Google Sheet 資料讀取成功</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              共 {data.length} 筆記錄 · {headers.length} 個欄位
            </p>
          </div>
        </div>
        <Button onClick={refetch} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          重新整理
        </Button>
      </CardHeader>
      <CardContent>
        <ScrollArea className="w-full whitespace-nowrap rounded-md border">
          <div className="min-w-max">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold w-12 text-center">#</TableHead>
                  {headers.map((header, index) => (
                    <TableHead key={index} className="font-semibold min-w-[120px]">
                      {header || `欄位 ${index + 1}`}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={headers.length + 1} className="text-center py-8 text-muted-foreground">
                      <FileSpreadsheet className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      暫無資料
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((row, rowIndex) => (
                    <TableRow key={rowIndex} className="hover:bg-muted/30">
                      <TableCell className="text-center text-muted-foreground font-mono text-sm">
                        {rowIndex + 1}
                      </TableCell>
                      {headers.map((header, colIndex) => (
                        <TableCell key={colIndex} className="max-w-[200px] truncate">
                          {row[header] || '-'}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
