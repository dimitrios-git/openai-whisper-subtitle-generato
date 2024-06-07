'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Card,
  Button,
  Link,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Tooltip,
  Spacer,
} from '@nextui-org/react';
import { DeleteIcon } from './DeleteIcon';
import { EditIcon } from './EditIcon';
import { EyeIcon } from './EyeIcon';

const Home = () => {
  const router = useRouter();
  const [videos, setVideos] = useState<string[]>([]);
  const [subtitles, setSubtitles] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const handleViewVideo = (videoId: string) => {
    sessionStorage.setItem('scrollPosition', window.scrollY.toString());
    router.push(`/video/${videoId}`);
  };

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await fetch('http://localhost:5000/uploads');
        if (response.ok) {
          const data = await response.json();
          setVideos(data.files.videos || []);
          setSubtitles(data.files.subtitles || []);
        } else {
          console.error('Failed to fetch uploaded files');
        }
      } catch (error) {
        console.error('Error fetching uploaded files:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, []);

  useEffect(() => {
    if (!loading) {
      const savedPosition = sessionStorage.getItem('scrollPosition');
      if (savedPosition) {
        window.scrollTo({
          top: parseInt(savedPosition, 10),
          behavior: 'smooth',
        });
        sessionStorage.removeItem('scrollPosition');
      }
    }
  }, [loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen p-0">
        Loading...
      </div>
    );
  }

  const handleDelete = async (video: string) => {
    try {
      const response = await fetch(`http://localhost:5000/videos/${video}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        // Remove the deleted video from the state
        setVideos((prevVideos) => prevVideos.filter((v) => v !== video));
        console.log('File deleted successfully');
      } else {
        console.error('Failed to delete file');
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error deleting file:', error.message);
      } else {
        console.error('Error deleting file:', error);
      }
    }
  };

  const handleGenerateSubtitle = async (video: string) => {
    try {
      const response = await fetch(
        `http://localhost:5000/generate-subtitle/${video}`,
        {
          method: 'POST',
        }
      );
      if (response.ok) {
        console.log('Subtitle generated successfully');
      } else {
        console.error('Failed to generate subtitle');
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error generating subtitle:', error.message);
      } else {
        console.error('Error generating subtitle:', error);
      }
    }
  };

  const subtitleExists = (video: string) => {
    const subtitle = video.replace(/\.[^/.]+$/, '') + '.vtt';
    return subtitles.includes(subtitle);
  };

  return (
    <div>
      <div>
        <Button
          href="/upload"
          color="primary"
          variant="ghost"
          size="lg"
          className="fixed bottom-4 left-1/2 transform -translate-x-1/2 py-2 px-4 rounded-lg shadow-lg z-10"
        >
          Upload Video
        </Button>
      </div>
      {videos.length === 0 ? (
        <div className="flex items-center justify-center min-h-screen p-0">
          <svg
            width="100"
            height="100"
            viewBox="0 -0.5 17 17"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            className="si-glyph si-glyph-folder-error"
            fill="none"
          >
            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
            <g
              id="SVGRepo_tracerCarrier"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></g>
            <g id="SVGRepo_iconCarrier">
              <title>No files found. Please upload a video.</title>{' '}
              <defs> </defs>
              <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                <g transform="translate(1.000000, 2.000000)" fill="#434343">
                  <path
                    d="M7.35,3 L5.788,0.042 L2.021,0.042 L2.021,1.063 L0.023,1.063 L0.023,10.976 L1.043,10.976 L1.045,11.976 L15.947,11.976 L15.968,3 L7.35,3 L7.35,3 Z M10.918,9.109 L10.09,9.938 L8.512,8.361 L6.934,9.938 L6.104,9.109 L7.682,7.531 L6.104,5.953 L6.934,5.125 L8.512,6.701 L10.088,5.125 L10.918,5.953 L9.34,7.531 L10.918,9.109 L10.918,9.109 Z"
                    className="si-glyph-fill"
                  ></path>
                  <path
                    d="M13.964,1.982 L13.964,1.042 L8.024,1.042 L8.354,1.982 L13.964,1.982 Z"
                    className="si-glyph-fill"
                  ></path>
                </g>
              </g>
            </g>
          </svg>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 md:p-8">
          {videos.map((video) => {
            const subtitle = video.replace(/\.[^/.]+$/, '') + '.vtt';
            return (
              <Card key={video} className="w-full">
                <video controls className="w-full h-auto">
                  <source
                    src={`http://localhost:5000/videos/${video}`}
                    type="video/mp4"
                  />
                  {subtitleExists(video) && (
                    <track
                      src={`/subtitles/${subtitle}`} // Use the proxied URL
                      kind="subtitles"
                      srcLang="en"
                      label="English"
                      default
                    />
                  )}
                </video>
                <div className="p-4">
                  <Table
                    removeWrapper
                    aria-label="Example static collection table"
                    radius="none"
                  >
                    <TableHeader>
                      <TableColumn>FILENAME</TableColumn>
                      <TableColumn className="flex items-center justify-end">
                        ACTIONS
                      </TableColumn>
                    </TableHeader>
                    <TableBody>
                      <TableRow key="1">
                        <TableCell>{video}</TableCell>
                        <TableCell className="flex flex-row items-center justify-end">
                          <div className="relative flex items-center gap-4">
                            <Tooltip content="View">
                              <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                                <Link
                                  color="foreground"
                                  href={`/video/${video}`}
                                  onClick={() => handleViewVideo(video)}
                                >
                                  <EyeIcon />
                                </Link>
                              </span>
                            </Tooltip>
                            <Tooltip color="danger" content="Delete">
                              <span className="text-lg text-danger cursor-pointer active:opacity-50">
                                <Link
                                  color="danger"
                                  onClick={() => handleDelete(video)}
                                >
                                  <DeleteIcon />
                                </Link>
                              </span>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                      <TableRow key="2">
                        <TableCell>
                          {subtitleExists(video) ? (
                            <span>{subtitle}</span>
                          ) : (
                            <span>No subtitle found</span>
                          )}
                        </TableCell>
                        <TableCell className="flex flex-row space-x-2 items-center justify-end">
                          <div className="relative flex items-center gap-4">
                            {subtitleExists(video) ? (
                              <Tooltip content="Edit">
                                <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                                  <Link
                                    color="foreground"
                                    href={`/subtitle/${subtitle}`}
                                  >
                                    <EditIcon />
                                  </Link>
                                </span>
                              </Tooltip>
                            ) : null}
                            {subtitleExists(video) ? (
                              <Tooltip color="danger" content="Delete">
                                <span className="text-lg text-danger cursor-pointer active:opacity-50">
                                  <Link
                                    color="danger"
                                    onClick={() => handleDelete(subtitle)}
                                  >
                                    <DeleteIcon />
                                  </Link>
                                </span>
                              </Tooltip>
                            ) : (
                              <Tooltip color="warning" content="Generate">
                                <span className="text-lg text-warning cursor-pointer active:opacity-50">
                                  <Link
                                    color="warning"
                                    onClick={() =>
                                      handleGenerateSubtitle(video)
                                    }
                                  >
                                    <DeleteIcon />
                                  </Link>
                                </span>
                              </Tooltip>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </Card>
            );
          })}
          <Spacer y={12} />
        </div>
      )}
    </div>
  );
};

export default Home;
