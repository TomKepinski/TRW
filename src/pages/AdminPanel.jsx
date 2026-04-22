const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

import WikiHeader from '@/components/wiki/WikiHeader';
import { Plus, Edit3, Trash2, Eye, EyeOff, Train, MapPin, Gamepad2, BookOpen } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { format } from 'date-fns';

const categoryMeta = {
  stations_routes: { label: 'Stations & Routes', icon: MapPin, color: 'text-blue-400' },
  trains_rolling_stock: { label: 'Trains & Rolling Stock', icon: Train, color: 'text-purple-400' },
  game_mechanics_guides: { label: 'Game Mechanics & Guides', icon: Gamepad2, color: 'text-green-400' },
  general: { label: 'General', icon: BookOpen, color: 'text-orange-400' },
};

export default function AdminPanel() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ['articles-admin'],
    queryFn: () => db.entities.Article.list('-updated_date', 100),
  });

  const togglePublish = useMutation({
    mutationFn: ({ id, is_published }) => db.entities.Article.update(id, { is_published }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['articles-admin'] }),
  });

  const deleteArticle = useMutation({
    mutationFn: (id) => db.entities.Article.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['articles-admin'] }),
  });

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background">
        <WikiHeader />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <p className="text-muted-foreground text-lg">Access denied. Admin only.</p>
          <Link to="/" className="text-primary hover:underline mt-2 inline-block">← Go Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <WikiHeader />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
            <p className="text-muted-foreground text-sm mt-1">{articles.length} total articles</p>
          </div>
          <Link
            to="/admin/new"
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Article
          </Link>
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading...</div>
          ) : articles.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <p>No articles yet. Create your first one!</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-3 text-sm font-semibold text-muted-foreground">Title</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-muted-foreground hidden md:table-cell">Category</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-muted-foreground hidden sm:table-cell">Updated</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-muted-foreground">Status</th>
                  <th className="text-right px-4 py-3 text-sm font-semibold text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {articles.map((article) => {
                  const meta = categoryMeta[article.category] || categoryMeta.general;
                  const Icon = meta.icon;
                  return (
                    <tr key={article.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <Link to={`/wiki/${article.slug || article.id}`} className="font-medium text-foreground hover:text-primary transition-colors">
                          {article.title}
                        </Link>
                        {article.summary && <p className="text-xs text-muted-foreground truncate max-w-xs mt-0.5">{article.summary}</p>}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div className={`flex items-center gap-1.5 text-sm ${meta.color}`}>
                          <Icon className="w-3.5 h-3.5" />
                          <span>{meta.label}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">
                        {article.updated_date && format(new Date(article.updated_date), 'dd MMM yyyy')}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${article.is_published ? 'bg-green-400/10 text-green-400' : 'bg-muted text-muted-foreground'}`}>
                          {article.is_published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <button
                            onClick={() => togglePublish.mutate({ id: article.id, is_published: !article.is_published })}
                            className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                            title={article.is_published ? 'Unpublish' : 'Publish'}
                          >
                            {article.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          <Link
                            to={`/admin/edit/${article.id}`}
                            className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-primary"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => { if (confirm(`Delete "${article.title}"?`)) deleteArticle.mutate(article.id); }}
                            className="p-1.5 rounded hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}