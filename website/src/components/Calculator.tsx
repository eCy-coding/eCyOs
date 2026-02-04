/**
 * Omni-Calculator - MIT 2000 Standards Compliant
 * Modes: Scientific, Programmer, Basic
 * Features: Trigonometry, Logarithms, Powers, Roots, Hex/Bin/Oct, Bitwise Operations
 */

import { useReducer, type ReactNode } from 'react';
import { evaluate, format } from 'mathjs';
import './Calculator.module.css';

type CalculatorMode = 'basic' | 'scientific' | 'programmer' | 'graphing';
type NumberBase = 'DEC' | 'HEX' | 'BIN' | 'OCT';

interface CalculatorState {
  display: string;
  expression: string;
  mode: CalculatorMode;
  base: NumberBase;
  memory: number;
  history: string[];
  error: string | null;
}

type CalculatorAction =
  | { type: 'APPEND'; payload: string }
  | { type: 'OPERATION'; payload: string }
  | { type: 'CALCULATE' }
  | { type: 'CLEAR' }
  | { type: 'CLEAR_ENTRY' }
  | { type: 'SET_MODE'; payload: CalculatorMode }
  | { type: 'SET_BASE'; payload: NumberBase }
  | { type: 'SCIENTIFIC_FUNC'; payload: 'sin' | 'cos' | 'tan' | 'log' | 'ln' | 'sqrt' | 'pi' | 'e' }
  | { type: 'BITWISE'; payload: '&' | '|' | '^' | '~' | '<<' | '>>' }
  | { type: 'BACKSPACE' };

const initialState: CalculatorState = {
  display: '0',
  expression: '',
  mode: 'basic',
  base: 'DEC',
  memory: 0,
  history: [],
  error: null
};

function calculatorReducer(state: CalculatorState, action: CalculatorAction): CalculatorState {
  switch (action.type) {
    case 'APPEND': {
      const newDisplay = state.display === '0' ? action.payload : state.display + action.payload;
      return { ...state, display: newDisplay, error: null };
    }

    case 'OPERATION': {
      return {
        ...state,
        expression: state.expression + state.display + action.payload,
        display: '0',
        error: null
      };
    }

    case 'CALCULATE': {
      try {
        const fullExpression = state.expression + state.display;
        
        // Use math.js for precise calculation
        const result = evaluate(fullExpression);
        const formatted = format(result, { precision: 14 });
        
        return {
          ...state,
          display: formatted,
          expression: '',
          history: [...state.history, `${fullExpression} = ${formatted}`].slice(-10),
          error: null
        };
      } catch (err) {
        return {
          ...state,
          error: err instanceof Error ? err.message : 'Calculation Error',
          display: 'Error'
        };
      }
    }

    case 'CLEAR': {
      return { ...initialState, mode: state.mode, base: state.base };
    }

    case 'CLEAR_ENTRY': {
      return { ...state, display: '0', error: null };
    }

    case 'SET_MODE': {
      return { ...state, mode: action.payload, display: '0', expression: '', error: null };
    }

    case 'SET_BASE': {
      try {
        // Convert current display to new base
        const decimal = state.base === 'DEC' ? parseInt(state.display, 10) :
                       state.base === 'HEX' ? parseInt(state.display, 16) :
                       state.base === 'BIN' ? parseInt(state.display, 2) :
                       parseInt(state.display, 8);

        const newDisplay = action.payload === 'DEC' ? decimal.toString(10) :
                          action.payload === 'HEX' ? decimal.toString(16).toUpperCase() :
                          action.payload === 'BIN' ? decimal.toString(2) :
                          decimal.toString(8);

        return { ...state, base: action.payload, display: newDisplay, error: null };
      } catch {
        return { ...state, base: action.payload, display: '0', error: 'Conversion Error' };
      }
    }

    case 'SCIENTIFIC_FUNC': {
      try {
        const value = parseFloat(state.display);
        let result: number;

        switch (action.payload) {
          case 'sin':
            result = evaluate(`sin(${value})`);
            break;
          case 'cos':
            result = evaluate(`cos(${value})`);
            break;
          case 'tan':
            result = evaluate(`tan(${value})`);
            break;
          case 'log':
            result = evaluate(`log10(${value})`);
            break;
          case 'ln':
            result = evaluate(`log(${value})`);
            break;
          case 'sqrt':
            result = evaluate(`sqrt(${value})`);
            break;
          case 'pi':
            result = Math.PI;
            break;
          case 'e':
            result = Math.E;
            break;
          default:
            result = value;
        }

        return { ...state, display: format(result, { precision: 14 }), error: null };
      } catch (err) {
        return { ...state, error: 'Math Error', display: 'Error' };
      }
    }

    case 'BITWISE': {
      try {
        const a = parseInt(state.display, state.base === 'DEC' ? 10 : state.base === 'HEX' ? 16 : state.base === 'BIN' ? 2 : 8);
        let result: number;

        switch (action.payload) {
          case '~':
            result = ~a;
            break;
          default:
            // For binary ops, need second operand - store in expression
            return { ...state, expression: state.display + action.payload, display: '0' };
        }

        const formatted = state.base === 'DEC' ? result.toString(10) :
                         state.base === 'HEX' ? result.toString(16).toUpperCase() :
                         state.base === 'BIN' ? result.toString(2) :
                         result.toString(8);

        return { ...state, display: formatted, error: null };
      } catch {
        return { ...state, error: 'Bitwise Error', display: 'Error' };
      }
    }

    case 'BACKSPACE': {
      const newDisplay = state.display.length > 1 ? state.display.slice(0, -1) : '0';
      return { ...state, display: newDisplay };
    }

    default:
      return state;
  }
}

