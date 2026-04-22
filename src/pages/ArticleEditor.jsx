const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import WikiHeader from '@/components/wiki/WikiHeader';
import ReactMarkdown from 'react-markdown';
import { Save, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

const CATEGORIES = [
  { value: 'stations_routes', label: 'Stations & Routes' },
  { value: 'trains_rolling_stock', label: 'Trains & Rolling Stock' },
  { value: 'game_mechanics_guides', label: 'Game Mechanics & Guides' },
  { value: 'general', label: 'General' },
];

const defaultForm = {
  title: '',
  slug: '',
  category: 'general',
  summary: '',
  content: '',
  cover_image: '',
  tags: '',
  is_published: false,
};

export default function ArticleEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isNew = !id;
  const [form, setForm] = useState(defaultForm);
  const [preview, setPreview] = useState(false);

  const { data: article } = useQuery({
    queryKey: ['article-edit', id],
    queryFn: () => db.entities.Article.filter({ id }),
    enabled: !isNew,
    select: (data) => data[0],
  });

  useEffect(() => {
    if (article) {
      setForm({
        ...article,
        tags: Array.isArray(article.tags) ? article.tags.join(', ') : '',
      });
    }
  }, [article]);

  const saveMutation = useMutation({
    mutationFn: (data) => isNew
      ? db.entities.Article.create(data)
      : db.entities.Article.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles-admin'] });
      queryClient.invalidateQueries({ queryKey: ['articles-published'] });
      navigate('/admin');
    },
  });

  const handleSave = () => {
    const data = {
      ...form,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      slug: form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    };
    saveMutation.mutate(data);
  };

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target ? e.target.value : e }));

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background">
        <WikiHeader />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center text-muted-foreground">Access denied.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <WikiHeader />
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link to="/admin" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" /> Admin
            </Link>
            <span className="text-muted-foreground">/</span>
            <h1 className="text-xl font-bold text-foreground">{isNew ? 'New Article' : 'Edit Article'}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPreview(p => !p)}
              className="flex items-center gap-1.5 px-3 py-2 bg-muted text-foreground rounded-lg text-sm hover:bg-muted/80 transition-colors"
            >
              {preview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {preview ? 'Edit' : 'Preview'}
            </button>
            <button
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saveMutation.isPending ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Editor */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-card border border-border rounded-xl p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={set('title')}
                  placeholder="Article title..."
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Summary</label>
                <textarea
                  value={form.summary}
                  onChange={set('summary')}
                  placeholder="Short description..."
                  rows={2}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
              </div>
            </div>

            {/* Content */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-2 border-b border-border bg-muted/30">
                <span className="text-sm font-medium text-foreground">Content</span>
                <span className="text-xs text-muted-foreground">(Markdown supported)</span>
              </div>
              {preview ? (
                <div className="p-6 wiki-content min-h-64">
                  <ReactMarkdown>{form.content || '*Nothing to preview yet.*'}</ReactMarkdown>
                </div>
              ) : (
                <textarea
                  value={form.content}
                  onChange={set('content')}
                  placeholder="Write your article in Markdown..."
                  className="w-full px-4 py-4 bg-transparent text-sm focus:outline-none font-mono min-h-96 resize-y"
                />
              )}
            </div>
          </div>

          {/* Sidebar settings */}
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-xl p-4 space-y-4">
              <h3 className="font-semibold text-sm text-foreground">Settings</h3>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Category *</label>
                <select
                  value={form.category}
                  onChange={set('category')}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">URL Slug</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={set('slug')}
                  placeholder="auto-generated-from-title"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Cover Image URL</label>
                <input
                  type="text"
                  value={form.cover_image}
                  onChange={set('cover_image')}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={set('tags')}
                  placeholder="station, north, express"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="flex items-center gap-3 pt-2 border-t border-border">
                <input
                  type="checkbox"
                  id="published"
                  checked={form.is_published}
                  onChange={(e) => setForm(f => ({ ...f, is_published: e.target.checked }))}
                  className="accent-primary w-4 h-4"
                />
                <label htmlFor="published" className="text-sm text-foreground cursor-pointer">Published</label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}