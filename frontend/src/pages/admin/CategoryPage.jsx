import { useState, useEffect, useMemo } from 'react';
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../../api/category.api';
import { Button, Input, Modal, Badge, EmptyState, LoadingSpinner } from '../../components/ui';
import {
  Tag,
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  Folder,
  Search,
  X,
} from 'lucide-react';

function CategoryPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

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
      setCategories(res.data.data || []);
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

  async function handleDelete(cat) {
    if (cat.news_count > 0) {
      alert(`ไม่สามารถลบหมวดหมู่ "${cat.category_name}" ได้ เนื่องจากมีข่าวสาร ${cat.news_count} รายการผูกอยู่`);
      return;
    }

    if (!window.confirm(`ยืนยันลบหมวดหมู่ "${cat.category_name}" ออกจากระบบ?`)) return;

    try {
      await deleteCategory(cat.category_id);
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || 'ลบไม่สำเร็จ');
    }
  }

  // คัดกรองตามช่องค้นหา
  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return categories;
    const query = searchTerm.toLowerCase();
    return categories.filter((c) => c.category_name.toLowerCase().includes(query));
  }, [categories, searchTerm]);

  if (loading) return <LoadingSpinner text="กำลังโหลดหมวดหมู่ข่าวสาร..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-h1 text-text-primary">จัดการหมวดหมู่ข่าวสาร</h1>
            <Badge variant="primary">{categories.length} หมวดหมู่</Badge>
          </div>
          <p className="text-body-sm text-text-secondary mt-1">
            จัดระเบียบหมวดหมู่ข่าวสาร ประกาศ และสาระชุมชน เพื่อให้ลูกบ้านค้นหาและติดตามได้ง่าย
          </p>
        </div>
        <Button icon={Plus} variant="primary" onClick={openCreate} className="shrink-0 shadow-sm">
          เพิ่มหมวดหมู่ใหม่
        </Button>
      </div>

      {errorMsg && (
        <div className="p-4 bg-error-soft border border-error/20 rounded-md text-error text-body-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-surface border border-border p-3.5 rounded-lg shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาชื่อหมวดหมู่..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-10 pr-9 text-body-sm bg-surface border border-border rounded-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary p-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Table View */}
      <div className="bg-surface border border-border rounded-lg shadow-xs overflow-hidden">
        {filteredCategories.length === 0 ? (
          <EmptyState
            icon={Tag}
            title={searchTerm ? 'ไม่พบหมวดหมู่ที่ตรงกับการค้นหา' : 'ยังไม่มีหมวดหมู่ข่าวสาร'}
            description={
              searchTerm
                ? `ไม่พบหมวดหมู่ที่ตรงกับคำว่า "${searchTerm}" กรุณาลองใช้คำค้นอื่น`
                : 'กดปุ่ม "เพิ่มหมวดหมู่ใหม่" ด้านบนเพื่อเริ่มสร้างหมวดหมู่แรก'
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-border text-body-sm text-text-secondary font-semibold">
                <tr>
                  <th className="px-6 py-3.5 w-16 text-center">#</th>
                  <th className="px-6 py-3.5">ชื่อหมวดหมู่</th>
                  <th className="px-6 py-3.5">จำนวนข่าวสารที่ผูก</th>
                  <th className="px-6 py-3.5">วันที่สร้าง</th>
                  <th className="px-6 py-3.5 text-right w-36">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredCategories.map((cat, idx) => (
                  <tr key={cat.category_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 text-center text-text-muted text-body-sm">{idx + 1}</td>
                    <td className="px-6 py-4 font-medium text-text-primary">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-md bg-primary-soft text-primary flex items-center justify-center shrink-0">
                          <Folder className="w-4 h-4" />
                        </div>
                        <span className="text-body font-semibold">{cat.category_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={Number(cat.news_count) > 0 ? 'primary' : 'default'}>
                        {Number(cat.news_count) > 0 ? `${cat.news_count} ข่าว` : 'ไม่มีข่าว'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-body-sm text-text-muted">
                      {cat.created_at ? new Date(cat.created_at).toLocaleDateString('th-TH') : '—'}
                    </td>
                    <td className="px-6 py-4 text-right space-x-1.5">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(cat)} title="แก้ไข">
                        <Edit2 className="w-4 h-4 text-primary" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(cat)} title="ลบ">
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

      {/* Create / Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={editTarget ? 'แก้ไขหมวดหมู่ข่าวสาร' : 'เพิ่มหมวดหมู่ข่าวสารใหม่'}
        footer={
          <>
            <Button variant="secondary" onClick={closeModal} disabled={submitting}>
              ยกเลิก
            </Button>
            <Button variant="primary" loading={submitting} onClick={handleSubmit}>
              {editTarget ? 'บันทึกการแก้ไข' : 'เพิ่มหมวดหมู่'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-error-soft border border-error/20 rounded-md text-error text-body-sm flex items-center gap-2" role="alert">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <Input
            label="ชื่อหมวดหมู่"
            required
            placeholder="เช่น ประกาศด่วน, กิจกรรมชุมชน, ประชาสัมพันธ์, ข่าวสารเกษตร"
            helperText="ตั้งชื่อให้กระชับและสื่อความหมายชัดเจน เพื่อให้ลูกบ้านเข้าใจง่าย"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
          />

          {editTarget && editTarget.news_count > 0 && (
            <div className="bg-primary-soft/50 border border-primary/20 rounded-md p-3 text-body-sm text-text-secondary">
              ℹ️ มีข่าวสารจำนวน <strong>{editTarget.news_count}</strong> รายการที่อยู่ในหมวดหมู่นี้ การเปลี่ยนชื่อจะมีผลกับข่าวทั้งหมดทันที
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
}

export default CategoryPage;
