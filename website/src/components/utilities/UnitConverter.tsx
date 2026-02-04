// eCy OS v1005.0 - Unit Converter
// Convert between multiple unit categories

import { useState } from 'react';
import { UtilityBase } from './UtilityBase';
import { CopyButton } from './CopyButton';
import styles from './UnitConverter.module.css';

type Category = 'length' | 'weight' | 'temperature' | 'speed' | 'volume';

interface Unit {
  name: string;
  symbol: string;
  toBase: (value: number) => number;
  fromBase: (value: number) => number;
}

const units: Record<Category, Record<string, Unit>> = {
  length: {
    meter: {
      name: 'Meter',
      symbol: 'm',
      toBase: (v) => v,
      fromBase: (v) => v,
    },
    kilometer: {
      name: 'Kilometer',
      symbol: 'km',
      toBase: (v) => v * 1000,
      fromBase: (v) => v / 1000,
    },
    centimeter: {
      name: 'Centimeter',
      symbol: 'cm',
      toBase: (v) => v / 100,
      fromBase: (v) => v * 100,
    },
    millimeter: {
      name: 'Millimeter',
      symbol: 'mm',
      toBase: (v) => v / 1000,
      fromBase: (v) => v * 1000,
    },
    mile: {
      name: 'Mile',
      symbol: 'mi',
      toBase: (v) => v * 1609.344,
      fromBase: (v) => v / 1609.344,
    },
    yard: {
      name: 'Yard',
      symbol: 'yd',
      toBase: (v) => v * 0.9144,
      fromBase: (v) => v / 0.9144,
    },
    foot: {
      name: 'Foot',
      symbol: 'ft',
      toBase: (v) => v * 0.3048,
      fromBase: (v) => v / 0.3048,
    },
    inch: {
      name: 'Inch',
      symbol: 'in',
      toBase: (v) => v * 0.0254,
      fromBase: (v) => v / 0.0254,
    },
  },
  weight: {
    kilogram: {
      name: 'Kilogram',
      symbol: 'kg',
      toBase: (v) => v,
      fromBase: (v) => v,
    },
    gram: {
      name: 'Gram',
      symbol: 'g',
      toBase: (v) => v / 1000,
      fromBase: (v) => v * 1000,
    },
    milligram: {
      name: 'Milligram',
      symbol: 'mg',
      toBase: (v) => v / 1000000,
      fromBase: (v) => v * 1000000,
    },
    ton: {
      name: 'Metric Ton',
      symbol: 't',
      toBase: (v) => v * 1000,
      fromBase: (v) => v / 1000,
    },
    pound: {
      name: 'Pound',
      symbol: 'lb',
      toBase: (v) => v * 0.453592,
      fromBase: (v) => v / 0.453592,
    },
    ounce: {
      name: 'Ounce',
      symbol: 'oz',
      toBase: (v) => v * 0.0283495,
      fromBase: (v) => v / 0.0283495,
    },
  },
  temperature: {
    celsius: {
      name: 'Celsius',
      symbol: '°C',
      toBase: (v) => v,
      fromBase: (v) => v,
    },
    fahrenheit: {
      name: 'Fahrenheit',
      symbol: '°F',
      toBase: (v) => (v - 32) * (5 / 9),
      fromBase: (v) => v * (9 / 5) + 32,
    },
    kelvin: {
      name: 'Kelvin',
      symbol: 'K',
      toBase: (v) => v - 273.15,
      fromBase: (v) => v + 273.15,
    },
  },
  speed: {
    mps: {
      name: 'Meter/Second',
      symbol: 'm/s',
      toBase: (v) => v,
      fromBase: (v) => v,
    },
    kph: {
      name: 'Kilometer/Hour',
      symbol: 'km/h',
      toBase: (v) => v / 3.6,
      fromBase: (v) => v * 3.6,
    },
    mph: {
      name: 'Mile/Hour',
      symbol: 'mph',
      toBase: (v) => v * 0.44704,
      fromBase: (v) => v / 0.44704,
    },
    knot: {
      name: 'Knot',
      symbol: 'kn',
      toBase: (v) => v * 0.514444,
      fromBase: (v) => v / 0.514444,
    },
  },
  volume: {
    liter: {
      name: 'Liter',
      symbol: 'L',
      toBase: (v) => v,
      fromBase: (v) => v,
    },
    milliliter: {
      name: 'Milliliter',
      symbol: 'mL',
      toBase: (v) => v / 1000,
      fromBase: (v) => v * 1000,
    },
    gallon: {
      name: 'Gallon (US)',
      symbol: 'gal',
      toBase: (v) => v * 3.78541,
      fromBase: (v) => v / 3.78541,
    },
    quart: {
      name: 'Quart (US)',
      symbol: 'qt',
      toBase: (v) => v * 0.946353,
      fromBase: (v) => v / 0.946353,
    },
    cup: {
      name: 'Cup (US)',
      symbol: 'cup',
      toBase: (v) => v * 0.236588,
      fromBase: (v) => v / 0.236588,
    },
    cubicMeter: {
      name: 'Cubic Meter',
      symbol: 'm³',
      toBase: (v) => v * 1000,
      fromBase: (v) => v / 1000,
    },
  },
};

