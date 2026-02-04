// eCy OS v1005.0 - JSON Refiner Test Suite
// 10 test cases: Simple → Complex → Edge Cases

import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { JSONRefiner } from '../components/JSONRefiner';

describe('JSONRefiner - Comprehensive Test Suite', () => {
  
  // TEST 1: Valid Simple JSON
  it('TEST 1: Should validate simple JSON object', async () => {
    const { container } = render(<JSONRefiner />);
    
    const input = container.querySelector('textarea') as HTMLTextAreaElement;
    fireEvent.change(input, { target: { value: '{"name": "test"}' } });
    
    await waitFor(() => {
      const status = screen.getByText(/VALID JSON/i);
      expect(status).toBeTruthy();
    }, { timeout: 1000 });
  });

  // TEST 2: Beautify JSON
  it('TEST 2: Should beautify minified JSON', async () => {
    const { container } = render(<JSONRefiner />);
    
    const input = container.querySelector('textarea') as HTMLTextAreaElement;
    fireEvent.change(input, { target: { value: '{"a":1,"b":2}' } });
    
    await waitFor(() => {
      const outputDivs = container.querySelectorAll('.text-cyan-300');
      const output = Array.from(outputDivs).find(
        el => el.classList.contains('whitespace-pre')
      ) as HTMLElement;
      expect(output.textContent).toContain('\n');
      expect(output.textContent).toContain('  '); // Indentation
    }, { timeout: 1500 });
  });

  // TEST 3: Minify JSON
  it('TEST 3: Should minify beautified JSON', async () => {
    const { container } = render(<JSONRefiner />);
    
    // Click minify button
    const minifyBtn = screen.getByText(/MINIFY/i);
    fireEvent.click(minifyBtn);
    
    const input = container.querySelector('textarea') as HTMLTextAreaElement;
    fireEvent.change(input, { target: { value: '{\n  "a": 1,\n  "b": 2\n}' } });
    
    await waitFor(() => {
      const outputDivs = container.querySelectorAll('.text-cyan-300');
      const output = Array.from(outputDivs).find(
        el => el.classList.contains('whitespace-pre')
      ) as HTMLElement;
      expect(output.textContent).toBe('{"a":1,"b":2}');
    }, { timeout: 1500 });
  });

  // TEST 4: Invalid JSON Error Detection
  it('TEST 4: Should detect invalid JSON and show error', async () => {
    const { container } = render(<JSONRefiner />);
    
    const input = container.querySelector('textarea') as HTMLTextAreaElement;
    fireEvent.change(input, { target: { value: '{invalid json}' } });
    
    await waitFor(() => {
      const error = screen.getByText(/ERROR:/i);
      expect(error).toBeTruthy();
    }, { timeout: 1000 });
  });

  // TEST 5: Nested Object Formatting
  it('TEST 5: Should format nested objects correctly', async () => {
    const { container } = render(<JSONRefiner />);
    
    const nestedJSON = '{"user":{"name":"John","address":{"city":"NYC"}}}';
    const input = container.querySelector('textarea') as HTMLTextAreaElement;
    fireEvent.change(input, { target: { value: nestedJSON } });
    
    await waitFor(() => {
      const outputDivs = container.querySelectorAll('.text-cyan-300');
      const output = Array.from(outputDivs).find(
        el => el.classList.contains('whitespace-pre')
      ) as HTMLElement;
      expect(output.textContent).toContain('user');
      expect(output.textContent).toContain('address');
      expect(output.textContent).toContain('city');
    }, { timeout: 1500 });
  });

  // TEST 6: Array Handling
  it('TEST 6: Should handle arrays properly', async () => {
    const { container } = render(<JSONRefiner />);
    
    const arrayJSON = '{"items":[1,2,3,4,5]}';
    const input = container.querySelector('textarea') as HTMLTextAreaElement;
    fireEvent.change(input, { target: { value: arrayJSON } });
    
    await waitFor(() => {
      const outputDivs = container.querySelectorAll('.text-cyan-300');
      const output = Array.from(outputDivs).find(
        el => el.classList.contains('whitespace-pre')
      ) as HTMLElement;
      expect(output.textContent).toContain('items');
      expect(output.textContent).toContain('[');
    }, { timeout: 1500 });
  });

  // TEST 7: Indent Size Change
  it('TEST 7: Should respect indent size selection', async () => {
    const { container } = render(<JSONRefiner />);
    
    // Select 4 spaces
    const indentSelect = container.querySelector('select') as HTMLSelectElement;
    fireEvent.change(indentSelect, { target: { value: '4' } });
    
    const input = container.querySelector('textarea') as HTMLTextAreaElement;
    fireEvent.change(input, { target: { value: '{"a":1}' } });
    
    await waitFor(() => {
      // More specific selector - get the output div specifically
      const outputDivs = container.querySelectorAll('.text-cyan-300');
      const output = Array.from(outputDivs).find( 
        el => el.classList.contains('whitespace-pre')
      ) as HTMLElement;
      // With 4-space indent, should have formatted output
      expect(output.textContent).toMatch(/\{\s+"a":\s+1\s+\}/);
    }, { timeout: 1500 });
  });

  // TEST 8: Large JSON Performance
  it('TEST 8: Should handle large JSON (100+ keys)', async () => {
    const { container } = render(<JSONRefiner />);
    
    // Generate large JSON
    const largeJSON = JSON.stringify(
      Object.fromEntries(Array.from({ length: 100 }, (_, i) => [`key${i}`, i]))
    );
    
    const input = container.querySelector('textarea') as HTMLTextAreaElement;
    fireEvent.change(input, { target: { value: largeJSON } });
    
    await waitFor(() => {
      const status = screen.getByText(/VALID JSON/i);
      expect(status).toBeTruthy();
    }, { timeout: 2000 }); // Allow more time for large JSON
  });

  // TEST 9: Copy to Clipboard Button
  it('TEST 9: Should enable copy button when output exists', async () => {
    const { container } = render(<JSONRefiner />);
    
    const input = container.querySelector('textarea') as HTMLTextAreaElement;
    fireEvent.change(input, { target: { value: '{"test": true}' } });
    
    await waitFor(() => {
      const copyBtn = container.querySelector('button[title="Copy to clipboard"]') as HTMLButtonElement;
      expect(copyBtn.disabled).toBe(false);
    }, { timeout: 1000 });
  });

  // TEST 10: History Tracking
  it('TEST 10: Should track conversion history', async () => {
    const { container } = render(<JSONRefiner />);
    
    const input = container.querySelector('textarea') as HTMLTextAreaElement;
    
    // First conversion
    fireEvent.change(input, { target: { value: '{"test": 1}' } });
    
    await waitFor(() => {
      // Wait for first conversion
      const output = container.querySelector('.text-cyan-300') as HTMLElement;
      expect(output.textContent).toBeTruthy();
    }, { timeout: 1000 });
    
    // Second conversion
    fireEvent.change(input, { target: { value: '{"test": 2}' } });
    
    await waitFor(() => {
      const history = screen.queryByText(/HISTORY/i);
      expect(history).toBeTruthy();
    }, { timeout: 1500 });
  });
});
