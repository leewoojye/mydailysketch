
import React, { useState } from 'react';
import { DiaryEntry } from '../types';
import { MapPin } from './Icons';

interface DiaryCardProps {
  entry: DiaryEntry;
}

const DiaryCard: React.FC<DiaryCardProps> = ({ entry }) => {
  const [showOriginal, setShowOriginal] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-stone-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="relative group">
          <img 
            src={showOriginal ? entry.photoUrl : entry.sketchUrl} 
            alt="Diary sketch" 
            className="w-full h-64 object-cover transition-all duration-500"
          />
           <button 
                onClick={() => setShowOriginal(!showOriginal)}
                className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
            >
                {showOriginal ? 'Show Sketch' : 'Show Original'}
            </button>
        </div>
        <div className="p-5 flex flex-col justify-between">
          <div>
            <p className="text-2xl text-stone-700 leading-snug">"{entry.diaryText}"</p>
            <p className="text-sm text-stone-500 mt-3 italic">
              From your memo: "{entry.voiceMemoTranscription}"
            </p>
          </div>
          <div className="mt-4 flex justify-between items-end">
             {entry.location && (
              <div className="flex items-start space-x-1 text-stone-500 text-sm">
                <MapPin size={16} className="mt-0.5 shrink-0" />
                <span>{entry.location.name}</span>
              </div>
            )}
            <p className="text-xs text-stone-400 text-right w-full">
              {new Date(entry.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiaryCard;
