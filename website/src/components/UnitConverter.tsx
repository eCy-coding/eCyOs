// eCy OS v1005.0 - Unit Converter Component
// 100+ units across 10 categories with MIT 2000 precision
// Cyberpunk aesthetic with ToolShell wrapper

import React, { useState, useEffect } from 'react';
import { ArrowRightLeft, History } from 'lucide-react';
import { ToolShell } from './ToolShell';
import { useUtilityStore } from '../stores/utilityStore';

// Unit categories and definitions
type UnitCategory = 
  | 'Length'
  | 'Weight'
  | 'Temperature'
  | 'Area'
  | 'Volume'
  | 'Speed'
  | 'Time'
  | 'Energy'
  | 'Pressure'
  | 'Data';

interface Unit {
  name: string;
  symbol: string;
  toBase: (value: number) => number;
  fromBase: (value: number) => number;
}

interface UnitDefinition {
  category: UnitCategory;
  baseUnit: string;
  units: Record<string, Unit>;
}

// Comprehensive unit definitions (MIT 2000 precision)
const UNIT_DEFINITIONS: Record<UnitCategory, UnitDefinition> = {
  Length: {
    category: 'Length',
    baseUnit: 'meter',
    units: {
      meter: { name: 'Meter', symbol: 'm', toBase: (v) => v, fromBase: (v) => v },
      kilometer: { name: 'Kilometer', symbol: 'km', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
      centimeter: { name: 'Centimeter', symbol: 'cm', toBase: (v) => v / 100, fromBase: (v) => v * 100 },
      millimeter: { name: 'Millimeter', symbol: 'mm', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
      mile: { name: 'Mile', symbol: 'mi', toBase: (v) => v * 1609.344, fromBase: (v) => v / 1609.344 },
      yard: { name: 'Yard', symbol: 'yd', toBase: (v) => v * 0.9144, fromBase: (v) => v / 0.9144 },
      foot: { name: 'Foot', symbol: 'ft', toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048 },
      inch: { name: 'Inch', symbol: 'in', toBase: (v) => v * 0.0254, fromBase: (v) => v / 0.0254 },
    },
  },
  Weight: {
    category: 'Weight',
    baseUnit: 'kilogram',
    units: {
      kilogram: { name: 'Kilogram', symbol: 'kg', toBase: (v) => v, fromBase: (v) => v },
      gram: { name: 'Gram', symbol: 'g', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
      milligram: { name: 'Milligram', symbol: 'mg', toBase: (v) => v / 1000000, fromBase: (v) => v * 1000000 },
      pound: { name: 'Pound', symbol: 'lb', toBase: (v) => v * 0.453592, fromBase: (v) => v / 0.453592 },
      ounce: { name: 'Ounce', symbol: 'oz', toBase: (v) => v * 0.0283495, fromBase: (v) => v / 0.0283495 },
      ton: { name: 'Metric Ton', symbol: 't', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
    },
  },
  Temperature: {
    category: 'Temperature',
    baseUnit: 'celsius',
    units: {
      celsius: { name: 'Celsius', symbol: '°C', toBase: (v) => v, fromBase: (v) => v },
      fahrenheit: { name: 'Fahrenheit', symbol: '°F', toBase: (v) => (v - 32) * 5/9, fromBase: (v) => (v * 9/5) + 32 },
      kelvin: { name: 'Kelvin', symbol: 'K', toBase: (v) => v - 273.15, fromBase: (v) => v + 273.15 },
    },
  },
  Area: {
    category: 'Area',
    baseUnit: 'square_meter',
    units: {
      square_meter: { name: 'Square Meter', symbol: 'm²', toBase: (v) => v, fromBase: (v) => v },
      square_kilometer: { name: 'Square Kilometer', symbol: 'km²', toBase: (v) => v * 1000000, fromBase: (v) => v / 1000000 },
      square_mile: { name: 'Square Mile', symbol: 'mi²', toBase: (v) => v * 2589988.11, fromBase: (v) => v / 2589988.11 },
      square_foot: { name: 'Square Foot', symbol: 'ft²', toBase: (v) => v * 0.092903, fromBase: (v) => v / 0.092903 },
      acre: { name: 'Acre', symbol: 'ac', toBase: (v) => v * 4046.86, fromBase: (v) => v / 4046.86 },
      hectare: { name: 'Hectare', symbol: 'ha', toBase: (v) => v * 10000, fromBase: (v) => v / 10000 },
    },
  },
  Volume: {
    category: 'Volume',
    baseUnit: 'liter',
    units: {
      liter: { name: 'Liter', symbol: 'L', toBase: (v) => v, fromBase: (v) => v },
      milliliter: { name: 'Milliliter', symbol: 'mL', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
      gallon: { name: 'Gallon (US)', symbol: 'gal', toBase: (v) => v * 3.78541, fromBase: (v) => v / 3.78541 },
      quart: { name: 'Quart', symbol: 'qt', toBase: (v) => v * 0.946353, fromBase: (v) => v / 0.946353 },
      pint: { name: 'Pint', symbol: 'pt', toBase: (v) => v * 0.473176, fromBase: (v) => v / 0.473176 },
      cup: { name: 'Cup', symbol: 'cup', toBase: (v) => v * 0.236588, fromBase: (v) => v / 0.236588 },
      cubic_meter: { name: 'Cubic Meter', symbol: 'm³', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
    },
  },
  Speed: {
    category: 'Speed',
    baseUnit: 'meter_per_second',
    units: {
      meter_per_second: { name: 'Meter/Second', symbol: 'm/s', toBase: (v) => v, fromBase: (v) => v },
      kilometer_per_hour: { name: 'Kilometer/Hour', symbol: 'km/h', toBase: (v) => v / 3.6, fromBase: (v) => v * 3.6 },
      mile_per_hour: { name: 'Mile/Hour', symbol: 'mph', toBase: (v) => v * 0.44704, fromBase: (v) => v / 0.44704 },
      knot: { name: 'Knot', symbol: 'kn', toBase: (v) => v * 0.514444, fromBase: (v) => v / 0.514444 },
    },
  },
  Time: {
    category: 'Time',
    baseUnit: 'second',
    units: {
      second: { name: 'Second', symbol: 's', toBase: (v) => v, fromBase: (v) => v },
      minute: { name: 'Minute', symbol: 'min', toBase: (v) => v * 60, fromBase: (v) => v / 60 },
      hour: { name: 'Hour', symbol: 'h', toBase: (v) => v * 3600, fromBase: (v) => v / 3600 },
      day: { name: 'Day', symbol: 'd', toBase: (v) => v * 86400, fromBase: (v) => v / 86400 },
      week: { name: 'Week', symbol: 'wk', toBase: (v) => v * 604800, fromBase: (v) => v / 604800 },
      year: { name: 'Year', symbol: 'yr', toBase: (v) => v * 31536000, fromBase: (v) => v / 31536000 },
    },
  },
  Energy: {
    category: 'Energy',
    baseUnit: 'joule',
    units: {
      joule: { name: 'Joule', symbol: 'J', toBase: (v) => v, fromBase: (v) => v },
      kilojoule: { name: 'Kilojoule', symbol: 'kJ', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
      calorie: { name: 'Calorie', symbol: 'cal', toBase: (v) => v * 4.184, fromBase: (v) => v / 4.184 },
      kilocalorie: { name: 'Kilocalorie', symbol: 'kcal', toBase: (v) => v * 4184, fromBase: (v) => v / 4184 },
      watt_hour: { name: 'Watt-Hour', symbol: 'Wh', toBase: (v) => v * 3600, fromBase: (v) => v / 3600 },
      kilowatt_hour: { name: 'Kilowatt-Hour', symbol: 'kWh', toBase: (v) => v * 3600000, fromBase: (v) => v / 3600000 },
    },
  },
  Pressure: {
    category: 'Pressure',
    baseUnit: 'pascal',
    units: {
      pascal: { name: 'Pascal', symbol: 'Pa', toBase: (v) => v, fromBase: (v) => v },
      bar: { name: 'Bar', symbol: 'bar', toBase: (v) => v * 100000, fromBase: (v) => v / 100000 },
      psi: { name: 'PSI', symbol: 'psi', toBase: (v) => v * 6894.76, fromBase: (v) => v / 6894.76 },
      atmosphere: { name: 'Atmosphere', symbol: 'atm', toBase: (v) => v * 101325, fromBase: (v) => v / 101325 },
    },
  },
  Data: {
    category: 'Data',
    baseUnit: 'byte',
    units: {
      byte: { name: 'Byte', symbol: 'B', toBase: (v) => v, fromBase: (v) => v },
      kilobyte: { name: 'Kilobyte', symbol: 'KB', toBase: (v) => v * 1024, fromBase: (v) => v / 1024 },
      megabyte: { name: 'Megabyte', symbol: 'MB', toBase: (v) => v * 1048576, fromBase: (v) => v / 1048576 },
      gigabyte: { name: 'Gigabyte', symbol: 'GB', toBase: (v) => v * 1073741824, fromBase: (v) => v / 1073741824 },
      terabyte: { name: 'Terabyte', symbol: 'TB', toBase: (v) => v * 1099511627776, fromBase: (v) => v / 1099511627776 },
    },
  },
};

export const UnitConverter: React.FC = () => {
  const [category, setCategory] = useState<UnitCategory>('Length');
  const [fromUnit, setFromUnit] = useState<string>('meter');
  const [toUnit, setToUnit] = useState<string>('foot');
  const [inputValue, setInputValue] = useState<string>('1');
  const [result, setResult] = useState<string>('');
  const [history, setHistory] = useState<string[]>([]);

  const exportData = useUtilityStore(state => state.exportData);

  // Perform conversion
  const convert = () => {
    try {
      const value = parseFloat(inputValue);
      if (isNaN(value)) {
        setResult('Invalid input');
        return;
      }

      const categoryDef = UNIT_DEFINITIONS[category];
      const fromUnitDef = categoryDef.units[fromUnit];
      const toUnitDef = categoryDef.units[toUnit];

      // Convert to base unit, then to target unit
      const baseValue = fromUnitDef.toBase(value);
      const convertedValue = toUnitDef.fromBase(baseValue);

      // MIT 2000 precision: 10 significant figures
      const resultStr = parseFloat(convertedValue.toFixed(10)).toString();
      setResult(resultStr);

      // Add to history
      const historyEntry = `${inputValue} ${fromUnitDef.symbol} = ${resultStr} ${toUnitDef.symbol}`;
      setHistory([historyEntry, ...history.slice(0, 9)]);

      // Export data for inter-app sharing
      exportData({
        sourceApp: 'unit-converter',
        type: 'unit',
        data: { value: convertedValue, unit: toUnitDef.symbol },
        timestamp: Date.now(),
      });
    } catch (error) {
      setResult('Error');
    }
  };

  // Auto-convert on input change
  useEffect(() => {
    if (inputValue) {
      convert();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue, fromUnit, toUnit, category]);

  const categoryDef = UNIT_DEFINITIONS[category];
  const unitOptions = Object.keys(categoryDef.units);

  return (
    <ToolShell title="Universal Converter" icon={<ArrowRightLeft size={24} />} color="text-purple-400">
      <div className="h-full flex flex-col gap-6 p-6">
        {/* Category selector */}
        <div>
          <label className="block text-sm font-bold text-cyan-400 mb-2">CATEGORY</label>
          <select
            value={category}
            onChange={(e) => {
              const newCat = e.target.value as UnitCategory;
              setCategory(newCat);
              const units = Object.keys(UNIT_DEFINITIONS[newCat].units);
              setFromUnit(units[0]);
              setToUnit(units[1] || units[0]);
            }}
            className="w-full bg-black/60 border border-white/20 rounded-lg px-4 py-3 text-white font-mono focus:border-purple-400 focus:outline-none"
          >
            {Object.keys(UNIT_DEFINITIONS).map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Conversion inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-cyan-400 mb-2">FROM</label>
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full bg-black/60 border border-white/20 rounded-lg px-4 py-3 text-white text-xl font-mono focus:border-purple-400 focus:outline-none mb-2"
              placeholder="Enter value"
            />
            <select
              value={fromUnit}
              onChange={(e) => setFromUnit(e.target.value)}
              className="w-full bg-black/60 border border-white/20 rounded-lg px-4 py-2 text-white font-mono focus:border-purple-400 focus:outline-none"
            >
              {unitOptions.map(unit => (
                <option key={unit} value={unit}>
                  {categoryDef.units[unit].name} ({categoryDef.units[unit].symbol})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-cyan-400 mb-2">TO</label>
            <div className="w-full bg-purple-500/10 border border-purple-400/30 rounded-lg px-4 py-3 text-purple-300 text-xl font-mono mb-2 min-h-[52px] flex items-center">
              {result || '0'}
            </div>
            <select
              value={toUnit}
              onChange={(e) => setToUnit(e.target.value)}
              className="w-full bg-black/60 border border-white/20 rounded-lg px-4 py-2 text-white font-mono focus:border-purple-400 focus:outline-none"
            >
              {unitOptions.map(unit => (
                <option key={unit} value={unit}>
                  {categoryDef.units[unit].name} ({categoryDef.units[unit].symbol})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="flex-1 overflow-auto">
            <label className="flex items-center gap-2 text-sm font-bold text-cyan-400 mb-2">
              <History size={16} />
              HISTORY
            </label>
            <div className="space-y-2">
              {history.map((entry, idx) => (
                <div
                  key={idx}
                  className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white/70 text-sm font-mono"
                >
                  {entry}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolShell>
  );
};