interface CalculatorProps {
  demoMode?: boolean;
  children?: ReactNode;
}

export function Calculator({ demoMode: _demoMode = false }: CalculatorProps) {
  const [state, dispatch] = useReducer(calculatorReducer, initialState);

  const handleNumber = (num: string) => dispatch({ type: 'APPEND', payload: num });
  const handleOperation = (op: string) => dispatch({ type: 'OPERATION', payload: op });
  const handleCalculate = () => dispatch({ type: 'CALCULATE' });
  const handleClear = () => dispatch({ type: 'CLEAR' });
  const handleClearEntry = () => dispatch({ type: 'CLEAR_ENTRY' });

  return (
    <div className="calculator-container">
      {/* Mode Selector */}
      <div className="mode-selector">
        {(['basic', 'scientific', 'programmer'] as const).map(mode => (
          <button
            key={mode}
            onClick={() => dispatch({ type: 'SET_MODE', payload: mode })}
            className={`mode-btn ${state.mode === mode ? 'active' : ''}`}
          >
            {mode.charAt(0).toUpperCase() + mode.slice(1)}
          </button>
        ))}
      </div>

      {/* Display */}
      <div className="display-section">
        <div className="expression">{state.expression || '\u00A0'}</div>
        <div 
          className="display" 
          data-testid="calculator-display"
        >
          {state.display}
        </div>
        <div 
          className="result" 
          data-testid="calculator-result"
        >
          {state.error || '\u00A0'}
        </div>
      </div>

      {/* Programmer Mode Base Selector */}
      {state.mode === 'programmer' && (
        <div className="base-selector">
          {(['DEC', 'HEX', 'BIN', 'OCT'] as const).map(base => (
            <button
              key={base}
              onClick={() => dispatch({ type: 'SET_BASE', payload: base })}
              className={`base-btn ${state.base === base ? 'active' : ''}`}
            >
              {base}
            </button>
          ))}
        </div>
      )}

      {/* Button Grid */}
      <div className="button-grid">
        {/* Scientific Functions */}
        {state.mode === 'scientific' && (
          <div className="scientific-row">
            <button onClick={() => dispatch({ type: 'SCIENTIFIC_FUNC', payload: 'sin' })}>sin</button>
            <button onClick={() => dispatch({ type: 'SCIENTIFIC_FUNC', payload: 'cos' })}>cos</button>
            <button onClick={() => dispatch({ type: 'SCIENTIFIC_FUNC', payload: 'tan' })}>tan</button>
            <button onClick={() => dispatch({ type: 'SCIENTIFIC_FUNC', payload: 'log' })}>log</button>
            <button onClick={() => dispatch({ type: 'SCIENTIFIC_FUNC', payload: 'ln' })}>ln</button>
            <button onClick={() => dispatch({ type: 'SCIENTIFIC_FUNC', payload: 'sqrt' })}>√</button>
            <button onClick={() => dispatch({ type: 'OPERATION', payload: '^' })}>x^y</button>
            <button onClick={() => dispatch({ type: 'SCIENTIFIC_FUNC', payload: 'pi' })}>π</button>
            <button onClick={() => dispatch({ type: 'SCIENTIFIC_FUNC', payload: 'e' })}>e</button>
          </div>
        )}

        {/* Programmer Functions */}
        {state.mode === 'programmer' && (
          <div className="programmer-row">
            <button onClick={() => dispatch({ type: 'BITWISE', payload: '&' })}>AND</button>
            <button onClick={() => dispatch({ type: 'BITWISE', payload: '|' })}>OR</button>
            <button onClick={() => dispatch({ type: 'BITWISE', payload: '^' })}>XOR</button>
            <button onClick={() => dispatch({ type: 'BITWISE', payload: '~' })}>NOT</button>
            <button onClick={() => dispatch({ type: 'BITWISE', payload: '<<' })}>&lt;&lt;</button>
            <button onClick={() => dispatch({ type: 'BITWISE', payload: '>>' })}>&gt;&gt;</button>
            {state.base === 'HEX' && (
              <>
                <button onClick={() => handleNumber('A')}>A</button>
                <button onClick={() => handleNumber('B')}>B</button>
                <button onClick={() => handleNumber('C')}>C</button>
                <button onClick={() => handleNumber('D')}>D</button>
                <button onClick={() => handleNumber('E')}>E</button>
                <button onClick={() => handleNumber('F')}>F</button>
              </>
            )}
          </div>
        )}

        {/* Standard Number Pad */}
        <div className="number-pad">
          <button onClick={handleClear} className="operator">C</button>
          <button onClick={handleClearEntry} className="operator">CE</button>
          <button onClick={() => dispatch({ type: 'BACKSPACE' })} className="operator">⌫</button>
          <button onClick={() => handleOperation('/')} className="operator">÷</button>

          <button onClick={() => handleNumber('7')}>7</button>
          <button onClick={() => handleNumber('8')}>8</button>
          <button onClick={() => handleNumber('9')}>9</button>
          <button onClick={() => handleOperation('*')} className="operator">×</button>

          <button onClick={() => handleNumber('4')}>4</button>
          <button onClick={() => handleNumber('5')}>5</button>
          <button onClick={() => handleNumber('6')}>6</button>
          <button onClick={() => handleOperation('-')} className="operator">-</button>

          <button onClick={() => handleNumber('1')}>1</button>
          <button onClick={() => handleNumber('2')}>2</button>
          <button onClick={() => handleNumber('3')}>3</button>
          <button onClick={() => handleOperation('+')} className="operator">+</button>

          <button onClick={() => handleNumber('0')} className="zero">0</button>
          <button onClick={() => handleNumber('.')}>.</button>
          <button onClick={handleCalculate} className="equals">=</button>
        </div>
      </div>

      {/* History */}
      {state.history.length > 0 && (
        <div className="history">
          <h4>History:</h4>
          {state.history.slice(-3).map((entry, i) => (
            <div key={i} className="history-entry">{entry}</div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Calculator;
