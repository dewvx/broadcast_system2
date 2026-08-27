import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getNewsById, createNews, updateNews, uploadNewsImage } from '../../api/news.api';
import { getCategories } from '../../api/category.api';
import { Button, Input, Select, Textarea, Card, LoadingSpinner } from '../../components/ui';
import { ArrowLeft, Save, Upload, Image as ImageIcon, AlertCircle } from 'lucide-react';

function NewsFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [newsTitle, setNewsTitle] = useState('');
  const [newsContent, setNewsContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [currentImage, setCurrentImage] = useState('');

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchCategories();
    if (isEdit) {
      fetchNews();
    }
  }, [id]);

  async function fetchCategories() {
    try {
      const res = await getCategories();
      setCategories(res.data.data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  }

  async function fetchNews() {
    try {
      setLoading(true);
      const res = await getNewsById(id);
      const data = res.data.data;
      setNewsTitle(data.news_title);
      setNewsContent(data.news_content);
      setCategoryId(data.category_id);
      if (data.news_image) {
        setCurrentImage(data.news_image);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'ดึงข้อมูลข่าวไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  }

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg('');

    if (!newsTitle.trim() || !newsContent.trim() || !categoryId) {
      setErrorMsg('กรุณากรอกหัวข้อข่าว เนื้อหาข่าว และเลือกหมวดหมู่ให้ครบถ้วน');
      return;
    }

    try {
      setSubmitting(true);
      let targetNewsId = id;

      if (isEdit) {
        await updateNews(id, { newsTitle, newsContent, categoryId });
      } else {
        const res = await createNews({ newsTitle, newsContent, categoryId });
        targetNewsId = res.data?.data?.news_id || res.data?.data?.newsId || res.data?.data;
      }

      if (imageFile && targetNewsId) {
        await uploadNewsImage(targetNewsId, imageFile);
      }

      navigate('/admin/news');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'บันทึกข่าวไม่สำเร็จ');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <LoadingSpinner text="กำลังโหลดข้อมูลข่าว..." />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate('/admin/news')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-h1 text-text-primary">
            {isEdit ? 'แก้ไขข่าวสาร' : 'สร้างข่าวสารใหม่'}
          </h1>
          <p className="text-sm text-text-secondary mt-0.5">
            {isEdit ? 'ปรับปรุงเนื้อหาและข้อมูลข่าวสาร' : 'กรอกรายละเอียดเพื่อสร้างข่าวหรือประกาศใหม่'}
          </p>
        </div>
      </div>

      {/* Form Card */}
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {errorMsg && (
            <div className="p-4 bg-error-soft border border-error/20 rounded-sm text-error text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <Input
            label="หัวข้อข่าวสาร / ประกาศ"
            required
            placeholder="ระบุหัวข้อข่าวสารสั้นๆ เข้าใจง่าย"
            value={newsTitle}
            onChange={(e) => setNewsTitle(e.target.value)}
          />

          <Select
            label="หมวดหมู่ข่าวสาร"
            required
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="" disabled hidden>
              -- เลือกหมวดหมู่ --
            </option>
            {categories.map((c) => (
              <option key={c.category_id} value={c.category_id}>
                {c.category_name}
              </option>
            ))}
          </Select>

          {/* Cover Image Upload (Aspect Ratio 16:9 according to DESIGN_SYSTEM) */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-text-primary">รูปภาพปกประกอบข่าว</label>
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="w-full sm:w-64 aspect-video bg-slate-100 border border-border rounded-sm overflow-hidden flex items-center justify-center relative">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : currentImage ? (
                  <img src={currentImage} alt="Current" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-4 text-text-muted">
                    <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50" />
                    <span className="text-body-sm">ไม่มีรูปภาพปก</span>
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="text-body-sm text-text-secondary file:mr-3 file:py-2.5 file:px-4 file:rounded-sm file:border-0 file:text-body-sm file:font-medium file:bg-primary-soft file:text-primary-active hover:file:bg-primary/20 border border-border rounded-sm p-1.5 cursor-pointer"
                />
                <p className="text-xs text-text-muted">
                  แนะนำสัดส่วน 16:9 ขนาดไม่เกิน 5MB (ไฟล์ .jpg, .png, .webp)
                </p>
              </div>
            </div>
          </div>

          <Textarea
            label="เนื้อหาข่าวสารเต็ม"
            required
            rows={8}
            placeholder="รายละเอียดข่าวสาร ข้อมูลประกาศ วันเวลา สถานที่ หรือข้อมูลติดต่อเพิ่มเติม..."
            value={newsContent}
            onChange={(e) => setNewsContent(e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="secondary" onClick={() => navigate('/admin/news')}>
              ยกเลิก
            </Button>
            <Button type="submit" variant="primary" icon={Save} loading={submitting}>
              {isEdit ? 'บันทึกการแก้ไข' : 'บันทึกข่าว'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default NewsFormPage;