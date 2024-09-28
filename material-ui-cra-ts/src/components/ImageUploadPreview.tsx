import React, { useState } from 'react';
import { Box, Button, Input, OutlinedInput, Typography } from '@mui/material';

interface ImageUploadPreviewProps {
    onSuccessUpload: (fileIds: string[], status: string) => void; // Callback after successful upload
    uploadImages: (images: File[]) => Promise<{ fileIds: string[], status: string }>; // Function to handle image upload logic
}

const ImageUploadPreview: React.FC<ImageUploadPreviewProps> = ({ onSuccessUpload, uploadImages }) => {
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [uploadStatus, setUploadStatus] = useState<string>(''); // To display upload status

    // Handle image file selection
    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            const selectedFilesArray = Array.from(files);
            setSelectedImages(selectedFilesArray);

            // Create image previews
            const previews = selectedFilesArray.map(file => URL.createObjectURL(file));
            setImagePreviews(previews);
        }
    };

    // Remove selected image
    const removeImage = (index: number) => {
        const updatedImages = [...selectedImages];
        updatedImages.splice(index, 1);
        setSelectedImages(updatedImages);

        const updatedPreviews = [...imagePreviews];
        updatedPreviews.splice(index, 1);
        setImagePreviews(updatedPreviews);
    };

    // Handle upload process
    const handleUpload = async () => {
        if (selectedImages.length > 0) {
            try {
                setUploadStatus('Uploading...');
                const { fileIds, status } = await uploadImages(selectedImages);
                setUploadStatus(status);
                onSuccessUpload(fileIds, status); // Call the success callback with fileIds and status
            } catch (error) {
                setUploadStatus('Upload failed. Please try again.');
            }
        }
    };

    return (
        <Box>
            <Typography variant="h6">Upload and Preview Images</Typography>

            <OutlinedInput
                type="file"
                inputProps={{ accept: 'image/*', multiple: false }}
                onChange={handleImageSelect}

            />

            <Box mt={2}>
                {imagePreviews.map((preview, index) => (
                    <Box
                        key={index}
                        mb={2}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,  // This will add space between the image box and the button
                            p: 2,
                            border: '1px dashed grey'
                        }}
                    >
                        <img src={preview} alt={`preview ${index}`} height="200" />

                    </Box>
                ))}
            </Box>




            {/* Display upload status */}
            {uploadStatus && (
                <Typography variant="subtitle1" color="primary" mt={2}>
                    {uploadStatus}
                </Typography>
            )}
        </Box>
    );
};

export default ImageUploadPreview;
