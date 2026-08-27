import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAllDocuments, uploadDocument, deleteDocument } from '../../api/document.api';
import { Button, Input, Modal, Badge, EmptyState, LoadingSpinner, Pagination } from '../../components/ui';
import { FileText, Upload, Download, Trash2, FileCode, File, AlertCircle } from 'lucide-react';

const ITEMS_PER_PAGE = 8;

function DocumentPage() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [docName, setDocName] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const fileRef = useRef(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  async function fetchDocuments() {
    try {
      setLoading(true);
      const res = await getAllDocuments();
      setDocuments(res.data.data);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'โหลดข้อมูลไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(e) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setUploadError('กรุณาเลือกไฟล์เอกสาร');
      return;
    }
    if (!docName.trim()) {
      setUploadError('กรุณาระบุชื่อเอกสาร');
      return;
    }

    const formData = new FormData();
    formData.append('docName', docName.trim());
    formData.append('document', file);

    try {
      setUploading(true);
      setUploadError('');
      await uploadDocument(formData);
      setDocName('');
      if (fileRef.current) fileRef.current.value = '';
      setShowUploadModal(false);
      fetchDocuments();
    } catch (err) {
      setUploadError(err.response?.data?.message || 'อัปโหลดไม่สำเร็จ');
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('ยืนยันลบเอกสารนี้?')) return;
    try {
      await deleteDocument(id);
      fetchDocuments();
    } catch (err) {
      alert(err.response?.data?.message || 'ลบไม่สำเร็จ');
    }
  }

  function getFileIcon(filePath = '') {
    const ext = filePath.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return <FileText className="w-5 h-5 text-red-500" />;
    if (['doc', 'docx'].includes(ext)) return <FileCode className="w-5 h-5 text-blue-500" />;
    return <File className="w-5 h-5 text-text-muted" />;
  }

  function getFileExt(filePath = '') {
    return filePath.split('.').pop()?.toUpperCase() || 'FILE';
  }

  const paginatedDocs = documents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (loading) return <LoadingSpinner text="กำลังโหลดแบบฟอร์มเอกสาร..." />;

  if (errorMsg) {
    return (
      <div className="p-4 bg-error-soft border border-error/20 rounded-sm text-error text-sm flex items-center gap-2">
        <AlertCircle className="w-4 h-4 shrink-0" />
        <span>{errorMsg}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-h1 text-text-primary">แบบฟอร์มราชการ</h1>
          <p className="text-sm text-text-secondary mt-1">
            คลังเอกสารและแบบฟอร์มทางการสำหรับลูกบ้านดาวน์โหลด ({documents.length} ไฟล์)
          </p>
        </div>
        <Button
          icon={Upload}
          variant="primary"
          onClick={() => {
            setShowUploadModal(true);
            setUploadError('');
          }}
        >
          อัปโหลดเอกสาร
        </Button>
      </div>

      {/* Document List Table */}
      <div className="bg-surface border border-border rounded-md shadow-xs overflow-hidden">
        {documents.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="ยังไม่มีเอกสารในระบบ"
            description="กดปุ่มอัปโหลดเอกสารด้านบนเพื่อเพิ่มแบบฟอร์มราชการในระบบ"
          />
        ) : (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 border-b border-border text-body-sm text-text-secondary font-semibold">
                  <tr>
                    <th className="px-6 py-3.5">ชื่อเอกสาร</th>
                    <th className="px-6 py-3.5">ประเภท</th>
                    <th className="px-6 py-3.5">อัปโหลดโดย</th>
                    <th className="px-6 py-3.5">วันที่อัปโหลด</th>
                    <th className="px-6 py-3.5 text-right">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paginatedDocs.map((doc) => (
                    <tr key={doc.doc_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-100 rounded-sm">
                            {getFileIcon(doc.doc_file_path)}
                          </div>
                          <span className="font-medium text-text-primary">{doc.doc_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="neutral">{getFileExt(doc.doc_file_path)}</Badge>
                      </td>
                      <td className="px-6 py-4 text-text-secondary">{doc.created_by_name || '—'}</td>
                      <td className="px-6 py-4 text-text-muted">
                        {new Date(doc.upload_date).toLocaleDateString('th-TH')}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <a href={doc.doc_file_path} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="outline" icon={Download}>
                            ดาวน์โหลด
                          </Button>
                        </a>
                        {user?.roleName === 'Admin' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(doc.doc_id)}
                            title="ลบ"
                          >
                            <Trash2 className="w-4 h-4 text-text-muted hover:text-error" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalItems={documents.length}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="อัปโหลดแบบฟอร์มเอกสารใหม่"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowUploadModal(false)}>
              ยกเลิก
            </Button>
            <Button variant="primary" loading={uploading} onClick={handleUpload}>
              อัปโหลด
            </Button>
          </>
        }
      >
        <form onSubmit={handleUpload} className="space-y-4">
          {uploadError && (
            <div className="p-3 bg-error-soft border border-error/20 rounded-sm text-error text-body-sm">
              {uploadError}
            </div>
          )}
          <Input
            label="ชื่อเอกสาร"
            required
            placeholder="เช่น แบบฟอร์มคำร้องขอลงทะเบียนสวัสดิการ"
            value={docName}
            onChange={(e) => setDocName(e.target.value)}
          />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-text-primary">
              เลือกไฟล์เอกสาร <span className="text-error">*</span>
            </label>
            <input
              type="file"
              ref={fileRef}
              accept=".pdf,.doc,.docx"
              className="w-full text-body-sm text-text-secondary file:mr-3 file:py-2.5 file:px-4 file:rounded-sm file:border-0 file:text-body-sm file:font-medium file:bg-primary-soft file:text-primary-active hover:file:bg-primary/20 border border-border rounded-sm p-1.5 cursor-pointer"
            />
            <p className="text-body-sm text-text-muted">รองรับไฟล์ .pdf, .doc, .docx ขนาดไม่เกิน 10MB</p>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default DocumentPage;
