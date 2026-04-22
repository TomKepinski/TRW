import { motion } from 'framer-motion';
import WikiHeader from './WikiHeader';
import WikiSidebar from './WikiSidebar';

export default function PageLayout({ children, recentArticles = [] }) {
  return (
    <div className="min-h-screen bg-background">
      <WikiHeader />
      <div className="max-w-6xl mx-auto px-6 py-10 flex gap-12">
        <WikiSidebar recentArticles={recentArticles} />
        <motion.main
          className="flex-1 min-w-0"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}