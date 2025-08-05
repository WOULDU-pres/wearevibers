// AdminReports.tsx - 관리자용 신고 대시보드
// EPIC-04: 보안 및 안정성 - STORY-015

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  // AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  // Eye,
  Shield,
  FileText,
  Users,
  // TrendingUp,
  // Trash2,
} from 'lucide-react';
import { useReports, useReportStats, useProcessReport } from '@/hooks/useSecurity';
import { REPORT_REASON_OPTIONS } from '@/lib/constants/report-reasons';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { Report, ReportStatus } from '@/types/security';

const AdminReports = () => {
  const [selectedStatus, setSelectedStatus] = useState<ReportStatus | 'all'>('all');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isProcessDialogOpen, setIsProcessDialogOpen] = useState(false);
  const [processAction, setProcessAction] = useState<ReportStatus>('resolved');
  const [resolutionNote, setResolutionNote] = useState('');

  // 데이터 조회
  const { data: reportsData, isLoading: reportsLoading } = useReports({
    status: selectedStatus === 'all' ? undefined : selectedStatus,
    limit: 50,
  });
  const { data: stats } = useReportStats();
  const processReportMutation = useProcessReport();

  const reports = reportsData?.reports || [];

  const handleProcessReport = (report: Report, action: ReportStatus) => {
    setSelectedReport(report);
    setProcessAction(action);
    setIsProcessDialogOpen(true);
  };

  const handleConfirmProcess = async () => {
    if (!selectedReport) return;

    try {
      await processReportMutation.mutateAsync({
        report_id: selectedReport.id,
        new_status: processAction,
        resolution_note: resolutionNote.trim() || undefined,
      });

      setIsProcessDialogOpen(false);
      setSelectedReport(null);
      setResolutionNote('');
    } catch (error) {
      console.error('신고 처리 실패:', error);
    }
  };

  const getStatusBadge = (status: ReportStatus) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-200">대기중</Badge>;
      case 'reviewing':
        return <Badge variant="outline" className="text-blue-600 border-blue-200">검토중</Badge>;
      case 'resolved':
        return <Badge variant="outline" className="text-green-600 border-green-200">해결됨</Badge>;
      case 'dismissed':
        return <Badge variant="outline" className="text-gray-600 border-gray-200">기각됨</Badge>;
      default:
        return <Badge variant="outline">-</Badge>;
    }
  };

  const getReasonLabel = (reason: string) => {
    const reasonOption = REPORT_REASON_OPTIONS.find(opt => opt.value === reason);
    return reasonOption?.label || reason;
  };

  const getContentTypeLabel = (type: string) => {
    switch (type) {
      case 'post': return '게시글';
      case 'tip': return '팁';
      case 'comment': return '댓글';
      case 'profile': return '프로필';
      default: return type;
    }
  };

  if (reportsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">신고 관리 대시보드</h1>
            <p className="text-muted-foreground">
              커뮤니티 신고를 검토하고 관리하세요
            </p>
          </div>
        </div>

        {/* 통계 카드 */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">전체 신고</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_reports}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">대기중</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pending_reports}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">해결됨</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.resolved_reports}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">기각됨</CardTitle>
                <XCircle className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.dismissed_reports}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 필터 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">필터</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="status-filter">상태별 필터</Label>
                <Select value={selectedStatus} onValueChange={(value: ReportStatus | 'all') => setSelectedStatus(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="상태 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체</SelectItem>
                    <SelectItem value="pending">대기중</SelectItem>
                    <SelectItem value="reviewing">검토중</SelectItem>
                    <SelectItem value="resolved">해결됨</SelectItem>
                    <SelectItem value="dismissed">기각됨</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 신고 목록 */}
        <Card>
          <CardHeader>
            <CardTitle>신고 목록</CardTitle>
            <CardDescription>
              {reports.length}개의 신고가 있습니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            {reports.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>신고된 내용이 없습니다.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>상태</TableHead>
                      <TableHead>유형</TableHead>
                      <TableHead>사유</TableHead>
                      <TableHead>신고자</TableHead>
                      <TableHead>날짜</TableHead>
                      <TableHead>액션</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>
                          {getStatusBadge(report.status)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {getContentTypeLabel(report.content_type)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{getReasonLabel(report.reason)}</p>
                            {report.description && (
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {report.description}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            {report.reporter?.username || '알 수 없음'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {formatDistanceToNow(new Date(report.created_at), {
                              addSuffix: true,
                              locale: ko,
                            })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {report.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleProcessReport(report, 'resolved')}
                                  className="text-green-600 hover:text-green-700"
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  승인
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleProcessReport(report, 'dismissed')}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  기각
                                </Button>
                              </>
                            )}
                            {report.status === 'resolved' && report.resolution_note && (
                              <div className="max-w-32">
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                  {report.resolution_note}
                                </p>
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 신고 처리 다이얼로그 */}
      <AlertDialog open={isProcessDialogOpen} onOpenChange={setIsProcessDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              신고 {processAction === 'resolved' ? '승인' : '기각'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              이 신고를 {processAction === 'resolved' ? '승인' : '기각'}하시겠습니까?
              {selectedReport && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p className="text-sm">
                    <strong>신고 사유:</strong> {getReasonLabel(selectedReport.reason)}
                  </p>
                  {selectedReport.description && (
                    <p className="text-sm mt-1">
                      <strong>상세 내용:</strong> {selectedReport.description}
                    </p>
                  )}
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-2">
            <Label htmlFor="resolution-note">처리 사유 (선택사항)</Label>
            <Textarea
              id="resolution-note"
              placeholder="처리 사유를 입력해주세요..."
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              rows={3}
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmProcess}
              disabled={processReportMutation.isPending}
              className={
                processAction === 'resolved'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              }
            >
              {processReportMutation.isPending
                ? '처리 중...'
                : processAction === 'resolved'
                ? '승인'
                : '기각'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </div>
  );
};

export default AdminReports;