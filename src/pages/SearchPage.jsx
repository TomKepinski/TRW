const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import PageLayout from '@/components/wiki/PageLayout';
import { Train, MapPin, Gamepad2, BookOpen, Search, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const categoryMeta = {
  stations_routes: { label: 'Stations & Routes', icon: MapPin, color: 'text-blue-400' },
  trains_rolling_stock: { label: 'Trains & Rolling Stock', icon: Train, color: 'text-violet-400' },
  game_mechanics_guides: { label: 'Game Mechanics & Guides', icon: Gamepad2, color: 'text-emerald-400' },
  general: { label: 'General', icon: BookOpen, color: 'text-amber-400' },
};

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } } };

export default function SearchPage() {
  const params = new URLSearchParams(window.location.search);
  const query = params.get('q') || '';

  const { data: articles = [] } = useQuery({
    queryKey: ['articles-all'],
    queryFn: () => db.entities.Article.filter({ is_published: true }, '-updated_date', 100),
  });

  const { data: recentArticles = [] } = useQuery({
    queryKey: ['articles-recent-sidebar'],
    queryFn: () => db.entities.Article.filter({ is_published: true }, '-updated_date', 10),
  });

  const results = query
    ? articles.filter(a =>
        a.title?.toLowerCase().includes(query.toLowerCase()) ||
        a.summary?.toLowerCase().includes(query.toLowerCase()) ||
        a.content?.toLowerCase().includes(query.toLowerCase()) ||
        a.tags?.some(t => t.toLowerCase().includes(query.toLowerCase()))
      )
    : [];

  return (
    <PageLayout recentArticles={recentArticles}>
      <div className="space-y-8">
        <section className="border-b border-border pb-6">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Search Results</h1>
          {query && <p className="text-muted-foreground text-sm mt-1">"{query}" — {results.length} result{results.length !== 1 ? 's' : ''}</p>}
        </section>

        {!query ? (
          <div className="py-16 text-center text-muted-foreground text-sm">
            <Search className="w-8 h-8 mx-auto mb-3 opacity-30" />
            Enter a search query to find articles.
          </div>
        ) : results.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground text-sm">
            <Search className="w-8 h-8 mx-auto mb-3 opacity-30" />
            <p>No results for "<span className="text-foreground">{query}</span>".</p>
            <Link to="/" className="text-primary hover:underline mt-2 inline-block">← Back to Main Page</Link>
          </div>
        ) : (
          <motion.div className="divide-y divide-border" variants={container} initial="hidden" animate="show">
            {results.map((article) => {
              const meta = categoryMeta[article.category] || categoryMeta.general;
              const Icon = meta.icon;
              return (
                <motion.div key={article.id} variants={item}>
                  <Link
                    to={`/wiki/${article.slug || article.id}`}
                    className="group flex items-start gap-4 py-4"
                  >
                    <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${meta.color} opacity-70`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{article.title}</div>
                      {article.summary && <div className="text-xs text-muted-foreground mt-1 line-clamp-1">{article.summary}</div>}
                      <span className={`text-xs ${meta.color} mt-1 block`}>{meta.label}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0 mt-0.5" />
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </PageLayout>
  );
}