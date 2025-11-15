
import React from 'react';
import { DiaryEntry } from '../types';
import DiaryCard from './DiaryCard';

interface DiaryFeedProps {
  entries: DiaryEntry[];
}

const DiaryFeed: React.FC<DiaryFeedProps> = ({ entries }) => {
  const groupedEntries = entries.reduce((acc, entry) => {
    const date = new Date(entry.date).toDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(entry);
    return acc;
  }, {} as Record<string, DiaryEntry[]>);

  const sortedDates = Object.keys(groupedEntries).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  if (entries.length === 0) {
    return (
        <div className="mt-8 text-center bg-white/60 p-10 rounded-2xl shadow-sm border border-stone-200">
            <h3 className="text-2xl text-stone-500">Your sketch diary is empty.</h3>
            <p className="text-lg text-stone-400 mt-2">Create your first memory to see it here!</p>
        </div>
    );
  }

  return (
    <div className="space-y-8 mt-8">
      {sortedDates.map(date => (
        <div key={date}>
          <h2 className="text-2xl font-bold text-stone-500 pb-2 mb-4 border-b-2 border-stone-200">
            {new Date(date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </h2>
          <div className="space-y-6">
            {groupedEntries[date].map(entry => (
              <DiaryCard key={entry.id} entry={entry} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DiaryFeed;
