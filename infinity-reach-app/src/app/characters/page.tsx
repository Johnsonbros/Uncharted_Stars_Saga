'use client';

import { dataStore } from '@/lib/dataStore';

export default function CharactersPage() {
  const characters = dataStore.getAllCharacters();

  const roleColors = {
    protagonist: 'bg-blue-100 text-blue-800',
    antagonist: 'bg-red-100 text-red-800',
    supporting: 'bg-green-100 text-green-800',
    minor: 'bg-slate-100 text-slate-800',
  };

  const roleIcons = {
    protagonist: '⭐',
    antagonist: '⚔️',
    supporting: '👥',
    minor: '👤',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Characters</h1>
          <p className="text-slate-600 mt-1">Character profiles and relationships</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-600">Total Characters</div>
          <div className="text-2xl font-bold text-slate-900">{characters.length}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {characters.map((character) => (
          <div
            key={character.id}
            className="bg-white rounded-lg shadow-sm p-6 border border-slate-200 hover:border-blue-300 transition-colors"
          >
            <div className="flex items-start gap-4">
              <div className="text-4xl">{roleIcons[character.role]}</div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h2 className="text-xl font-semibold text-slate-900">{character.name}</h2>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${roleColors[character.role]}`}>
                    {character.role}
                  </span>
                </div>

                {character.age && character.species && (
                  <p className="text-sm text-slate-600 mb-3">
                    {character.age} years old • {character.species}
                  </p>
                )}

                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm font-medium text-slate-700 mb-1">Appearance</h3>
                    <p className="text-sm text-slate-600">{character.appearance}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-slate-700 mb-1">Personality</h3>
                    <p className="text-sm text-slate-600">{character.personality}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-slate-700 mb-1">Background</h3>
                    <p className="text-sm text-slate-600">{character.background}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-slate-700 mb-1">Goals</h3>
                    <p className="text-sm text-slate-600">{character.goals}</p>
                  </div>

                  {character.relationships.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-slate-700 mb-1">Relationships</h3>
                      <div className="space-y-1">
                        {character.relationships.map((rel, idx) => {
                          const relatedChar = dataStore.getCharacter(rel.relatedCharacterId);
                          return (
                            <div key={idx} className="text-sm text-slate-600 pl-3 border-l-2 border-slate-200">
                              <span className="font-medium">{relatedChar?.name}</span>: {rel.relationshipType}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {character.notes && (
                    <div className="pt-3 border-t border-slate-100">
                      <p className="text-xs text-slate-500 italic">{character.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
