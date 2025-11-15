
import React, { useState, useCallback } from 'react';
import { DiaryEntry, Location, Place } from '../types';
import { generateSketch, generateDiaryText } from '../services/geminiService';
import useAudioRecorder from '../hooks/useAudioRecorder';
import LocationSearchModal from './LocationSearchModal';
import { Camera, Mic, MapPin, Edit3, X, Image as ImageIcon } from './Icons';

interface DiaryEntryCreatorProps {
  onAddEntry: (entry: DiaryEntry) => void;
}

const DiaryEntryCreator: React.FC<DiaryEntryCreatorProps> = ({ onAddEntry }) => {
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [location, setLocation] = useState<Location | undefined>(undefined);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditingText, setIsEditingText] = useState(false);

  const { isRecording, startRecording, stopRecording, transcription, setTranscription } = useAudioRecorder();

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhoto(file);
      const previewUrl = URL.createObjectURL(file);
      setPhotoPreview(previewUrl);
    }
  };

  const handleSelectLocation = (place: Place) => {
    setLocation({ name: place.name, address: place.address });
    setIsLocationModalOpen(false);
  };

  const handleSubmit = async () => {
    if (!photo || !transcription) {
      alert('Please add a photo and record a voice memo.');
      return;
    }

    setIsLoading(true);
    try {
      const [sketchUrl, diaryText] = await Promise.all([
        generateSketch(photo, transcription),
        generateDiaryText(transcription),
      ]);
      
      const newEntry: DiaryEntry = {
        id: new Date().toISOString(),
        date: new Date().toISOString(),
        photoUrl: photoPreview!,
        sketchUrl,
        voiceMemoTranscription: transcription,
        diaryText,
        location,
      };

      onAddEntry(newEntry);
      resetForm();
    } catch (error) {
      console.error("Failed to create diary entry:", error);
      alert("Something went wrong while creating your sketch. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setPhoto(null);
    setPhotoPreview(null);
    setTranscription('');
    setLocation(undefined);
    setIsEditingText(false);
  };

  const isSubmitDisabled = !photo || !transcription || isLoading;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-stone-200 space-y-6">
       <h2 className="text-3xl font-bold text-stone-600 mb-2">Create a New Sketch</h2>
      
      {/* Photo Upload */}
      <div className="border-2 border-dashed border-stone-300 rounded-lg p-4 text-center">
        <input type="file" id="photo-upload" className="hidden" accept="image/*" onChange={handlePhotoChange} />
        {photoPreview ? (
          <div className="relative group">
            <img src={photoPreview} alt="Preview" className="w-full h-auto max-h-60 object-contain rounded-lg" />
            <button onClick={() => { setPhoto(null); setPhotoPreview(null); }} className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <X size={18} />
            </button>
          </div>
        ) : (
          <label htmlFor="photo-upload" className="cursor-pointer flex flex-col items-center justify-center space-y-2 text-stone-500 hover:text-amber-500 transition-colors">
            <Camera size={40} />
            <span className="text-lg">Upload a Photo</span>
          </label>
        )}
      </div>

      {/* Audio Recording & Transcription */}
      <div className="space-y-3">
        <div className="flex items-center space-x-4">
          <button onClick={isRecording ? stopRecording : startRecording} className={`p-4 rounded-full transition-all duration-300 ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-amber-400 hover:bg-amber-500'} text-white`}>
            <Mic size={24} />
          </button>
          <div className="flex-1">
            <p className="text-lg font-semibold">{isRecording ? "Recording your moment..." : "Record a voice memo"}</p>
            <p className="text-sm text-stone-500">Describe what's happening or how you feel.</p>
          </div>
        </div>
        {transcription && (
          <div className="bg-stone-100 p-3 rounded-lg border border-stone-200">
            <div className="flex justify-between items-start">
              {isEditingText ? (
                <textarea 
                  value={transcription}
                  onChange={(e) => setTranscription(e.target.value)}
                  className="w-full text-md text-stone-700 bg-white border border-amber-400 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-amber-300"
                  rows={4}
                />
              ) : (
                <p className="text-md text-stone-700 italic">"{transcription}"</p>
              )}
              <button onClick={() => setIsEditingText(!isEditingText)} className="ml-2 text-stone-500 hover:text-amber-500 p-1 shrink-0">
                {isEditingText ? <X size={20}/> : <Edit3 size={20} />}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Location */}
      <div>
        <button onClick={() => setIsLocationModalOpen(true)} className="w-full flex items-center justify-center space-x-2 py-3 text-lg border-2 border-dashed border-stone-300 rounded-lg text-stone-500 hover:border-amber-400 hover:text-amber-500 transition-colors">
          <MapPin size={20} />
          <span>{location ? location.name : 'Add Location (Optional)'}</span>
        </button>
        {location && <p className="text-center text-sm text-stone-500 mt-1">{location.address}</p>}
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={isSubmitDisabled}
        className="w-full py-4 text-2xl font-bold bg-amber-500 text-white rounded-lg shadow-lg hover:bg-amber-600 disabled:bg-stone-300 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center"
      >
        {isLoading ? (
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        ) : (
          <div className="flex items-center">
            <ImageIcon size={24} className="mr-2"/>
            <span>Create My Sketch</span>
          </div>
        )}
      </button>

      {isLocationModalOpen && (
        <LocationSearchModal
          onClose={() => setIsLocationModalOpen(false)}
          onSelectLocation={handleSelectLocation}
        />
      )}
    </div>
  );
};

export default DiaryEntryCreator;
