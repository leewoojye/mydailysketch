
export interface Location {
  name: string;
  address: string;
  uri?: string;
}

export interface DiaryEntry {
  id: string;
  date: string;
  photoUrl: string;
  sketchUrl: string;
  voiceMemoTranscription: string;
  diaryText: string;
  location?: Location;
}

export interface DailySummary {
  summaryText: string;
  emotionScore: number;
  emotionDescription: string;
}

export interface Place {
    name: string;
    address: string;
}
