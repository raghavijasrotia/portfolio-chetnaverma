import { NextResponse } from 'next/server';
import { isRedisConfigured } from '@/lib/storage';

export async function GET() {
  const isVercel = !!process.env.VERCEL || process.env.NODE_ENV === 'production';
  const redisConfigured = isRedisConfigured();
  const blobConfigured = !!process.env.BLOB_READ_WRITE_TOKEN;

  return NextResponse.json({
    isVercel,
    redisConfigured,
    blobConfigured,
  });
}
