import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getNewsById } from '../../api/news.api';
import { Button, Badge, Card, LoadingSpinner } from '../../components/ui';
import { ArrowLeft, Calendar, User, Eye, AlertCircle } from 'lucide-react';

function NewsViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function fetchNews() {
      try {
        setLoading(true);
        const res = await getNewsById(id);
        setNews(res.data.data);
      } catch (err) {
        setErrorMsg(err.response?.data?.message || 'ดึงข้อมูลข่าวไม่สำเร็จ');
      } finally {
        setLoading(false);
      }
    }
    fetchNews();
  }, [id]);

  if (loading) return <LoadingSpinner text="กำลังโหลดข่าวสาร..." />;

  if (errorMsg) {
    return (
      <div className="p-4 bg-error-soft border border-error/20 rounded-sm text-error text-sm flex items-center gap-2">
        <AlertCircle className="w-4 h-4 shrink-0" />
        <span>{errorMsg}</span>
      </div>
    );
  }

  if (!news) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate('/admin/news')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-h2 text-text-primary">รายละเอียดข่าวสาร</h1>
        </div>
      </div>

      {/* Article Container (Max width 720px for reading according to DESIGN_SYSTEM) */}
      <Card className="space-y-6">
        {/* Category & Status */}
        <div className="flex items-center justify-between gap-4">
          <Badge variant="primary">{news.category_name || 'ข่าวสารทั่วไป'}</Badge>
          <Badge status={news.news_status} />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-text-primary leading-snug">{news.news_title}</h2>

        {/* Meta Info */}
        <div className="flex flex-wrap items-center gap-4 text-body-sm text-text-secondary border-y border-border py-3">
          <span className="flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-text-muted" />
            <span>สร้างโดย {news.created_by_name || 'Admin'}</span>
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-text-muted" />
            <span>{new Date(news.created_at).toLocaleDateString('th-TH')}</span>
          </span>
          <span className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5 text-text-muted" />
            <span>อ่านแล้ว {news.view_count || 0} ครั้ง</span>
          </span>
        </div>

        {/* Image Cover */}
        {news.news_image && (
          <div className="w-full aspect-video rounded-sm overflow-hidden border border-border">
            <img src={news.news_image} alt={news.news_title} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Content */}
        <div className="text-text-primary leading-relaxed whitespace-pre-wrap text-base font-normal">
          {news.news_content}
        </div>
      </Card>
    </div>
  );
}

export default NewsViewPage;