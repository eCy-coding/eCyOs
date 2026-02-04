// eCy OS v1005.0 - Image Compressor
// Compress and resize images with quality control

import { useState, useRef } from 'react';
import { UtilityBase } from './UtilityBase';
import styles from './ImageCompressor.module.css';

interface ImageData {
  original: {
    url: string;
    size: number;
    width: number;
    height: number;
    format: string;
  } | null;
  compressed: {
    url: string;
    size: number;
  } | null;
}

export function ImageCompressor() {
  const [imageData, setImageData] = useState<ImageData>({ original: null, compressed: null });
  const [quality, setQuality] = useState(80);
  const [resizeWidth, setResizeWidth] = useState<number | ''>('');
  const [resizeHeight, setResizeHeight] = useState<number | ''>('');
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    setProcessing(true);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const img = new Image();
      img.onload = () => {
        // Store original data
        setImageData({
          original: {
            url: e.target?.result as string,
            size: file.size,
            width: img.width,
            height: img.height,
            format: file.type,
          },
          compressed: null,
        });

        // Set default resize dimensions
        if (resizeWidth === '') setResizeWidth(img.width);
        if (resizeHeight === '') setResizeHeight(img.height);

        // Auto-compress
        compressImage(img, file.type);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const compressImage = (img: HTMLImageElement, format: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Calculate dimensions
    let width = resizeWidth || img.width;
    let height = resizeHeight || img.height;

    if (typeof width === 'string') width = img.width;
    if (typeof height === 'string') height = img.height;

    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    // Draw image
    ctx.drawImage(img, 0, 0, width, height);

    // Compress
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          setImageData((prev) => ({
            ...prev,
            compressed: {
              url,
              size: blob.size,
            },
          }));
        }
        setProcessing(false);
      },
      format,
      quality / 100
    );
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleQualityChange = (newQuality: number) => {
    setQuality(newQuality);
    if (imageData.original) {
      const img = new Image();
      img.onload = () => {
        compressImage(img, imageData.original!.format);
      };
      img.src = imageData.original.url;
    }
  };

  const handleResizeWidthChange = (width: number) => {
    setResizeWidth(width);
    if (maintainAspectRatio && imageData.original) {
      const aspectRatio = imageData.original.height / imageData.original.width;
      setResizeHeight(Math.round(width * aspectRatio));
    }
  };

  const handleResizeHeightChange = (height: number) => {
    setResizeHeight(height);
    if (maintainAspectRatio && imageData.original) {
      const aspectRatio = imageData.original.width / imageData.original.height;
      setResizeWidth(Math.round(height * aspectRatio));
    }
  };

  const applyResize = () => {
    if (imageData.original) {
      const img = new Image();
      img.onload = () => {
        compressImage(img, imageData.original!.format);
      };
      img.src = imageData.original.url;
    }
  };

  const downloadCompressed = () => {
    if (!imageData.compressed) return;

    const link = document.createElement('a');
    link.href = imageData.compressed.url;
    link.download = `compressed-${Date.now()}.jpg`;
    link.click();
  };

  const clearAll = () => {
    setImageData({ original: null, compressed: null });
    setQuality(80);
    setResizeWidth('');
    setResizeHeight('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getReduction = (): string => {
    if (!imageData.original || !imageData.compressed) return '0';
    const reduction = ((imageData.original.size - imageData.compressed.size) / imageData.original.size) * 100;
    return reduction.toFixed(1);
  };

  return (
    <UtilityBase
      title="Image Compressor"
      icon="📸"
      description="Compress and resize images with quality control"
    >
      <div className={styles.container}>
        {/* Hidden Canvas */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {/* Upload Zone */}
        {!imageData.original && (
          <div
            className={`${styles.uploadZone} ${isDragging ? styles.dragging : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className={styles.uploadIcon}>📸</div>
            <div className={styles.uploadText}>
              Drag & drop image here or click to upload
            </div>
            <div className={styles.uploadSubtext}>
              Supports JPG, PNG, WebP
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileInput}
              style={{ display: 'none' }}
            />
          </div>
        )}

        {/* Controls */}
        {imageData.original && (
          <>
            <div className={styles.controls}>
              {/* Quality Slider */}
              <div className={styles.control}>
                <label className={styles.controlLabel}>
                  Quality: {quality}%
                </label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={quality}
                  onChange={(e) => handleQualityChange(Number(e.target.value))}
                  className={styles.slider}
                />
              </div>

              {/* Resize Options */}
              <div className={styles.resizeSection}>
                <div className={styles.resizeHeader}>Resize (optional)</div>
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={maintainAspectRatio}
                    onChange={(e) => setMaintainAspectRatio(e.target.checked)}
                  />
                  <span>Maintain Aspect Ratio</span>
                </label>
                <div className={styles.resizeInputs}>
                  <div className={styles.resizeInput}>
                    <label>Width (px)</label>
                    <input
                      type="number"
                      value={resizeWidth}
                      onChange={(e) => handleResizeWidthChange(Number(e.target.value))}
                      placeholder="Width"
                    />
                  </div>
                  <div className={styles.resizeInput}>
                    <label>Height (px)</label>
                    <input
                      type="number"
                      value={resizeHeight}
                      onChange={(e) => handleResizeHeightChange(Number(e.target.value))}
                      placeholder="Height"
                    />
                  </div>
                </div>
                <button onClick={applyResize} className={styles.applyBtn}>
                  Apply Resize
                </button>
              </div>
            </div>

            {/* Preview */}
            <div className={styles.preview}>
              <div className={styles.previewItem}>
                <div className={styles.previewLabel}>Original</div>
                <img src={imageData.original.url} alt="Original" className={styles.previewImage} />
                <div className={styles.previewSize}>
                  {formatFileSize(imageData.original.size)}
                </div>
                <div className={styles.previewDimensions}>
                  {imageData.original.width} × {imageData.original.height}
                </div>
              </div>

              {imageData.compressed && (
                <div className={styles.previewItem}>
                  <div className={styles.previewLabel}>Compressed</div>
                  <img src={imageData.compressed.url} alt="Compressed" className={styles.previewImage} />
                  <div className={styles.previewSize}>
                    {formatFileSize(imageData.compressed.size)}
                  </div>
                  <div className={styles.previewReduction}>
                    ↓ {getReduction()}% smaller
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className={styles.actions}>
              <button
                onClick={downloadCompressed}
                disabled={!imageData.compressed}
                className={styles.downloadBtn}
              >
                📥 Download Compressed
              </button>
              <button onClick={clearAll} className={styles.clearBtn}>
                Clear
              </button>
            </div>

            {/* Stats */}
            {imageData.compressed && (
              <div className={styles.stats}>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Reduction</span>
                  <span className={styles.statValue}>{getReduction()}%</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Quality</span>
                  <span className={styles.statValue}>{quality}%</span>
                </div>
              </div>
            )}
          </>
        )}

        {processing && (
          <div className={styles.processing}>
            Processing...
          </div>
        )}
      </div>
    </UtilityBase>
  );
}
