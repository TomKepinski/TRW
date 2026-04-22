const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import PageLayout from '@/components/wiki/PageLayout';
import { Train, MapPin, Gamepad2, BookOpen, ArrowRight, Eye, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

const categoryMeta = {
  stations_routes: { label: 'Stations & Routes', icon: MapPin, color: 'text-blue-400', description: 'Information about all stations and routes in the Teesside Railway network.' },
  trains_rolling_stock: { label: 'Trains & Rolling Stock', icon: Train, color: 'text-violet-400', description: 'Details on all trains, locomotives, and rolling stock available in the game.' },
  game_mechanics_guides: { label: 'Game Mechanics & Guides', icon: Gamepad2, color: 'text-emerald-400', description: 'Guides and documentation for game mechanics, controls, and features.' },
  general: { label: 'General', icon: BookOpen, color: 'text-amber-400', description: 'General information and miscellaneous articles about Teesside Railway.' },
};

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } } };

export default function CategoryPage() {
  const { category } = useParams();
  const meta = categoryMeta[category] || categoryMeta.general;
  const Icon = meta.icon;

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ['articles-category', category],
    queryFn: () => db.entities.Article.filter({ category, is_published: true }, '-updated_date', 50),
  });

  const { data: recentArticles = [] } = useQuery({
    queryKey: ['articles-recent-sidebar'],
    queryFn: () => db.entities.Article.filter({ is_published: true }, '-updated_date', 10),
  });

  return (
    <PageLayout recentArticles={recentArticles}>
      <div className="space-y-8">
        {/* Category Header */}
        <section className="border-b border-border pb-8">
          <div className="text-xs text-muted-foreground mb-3">
            <Link to="/" className="hover:text-primary transition-colors">Main Page</Link>
            <span className="mx-1.5">/</span>
            <span className={meta.color}>{meta.label}</span>
          </div>
          <div className="flex items-center gap-3">
            <Icon className={`w-6 h-6 ${meta.color}`} />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{meta.label}</h1>
          </div>
          <p className="text-muted-foreground text-sm mt-2">{meta.description}</p>
          <p className="text-xs text-muted-foreground mt-1">{articles.length} article{articles.length !== 1 ? 's' : ''}</p>
        </section>

        {/* Articles */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-14 bg-muted/40 rounded animate-pulse" />
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground text-sm">
            No articles in this category yet.
          </div>
        ) : (
          <motion.div className="divide-y divide-border" variants={container} initial="hidden" animate="show">
            {articles.map((article) => (
              <motion.div key={article.id} variants={item}>
                <Link
                  to={`/wiki/${article.slug || article.id}`}
                  className="group flex items-start gap-4 py-4 transition-opacity"
                >
                  <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${meta.color} opacity-70`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{article.title}</div>
                    {article.summary && <div className="text-xs text-muted-foreground mt-1 line-clamp-1">{article.summary}</div>}
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                      {article.updated_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(article.updated_date), 'dd MMM yyyy')}
                        </span>
                      )}
                      {article.views > 0 && (
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{article.views}</span>
                      )}
                      {article.tags?.slice(0, 3).map(tag => (
                        <span key={tag} className="px-1.5 py-0.5 bg-muted rounded-full">{tag}</span>
                      ))}
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0 mt-0.5" />
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </PageLayout>
  );
}