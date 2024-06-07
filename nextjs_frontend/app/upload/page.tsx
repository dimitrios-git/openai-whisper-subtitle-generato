'use client';

import { Button } from '@nextui-org/react';
import { useRouter } from 'next/navigation'; // Update import

const UploadPage = () => {
  const router = useRouter();

  const handleUpload = () => {
    // Implement your upload logic here
    // Redirect to home page after upload is complete
    router.push('/');
  };

  return (
    <div>
      <h1>Upload Video</h1>
      {/* Add upload form or input here */}
      <Button onClick={handleUpload}>Upload</Button>
    </div>
  );
};

export default UploadPage;
