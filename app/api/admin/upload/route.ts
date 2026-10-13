import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { put, del } from '@vercel/blob';
import { getPortfolioData, savePortfolioData } from '@/lib/storage';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const type = formData.get('type') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!['photo', 'resume', 'project-image'].includes(type)) {
      return NextResponse.json({ error: 'Invalid upload type' }, { status: 400 });
    }

    const allowedPhotoTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if ((type === 'photo' || type === 'project-image') && !allowedPhotoTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Only JPG, PNG, or WEBP images are allowed' }, { status: 400 });
    }
    if (type === 'resume' && file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are allowed for resume' }, { status: 400 });
    }

    const maxSize = type === 'resume' ? 8 * 1024 * 1024 : 4 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: `File too large. Maximum size: ${maxSize / 1024 / 1024}MB` }, { status: 400 });
    }

    const token = process.env.BLOB_READ_WRITE_TOKEN;
    let fileUrl = '';

    if (token) {
      try {
        const ext = file.name.split(".").pop() || 'bin';
        const filename = `${type}-${Date.now()}.${ext}`;
        const blob = await put(filename, file, { access: 'public', token });
        fileUrl = blob.url;
      } catch (blobErr: any) {
        console.warn('Vercel Blob upload failed, falling back to base64 Data URI:', blobErr);
      }
    }

    if (!fileUrl) {
      const isVercel = !!process.env.VERCEL || process.env.NODE_ENV === 'production';
      if (!isVercel) {
        try {
          const { writeFile, mkdir } = await import('fs/promises');
          const path = await import('path');
          const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
          await mkdir(uploadsDir, { recursive: true });
          const ext = file.name.split(".").pop() || 'bin';
          const filename = `${type}-${Date.now()}.${ext}`;
          const buffer = Buffer.from(await file.arrayBuffer());
          await writeFile(path.join(uploadsDir, filename), buffer);
          fileUrl = `/uploads/${filename}`;
        } catch (fsErr) {
          console.warn('Local filesystem write failed:', fsErr);
        }
      }
    }

    if (!fileUrl) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const mimeType = file.type || (type === 'resume' ? 'application/pdf' : 'image/jpeg');
      fileUrl = `data:${mimeType};base64,${buffer.toString('base64')}`;
    }

    const data = await getPortfolioData();

    if (type === 'photo') {
      data.profile.profileImage = fileUrl;
    } else if (type === 'resume') {
      data.siteSettings.resumeUrl = fileUrl;
    }

    const saveResult = await savePortfolioData(data);
    if (!saveResult.success) {
      return NextResponse.json({ error: saveResult.error || 'Failed to save portfolio data' }, { status: 500 });
    }

    try {
      revalidatePath('/');
      revalidatePath('/', 'layout');
    } catch (e) {
      console.warn('Revalidation warning:', e);
    }

    return NextResponse.json({ url: fileUrl, success: true });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: error?.message || 'Upload failed' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { url, type } = await request.json();
    const token = process.env.BLOB_READ_WRITE_TOKEN;

    if (token && url && url.includes('blob.vercel-storage.com')) {
      await del(url, { token });
    }

    const data = await getPortfolioData();
    if (type === 'photo') {
      data.profile.profileImage = '';
    } else if (type === 'resume') {
      data.siteSettings.resumeUrl = '';
    }
    await savePortfolioData(data);

    try {
      revalidatePath('/');
      revalidatePath('/', 'layout');
    } catch (e) {
      console.warn('Revalidation warning:', e);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Delete failed' }, { status: 500 });
  }
}