export function UnitConverter() {
  const [category, setCategory] = useState<Category>('length');
  const [fromUnit, setFromUnit] = useState('meter');
  const [toUnit, setToUnit] = useState('kilometer');
  const [fromValue, setFromValue] = useState('');
  const [toValue, setToValue] = useState('');

  const convert = (value: string, from: string, to: string) => {
    if (!value || isNaN(Number(value))) {
      setToValue('');
      return;
    }

    const numValue = Number(value);
    const categoryUnits = units[category];
    
    // Convert to base unit, then to target unit
    const baseValue = categoryUnits[from].toBase(numValue);
    const result = categoryUnits[to].fromBase(baseValue);
    
    // Format result (max 6 decimal places, remove trailing zeros)
    const formatted = Number(result.toFixed(6)).toString();
    setToValue(formatted);
  };

  const handleFromChange = (value: string) => {
    setFromValue(value);
    convert(value, fromUnit, toUnit);
  };

  const handleToChange = (value: string) => {
    setToValue(value);
    // Reverse conversion
    if (!value || isNaN(Number(value))) {
      setFromValue('');
      return;
    }
    const numValue = Number(value);
    const categoryUnits = units[category];
    const baseValue = categoryUnits[toUnit].toBase(numValue);
    const result = categoryUnits[fromUnit].fromBase(baseValue);
    setFromValue(Number(result.toFixed(6)).toString());
  };

  const handleCategoryChange = (newCategory: Category) => {
    setCategory(newCategory);
    const firstUnit = Object.keys(units[newCategory])[0];
    const secondUnit = Object.keys(units[newCategory])[1];
    setFromUnit(firstUnit);
    setToUnit(secondUnit);
    setFromValue('');
    setToValue('');
  };

  const handleSwapUnits = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
    setFromValue(toValue);
    setToValue(fromValue);
  };

  const loadExample = () => {
    if (category === 'length') {
      setFromValue('5');
      setFromUnit('mile');
      setToUnit('kilometer');
      convert('5', 'mile', 'kilometer');
    } else if (category === 'weight') {
      setFromValue('150');
      setFromUnit('pound');
      setToUnit('kilogram');
      convert('150', 'pound', 'kilogram');
    } else if (category === 'temperature') {
      setFromValue('100');
      setFromUnit('celsius');
      setToUnit('fahrenheit');
      convert('100', 'celsius', 'fahrenheit');
    } else if (category === 'speed') {
      setFromValue('100');
      setFromUnit('kph');
      setToUnit('mph');
      convert('100', 'kph', 'mph');
    } else if (category === 'volume') {
      setFromValue('1');
      setFromUnit('gallon');
      setToUnit('liter');
      convert('1', 'gallon', 'liter');
    }
  };

  const categoryUnits = units[category];

  return (
    <UtilityBase
      title="Unit Converter"
      icon="⚖️"
      description="Convert between units (length, weight, temp, speed, volume)"
    >
      <div className={styles.container}>
        {/* Category Tabs */}
        <div className={styles.categoryTabs}>
          {(['length', 'weight', 'temperature', 'speed', 'volume'] as Category[]).map((cat) => (
            <button
              key={cat}
              className={`${styles.categoryTab} ${category === cat ? styles.active : ''}`}
              onClick={() => handleCategoryChange(cat)}
            >
              {cat === 'length' && '📏'}
              {cat === 'weight' && '⚖️'}
              {cat === 'temperature' && '🌡️'}
              {cat === 'speed' && '🚀'}
              {cat === 'volume' && '🧪'}
              <span>{cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
            </button>
          ))}
        </div>

        {/* Example Button */}
        <div className={styles.exampleSection}>
          <button onClick={loadExample} className={styles.exampleBtn}>
            Load Example
          </button>
        </div>

        {/* From Unit */}
        <div className={styles.conversionSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>From</span>
          </div>
          
          <div className={styles.inputGroup}>
            <input
              type="number"
              value={fromValue}
              onChange={(e) => handleFromChange(e.target.value)}
              placeholder="Enter value..."
              className={styles.input}
            />
            <select
              value={fromUnit}
              onChange={(e) => {
                setFromUnit(e.target.value);
                convert(fromValue, e.target.value, toUnit);
              }}
              className={styles.select}
            >
              {Object.entries(categoryUnits).map(([key, unit]) => (
                <option key={key} value={key}>
                  {unit.name} ({unit.symbol})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Swap Button */}
        <div className={styles.swapSection}>
          <button onClick={handleSwapUnits} className={styles.swapBtn}>
            ⇅
          </button>
        </div>

        {/* To Unit */}
        <div className={styles.conversionSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>To</span>
            {toValue && <CopyButton text={toValue} label="Copy" />}
          </div>
          
          <div className={styles.inputGroup}>
            <input
              type="number"
              value={toValue}
              onChange={(e) => handleToChange(e.target.value)}
              placeholder="Result..."
              className={styles.input}
            />
            <select
              value={toUnit}
              onChange={(e) => {
                setToUnit(e.target.value);
                convert(fromValue, fromUnit, e.target.value);
              }}
              className={styles.select}
            >
              {Object.entries(categoryUnits).map(([key, unit]) => (
                <option key={key} value={key}>
                  {unit.name} ({unit.symbol})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Conversion Formula */}
        {fromValue && toValue && (
          <div className={styles.formula}>
            <span className={styles.formulaText}>
              {fromValue} {categoryUnits[fromUnit].symbol} = {toValue} {categoryUnits[toUnit].symbol}
            </span>
          </div>
        )}
      </div>
    </UtilityBase>
  );
}
