import { Link, useLocation } from 'react-router-dom';
import { Train, MapPin, Gamepad2, BookOpen, Home } from 'lucide-react';

const categories = [
  { id: 'stations_routes', label: 'Stations & Routes', icon: MapPin, path: '/category/stations_routes' },
  { id: 'trains_rolling_stock', label: 'Trains & Rolling Stock', icon: Train, path: '/category/trains_rolling_stock' },
  { id: 'game_mechanics_guides', label: 'Game Mechanics & Guides', icon: Gamepad2, path: '/category/game_mechanics_guides' },
  { id: 'general', label: 'General', icon: BookOpen, path: '/category/general' },
];

export default function WikiSidebar({ recentArticles = [] }) {
  const location = useLocation();

  return (
    <aside className="w-56 shrink-0 space-y-8">
      {/* Navigation */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 px-1">Navigation</p>
        <nav className="space-y-0.5">
          <Link
            to="/"
            className={`flex items-center gap-2.5 px-2 py-1.5 rounded text-sm transition-colors hover:text-primary ${location.pathname === '/' ? 'text-primary font-medium' : 'text-foreground/80'}`}
          >
            <Home className="w-3.5 h-3.5" />
            Main Page
          </Link>
        </nav>
      </div>

      {/* Categories */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 px-1">Categories</p>
        <nav className="space-y-0.5">
          {categories.map(({ id, label, icon: Icon, path }) => (
            <Link
              key={id}
              to={path}
              className={`flex items-center gap-2.5 px-2 py-1.5 rounded text-sm transition-colors hover:text-primary ${location.pathname === path ? 'text-primary font-medium' : 'text-foreground/80'}`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Recent Articles */}
      {recentArticles.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 px-1">Recent</p>
          <nav className="space-y-0.5">
            {recentArticles.slice(0, 8).map((article) => (
              <Link
                key={article.id}
                to={`/wiki/${article.slug || article.id}`}
                className="block px-2 py-1.5 rounded text-sm text-foreground/70 hover:text-primary transition-colors truncate"
              >
                {article.title}
              </Link>
            ))}
          </nav>
        </div>
      )}

      {/* Game Link */}
      <div>
        <a
          href="https://www.roblox.com/games/80426184267903/Teesside-Railway"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-primary hover:underline px-1"
        >
          <Gamepad2 className="w-3.5 h-3.5" />
          Play on Roblox ↗
        </a>
      </div>
    </aside>
  );
}