import { useState, useEffect } from 'react';
import {
  getAllFaqs,
  createFaq,
  updateFaq,
  deleteFaq,
} from '../../api/chatbotfaq.api';
import { getAllNews } from '../../api/news.api';
import { getAllDocuments } from '../../api/document.api';
import { Button, Input, Textarea, Modal, Card, EmptyState, LoadingSpinner } from '../../components/ui';
import { Bot, Plus, Edit2, Trash2, AlertCircle, MessageSquare } from 'lucide-react';

function ChatbotFaqPage() {
  const [faqs, setFaqs] = useState([]);
  const [news, setNews] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [questionKey, setQuestionKey] = useState('');
  const [answerText, setAnswerText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchFaqs();
    fetchResources();
  }, []);

  async function fetchFaqs() {
    try {
      setLoading(true);
      const res = await getAllFaqs();
      setFaqs(res.data.data);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'โหลดข้อมูล Chatbot FAQ ไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  }

  async function fetchResources() {
    try {
      const newsRes = await getAllNews();
      setNews(newsRes.data.data);
      const docRes = await getAllDocuments();
      setDocuments(docRes.data.data);
    } catch (err) {
      console.error('Failed to load resources for chatbot:', err);
    }
  }

  function openCreate() {
    setEditTarget(null);
    setQuestionKey('');
    setAnswerText('');
    setFormError('');
    setShowModal(true);
  }

  function openEdit(item) {
    setEditTarget(item);
    setQuestionKey(item.question_key || '');
    setAnswerText(item.answer_text || '');
    setFormError('');
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditTarget(null);
    setQuestionKey('');
    setAnswerText('');
    setFormError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!questionKey.trim() || !answerText.trim()) {
      setFormError('กรุณากรอกคำค้นและคำตอบให้ครบถ้วน');
      return;
    }

    try {
      setSubmitting(true);
      if (editTarget) {
        await updateFaq(editTarget.faq_id, {
          questionKey: questionKey.trim(),
          answerText: answerText.trim(),
        });
      } else {
        await createFaq({
          questionKey: questionKey.trim(),
          answerText: answerText.trim(),
        });
      }
      closeModal();
      fetchFaqs();
    } catch (err) {
      setFormError(err.response?.data?.message || 'บันทึกไม่สำเร็จ');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('ยืนยันลบคำถาม-คำตอบนี้?')) return;
    try {
      await deleteFaq(id);
      fetchFaqs();
    } catch (err) {
      alert(err.response?.data?.message || 'ลบไม่สำเร็จ');
    }
  }

  if (loading) return <LoadingSpinner text="กำลังโหลดข้อมูลแชทบอทตอบคำถามอัตโนมัติ..." />;

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
          <h1 className="text-2xl font-bold text-text-primary">ตั้งค่าแชทบอทตอบคำถามอัตโนมัติ</h1>
          <p className="text-sm text-text-secondary mt-1">
            กำหนดคำค้นหาหลัก (Keyword) และข้อความที่จะตอบกลับลูกบ้านใน LINE OA อัตโนมัติ ({faqs.length} รายการ)
          </p>
        </div>
        <Button icon={Plus} variant="primary" onClick={openCreate}>
          เพิ่มคำถาม-คำตอบ
        </Button>
      </div>

      {/* FAQ Table */}
      <div className="bg-surface border border-border rounded-md shadow-xs overflow-hidden">
        {faqs.length === 0 ? (
          <EmptyState
            icon={Bot}
            title="ยังไม่มีคำถาม-คำตอบอัตโนมัติ"
            description="กดปุ่มเพิ่มคำถาม-คำตอบด้านบน เพื่อตั้งค่าคำคีย์เวิร์ดตอบแชทลูกบ้าน"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-border text-xs text-text-secondary font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">#</th>
                  <th className="px-6 py-3.5">คำค้นหาหลัก (Keyword)</th>
                  <th className="px-6 py-3.5">ข้อความตอบกลับอัตโนมัติ</th>
                  <th className="px-6 py-3.5 text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {faqs.map((faq, idx) => (
                  <tr key={faq.faq_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 text-text-muted">{idx + 1}</td>
                    <td className="px-6 py-4 font-medium text-primary">
                      <div className="flex items-center gap-1.5">
                        <MessageSquare className="w-4 h-4 text-primary/70 shrink-0" />
                        <span>{faq.question_key}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-text-primary max-w-md whitespace-pre-wrap">
                      {faq.answer_text}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(faq)} title="แก้ไข">
                        <Edit2 className="w-4 h-4 text-primary" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(faq.faq_id)} title="ลบ">
                        <Trash2 className="w-4 h-4 text-text-muted hover:text-error" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={editTarget ? 'แก้ไขคำถาม-คำตอบ' : 'เพิ่มคำถาม-คำตอบใหม่'}
        footer={
          <>
            <Button variant="secondary" onClick={closeModal}>
              ยกเลิก
            </Button>
            <Button variant="primary" loading={submitting} onClick={handleSubmit}>
              บันทึก
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-error-soft border border-error/20 rounded-sm text-error text-xs">
              {formError}
            </div>
          )}
          <Input
            label="คำค้นหาหลัก / คีย์เวิร์ด (Question Keyword)"
            required
            placeholder="เช่น เวลาเปิดทำการ, ขยะ, ติดต่อ"
            helperText="เมื่อลูกบ้านพิมพ์ข้อความที่มีคำนี้ ระบบจะตอบกลับด้วยข้อความที่กำหนดไว้"
            value={questionKey}
            onChange={(e) => setQuestionKey(e.target.value)}
          />
          <Textarea
            label="ข้อความที่จะตอบกลับ (Answer Text)"
            required
            rows={4}
            placeholder="เช่น สำนักงานเปิดทำการวันจันทร์ - ศุกร์ เวลา 08.30 - 16.30 น."
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
          />

          <div className="pt-4 border-t border-border">
            <h3 className="text-sm font-semibold text-text-primary mb-2">แหล่งข้อมูลสำหรับคัดลอกลิงก์:</h3>
            <div className="max-h-48 overflow-y-auto space-y-2 text-xs">
              <div className="font-semibold text-text-secondary">ข่าวสาร (เฉพาะที่อนุมัติแล้ว):</div>
              {news.filter(n => n.news_status === 'Approved').map(n => (
                <div key={n.news_id} className="flex justify-between items-center bg-slate-50 p-1.5 rounded">
                  <span className="truncate flex-1">{n.news_title}</span>
                  <Button size="sm" variant="ghost" className="h-6" onClick={() => navigator.clipboard.writeText(`/news/${n.news_id}`)}>คัดลอก Path</Button>
                </div>
              ))}
              <div className="font-semibold text-text-secondary pt-2">เอกสาร:</div>
              {documents.map(d => (
                <div key={d.doc_id} className="flex justify-between items-center bg-slate-50 p-1.5 rounded">
                  <span className="truncate flex-1">{d.doc_name}</span>
                  <Button size="sm" variant="ghost" className="h-6" onClick={() => navigator.clipboard.writeText(d.doc_file_path)}>คัดลอก Path</Button>
                </div>
              ))}
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default ChatbotFaqPage;
