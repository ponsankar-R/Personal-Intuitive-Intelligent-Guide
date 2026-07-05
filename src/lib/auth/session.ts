import { cookies } from 'next/headers';

export async function getSession() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;
  return userId ? parseInt(userId) : null;
}

export async function setSession(userId: number) {
  const cookieStore = await cookies();
  cookieStore.set('userId', userId.toString(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete('userId');
}
