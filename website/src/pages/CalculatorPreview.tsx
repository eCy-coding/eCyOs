import React from "react";
import { Calculator } from "../components/Calculator";

/**
 * CalculatorPreview Page
 * Renders the Calculator component in isolation for testing and preview.
 * This page is accessible via the `/calculator-preview` route.
 */
const CalculatorPreview: React.FC = () => {
  return (
    <div style={{ padding: "2rem", display: "flex", justifyContent: "center" }}>
      <Calculator />
    </div>
  );
};

export default CalculatorPreview;
