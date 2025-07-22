// app/api/chats/route.ts
import { NextResponse } from 'next/server';
import pool from '../../db';

export async function GET() {
  const result = await pool.query('SELECT * FROM chats ORDER BY created_at DESC');
  return NextResponse.json(result.rows);
}

export async function POST(req: Request) {
  const { title } = await req.json();
  const result = await pool.query(
    'INSERT INTO chats (title) VALUES ($1) RETURNING *',
    [title]
  );
  return NextResponse.json(result.rows[0]);
}
