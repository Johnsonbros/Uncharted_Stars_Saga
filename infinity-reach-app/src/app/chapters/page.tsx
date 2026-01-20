'use client';

import { dataStore } from '@/lib/dataStore';
import Link from 'next/link';

export default function ChaptersPage() {
  const chapters = dataStore.getAllChapters();
  const story = dataStore.getStory();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Chapters</h1>
          <p className="text-slate-600 mt-1">{story.title}</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-600">Total Chapters</div>
          <div className="text-2xl font-bold text-slate-900">{chapters.length}</div>
        </div>
      </div>

      <div className="space-y-4">
        {chapters.map((chapter) => (
          <div
            key={chapter.id}
            className="bg-white rounded-lg shadow-sm p-6 border border-slate-200 hover:border-blue-300 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Link
                  href={`/chapters/${chapter.id}`}
                  className="text-xl font-semibold text-slate-900 hover:text-blue-600"
                >
                  {chapter.title}
                </Link>
                <p className="text-slate-600 mt-2 leading-relaxed">{chapter.synopsis}</p>
                <div className="flex items-center gap-6 mt-4 text-sm text-slate-500">
                  <span className="flex items-center gap-1">
                    <span className="font-medium">📝</span>
                    {chapter.wordCount.toLocaleString()} words
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="font-medium">🎬</span>
                    {chapter.scenes.length} scenes
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="font-medium">📅</span>
                    {new Date(chapter.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="ml-6 text-right">
                <div className="text-sm text-slate-500">Chapter</div>
                <div className="text-3xl font-bold text-slate-900">{chapter.order}</div>
              </div>
            </div>

            {chapter.scenes.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="text-sm font-medium text-slate-700 mb-2">Scenes:</div>
                <div className="space-y-2">
                  {chapter.scenes.map((scene) => (
                    <div
                      key={scene.id}
                      className="text-sm text-slate-600 pl-4 border-l-2 border-slate-200"
                    >
                      <span className="font-medium">{scene.title}</span>
                      <span className="text-slate-500"> • {scene.wordCount} words</span>
                      {scene.pov && <span className="text-slate-500"> • POV: {scene.pov}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
