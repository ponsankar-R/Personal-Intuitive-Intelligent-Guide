import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { query } from '@/lib/db';
import { setSession } from '@/lib/auth/session';
import { initDb } from '@/lib/schema';

export async function POST(request: Request) {
  try {
    await initDb();
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await query(
      'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id',
      [username, hashedPassword]
    );

    const userId = result.rows[0].id;
    await setSession(userId);

    return NextResponse.json({ success: true, userId });
  } catch (error: any) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Username already exists' }, { status: 400 });
    }
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
