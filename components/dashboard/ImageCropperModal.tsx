import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Modal, Button } from '../UIComponents';
import { RotateCw, ZoomIn, ZoomOut, Check, X, Crop as CropIcon } from 'lucide-react';
import getCroppedImg from '../../utils/canvasUtils';
import { TRANSLATIONS } from '../../constants';

interface ImageCropperModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  onCropComplete: (croppedBlob: Blob) => void;
  isUploading?: boolean;
}

export const ImageCropperModal: React.FC<ImageCropperModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  onCropComplete,
  isUploading = false,
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  const t = TRANSLATIONS.th.labels;

  const onCropChange = (crop: { x: number; y: number }) => {
    setCrop(crop);
  };

  const onZoomChange = (zoom: number) => {
    setZoom(zoom);
  };

  const onCropCompleteInternal = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    if (!imageUrl || !croppedAreaPixels) return;
    
    setIsSaving(true);
    try {
      const croppedBlob = await getCroppedImg(imageUrl, croppedAreaPixels, rotation);
      if (croppedBlob) {
        onCropComplete(croppedBlob);
      }
    } catch (e) {
      console.error('Error cropping image:', e);
    } finally {
      setIsSaving(false);
    }
  };

  const rotateImage = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t.adjustPhoto}
      size="lg"
      footer={
        <div className="flex justify-end gap-3 w-full">
          <Button variant="outline" onClick={onClose} disabled={isSaving || isUploading}>
            <X className="w-4 h-4 mr-2" /> ยกเลิก
          </Button>
          <Button 
            onClick={handleSave} 
            isLoading={isSaving || isUploading}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Check className="w-4 h-4 mr-2" /> {t.cropAndSave}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col h-[500px]">
        {/* Cropper Container */}
        <div className="relative flex-1 bg-gray-900 rounded-lg overflow-hidden">
          {imageUrl && (
            <Cropper
              image={imageUrl}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={3 / 4}
              onCropChange={onCropChange}
              onZoomChange={onZoomChange}
              onRotationChange={setRotation}
              onCropComplete={onCropCompleteInternal}
            />
          )}
        </div>

        {/* Controls */}
        <div className="mt-4 space-y-4">
          <div className="flex items-center gap-4">
            <ZoomOut className="w-5 h-5 text-gray-400" />
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <ZoomIn className="w-5 h-5 text-gray-400" />
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={rotateImage}
              className="flex items-center px-4 py-2 bg-white border rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
            >
              <RotateCw className="w-4 h-4 mr-2" /> {t.rotate}
            </button>
            <div className="flex items-center px-4 py-2 bg-gray-100 rounded-lg text-xs text-gray-500">
              <CropIcon className="w-4 h-4 mr-2" /> 3:4 Aspect Ratio
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
