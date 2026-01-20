'use client';

import { dataStore } from '@/lib/dataStore';

export default function LocationsPage() {
  const locations = dataStore.getAllLocations();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Locations</h1>
          <p className="text-slate-600 mt-1">Places and settings in the story</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-600">Total Locations</div>
          <div className="text-2xl font-bold text-slate-900">{locations.length}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {locations.map((location) => (
          <div
            key={location.id}
            className="bg-white rounded-lg shadow-sm p-6 border border-slate-200 hover:border-blue-300 transition-colors"
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="text-3xl">🌍</div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-slate-900 mb-1">{location.name}</h2>
                <span className="inline-block px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">
                  {location.type}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-1">Description</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{location.description}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-1">Significance</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{location.significance}</p>
              </div>

              {location.notes && (
                <div className="pt-3 border-t border-slate-100">
                  <h3 className="text-sm font-medium text-slate-700 mb-1">Notes</h3>
                  <p className="text-xs text-slate-500 italic">{location.notes}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
