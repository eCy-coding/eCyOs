
export const LiquidGlass = {
  colors: {
    neonCyan: "#00f3ff",
    neonMagenta: "#bc13fe", 
    deepSpace: "#050510",
    glassBorder: "rgba(255, 255, 255, 0.1)",
    glassSurface: "rgba(255, 255, 255, 0.03)",
  },
  effects: {
    backdropBlur: "blur(20px)",
    glow: "0 0 20px rgba(0, 243, 255, 0.3)",
    textGlow: "0 0 10px rgba(0, 243, 255, 0.8)",
  },
  physics: {
    friction: 0.9,
    restitution: 0.8, // Bounciness
  },
  gradients: {
    liquid: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.01) 100%)",
  }
};

export const glassCardStyle = {
  background: LiquidGlass.colors.glassSurface,
  backdropFilter: LiquidGlass.effects.backdropBlur,
  border: `1px solid ${LiquidGlass.colors.glassBorder}`,
  boxShadow: LiquidGlass.effects.glow,
  borderRadius: "16px",
};
