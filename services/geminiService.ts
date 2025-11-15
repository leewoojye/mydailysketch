
import { GoogleGenAI, Type } from "@google/genai";
import type { DiaryEntry, DailySummary, Place } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

// Converts a File object to a base64 encoded string with MIME type.
const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const generateSketch = async (photo: File, voiceMemo: string): Promise<string> => {
  const response = await ai.models.generateImages({
    model: 'imagen-4.0-generate-001',
    prompt: `Create a whimsical, emotional, and artistic hand-drawn sketch based on this voice memo: "${voiceMemo}". The sketch should capture the feeling and essence of the memo. Use a simple, clean style like a pencil on paper.`,
    config: {
        numberOfImages: 1,
        outputMimeType: 'image/png'
    }
  });

  const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
  return `data:image/png;base64,${base64ImageBytes}`;
};

export const generateDiaryText = async (voiceMemo: string): Promise<string> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Based on the following voice recording transcript, write a short, heartfelt, and poetic diary entry. Capture the core emotion and reflect on the moment described. Keep it to 2-3 sentences. Transcript: "${voiceMemo}"`
    });
    return response.text;
};

export const summarizeDay = async (entries: DiaryEntry[]): Promise<DailySummary> => {
  const entriesText = entries.map(e => `- ${e.diaryText} (from a moment described as: "${e.voiceMemoTranscription}")`).join('\n');
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-pro',
    contents: `Based on the following diary entries for today, provide a concise summary of the day's events and feelings. Also, provide an overall emotion score from 1 (very negative) to 10 (very positive), and a single-word description of the dominant emotion.
    
    Entries:
    ${entriesText}`,
    config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                summaryText: { type: Type.STRING },
                emotionScore: { type: Type.NUMBER },
                emotionDescription: { type: Type.STRING }
            },
            required: ['summaryText', 'emotionScore', 'emotionDescription']
        }
    }
  });

  const parsed = JSON.parse(response.text);
  return parsed as DailySummary;
};

export const getPlaceInfo = async (query: string, userLocation: { latitude: number; longitude: number } | null): Promise<Place[]> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Find places matching this query: "${query}". Respond with a list of names and addresses.`,
        config: {
            tools: [{ googleMaps: {} }],
            toolConfig: userLocation ? {
                retrievalConfig: {
                    latLng: {
                        latitude: userLocation.latitude,
                        longitude: userLocation.longitude
                    }
                }
            } : undefined,
        },
    });

    // The response is not guaranteed to be JSON, so we need to parse it carefully.
    // For this app, we will assume a simple text parsing will work.
    // A more robust solution might involve a more structured prompt or a JSON schema if the API supported it with Maps.
    
    // This is a simplified parser based on expected text format.
    const text = response.text;
    const places: Place[] = [];
    const placeBlocks = text.split('**').map(s => s.trim()).filter(s => s);
    
    for (let i = 0; i < placeBlocks.length; i += 2) {
        if (placeBlocks[i+1]) {
            places.push({ name: placeBlocks[i], address: placeBlocks[i+1].replace('Address:', '').trim() });
        }
    }

    // Fallback if parsing fails
    if (places.length === 0 && text.length > 0) {
        return [{ name: query, address: text.substring(0, 100) }];
    }
    
    return places;
};
