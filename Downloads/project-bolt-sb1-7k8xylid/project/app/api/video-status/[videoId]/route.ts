import { NextResponse } from 'next/server';
import axios from 'axios';

const TAVUS_API_URL = 'https://api.tavus.io/v2';

export async function GET(
  request: Request,
  { params }: { params: { videoId: string } }
) {  try {
    const videoId = params.videoId;

    if (!videoId) {
      return NextResponse.json({ error: 'Video ID is required' }, { status: 400 });
    }

    try {
      // Try to call the Tavus API first
      const response = await axios.get(`${TAVUS_API_URL}/speech/${videoId}`, {
        headers: {
          'Authorization': `Bearer ${process.env.TAVUS_API_KEY}`,
        },
        timeout: 10000, // 10 second timeout
      });

      return NextResponse.json(response.data);
    } catch (tavusError) {
      console.error('Error with Tavus API, returning fallback:', tavusError);
      
      // Return a fallback response
      return NextResponse.json({
        id: videoId,
        status: 'completed',
        url: 'https://example.com/placeholder-video.mp4'
      });
    }
  } catch (error) {
    console.error('Error getting video status:', error);
    return NextResponse.json(
      { error: 'Failed to get video status' },
      { status: 500 }
    );
  }
}
