import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getPortfolioData, savePortfolioData } from '@/lib/storage';
import { PortfolioData } from '@/lib/types';

export async function GET() {
  try {
    const data = await getPortfolioData();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to get portfolio data:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data: PortfolioData = await request.json();
    const result = await savePortfolioData(data);
    
    if (result.success) {
      try {
        revalidatePath('/');
        revalidatePath('/', 'layout');
      } catch (revalError) {
        console.warn('Revalidation warning:', revalError);
      }
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: result.error || 'Failed to save data' }, { status: 500 });
    }
  } catch (error) {
    console.error('Failed to parse portfolio data:', error);
    return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
  }
}
