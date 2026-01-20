'use client';

import { dataStore } from '@/lib/dataStore';
import Link from 'next/link';

export default function Dashboard() {
  const story = dataStore.getStory();
  const stats = dataStore.getStats();
  const recentChapters = dataStore.getAllChapters().slice(0, 3);
  const mainCharacters = dataStore.getAllCharacters().filter(c => c.role === 'protagonist' || c.role === 'antagonist');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-8 border border-slate-200">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">{story.title}</h1>
        <p className="text-lg text-slate-600 mb-4">{story.genre} • by {story.author}</p>
        <p className="text-slate-700 leading-relaxed">{story.synopsis}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
          <div className="text-3xl mb-2">📚</div>
          <div className="text-2xl font-bold text-slate-900">{stats.chapterCount}</div>
          <div className="text-sm text-slate-600">Chapters</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
          <div className="text-3xl mb-2">📝</div>
          <div className="text-2xl font-bold text-slate-900">{stats.totalWordCount.toLocaleString()}</div>
          <div className="text-sm text-slate-600">Total Words</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
          <div className="text-3xl mb-2">👥</div>
          <div className="text-2xl font-bold text-slate-900">{stats.characterCount}</div>
          <div className="text-sm text-slate-600">Characters</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
          <div className="text-3xl mb-2">🌍</div>
          <div className="text-2xl font-bold text-slate-900">{stats.locationCount}</div>
          <div className="text-sm text-slate-600">Locations</div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-2 gap-8">
        {/* Recent Chapters */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Recent Chapters</h2>
          <div className="space-y-4">
            {recentChapters.map((chapter) => (
              <Link
                key={chapter.id}
                href={`/chapters/${chapter.id}`}
                className="block p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <h3 className="font-semibold text-slate-900 mb-1">{chapter.title}</h3>
                <p className="text-sm text-slate-600 mb-2">{chapter.synopsis}</p>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span>{chapter.wordCount.toLocaleString()} words</span>
                  <span>{chapter.scenes.length} scenes</span>
                </div>
              </Link>
            ))}
          </div>
          <Link
            href="/chapters"
            className="mt-4 inline-block text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View all chapters →
          </Link>
        </div>

        {/* Main Characters */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Main Characters</h2>
          <div className="space-y-4">
            {mainCharacters.map((character) => (
              <Link
                key={character.id}
                href={`/characters/${character.id}`}
                className="block p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{character.role === 'protagonist' ? '⭐' : '⚔️'}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 mb-1">{character.name}</h3>
                    <p className="text-sm text-slate-600 mb-2">{character.personality.substring(0, 100)}...</p>
                    <div className="text-xs text-slate-500 capitalize">{character.role}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <Link
            href="/characters"
            className="mt-4 inline-block text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View all characters →
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Quick Actions</h2>
        <div className="flex gap-4">
          <Link
            href="/agent"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            🤖 Ask Agent a Question
          </Link>
          <Link
            href="/timeline"
            className="px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium"
          >
            ⏱️ View Timeline
          </Link>
          <Link
            href="/notes"
            className="px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium"
          >
            📝 Browse Notes
          </Link>
        </div>
      </div>
    </div>
  );
}
