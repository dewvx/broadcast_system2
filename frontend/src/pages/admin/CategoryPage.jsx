import { useState, useEffect } from 'react';
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../../api/category.api';
import { Button, Input, Modal, Card, EmptyState, LoadingSpinner } from '../../components/ui';
import { Tag, Plus, Edit2, Trash2, AlertCircle, Folder } from 'lucide-react';

function CategoryPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      setLoading(true);
      const res = await getAllCategories();
      setCategories(res.data.data);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'โหลดข้อมูลหมวดหมู่ไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditTarget(null);
    setCategoryName('');
    setFormError('');
    setShowModal(true);
  }

  function openEdit(item) {
    setEditTarget(item);
    setCategoryName(item.category_name || '');
    setFormError('');
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditTarget(null);
    setCategoryName('');
    setFormError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!categoryName.trim()) {
      setFormError('กรุณากรอกชื่อหมวดหมู่');
      return;
    }

    try {
      setSubmitting(true);
      if (editTarget) {
        await updateCategory(editTarget.category_id, { categoryName: categoryName.trim() });
      } else {
        await createCategory({ categoryName: categoryName.trim() });
      }
      closeModal();
      fetchCategories();
    } catch (err) {
      setFormError(err.response?.data?.message || 'บันทึกไม่สำเร็จ');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('ยืนยันลบหมวดหมู่นี้? (จะไม่สามารถลบได้หากมีข่าวผูกกับหมวดหมู่นี้อยู่)')) return;
    try {
      await deleteCategory(id);
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || 'ลบไม่สำเร็จ');
    }
  }

  if (loading) return <LoadingSpinner text="กำลังโหลดหมวดหมู่ข่าวสาร..." />;

  if (errorMsg) {
    return (
      <div className="p-4 bg-error-soft border border-error/20 rounded-sm text-error text-sm flex items-center gap-2">
        <AlertCircle className="w-4 h-4 shrink-0" />
        <span>{errorMsg}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-h1 text-text-primary">จัดการหมวดหมู่ข่าวสาร</h1>
          <p className="text-sm text-text-secondary mt-1">
            หมวดหมู่สำหรับจัดกลุ่มข่าวสารและประกาศชุมชน ({categories.length} หมวดหมู่)
          </p>
        </div>
        <Button icon={Plus} variant="primary" onClick={openCreate}>
          เพิ่มหมวดหมู่
        </Button>
      </div>

      {/* Categories Table */}
      <div className="bg-surface border border-border rounded-md shadow-xs overflow-hidden">
        {categories.length === 0 ? (
          <EmptyState
            icon={Tag}
            title="ยังไม่มีหมวดหมู่ข่าวสาร"
            description="กดปุ่มเพิ่มหมวดหมู่ด้านบนเพื่อสร้างหมวดหมู่แรกของคุณ"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-border text-body-sm text-text-secondary font-semibold">
                <tr>
                  <th className="px-6 py-3.5">#</th>
                  <th className="px-6 py-3.5">ชื่อหมวดหมู่</th>
                  <th className="px-6 py-3.5 text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {categories.map((cat, idx) => (
                  <tr key={cat.category_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 text-text-muted">{idx + 1}</td>
                    <td className="px-6 py-4 font-medium text-text-primary">
                      <div className="flex items-center gap-2">
                        <Folder className="w-4 h-4 text-primary" />
                        <span>{cat.category_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(cat)} title="แก้ไข">
                        <Edit2 className="w-4 h-4 text-primary" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(cat.category_id)} title="ลบ">
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
        title={editTarget ? 'แก้ไขหมวดหมู่' : 'เพิ่มหมวดหมู่ใหม่'}
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
            <div className="p-3 bg-error-soft border border-error/20 rounded-sm text-error text-body-sm" role="alert">
              {formError}
            </div>
          )}
          <Input
            label="ชื่อหมวดหมู่"
            required
            placeholder="เช่น ประกาศด่วน, กิจกรรมชุมชน, ประชาสัมพันธ์"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
          />
        </form>
      </Modal>
    </div>
  );
}

export default CategoryPage;
