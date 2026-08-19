import { useState, useEffect } from 'react';
import { useLiff } from '../../context/LiffContext';
import { getDocumentsForVillager } from '../../api/villager.api';
import { Card, EmptyState, LoadingSpinner, Button, Badge } from '../../components/ui';
import { FileText, Download, AlertCircle, LogIn, FileCode, File } from 'lucide-react';

function DocumentListPage() {
  const { liff, isLiffReady, liffError, idToken } = useLiff();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [needLogin, setNeedLogin] = useState(false);

  useEffect(() => {
    if (!isLiffReady) return;

    async function loadDocuments() {
      try {
        setLoading(true);
        setErrorMsg('');

        if (liff && liff.isLoggedIn && !liff.isLoggedIn()) {
          setNeedLogin(true);
          setLoading(false);
          return;
        }

        const token = idToken || (liff?.getIDToken ? liff.getIDToken() : null);

        if (!token) {
          setNeedLogin(true);
          setLoading(false);
          return;
        }

        const res = await getDocumentsForVillager(token);
        setDocuments(res.data.data);
      } catch (err) {
        setErrorMsg(err.response?.data?.message || 'ไม่สามารถโหลดเอกสารได้');
      } finally {
        setLoading(false);
      }
    }

    loadDocuments();
  }, [isLiffReady, liff, idToken]);

  function getFileIcon(filePath = '') {
    const ext = filePath.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return <FileText className="w-5 h-5 text-red-500" />;
    if (['doc', 'docx'].includes(ext)) return <FileCode className="w-5 h-5 text-blue-500" />;
    return <File className="w-5 h-5 text-text-muted" />;
  }

  function getFileExt(filePath = '') {
    return filePath.split('.').pop()?.toUpperCase() || 'FILE';
  }

  if (!isLiffReady || loading) {
    return <LoadingSpinner text="กำลังโหลดเอกสาร..." className="min-h-screen" />;
  }

  if (liffError) {
    return (
      <div className="p-6 text-center text-error space-y-2">
        <p className="font-bold">เกิดข้อผิดพลาด LIFF</p>
        <p className="text-xs text-text-secondary">{liffError}</p>
      </div>
    );
  }

  if (needLogin) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Card className="text-center space-y-4 py-8 w-full">
          <div className="w-12 h-12 rounded-full bg-primary-soft text-primary mx-auto flex items-center justify-center">
            <LogIn className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-text-primary">กรุณาล็อกอินผ่าน LINE</h2>
            <p className="text-xs text-text-secondary mt-1">เข้าสู่ระบบเพื่อดาวน์โหลดแบบฟอร์มราชการ</p>
          </div>
          <Button
            variant="primary"
            fullWidth
            onClick={() => {
              if (liff && liff.login) {
                liff.login({ redirectUri: window.location.href });
              }
            }}
          >
            เข้าสู่ระบบด้วย LINE
          </Button>
        </Card>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="p-4 m-4 bg-error-soft border border-error/20 rounded-sm text-error text-sm flex items-center gap-2">
        <AlertCircle className="w-4 h-4 shrink-0" />
        <span>{errorMsg}</span>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div>
        <h1 className="text-xl font-bold text-text-primary">แบบฟอร์มราชการ</h1>
        <p className="text-xs text-text-secondary mt-0.5">
          แบบฟอร์มและเอกสารสำคัญเปิดให้ดาวน์โหลด ({documents.length} ไฟล์)
        </p>
      </div>

      {documents.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="ยังไม่มีเอกสาร"
          description="เอกสารแบบฟอร์มราชการจะแสดงที่นี่"
        />
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <Card key={doc.doc_id} padding="sm" className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 rounded-sm shrink-0">
                  {getFileIcon(doc.doc_file_path)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-text-primary text-sm truncate">{doc.doc_name}</p>
                  <p className="text-[11px] text-text-muted mt-0.5">
                    {new Date(doc.upload_date).toLocaleDateString('th-TH')}
                  </p>
                </div>
                <Badge variant="neutral">{getFileExt(doc.doc_file_path)}</Badge>
              </div>

              <div className="pt-2 border-t border-border flex justify-end">
                <a
                  href={doc.doc_file_path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full"
                >
                  <Button size="sm" variant="outline" fullWidth icon={Download}>
                    ดาวน์โหลดเอกสาร
                  </Button>
                </a>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default DocumentListPage;
