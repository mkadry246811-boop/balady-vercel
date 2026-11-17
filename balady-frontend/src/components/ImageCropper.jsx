import React, { useState, useRef, useEffect, useCallback } from 'react';
import './ImageCropper.css';

/**
 * ImageCropper – drag + pinch/scroll to zoom, then crop to certificate frame ratio.
 * aspectRatio: width/height  (default 1 = square, matching cert-photo-box)
 */
const ImageCropper = ({ imageSrc, onCrop, onCancel, aspectRatio = 1 }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Image natural size
  const imgRef = useRef(new Image());
  const [imgLoaded, setImgLoaded] = useState(false);

  // Pan & zoom state (stored in ref for smooth drag, mirrored to state for re-render)
  const stateRef = useRef({ x: 0, y: 0, scale: 1 });
  const [renderKey, setRenderKey] = useState(0); // force re-draw

  const PREVIEW_W = 400;
  const PREVIEW_H = Math.round(PREVIEW_W / aspectRatio);

  // ── Load image ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const img = imgRef.current;
    img.crossOrigin = "anonymous"; // Prevents tainted canvas issues with external URLs
    img.onload = () => {
      // Fit image to preview box initially
      const scaleX = PREVIEW_W / img.naturalWidth;
      const scaleY = PREVIEW_H / img.naturalHeight;
      const initScale = Math.max(scaleX, scaleY); // cover
      stateRef.current = {
        x: (PREVIEW_W - img.naturalWidth * initScale) / 2,
        y: (PREVIEW_H - img.naturalHeight * initScale) / 2,
        scale: initScale,
      };
      setImgLoaded(true);
    };
    img.src = imageSrc;
  }, [imageSrc, PREVIEW_W, PREVIEW_H]);

  // ── Draw on canvas ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!imgLoaded) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const { x, y, scale } = stateRef.current;
    const img = imgRef.current;
    ctx.clearRect(0, 0, PREVIEW_W, PREVIEW_H);
    ctx.drawImage(img, x, y, img.naturalWidth * scale, img.naturalHeight * scale);
  });

  // ── Drag ─────────────────────────────────────────────────────────────────────
  const dragRef = useRef({ active: false, startX: 0, startY: 0 });

  const clampPosition = (x, y, scale) => {
    const img = imgRef.current;
    const iw = img.naturalWidth * scale;
    const ih = img.naturalHeight * scale;
    const clampedX = Math.min(0, Math.max(PREVIEW_W - iw, x));
    const clampedY = Math.min(0, Math.max(PREVIEW_H - ih, y));
    return { x: clampedX, y: clampedY };
  };

  const onMouseDown = (e) => {
    e.preventDefault();
    dragRef.current = { active: true, startX: e.clientX - stateRef.current.x, startY: e.clientY - stateRef.current.y };
  };

  const onMouseMove = useCallback((e) => {
    if (!dragRef.current.active) return;
    const rawX = e.clientX - dragRef.current.startX;
    const rawY = e.clientY - dragRef.current.startY;
    const { x, y } = clampPosition(rawX, rawY, stateRef.current.scale);
    stateRef.current = { ...stateRef.current, x, y };
    setRenderKey(k => k + 1);
  }, []);

  const onMouseUp = useCallback(() => { dragRef.current.active = false; }, []);

  // Touch drag
  const touchRef = useRef({ startX: 0, startY: 0, dist: 0 });
  const onTouchStart = (e) => {
    if (e.touches.length === 1) {
      touchRef.current.startX = e.touches[0].clientX - stateRef.current.x;
      touchRef.current.startY = e.touches[0].clientY - stateRef.current.y;
    } else if (e.touches.length === 2) {
      touchRef.current.dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
    }
  };

  const onTouchMove = (e) => {
    e.preventDefault();
    if (e.touches.length === 1) {
      const rawX = e.touches[0].clientX - touchRef.current.startX;
      const rawY = e.touches[0].clientY - touchRef.current.startY;
      const { x, y } = clampPosition(rawX, rawY, stateRef.current.scale);
      stateRef.current = { ...stateRef.current, x, y };
    } else if (e.touches.length === 2) {
      const newDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const delta = newDist / touchRef.current.dist;
      touchRef.current.dist = newDist;
      applyZoom(delta, PREVIEW_W / 2, PREVIEW_H / 2);
    }
    setRenderKey(k => k + 1);
  };

  // Wheel zoom
  const onWheel = (e) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.08 : 0.93;
    const rect = canvasRef.current.getBoundingClientRect();
    applyZoom(factor, e.clientX - rect.left, e.clientY - rect.top);
    setRenderKey(k => k + 1);
  };

  const applyZoom = (factor, cx, cy) => {
    const img = imgRef.current;
    const minScale = Math.max(PREVIEW_W / img.naturalWidth, PREVIEW_H / img.naturalHeight);
    const newScale = Math.min(10, Math.max(minScale, stateRef.current.scale * factor));
    // Zoom toward cursor point
    const newX = cx - (cx - stateRef.current.x) * (newScale / stateRef.current.scale);
    const newY = cy - (cy - stateRef.current.y) * (newScale / stateRef.current.scale);
    const { x, y } = clampPosition(newX, newY, newScale);
    stateRef.current = { x, y, scale: newScale };
  };

  // Global mouse up
  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [onMouseMove, onMouseUp]);

  // ── Zoom buttons ─────────────────────────────────────────────────────────────
  const zoom = (factor) => {
    applyZoom(factor, PREVIEW_W / 2, PREVIEW_H / 2);
    setRenderKey(k => k + 1);
  };

  // ── Crop & export ─────────────────────────────────────────────────────────────
  const handleCrop = () => {
    // Export at 2× resolution for quality
    const OUTPUT_W = PREVIEW_W * 2;
    const OUTPUT_H = PREVIEW_H * 2;
    const offscreen = document.createElement('canvas');
    offscreen.width = OUTPUT_W;
    offscreen.height = OUTPUT_H;
    const ctx = offscreen.getContext('2d');
    const { x, y, scale } = stateRef.current;
    ctx.drawImage(
      imgRef.current,
      x * 2, y * 2,
      imgRef.current.naturalWidth * scale * 2,
      imgRef.current.naturalHeight * scale * 2
    );
    offscreen.toBlob((blob) => {
      onCrop(blob);
    }, 'image/jpeg', 0.92);
  };

  // ── Reset ─────────────────────────────────────────────────────────────────────
  const handleReset = () => {
    const img = imgRef.current;
    const scaleX = PREVIEW_W / img.naturalWidth;
    const scaleY = PREVIEW_H / img.naturalHeight;
    const initScale = Math.max(scaleX, scaleY);
    stateRef.current = {
      x: (PREVIEW_W - img.naturalWidth * initScale) / 2,
      y: (PREVIEW_H - img.naturalHeight * initScale) / 2,
      scale: initScale,
    };
    setRenderKey(k => k + 1);
  };

  return (
    <div className="ic-overlay">
      <div className="ic-modal">
        <div className="ic-header">
          <h3>✂️ اقتصاص الصورة</h3>
          <p>اسحب لتحريك الصورة • دولاب الماوس أو الأزرار للتكبير والتصغير</p>
        </div>

        <div className="ic-canvas-wrapper" ref={containerRef}>
          {!imgLoaded && <div className="ic-loading">جاري تحميل الصورة…</div>}
          <canvas
            ref={canvasRef}
            width={PREVIEW_W}
            height={PREVIEW_H}
            className="ic-canvas"
            style={{ cursor: dragRef.current.active ? 'grabbing' : 'grab', display: imgLoaded ? 'block' : 'none' }}
            onMouseDown={onMouseDown}
            onWheel={onWheel}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={() => { }}
          />
          {/* Frame overlay */}
          <div className="ic-frame-overlay" style={{ width: PREVIEW_W, height: PREVIEW_H }} />
        </div>

        {/* Zoom controls */}
        <div className="ic-zoom-bar">
          <button className="ic-zoom-btn" onClick={() => zoom(0.85)} title="تصغير">−</button>
          <span className="ic-zoom-label">🔍 {Math.round(stateRef.current.scale * 100 / Math.max(PREVIEW_W / (imgRef.current.naturalWidth || 1), PREVIEW_H / (imgRef.current.naturalHeight || 1)))}%</span>
          <button className="ic-zoom-btn" onClick={() => zoom(1.15)} title="تكبير">+</button>
          <button className="ic-zoom-reset" onClick={handleReset} title="إعادة ضبط">↺ إعادة ضبط</button>
        </div>

        <div className="ic-actions">
          <button className="ic-btn-cancel" onClick={onCancel}>✕ إلغاء</button>
          <button className="ic-btn-crop" onClick={handleCrop}>✓ قص واستخدم</button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;
