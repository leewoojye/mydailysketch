
import React, { useState, useMemo } from 'react';
import { DiaryEntry, DailySummary } from './types';
import Header from './components/Header';
import DiaryEntryCreator from './components/DiaryEntryCreator';
import DiaryFeed from './components/DiaryFeed';
import { summarizeDay } from './services/geminiService';

const App: React.FC = () => {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);

  const handleAddEntry = (entry: DiaryEntry) => {
    setEntries(prevEntries => [entry, ...prevEntries]);
    setSummary(null); // Invalidate summary when a new entry is added
  };

  const handleSummarize = async () => {
    const today = new Date().toDateString();
    const todayEntries = entries.filter(e => new Date(e.date).toDateString() === today);

    if (todayEntries.length === 0) {
      alert("You need at least one entry today to create a summary!");
      return;
    }

    setIsSummarizing(true);
    try {
      const result = await summarizeDay(todayEntries);
      setSummary(result);
    } catch (error) {
      console.error("Failed to summarize day:", error);
      alert("Sorry, I couldn't create a summary. Please try again.");
    } finally {
      setIsSummarizing(false);
    }
  };

  const todayEntriesExist = useMemo(() => {
    const today = new Date().toDateString();
    return entries.some(e => new Date(e.date).toDateString() === today);
  }, [entries]);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-700">
      <Header />
      <main className="container mx-auto p-4 md:p-6 lg:p-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="lg:pr-4">
            <DiaryEntryCreator onAddEntry={handleAddEntry} />
          </div>
          <div className="lg:pl-4">
            <div className="bg-white/60 p-4 rounded-2xl shadow-sm border border-stone-200 sticky top-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-3xl font-bold text-stone-600">Today's Summary</h2>
                <button
                  onClick={handleSummarize}
                  disabled={isSummarizing || !todayEntriesExist}
                  className="px-4 py-2 text-lg bg-amber-400 text-white rounded-lg shadow-md hover:bg-amber-500 disabled:bg-stone-300 disabled:cursor-not-allowed transition-all duration-300"
                >
                  {isSummarizing ? 'Thinking...' : 'Summarize Today'}
                </button>
              </div>
              {summary && (
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 animate-fade-in">
                  <div className="flex items-center mb-2">
                    <p className="text-xl font-bold mr-2">Emotion Score: {summary.emotionScore}/10</p>
                    <p className="text-lg bg-amber-200 text-amber-800 px-2 py-1 rounded">{summary.emotionDescription}</p>
                  </div>
                  <p className="text-lg text-stone-600">{summary.summaryText}</p>
                </div>
              )}
               {!summary && !isSummarizing && (
                <div className="text-center py-6 text-stone-500">
                    <p>Click "Summarize Today" to get an AI-powered overview of your day!</p>
                </div>
               )}
               {isSummarizing && (
                 <div className="text-center py-6 text-stone-500">
                    <p>Brewing a summary of your day...</p>
                 </div>
               )}
            </div>
            <DiaryFeed entries={entries} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
