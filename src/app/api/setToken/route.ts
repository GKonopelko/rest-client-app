import { NextRequest, NextResponse } from 'next/server';
import * as cookie from 'cookie';

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 });
    }

    const response = NextResponse.json({ success: true });

    response.headers.set(
      'Set-Cookie',
      cookie.serialize('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60,
        path: '/',
        sameSite: 'lax',
      })
    );

    return response;
  } catch (error) {
    console.error('POST /api/setToken error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
