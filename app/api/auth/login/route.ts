import { NextResponse } from 'next/server';

import { createSession } from '@/lib/auth';

// Basic in-memory rate limiting map. In a real Vercel deployment without DB, 
// this resets on cold starts, but it provides basic protection.
const rateLimitMap = new Map<string, { attempts: number; timestamp: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // Get IP for rate limiting (fallback for local dev)
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    
    const now = Date.now();
    const limitRecord = rateLimitMap.get(ip);

    if (limitRecord) {
      if (limitRecord.attempts >= MAX_ATTEMPTS) {
        if (now - limitRecord.timestamp < LOCKOUT_MS) {
          return NextResponse.json(
            { error: 'Too many failed attempts. Please try again later.' },
            { status: 429 }
          );
        } else {
          // Reset after lockout period
          rateLimitMap.delete(ip);
        }
      }
    }

    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      console.error("ADMIN_PASSWORD is not set in environment variables.");
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    if (username !== adminUsername || password !== adminPassword) {
      // Record failed attempt
      recordFailedAttempt(ip, now);
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Success: clear rate limit and create session
    rateLimitMap.delete(ip);
    await createSession();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function recordFailedAttempt(ip: string, now: number) {
  const record = rateLimitMap.get(ip) || { attempts: 0, timestamp: now };
  record.attempts += 1;
  record.timestamp = now; // update timestamp to extend lockout if they keep trying
  rateLimitMap.set(ip, record);
}
