import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = 'AIzaSyBR3_Au3SqzIEA0Xk5fAmzvtCw3xBWjbOk';
const genAI = new GoogleGenerativeAI(API_KEY);

export async function generateIdeaCategory(title: string, description: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(
      `Kategorikan ide project berikut ke salah satu kategori: Web App, Mobile App, CLI Tool, API/Backend, Game, DevOps, atau Other. Berikan HANYA nama kategorinya, tanpa penjelasan.\n\nJudul: ${title}\nDeskripsi: ${description}`
    );
    return result.response.text().trim();
  } catch {
    return 'Web App';
  }
}

export async function generateProjectDescription(name: string, shortDesc: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(
      `Buatkan deskripsi lengkap untuk project bernama "${name}" dengan deskripsi singkat: "${shortDesc}". Deskripsi harus menarik, profesional, dan dalam bahasa Indonesia. Maksimal 3 kalimat. Hanya berikan deskripsinya tanpa penjelasan tambahan.`
    );
    return result.response.text().trim();
  } catch {
    return shortDesc;
  }
}

export async function generateCaption(imageContext: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(
      `Buatkan caption singkat untuk foto kegiatan coding club dengan konteks: "${imageContext}". Caption harus dalam bahasa Indonesia, singkat dan menarik. Maksimal 10 kata.`
    );
    return result.response.text().trim();
  } catch {
    return imageContext;
  }
}

export async function validateProjectUrl(url: string): Promise<{ valid: boolean; message: string }> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(
      `Apakah URL "${url}" terlihat seperti URL project yang valid? Periksa formatnya. Berikan jawaban dalam format JSON: {"valid": true/false, "message": "penjelasan singkat"}. Hanya berikan JSON tersebut.`
    );
    const text = result.response.text().trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return { valid: true, message: 'URL format looks valid' };
  } catch {
    // Basic URL validation fallback
    try {
      new URL(url);
      return { valid: true, message: 'URL format is valid' };
    } catch {
      return { valid: false, message: 'Invalid URL format' };
    }
  }
}
