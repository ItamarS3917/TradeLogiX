# Premium UI Components

This directory contains enhanced UI components that provide a premium look and feel for the Trading Journal application.

## Components Overview

### PremiumCard
A versatile card component with enhanced styling, including:
- Sophisticated hover effects
- Gradient glow effects
- Highlight styling options
- Color variants (primary, success, error, etc.)

### PerformanceCard
A specialized card for displaying performance metrics:
- Value and change display
- Automatic color coding for positive/negative changes
- Icon support
- Customizable formatting

### PremiumChartContainer
A container for charts and data visualizations:
- Professional styling for chart displays
- Header with optional tools
- Loading state handling
- Subtle background effects

### PremiumTradeCard
A card for displaying trade information:
- Win/loss styling
- Key trade metrics display
- Action buttons for chart view, notes, etc.
- Animated hover effects

### PremiumNavItem
An enhanced navigation item for sidebar menus:
- Active state indicators
- Smooth transition effects
- Icon support
- Density options

## Usage

Import components directly:

```jsx
import { 
  PremiumCard, 
  PerformanceCard,
  PremiumChartContainer,
  PremiumTradeCard,
  PremiumNavItem
} from '../components/Common/PremiumComponents';

// Then use in your component:
<PremiumCard 
  title="Card Title" 
  subtitle="Optional subtitle"
  icon={<Icon />}
  highlight
  variant="primary"
>
  Card content goes here
</PremiumCard>
```

## Styling

These components use MUI theme values to ensure consistent styling. They automatically adapt to light/dark mode and custom themes.

Custom variants are available through the `variant` prop, and additional styling can be applied through the `sx` prop:

```jsx
<PremiumCard
  variant="success"
  sx={{ 
    maxWidth: 400,
    '& .MuiTypography-root': {
      fontWeight: 700
    }
  }}
>
  Content
</PremiumCard>
```
