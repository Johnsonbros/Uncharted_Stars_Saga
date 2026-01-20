'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NavigationSection } from '@/types';

interface NavItem {
  id: NavigationSection;
  label: string;
  icon: string;
  href: string;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊', href: '/' },
  { id: 'chapters', label: 'Chapters', icon: '📖', href: '/chapters' },
  { id: 'characters', label: 'Characters', icon: '👥', href: '/characters' },
  { id: 'locations', label: 'Locations', icon: '🌍', href: '/locations' },
  { id: 'timeline', label: 'Timeline', icon: '⏱️', href: '/timeline' },
  { id: 'notes', label: 'Notes', icon: '📝', href: '/notes' },
  { id: 'agent', label: 'Ask Agent', icon: '🤖', href: '/agent' },
  { id: 'audio-production', label: 'Audio Production', icon: '🎙️', href: '/audio-production' },
  { id: 'version-control', label: 'Version Control', icon: '🌿', href: '/version-control' },
  { id: 'writing-assistant', label: 'Writing Assistant', icon: '✍️', href: '/writing-assistant' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen p-6 fixed left-0 top-0">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Infinity's Reach</h1>
        <p className="text-sm text-slate-400">Story Management System</p>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/' && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-6 left-6 right-6">
        <div className="p-4 bg-slate-800 rounded-lg">
          <p className="text-xs text-slate-400 mb-1">Project Version</p>
          <p className="text-sm font-medium">v0.1.0</p>
        </div>
      </div>
    </aside>
  );
}
