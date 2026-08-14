import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useLiff } from '../../context/LiffContext';
import { viewNewsDetail } from '../../api/news.api';

function NewsDetailPage() {
  const { id } = useParams();
  const { isLiffReady, liffError, idToken } = useLiff();

  const [news, setNews] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLiffReady || !idToken) return;

    viewNewsDetail(id, idToken)
      .then((res) => setNews(res.data.data))
      .catch((err) => setErrorMsg(err.response?.data?.message || 'ไม่สามารถโหลดข่าวได้'))
      .finally(() => setLoading(false));
  }, [isLiffReady, idToken, id]);

  if (liffError) {
    return <div className="p-6 text-red-600">เกิดข้อผิดพลาดในการเชื่อมต่อ LINE: {liffError}</div>;
  }

  if (!isLiffReady || loading) {
    return (
      <div className="p-6 text-slate-600">
        <p>กำลังโหลดข่าว...</p>
        <p className="text-xs mt-4 text-slate-400">
          isLiffReady: {String(isLiffReady)} / idToken: {idToken ? 'มีค่า' : 'ว่าง/null'} / liffError: {liffError || 'ไม่มี'}
        </p>
      </div>
    );
  }

  if (errorMsg) {
    return <div className="p-6 text-red-600">{errorMsg}</div>;
  }

  return (
    <div className="max-w-md mx-auto">
      {news.news_image && (
        // news_image เป็น relative path (/uploads/xxx.jpg) — ผ่าน Vite proxy ก็เปิดได้ตรงๆ
        <img src={news.news_image} alt={news.news_title} className="w-full aspect-video object-cover" />
      )}

      <div className="p-4">
        <span className="text-xs text-green-700 bg-green-50 px-2 py-1 rounded">{news.category_name}</span>
        <h1 className="text-xl font-bold text-slate-800 mt-2">{news.news_title}</h1>
        <p className="text-slate-600 mt-3 whitespace-pre-line">{news.news_content}</p>
      </div>
    </div>
  );
}

export default NewsDetailPage;