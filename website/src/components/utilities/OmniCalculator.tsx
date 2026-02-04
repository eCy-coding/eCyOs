import React, { useState, useCallback, useRef, useEffect } from 'react';
import { create, all } from 'mathjs';
import type { MathJsInstance } from 'mathjs';
import styles from './OmniCalculator.module.css';

// Initialize math.js with all functions
const math: MathJsInstance = create(all);

type CalculatorMode = 'scientific' | 'programmer' | 'graphical';
type NumberBase = 'DEC' | 'HEX' | 'BIN' | 'OCT';

interface HistoryEntry {
  expression: string;
  result: string;
  timestamp: number;
}

const OmniCalculator: React.FC = () => {
  const [mode, setMode] = useState<CalculatorMode>('scientific');
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [base, setBase] = useState<NumberBase>('DEC');
  const [graphEquation, setGraphEquation] = useState('sin(x)');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Scientific calculator functions
  const handleNumberClick = useCallback((num: string) => {
    setDisplay(prev => {
      if (prev === '0' || prev === 'Error') return num;
      return prev + num;
    });
  }, []);

  const handleOperatorClick = useCallback((op: string) => {
    setExpression(prev => prev + display + ' ' + op + ' ');
    setDisplay('0');
  }, [display]);

  const handleFunctionClick = useCallback((func: string) => {
    try {
      let result: number;
      const value = parseFloat(display);

      switch (func) {
        case 'sin':
          result = Number(math.sin(value));
          break;
        case 'cos':
          result = Number(math.cos(value));
          break;
        case 'tan':
          result = Number(math.tan(value));
          break;
        case 'sqrt':
          result = Number(math.sqrt(value));
          break;
        case 'log':
          result = Number(math.log10(value));
          break;
        case 'ln':
          result = Number(math.log(value));
          break;
        case 'x^2':
          result = Number(math.pow(value, 2));
          break;
        case '1/x':
          result = 1 / value;
          break;
        case 'e^x':
          result = Number(math.exp(value));
          break;
        case '!':
          result = Number(math.factorial(value));
          break;
        case 'abs':
          result = Number(math.abs(value));
          break;
        case 'π':
          setDisplay(math.pi.toString());
          return;
        case 'e':
          setDisplay(math.e.toString());
          return;
        default:
          result = value;
      }

      setDisplay(result.toString());
      setHistory(prev => [{
        expression: `${func}(${value})`,
        result: result.toString(),
        timestamp: Date.now()
      }, ...prev.slice(0, 19)]);
    } catch (error) {
      setDisplay('Error');
      console.error('Function error:', error);
    }
  }, [display]);

  const handleClear = useCallback(() => {
    setDisplay('0');
    setExpression('');
  }, []);

  const handleEquals = useCallback(() => {
    try {
      const fullExpression = expression + display;
      const result = math.evaluate(fullExpression);
      const resultStr = typeof result === 'number' ? result.toString() : String(result);
      
      setDisplay(resultStr);
      setHistory(prev => [{
        expression: fullExpression,
        result: resultStr,
        timestamp: Date.now()
      }, ...prev.slice(0, 19)]);
      setExpression('');
    } catch (error) {
      setDisplay('Error');
      console.error('Calculation error:', error);
    }
  }, [expression, display]);

  // Programmer mode functions
  const handleBaseConversion = useCallback((targetBase: NumberBase) => {
    try {
      let decimal: number;

      // Convert current display to decimal
      switch (base) {
        case 'HEX':
          decimal = parseInt(display, 16);
          break;
        case 'BIN':
          decimal = parseInt(display, 2);
          break;
        case 'OCT':
          decimal = parseInt(display, 8);
          break;
        default:
          decimal = parseInt(display, 10);
      }

      // Convert decimal to target base
      let result: string;
      switch (targetBase) {
        case 'HEX':
          result = decimal.toString(16).toUpperCase();
          break;
        case 'BIN':
          result = decimal.toString(2);
          break;
        case 'OCT':
          result = decimal.toString(8);
          break;
        default:
          result = decimal.toString(10);
      }

      setDisplay(result);
      setBase(targetBase);
    } catch (error) {
      setDisplay('Error');
      console.error('Base conversion error:', error);
    }
  }, [display, base]);

  const handleBitwiseOperation = useCallback((operation: string) => {
    try {
      const value = parseInt(display, base === 'HEX' ? 16 : base === 'BIN' ? 2 : base === 'OCT' ? 8 : 10);
      let result: number;

      switch (operation) {
        case 'NOT':
          result = ~value;
          break;
        case 'AND':
          setExpression(prev => prev + display + ' AND ');
          setDisplay('0');
          return;
        case 'OR':
          setExpression(prev => prev + display + ' OR ');
          setDisplay('0');
          return;
        case 'XOR':
          setExpression(prev => prev + display + ' XOR ');
          setDisplay('0');
          return;
        case '<<':
          result = value << 1;
          break;
        case '>>':
          result = value >> 1;
          break;
        default:
          result = value;
      }

      const resultStr = base === 'HEX' ? result.toString(16).toUpperCase() :
                        base === 'BIN' ? result.toString(2) :
                        base === 'OCT' ? result.toString(8) :
                        result.toString(10);

      setDisplay(resultStr);
      setHistory(prev => [{
        expression: `${operation}(${display})`,
        result: resultStr,
        timestamp: Date.now()
      }, ...prev.slice(0, 19)]);
    } catch (error) {
      setDisplay('Error');
      console.error('Bitwise operation error:', error);
    }
  }, [display, base]);

  // Graphical mode - plot equation
  useEffect(() => {
    if (mode !== 'graphical' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    
    // Vertical lines
    for (let x = 0; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y < height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw axes
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    
    // Y-axis
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.stroke();

    // X-axis
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    // Plot equation
    try {
      ctx.strokeStyle = '#00ffff';
      ctx.lineWidth = 2;
      ctx.beginPath();

      const xMin = -10;
      const xMax = 10;
      const xScale = width / (xMax - xMin);
      const yScale = height / 20;

      let firstPoint = true;

      for (let px = 0; px < width; px += 2) {
        const x = xMin + (px / xScale);
        try {
          const y = math.evaluate(graphEquation.replace(/x/g, `(${x})`)) as number;
          const py = height / 2 - y * yScale;

          if (Math.abs(py) < height * 2) {
            if (firstPoint) {
              ctx.moveTo(px, py);
              firstPoint = false;
            } else {
              ctx.lineTo(px, py);
            }
          }
        } catch {
          firstPoint = true;
        }
      }

      ctx.stroke();
    } catch (error) {
      console.error('Graph plotting error:', error);
    }
  }, [mode, graphEquation]);

  // Render mode-specific keypads
  const renderScientificKeypad = () => (
    <div className={`${styles.keypad} ${styles.scientificKeypad}`}>
      <button className={`${styles.calculatorButton} ${styles.buttonFunction}`} onClick={() => handleFunctionClick('sin')}>SIN</button>
      <button className={`${styles.calculatorButton} ${styles.buttonFunction}`} onClick={() => handleFunctionClick('cos')}>COS</button>
      <button className={`${styles.calculatorButton} ${styles.buttonFunction}`} onClick={() => handleFunctionClick('tan')}>TAN</button>
      <button className={`${styles.calculatorButton} ${styles.buttonFunction}`} onClick={() => handleFunctionClick('π')}>π</button>
      <button className={`${styles.calculatorButton} ${styles.buttonFunction}`} onClick={() => handleFunctionClick('e')}>e</button>

      <button className={`${styles.calculatorButton} ${styles.buttonFunction}`} onClick={() => handleFunctionClick('log')}>LOG</button>
      <button className={`${styles.calculatorButton} ${styles.buttonFunction}`} onClick={() => handleFunctionClick('ln')}>LN</button>
      <button className={`${styles.calculatorButton} ${styles.buttonFunction}`} onClick={() => handleFunctionClick('x^2')}>x²</button>
      <button className={`${styles.calculatorButton} ${styles.buttonFunction}`} onClick={() => handleFunctionClick('sqrt')}>√</button>
      <button className={`${styles.calculatorButton} ${styles.buttonFunction}`} onClick={() => handleFunctionClick('!')}>x!</button>

      <button className={`${styles.calculatorButton} ${styles.buttonNumber}`} onClick={() => handleNumberClick('7')}>7</button>
      <button className={`${styles.calculatorButton} ${styles.buttonNumber}`} onClick={() => handleNumberClick('8')}>8</button>
      <button className={`${styles.calculatorButton} ${styles.buttonNumber}`} onClick={() => handleNumberClick('9')}>9</button>
      <button className={`${styles.calculatorButton} ${styles.buttonOperator}`} onClick={() => handleOperatorClick('+')}>+</button>
      <button className={`${styles.calculatorButton} ${styles.buttonFunction}`} onClick={() => handleFunctionClick('1/x')}>1/x</button>

      <button className={`${styles.calculatorButton} ${styles.buttonNumber}`} onClick={() => handleNumberClick('4')}>4</button>
      <button className={`${styles.calculatorButton} ${styles.buttonNumber}`} onClick={() => handleNumberClick('5')}>5</button>
      <button className={`${styles.calculatorButton} ${styles.buttonNumber}`} onClick={() => handleNumberClick('6')}>6</button>
      <button className={`${styles.calculatorButton} ${styles.buttonOperator}`} onClick={() => handleOperatorClick('-')}>−</button>
      <button className={`${styles.calculatorButton} ${styles.buttonFunction}`} onClick={() => handleFunctionClick('abs')}>ABS</button>

      <button className={`${styles.calculatorButton} ${styles.buttonNumber}`} onClick={() => handleNumberClick('1')}>1</button>
      <button className={`${styles.calculatorButton} ${styles.buttonNumber}`} onClick={() => handleNumberClick('2')}>2</button>
      <button className={`${styles.calculatorButton} ${styles.buttonNumber}`} onClick={() => handleNumberClick('3')}>3</button>
      <button className={`${styles.calculatorButton} ${styles.buttonOperator}`} onClick={() => handleOperatorClick('*')}>×</button>
      <button className={`${styles.calculatorButton} ${styles.buttonFunction}`} onClick={() => handleFunctionClick('e^x')}>eˣ</button>

      <button className={`${styles.calculatorButton} ${styles.buttonNumber}`} onClick={() => handleNumberClick('0')}>0</button>
      <button className={`${styles.calculatorButton} ${styles.buttonNumber}`} onClick={() => handleNumberClick('.')}>.</button>
      <button className={`${styles.calculatorButton} ${styles.buttonClear}`} onClick={handleClear}>CLEAR</button>
      <button className={`${styles.calculatorButton} ${styles.buttonOperator}`} onClick={() => handleOperatorClick('/')}>÷</button>
      <button className={`${styles.calculatorButton} ${styles.buttonEquals}`} onClick={handleEquals}>=</button>
    </div>
  );

  const renderProgrammerKeypad = () => (
    <>
      <div className={styles.baseSelector}>
        <button 
          className={`${styles.baseButton} ${base === 'DEC' ? styles.active : ''}`}
          onClick={() => handleBaseConversion('DEC')}
        >
          DEC
        </button>
        <button 
          className={`${styles.baseButton} ${base === 'HEX' ? styles.active : ''}`}
          onClick={() => handleBaseConversion('HEX')}
        >
          HEX
        </button>
        <button 
          className={`${styles.baseButton} ${base === 'BIN' ? styles.active : ''}`}
          onClick={() => handleBaseConversion('BIN')}
        >
          BIN
        </button>
        <button 
          className={`${styles.baseButton} ${base === 'OCT' ? styles.active : ''}`}
          onClick={() => handleBaseConversion('OCT')}
        >
          OCT
        </button>
      </div>

      <div className={`${styles.keypad} ${styles.programmerKeypad}`}>
        <button className={`${styles.calculatorButton} ${styles.buttonFunction}`} onClick={() => handleBitwiseOperation('AND')}>AND</button>
        <button className={`${styles.calculatorButton} ${styles.buttonFunction}`} onClick={() => handleBitwiseOperation('OR')}>OR</button>
        <button className={`${styles.calculatorButton} ${styles.buttonFunction}`} onClick={() => handleBitwiseOperation('XOR')}>XOR</button>
        <button className={`${styles.calculatorButton} ${styles.buttonFunction}`} onClick={() => handleBitwiseOperation('NOT')}>NOT</button>
        <button className={`${styles.calculatorButton} ${styles.buttonFunction}`} onClick={() => handleBitwiseOperation('<<')}>{'<<'}</button>

        {base === 'HEX' && (
          <>
            <button className={`${styles.calculatorButton} ${styles.buttonNumber}`} onClick={() => handleNumberClick('A')}>A</button>
            <button className={`${styles.calculatorButton} ${styles.buttonNumber}`} onClick={() => handleNumberClick('B')}>B</button>
            <button className={`${styles.calculatorButton} ${styles.buttonNumber}`} onClick={() => handleNumberClick('C')}>C</button>
            <button className={`${styles.calculatorButton} ${styles.buttonNumber}`} onClick={() => handleNumberClick('D')}>D</button>
            <button className={`${styles.calculatorButton} ${styles.buttonNumber}`} onClick={() => handleNumberClick('E')}>E</button>
          </>
        )}

        <button className={`${styles.calculatorButton} ${styles.buttonNumber}`} onClick={() => handleNumberClick('7')}>7</button>
        <button className={`${styles.calculatorButton} ${styles.buttonNumber}`} onClick={() => handleNumberClick('8')}>8</button>
        <button className={`${styles.calculatorButton} ${styles.buttonNumber}`} onClick={() => handleNumberClick('9')}>9</button>
        <button className={`${styles.calculatorButton} ${styles.buttonOperator}`} onClick={() => handleOperatorClick('+')}>+</button>
        <button className={`${styles.calculatorButton} ${styles.buttonFunction}`} onClick={() => handleBitwiseOperation('>>')}>{'>>'}</button>

        <button className={`${styles.calculatorButton} ${styles.buttonNumber}`} onClick={() => handleNumberClick('4')}>4</button>
        <button className={`${styles.calculatorButton} ${styles.buttonNumber}`} onClick={() => handleNumberClick('5')}>5</button>
        <button className={`${styles.calculatorButton} ${styles.buttonNumber}`} onClick={() => handleNumberClick('6')}>6</button>
        <button className={`${styles.calculatorButton} ${styles.buttonOperator}`} onClick={() => handleOperatorClick('-')}>−</button>
        {base === 'HEX' && (
          <button className={`${styles.calculatorButton} ${styles.buttonNumber}`} onClick={() => handleNumberClick('F')}>F</button>
        )}

        <button className={`${styles.calculatorButton} ${styles.buttonNumber}`} onClick={() => handleNumberClick('1')}>1</button>
        <button className={`${styles.calculatorButton} ${styles.buttonNumber}`} onClick={() => handleNumberClick('2')}>2</button>
        <button className={`${styles.calculatorButton} ${styles.buttonNumber}`} onClick={() => handleNumberClick('3')}>3</button>
        <button className={`${styles.calculatorButton} ${styles.buttonOperator}`} onClick={() => handleOperatorClick('*')}>×</button>
        <button className={`${styles.calculatorButton} ${styles.buttonClear}`} onClick={handleClear}>CLR</button>

        <button className={`${styles.calculatorButton} ${styles.buttonNumber}`} onClick={() => handleNumberClick('0')}>0</button>
        <button className={`${styles.calculatorButton} ${styles.buttonOperator}`} onClick={() => handleOperatorClick('/')}>÷</button>
        <button className={`${styles.calculatorButton} ${styles.buttonEquals}`} onClick={handleEquals}>=</button>
      </div>
    </>
  );

  const renderGraphicalMode = () => (
    <>
      <div className={styles.graphControls}>
        <input
          type="text"
          className={styles.graphInput}
          value={graphEquation}
          onChange={(e) => setGraphEquation(e.target.value)}
          placeholder="Enter equation (e.g., sin(x), x^2, log(x))"
        />
      </div>
      <div className={styles.graphContainer}>
        <canvas
          ref={canvasRef}
          className={styles.graphCanvas}
          width={800}
          height={400}
        />
      </div>
    </>
  );

  return (
    <div className={styles.calculator}>
      <div className={styles.calculatorHeader}>
        <h2 className={styles.calculatorTitle}>⚡ OMNI-CALCULATOR</h2>
        <div className={styles.modeSelector}>
          <button
            className={`${styles.modeButton} ${mode === 'scientific' ? styles.active : ''}`}
            onClick={() => setMode('scientific')}
          >
            SCIENTIFIC
          </button>
          <button
            className={`${styles.modeButton} ${mode === 'programmer' ? styles.active : ''}`}
            onClick={() => setMode('programmer')}
          >
            PROGRAMMER
          </button>
          <button
            className={`${styles.modeButton} ${mode === 'graphical' ? styles.active : ''}`}
            onClick={() => setMode('graphical')}
          >
            GRAPHICAL
          </button>
        </div>
      </div>

      {mode !== 'graphical' && (
        <div className={styles.display}>
          <div className={styles.displayExpression}>{expression || ' '}</div>
          <div className={`${styles.displayResult} ${display === 'Error' ? styles.error : ''}`}>
            {display}
          </div>
          {mode === 'programmer' && (
            <div className={styles.displayBase}>
              {base} | DEC: {parseInt(display, base === 'HEX' ? 16 : base === 'BIN' ? 2 : base === 'OCT' ? 8 : 10) || 0}
            </div>
          )}
        </div>
      )}

      {mode === 'scientific' && renderScientificKeypad()}
      {mode === 'programmer' && renderProgrammerKeypad()}
      {mode === 'graphical' && renderGraphicalMode()}

      {mode !== 'graphical' && history.length > 0 && (
        <div className={styles.history}>
          <div className={styles.historyTitle}>History</div>
          {history.slice(0, 5).map((entry) => (
            <div
              key={entry.timestamp}
              className={styles.historyItem}
              onClick={() => {
                setExpression(entry.expression);
                setDisplay(entry.result);
              }}
            >
              {entry.expression} = {entry.result}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OmniCalculator;
