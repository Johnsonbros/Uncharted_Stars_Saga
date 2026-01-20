'use client';

import { useState } from 'react';
import { storyAgent } from '@/lib/agent';
import { AgentQuery } from '@/types';

export default function AgentPage() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<AgentQuery[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      const response = await storyAgent.askQuestion(query);
      const newQuery: AgentQuery = {
        id: `query-${Date.now()}`,
        query,
        response,
        context: [],
        timestamp: new Date(),
      };
      setHistory([newQuery, ...history]);
      setQuery('');
    } catch (error) {
      console.error('Error asking question:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestedQuestions = [
    "Who is Commander Elena Voss?",
    "What is the Prometheus?",
    "Tell me about the plot",
    "What happens in Chapter 1?",
    "Describe the Helix Nebula",
    "Who is ARIA?",
    "What are the main themes?",
    "When does the story take place?",
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Ask the Story Agent</h1>
        <p className="text-slate-600 mt-1">
          Ask questions about Infinity's Reach and get intelligent answers based on the story content
        </p>
      </div>

      {/* Query input */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="query" className="block text-sm font-medium text-slate-700 mb-2">
              Your Question
            </label>
            <textarea
              id="query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask anything about the story, characters, locations, plot, or themes..."
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={3}
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed font-medium transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                🤖 Ask Agent
              </>
            )}
          </button>
        </form>

        {/* Suggested questions */}
        <div className="mt-6">
          <p className="text-sm font-medium text-slate-700 mb-3">Suggested Questions:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setQuery(suggestion)}
                className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-full text-sm hover:bg-slate-200 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Query history */}
      {history.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">Conversation History</h2>
            <button
              onClick={() => setHistory([])}
              className="text-sm text-slate-600 hover:text-slate-900"
            >
              Clear History
            </button>
          </div>

          {history.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
              {/* Question */}
              <div className="bg-blue-50 p-4 border-b border-blue-100">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">❓</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-600 mb-1">You asked:</p>
                    <p className="text-slate-900">{item.query}</p>
                  </div>
                </div>
              </div>

              {/* Answer */}
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">🤖</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-600 mb-1">Agent response:</p>
                    <p className="text-slate-700 leading-relaxed">{item.response}</p>
                    <p className="text-xs text-slate-400 mt-3">
                      {new Date(item.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {history.length === 0 && (
        <div className="bg-slate-50 rounded-lg p-12 text-center border border-slate-200">
          <div className="text-6xl mb-4">🤖</div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No questions yet</h3>
          <p className="text-slate-600">
            Ask a question above to start exploring Infinity's Reach with the Story Agent
          </p>
        </div>
      )}
    </div>
  );
}
