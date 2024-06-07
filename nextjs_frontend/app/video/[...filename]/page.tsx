'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button, Spacer } from '@nextui-org/react';

const VideoPage = () => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [subtitleUrl, setSubtitleUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const filename = pathname.split('/').pop();
    if (filename) {
      fetchVideoDetails(filename);
    } else {
      setError('Video ID not found in URL');
      setLoading(false);
    }
  }, [pathname]);

  const fetchVideoDetails = async (filename: string) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/videos/${filename}`);
      if (!response.ok) {
        throw new Error('Failed to fetch video details');
      }
      setVideoUrl(response.url); // Set the video URL directly from the response
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const filename = pathname.split('/').pop();
    if (filename) {
      try {
        const response = await fetch(
          `http://localhost:5000/videos/${filename}`,
          {
            method: 'DELETE',
          }
        );
        if (response.ok) {
          router.push('/'); // Redirect to the home page after successful deletion
        } else {
          console.error('Failed to delete video');
        }
      } catch (error: any) {
        console.error('Error deleting video:', error.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-0">
      {videoUrl ? (
        <div className="w-full">
          <video controls className="w-full h-auto max-h-screen object-contain">
            <source src={videoUrl} type="video/mp4" />
            {subtitleUrl && <track src={subtitleUrl} kind="subtitles" />}
          </video>
          <div className="flex justify-end mt-4">
            <Button color="danger" onClick={handleDelete}>
              Delete Video
            </Button>
          </div>
        </div>
      ) : (
        <p>Video not found</p>
      )}
      <Spacer y={1} />
      <Button className="fixed bottom-4" onClick={() => router.back()}>
        Go Back
      </Button>
    </div>
  );
};

export default VideoPage;
