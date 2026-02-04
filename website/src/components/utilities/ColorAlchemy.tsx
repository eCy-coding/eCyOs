// eCy OS v1005.0 - Color Alchemy
// Convert, generate, and analyze colors with WCAG compliance

import { useState, useMemo } from 'react';
import { UtilityBase } from './UtilityBase';
import { CopyButton } from './CopyButton';
import styles from './ColorAlchemy.module.css';

interface RGB { r: number; g: number; b: number; }
interface HSL { h: number; s: number; l: number; }
interface CMYK { c: number; m: number; y: number; k: number; }

// Conversion utilities
const hexToRgb = (hex: string): RGB | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

const rgbToHex = (r: number, g: number, b: number): string => {
  return '#' + [r, g, b].map(x => {
    const hex = Math.round(x).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
};

const rgbToHsl = (r: number, g: number, b: number): HSL => {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
};

const hslToRgb = (h: number, s: number, l: number): RGB => {
  h /= 360; s /= 100; l /= 100;
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return { r: r * 255, g: g * 255, b: b * 255 };
};

const rgbToCmyk = (r: number, g: number, b: number): CMYK => {
  const rNorm = r / 255, gNorm = g / 255, bNorm = b / 255;
  const k = 1 - Math.max(rNorm, gNorm, bNorm);
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
  return {
    c: (1 - rNorm - k) / (1 - k) * 100,
    m: (1 - gNorm - k) / (1 - k) * 100,
    y: (1 - bNorm - k) / (1 - k) * 100,
    k: k * 100
  };
};

const getContrastRatio = (rgb1: RGB, rgb2: RGB): number => {
  const getLuminance = (r: number, g: number, b: number) => {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c /= 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };
  const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
};

export function ColorAlchemy() {
  const [inputColor, setInputColor] = useState('#8b5cf6');
  const [bgColor, setBgColor] = useState('#ffffff');
  
  const currentRgb = useMemo(() => hexToRgb(inputColor) || { r: 139, g: 92, b: 246 }, [inputColor]);
  const currentHsl = useMemo(() => rgbToHsl(currentRgb.r, currentRgb.g, currentRgb.b), [currentRgb]);
  const currentCmyk = useMemo(() => rgbToCmyk(currentRgb.r, currentRgb.g, currentRgb.b), [currentRgb]);
  
  const bgRgb = useMemo(() => hexToRgb(bgColor) || { r: 255, g: 255, b: 255 }, [bgColor]);
  const contrastRatio = useMemo(() => getContrastRatio(currentRgb, bgRgb), [currentRgb, bgRgb]);
  
  const palette = useMemo(() => {
    const h = currentHsl.h;
    return {
      complementary: (() => {
        const rgb = hslToRgb((h + 180) % 360, currentHsl.s, currentHsl.l);
        return rgbToHex(rgb.r, rgb.g, rgb.b);
      })(),
      triadic: [
        (() => { const rgb = hslToRgb((h + 120) % 360, currentHsl.s, currentHsl.l); return rgbToHex(rgb.r, rgb.g, rgb.b); })(),
        (() => { const rgb = hslToRgb((h + 240) % 360, currentHsl.s, currentHsl.l); return rgbToHex(rgb.r, rgb.g, rgb.b); })()
      ],
      analogous: [
        (() => { const rgb = hslToRgb((h - 30 + 360) % 360, currentHsl.s, currentHsl.l); return rgbToHex(rgb.r, rgb.g, rgb.b); })(),
        (() => { const rgb = hslToRgb((h + 30) % 360, currentHsl.s, currentHsl.l); return rgbToHex(rgb.r, rgb.g, rgb.b); })()
      ],
      monochromatic: [
        (() => { const rgb = hslToRgb(h, currentHsl.s, Math.max(0, currentHsl.l - 20)); return rgbToHex(rgb.r, rgb.g, rgb.b); })(),
        (() => { const rgb = hslToRgb(h, currentHsl.s, Math.min(100, currentHsl.l + 20)); return rgbToHex(rgb.r, rgb.g, rgb.b); })()
      ]
    };
  }, [currentHsl]);
  
  const gradientCss = `linear-gradient(135deg, ${inputColor}, ${palette.complementary})`;
  
  return (
    <UtilityBase
      title="Color Alchemy"
      icon="🎨"
      description="Convert colors, generate palettes, and check WCAG compliance"
    >
      <div className={styles.container}>
        {/* Color Picker */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>🎯 Color Input</span>
          </div>
          <div className={styles.colorPickerRow}>
            <input
              type="color"
              value={inputColor}
              onChange={(e) => setInputColor(e.target.value)}
              className={styles.colorPicker}
            />
            <input
              type="text"
              value={inputColor}
              onChange={(e) => setInputColor(e.target.value)}
              className={styles.colorInput}
              placeholder="#8b5cf6"
            />
            <div 
              className={styles.colorPreview}
              style={{ backgroundColor: inputColor }}
            />
          </div>
        </div>
        
        {/* Format Conversions */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>🔄 Conversions</span>
          </div>
          <div className={styles.conversionGrid}>
            <div className={styles.conversionItem}>
              <div className={styles.conversionLabel}>HEX</div>
              <div className={styles.conversionValue}>{inputColor.toUpperCase()}</div>
              <CopyButton text={inputColor.toUpperCase()} label="Copy" />
            </div>
            <div className={styles.conversionItem}>
              <div className={styles.conversionLabel}>RGB</div>
              <div className={styles.conversionValue}>
                rgb({Math.round(currentRgb.r)}, {Math.round(currentRgb.g)}, {Math.round(currentRgb.b)})
              </div>
              <CopyButton text={`rgb(${Math.round(currentRgb.r)}, ${Math.round(currentRgb.g)}, ${Math.round(currentRgb.b)})`} label="Copy" />
            </div>
            <div className={styles.conversionItem}>
              <div className={styles.conversionLabel}>HSL</div>
              <div className={styles.conversionValue}>
                hsl({Math.round(currentHsl.h)}°, {Math.round(currentHsl.s)}%, {Math.round(currentHsl.l)}%)
              </div>
              <CopyButton text={`hsl(${Math.round(currentHsl.h)}, ${Math.round(currentHsl.s)}%, ${Math.round(currentHsl.l)}%)`} label="Copy" />
            </div>
            <div className={styles.conversionItem}>
              <div className={styles.conversionLabel}>CMYK</div>
              <div className={styles.conversionValue}>
                C:{Math.round(currentCmyk.c)} M:{Math.round(currentCmyk.m)} Y:{Math.round(currentCmyk.y)} K:{Math.round(currentCmyk.k)}
              </div>
              <CopyButton text={`C:${Math.round(currentCmyk.c)} M:${Math.round(currentCmyk.m)} Y:${Math.round(currentCmyk.y)} K:${Math.round(currentCmyk.k)}`} label="Copy" />
            </div>
          </div>
        </div>
        
        {/* Palette Generator */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>🎨 Palettes</span>
          </div>
          
          <div className={styles.paletteGroup}>
            <div className={styles.paletteLabel}>Complementary</div>
            <div className={styles.paletteColors}>
              <div className={styles.paletteColor} style={{ backgroundColor: inputColor }} title={inputColor} />
              <div className={styles.paletteColor} style={{ backgroundColor: palette.complementary }} title={palette.complementary} />
            </div>
          </div>
          
          <div className={styles.paletteGroup}>
            <div className={styles.paletteLabel}>Triadic</div>
            <div className={styles.paletteColors}>
              <div className={styles.paletteColor} style={{ backgroundColor: inputColor }} title={inputColor} />
              {palette.triadic.map((c, i) => (
                <div key={i} className={styles.paletteColor} style={{ backgroundColor: c }} title={c} />
              ))}
            </div>
          </div>
          
          <div className={styles.paletteGroup}>
            <div className={styles.paletteLabel}>Analogous</div>
            <div className={styles.paletteColors}>
              {palette.analogous.map((c, i) => (
                <div key={i} className={styles.paletteColor} style={{ backgroundColor: c }} title={c} />
              ))}
              <div className={styles.paletteColor} style={{ backgroundColor: inputColor }} title={inputColor} />
            </div>
          </div>
          
          <div className={styles.paletteGroup}>
            <div className={styles.paletteLabel}>Monochromatic</div>
            <div className={styles.paletteColors}>
              {palette.monochromatic.map((c, i) => (
                <div key={i} className={styles.paletteColor} style={{ backgroundColor: c }} title={c} />
              ))}
              <div className={styles.paletteColor} style={{ backgroundColor: inputColor }} title={inputColor} />
            </div>
          </div>
        </div>
        
        {/* WCAG Contrast */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>♿ WCAG Contrast</span>
          </div>
          <div className={styles.contrastRow}>
            <div className={styles.contrastInput}>
              <label>Background:</label>
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className={styles.colorPicker}
              />
              <input
                type="text"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className={styles.colorInput}
                placeholder="#ffffff"
              />
            </div>
            <div className={styles.contrastResult}>
              <div className={styles.contrastRatio}>{contrastRatio.toFixed(2)}:1</div>
              <div className={styles.contrastBadges}>
                {contrastRatio >= 4.5 && <span className={styles.badgeAA}>AA ✓</span>}
                {contrastRatio >= 7 && <span className={styles.badgeAAA}>AAA ✓</span>}
                {contrastRatio < 4.5 && <span className={styles.badgeFail}>FAIL ✗</span>}
              </div>
            </div>
          </div>
          <div 
            className={styles.contrastPreview}
            style={{ backgroundColor: bgColor, color: inputColor }}
          >
            Sample Text for Contrast Testing
          </div>
        </div>
        
        {/* Gradient */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>🌈 Gradient</span>
          </div>
          <div 
            className={styles.gradientPreview}
            style={{ background: gradientCss }}
          />
          <div className={styles.gradientCode}>
            <code>{gradientCss}</code>
            <CopyButton text={gradientCss} label="Copy CSS" />
          </div>
        </div>
      </div>
    </UtilityBase>
  );
}
