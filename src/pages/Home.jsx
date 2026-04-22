const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

import PageLayout from '@/components/wiki/PageLayout';
import { Train, MapPin, Gamepad2, BookOpen, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const categoryMeta = {
  stations_routes: { label: 'Stations & Routes', icon: MapPin, color: 'text-blue-400' },
  trains_rolling_stock: { label: 'Trains & Rolling Stock', icon: Train, color: 'text-violet-400' },
  game_mechanics_guides: { label: 'Game Mechanics & Guides', icon: Gamepad2, color: 'text-emerald-400' },
  general: { label: 'General', icon: BookOpen, color: 'text-amber-400' },
};

const categoryCards = [
  { id: 'stations_routes', label: 'Stations & Routes', icon: MapPin, desc: 'Every station, line, and route in the network.' },
  { id: 'trains_rolling_stock', label: 'Trains & Rolling Stock', icon: Train, desc: 'Locomotives, units, and rolling stock.' },
  { id: 'game_mechanics_guides', label: 'Game Mechanics', icon: Gamepad2, desc: 'Controls, systems, and how-to guides.' },
  { id: 'general', label: 'General', icon: BookOpen, desc: 'Miscellaneous wiki articles.' },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } },
};

export default function Home() {
  const { data: articles = [] } = useQuery({
    queryKey: ['articles-published'],
    queryFn: () => db.entities.Article.filter({ is_published: true }, '-updated_date', 50),
  });

  const recentArticles = articles.slice(0, 10);

  return (
    <PageLayout recentArticles={recentArticles}>
      <div className="space-y-14">

        {/* Hero */}
        <section className="border-b border-border pb-10">
          <div className="flex items-start gap-5">
            <img
              src="https://media.db.com/images/public/user_68e745ae21f689d7c69e5677/cd8e604bf_47c59108-f58e-486c-9ad4-835abdba2fac.png"
              alt="Teesside Railway"
              className="w-14 h-14 object-contain mt-1 shrink-0 opacity-90"
            />
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Teesside Railway Wiki</h1>
              <p className="mt-2 text-muted-foreground leading-relaxed max-w-xl">
                The community knowledge base for the Roblox game{' '}
                <a href="https://www.roblox.com/games/80426184267903/Teesside-Railway" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Teesside Railway</a>.
                Browse stations, trains, routes, and guides.
              </p>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-5">Browse by Category</h2>
          <motion.div className="grid grid-cols-2 gap-4" variants={container} initial="hidden" animate="show">
            {categoryCards.map(({ id, label, icon: Icon, desc }) => (
              <motion.div key={id} variants={item}>
                <Link
                  to={`/category/${id}`}
                  className="group flex flex-col gap-2 p-5 border border-border rounded-lg hover:border-primary/40 transition-colors bg-card/40 hover:bg-card/80"
                >
                  <Icon className={`w-5 h-5 ${categoryMeta[id].color}`} />
                  <div>
                    <div className="font-medium text-foreground text-sm group-hover:text-primary transition-colors">{label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Recent Articles */}
        {articles.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-5">Recent Articles</h2>
            <motion.div className="divide-y divide-border" variants={container} initial="hidden" animate="show">
              {articles.slice(0, 6).map((article) => {
                const meta = categoryMeta[article.category] || categoryMeta.general;
                const Icon = meta.icon;
                return (
                  <motion.div key={article.id} variants={item}>
                    <Link
                      to={`/wiki/${article.slug || article.id}`}
                      className="group flex items-start gap-4 py-4 transition-opacity"
                    >
                      <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${meta.color} opacity-70`} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{article.title}</div>
                        {article.summary && <div className="text-xs text-muted-foreground mt-1 line-clamp-1">{article.summary}</div>}
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0 mt-0.5" />
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          </section>
        )}

        {articles.length === 0 && (
          <div className="py-16 text-center text-muted-foreground text-sm">
            No articles yet — check back soon.
          </div>
        )}
      </div>
    </PageLayout>
  );
}