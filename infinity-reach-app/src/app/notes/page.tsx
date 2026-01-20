'use client';

import { dataStore } from '@/lib/dataStore';

export default function NotesPage() {
  const notes = dataStore.getAllNotes();

  const categoryColors = {
    research: 'bg-purple-100 text-purple-800',
    plot: 'bg-blue-100 text-blue-800',
    worldbuilding: 'bg-green-100 text-green-800',
    general: 'bg-slate-100 text-slate-800',
  };

  const categoryIcons = {
    research: '🔬',
    plot: '📖',
    worldbuilding: '🌍',
    general: '📝',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Notes</h1>
          <p className="text-slate-600 mt-1">Research and planning notes</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-600">Total Notes</div>
          <div className="text-2xl font-bold text-slate-900">{notes.length}</div>
        </div>
      </div>

      {/* Category filters */}
      <div className="flex gap-2">
        <button className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium">
          All Notes
        </button>
        <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50">
          🔬 Research
        </button>
        <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50">
          📖 Plot
        </button>
        <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50">
          🌍 World Building
        </button>
        <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50">
          📝 General
        </button>
      </div>

      {/* Notes grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {notes.map((note) => (
          <div
            key={note.id}
            className="bg-white rounded-lg shadow-sm p-6 border border-slate-200 hover:border-blue-300 transition-colors"
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="text-2xl">{categoryIcons[note.category]}</div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-slate-900 mb-2">{note.title}</h2>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium capitalize ${categoryColors[note.category]}`}>
                  {note.category}
                </span>
              </div>
            </div>

            <div className="prose prose-sm max-w-none mb-4">
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{note.content}</p>
            </div>

            {/* Tags */}
            {note.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {note.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Related items */}
            {note.relatedItems.length > 0 && (
              <div className="pt-3 border-t border-slate-100">
                <div className="text-xs text-slate-500">
                  <span className="font-medium">Related: </span>
                  {note.relatedItems.map((item, idx) => (
                    <span key={idx}>
                      {item.type}
                      {idx < note.relatedItems.length - 1 && ', '}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-3 text-xs text-slate-400">
              Updated {new Date(note.updatedAt).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
