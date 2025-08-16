import { usePhotoEditor } from 'react-photo-editor';
import { useState, useEffect } from 'react';

interface PhotoEditorProps {
  imageUrl?: string;
  onSave?: (editedFile: File) => void;
}

export function PhotoEditor({ imageUrl, onSave }: PhotoEditorProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!imageUrl || !isOpen) {
      setImageFile(null);
      return;
    }

    const convertDataUrlToFile = async () => {
      try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const file = new File([blob], 'ai-generated-image.png', { type: 'image/png' });
        setImageFile(file);
      } catch (error) {
        console.error('Failed to convert image URL to file:', error);
        setImageFile(null);
      }
    };

    convertDataUrlToFile();
  }, [imageUrl, isOpen]);

  const {
    brightness,
    contrast,
    saturate,
    grayscale,
    rotate,
    flipHorizontal,
    flipVertical,
    setBrightness,
    setContrast,
    setSaturate,
    setGrayscale,
    setRotate,
    setFlipHorizontal,
    setFlipVertical,
    generateEditedFile,
    resetFilters,
    downloadImage
  } = usePhotoEditor({
    file: imageFile || undefined,
    defaultBrightness: 100,
    defaultContrast: 100,
    defaultSaturate: 100,
    defaultGrayscale: 0,
  });

  const handleSave = async () => {
    if (!imageFile) return;
    
    try {
      const editedFile = await generateEditedFile();
      if (onSave && editedFile) {
        onSave(editedFile);
        setIsOpen(false);
      }
    } catch (error) {
      console.error('Failed to generate edited file:', error);
    }
  };

  if (!imageUrl) return null;

  return (
    <div>
      <button onClick={() => setIsOpen(!isOpen)}>Edit</button>
      
      {isOpen && (
        <div>
          <div>
            <label>Brightness: {brightness}</label>
            <input
              type="range"
              min="0"
              max="200"
              value={brightness}
              onChange={(e) => setBrightness(Number(e.target.value))}
            />
          </div>
          
          <div>
            <label>Contrast: {contrast}</label>
            <input
              type="range"
              min="0"
              max="200"
              value={contrast}
              onChange={(e) => setContrast(Number(e.target.value))}
            />
          </div>
          
          <div>
            <label>Saturation: {saturate}</label>
            <input
              type="range"
              min="0"
              max="200"
              value={saturate}
              onChange={(e) => setSaturate(Number(e.target.value))}
            />
          </div>
          
          <div>
            <label>Grayscale: {grayscale}</label>
            <input
              type="range"
              min="0"
              max="100"
              value={grayscale}
              onChange={(e) => setGrayscale(Number(e.target.value))}
            />
          </div>
          
          <div>
            <button onClick={() => setRotate(rotate - 90)}>Rotate Left</button>
            <button onClick={() => setRotate(rotate + 90)}>Rotate Right</button>
          </div>
          
          <div>
            <button onClick={() => setFlipHorizontal(!flipHorizontal)}>Flip H</button>
            <button onClick={() => setFlipVertical(!flipVertical)}>Flip V</button>
          </div>
          
          <div>
            <button onClick={resetFilters}>Reset</button>
            <button onClick={handleSave}>Save</button>
            <button onClick={downloadImage}>Download</button>
          </div>
        </div>
      )}
    </div>
  );
}
