import { NextResponse } from 'next/server';
import axios from 'axios';

const TAVUS_API_URL = 'https://api.tavus.io/v2';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { text } = data;

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const response = await axios.post(`${TAVUS_API_URL}/speech`, {
      text,
      voice_id: process.env.TAVUS_VOICE_ID,
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.TAVUS_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 15000, // 15 second timeout
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error generating video:', error);
    return NextResponse.json(
      { error: 'Failed to generate video' },
      { status: 500 }
    );
  }
}
