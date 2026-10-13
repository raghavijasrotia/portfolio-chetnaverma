import { Redis } from '@upstash/redis';
import { PortfolioData } from './types';
import { defaultPortfolioData } from './defaultData';
import fs from 'fs';
import path from 'path';

const LOCAL_FILE_PATH = path.join(process.cwd(), 'data.json');
const REDIS_KEY = process.env.REDIS_KEY || 'chetna_portfolio_data';

function cleanEnv(val: string | undefined): string | undefined {
  if (!val) return undefined;
  const cleaned = val.trim().replace(/^["']|["']$/g, '');
  return cleaned.length > 0 ? cleaned : undefined;
}

export function getRedis(): Redis | null {
  let url =
    cleanEnv(process.env.UPSTASH_REDIS_REST_URL) ||
    cleanEnv(process.env.KV_REST_API_URL) ||
    cleanEnv(process.env.STORAGE_REST_API_URL) ||
    cleanEnv(process.env.STORAGE_KV_REST_API_URL) ||
    cleanEnv(process.env.REDIS_REST_URL);

  let token =
    cleanEnv(process.env.UPSTASH_REDIS_REST_TOKEN) ||
    cleanEnv(process.env.KV_REST_API_TOKEN) ||
    cleanEnv(process.env.STORAGE_REST_API_TOKEN) ||
    cleanEnv(process.env.STORAGE_KV_REST_API_TOKEN) ||
    cleanEnv(process.env.REDIS_REST_TOKEN);

  // Dynamic discovery for any custom prefix created in Vercel Storage integration
  if (!url || !token) {
    for (const [key, value] of Object.entries(process.env)) {
      if (!url && (key.endsWith('_REST_API_URL') || key.endsWith('_REDIS_REST_URL') || key.endsWith('_REST_URL'))) {
        url = cleanEnv(value);
      }
      if (!token && (key.endsWith('_REST_API_TOKEN') || key.endsWith('_REDIS_REST_TOKEN') || key.endsWith('_REST_TOKEN'))) {
        token = cleanEnv(value);
      }
    }
  }

  if (url && token) {
    try {
      return new Redis({ url, token });
    } catch (e) {
      console.error('Failed to initialize Redis client:', e);
      return null;
    }
  }
  return null;
}

export function isRedisConfigured(): boolean {
  return getRedis() !== null;
}

export async function getPortfolioData(): Promise<PortfolioData> {
  const redis = getRedis();
  if (redis) {
    try {
      const data = await redis.get<PortfolioData>(REDIS_KEY);
      if (data) return mergeWithDefaults(data);

      // First-time seed: load existing data.json from project so real data is preserved
      let initialData = defaultPortfolioData;
      try {
        if (fs.existsSync(LOCAL_FILE_PATH)) {
          const fileData = fs.readFileSync(LOCAL_FILE_PATH, 'utf-8');
          initialData = mergeWithDefaults(JSON.parse(fileData));
        }
      } catch (err) {
        console.warn('Could not read local data.json for seeding, using defaultPortfolioData:', err);
      }

      await redis.set(REDIS_KEY, initialData);
      return initialData;
    } catch (error: any) {
      if (error?.digest === 'DYNAMIC_SERVER_USAGE') {
        throw error;
      }
      console.error('Redis fetch error:', error);
    }
  }

  // Fallback to local filesystem (development)
  try {
    if (fs.existsSync(LOCAL_FILE_PATH)) {
      const fileData = fs.readFileSync(LOCAL_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(fileData) as PortfolioData;
      return mergeWithDefaults(parsed);
    } else {
      try {
        fs.writeFileSync(LOCAL_FILE_PATH, JSON.stringify(defaultPortfolioData, null, 2));
      } catch {}
      return defaultPortfolioData;
    }
  } catch (error) {
    return defaultPortfolioData;
  }
}

export async function savePortfolioData(data: PortfolioData): Promise<{ success: boolean; error?: string }> {
  const redis = getRedis();
  if (redis) {
    try {
      await redis.set(REDIS_KEY, data);
      return { success: true };
    } catch (error: any) {
      console.error('Redis save error:', error);
      return {
        success: false,
        error: `Database error: ${error?.message || 'Failed to write to Redis'}`,
      };
    }
  }

  // If no Redis configured and running on Vercel / production with read-only FS:
  const isVercel = !!process.env.VERCEL || process.env.NODE_ENV === 'production';
  try {
    fs.writeFileSync(LOCAL_FILE_PATH, JSON.stringify(data, null, 2));
    return { success: true };
  } catch (error: any) {
    console.error('Local file save error:', error);
    if (isVercel || error?.code === 'EROFS') {
      return {
        success: false,
        error: 'Database not connected on Vercel. Please connect Upstash Redis in your Vercel Dashboard (Storage -> Upstash Redis) and set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.',
      };
    }
    return {
      success: false,
      error: `Filesystem error: ${error?.message || 'Failed to save to local file'}`,
    };
  }
}

/**
 * Merges stored data with defaults to handle new fields gracefully.
 * If stored data is missing new fields (e.g. after a schema update),
 * they will be populated from defaultPortfolioData.
 */
function mergeWithDefaults(stored: Partial<PortfolioData>): PortfolioData {
  return {
    ...defaultPortfolioData,
    ...stored,
    profile: {
      ...defaultPortfolioData.profile,
      ...(stored.profile || {}),
      stats: (stored.profile?.stats && Array.isArray(stored.profile.stats) && stored.profile.stats.length > 0)
        ? stored.profile.stats
        : defaultPortfolioData.profile.stats,
    },
    availability: { ...defaultPortfolioData.availability, ...(stored.availability || {}) },
    contact: { ...defaultPortfolioData.contact, ...(stored.contact || {}) },
    siteSettings: {
      ...defaultPortfolioData.siteSettings,
      ...(stored.siteSettings || {}),
      sections: { ...defaultPortfolioData.siteSettings.sections, ...(stored.siteSettings?.sections || {}) },
      seo: { ...defaultPortfolioData.siteSettings.seo, ...(stored.siteSettings?.seo || {}) },
    },
    experience: stored.experience !== undefined ? stored.experience : defaultPortfolioData.experience,
    skills: stored.skills !== undefined ? stored.skills : defaultPortfolioData.skills,
    projects: stored.projects !== undefined ? stored.projects : defaultPortfolioData.projects,
    certifications: stored.certifications !== undefined ? stored.certifications : defaultPortfolioData.certifications,
    education: stored.education !== undefined ? stored.education : defaultPortfolioData.education,
    socialLinks: stored.socialLinks !== undefined ? stored.socialLinks : defaultPortfolioData.socialLinks,
  };
}
