const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import PageLayout from '@/components/wiki/PageLayout';
import ReactMarkdown from 'react-markdown';
import { Train, MapPin, Gamepad2, BookOpen, Edit3, ArrowLeft, Eye, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/lib/AuthContext';
import { useEffect } from 'react';

const categoryMeta = {
  stations_routes: { label: 'Stations & Routes', icon: MapPin, color: 'text-blue-400' },
  trains_rolling_stock: { label: 'Trains & Rolling Stock', icon: Train, color: 'text-violet-400' },
  game_mechanics_guides: { label: 'Game Mechanics & Guides', icon: Gamepad2, color: 'text-emerald-400' },
  general: { label: 'General', icon: BookOpen, color: 'text-amber-400' },
};

export default function ArticlePage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ['article-slug', slug],
    queryFn: () => db.entities.Article.filter({ slug }),
  });

  const article = articles[0];

  const updateViews = useMutation({
    mutationFn: (id) => db.entities.Article.update(id, { views: (article?.views || 0) + 1 }),
  });

  useEffect(() => {
    if (article?.id) updateViews.mutate(article.id);
  }, [article?.id]);

  const { data: recentArticles = [] } = useQuery({
    queryKey: ['articles-recent-sidebar'],
    queryFn: () => db.entities.Article.filter({ is_published: true }, '-updated_date', 10),
  });

  if (isLoading) return (
    <PageLayout recentArticles={[]}>
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-muted rounded w-1/3" />
        <div className="h-8 bg-muted rounded w-2/3 mt-4" />
        <div className="h-4 bg-muted rounded w-1/2" />
        <div className="space-y-3 mt-8">
          {[...Array(8)].map((_, i) => <div key={i} className="h-4 bg-muted rounded" style={{ width: `${70 + Math.random() * 30}%` }} />)}
        </div>
      </div>
    </PageLayout>
  );

  if (!article) return (
    <PageLayout recentArticles={recentArticles}>
      <div className="py-16 text-center text-muted-foreground text-sm">
        <p>Article not found.</p>
        <Link to="/" className="text-primary hover:underline mt-2 inline-block">← Back to Main Page</Link>
      </div>
    </PageLayout>
  );

  const meta = categoryMeta[article.category] || categoryMeta.general;
  const Icon = meta.icon;

  return (
    <PageLayout recentArticles={recentArticles}>
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-8">
        <Link to="/" className="hover:text-primary transition-colors">Main Page</Link>
        <span>/</span>
        <Link to={`/category/${article.category}`} className={`hover:text-primary transition-colors ${meta.color}`}>{meta.label}</Link>
        <span>/</span>
        <span className="text-foreground/70 truncate">{article.title}</span>
      </div>

      {/* Cover Image */}
      {article.cover_image && (
        <img src={article.cover_image} alt={article.title} className="w-full h-52 object-cover rounded-lg mb-8" />
      )}

      {/* Article Header */}
      <div className="border-b border-border pb-6 mb-8">
        <div className={`flex items-center gap-1.5 text-xs ${meta.color} mb-3`}>
          <Icon className="w-3.5 h-3.5" />
          <span>{meta.label}</span>
        </div>
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{article.title}</h1>
          {user?.role === 'admin' && (
            <Link
              to={`/admin/edit/${article.id}`}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground border border-border/60 rounded-md hover:border-border transition-colors shrink-0"
            >
              <Edit3 className="w-3 h-3" />
              Edit
            </Link>
          )}
        </div>
        {article.summary && <p className="text-muted-foreground mt-2 text-sm">{article.summary}</p>}
        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
          {article.updated_date && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Updated {format(new Date(article.updated_date), 'dd MMM yyyy')}
            </span>
          )}
          {article.views > 0 && (
            <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{article.views} views</span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="wiki-content">
        <ReactMarkdown>{article.content || '*No content yet.*'}</ReactMarkdown>
      </div>

      {/* Tags */}
      {article.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-10 pt-6 border-t border-border">
          {article.tags.map((tag) => (
            <span key={tag} className="px-2.5 py-1 bg-muted text-muted-foreground text-xs rounded-full">{tag}</span>
          ))}
        </div>
      )}

      <Link to="/" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors mt-8">
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Main Page
      </Link>
    </PageLayout>
  );
}