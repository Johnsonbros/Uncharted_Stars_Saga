'use client';

import { dataStore } from '@/lib/dataStore';

export default function TimelinePage() {
  const timeline = dataStore.getAllTimelineEvents();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Timeline</h1>
          <p className="text-slate-600 mt-1">Chronological events in the story</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-600">Total Events</div>
          <div className="text-2xl font-bold text-slate-900">{timeline.length}</div>
        </div>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-slate-200" />

        {/* Timeline events */}
        <div className="space-y-6">
          {timeline.map((event, index) => (
            <div key={event.id} className="relative pl-20">
              {/* Timeline dot */}
              <div className="absolute left-6 top-2 w-5 h-5 bg-blue-600 rounded-full border-4 border-white shadow-sm" />

              {/* Event card */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200 hover:border-blue-300 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">{event.title}</h2>
                    <p className="text-sm text-blue-600 font-medium mt-1">{event.date}</p>
                  </div>
                  <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">
                    Event {index + 1}
                  </span>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed mb-4">{event.description}</p>

                {/* Related items */}
                <div className="space-y-2">
                  {event.relatedCharacters.length > 0 && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-medium">👥 Characters:</span>
                      <span>
                        {event.relatedCharacters
                          .map((id) => dataStore.getCharacter(id)?.name)
                          .filter(Boolean)
                          .join(', ')}
                      </span>
                    </div>
                  )}

                  {event.relatedLocations.length > 0 && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-medium">🌍 Locations:</span>
                      <span>
                        {event.relatedLocations
                          .map((id) => dataStore.getLocation(id)?.name)
                          .filter(Boolean)
                          .join(', ')}
                      </span>
                    </div>
                  )}

                  {event.relatedChapters.length > 0 && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-medium">📖 Chapters:</span>
                      <span>
                        {event.relatedChapters
                          .map((id) => dataStore.getChapter(id)?.title)
                          .filter(Boolean)
                          .join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
