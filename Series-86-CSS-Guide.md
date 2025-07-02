# Series-86 CSS Template & Style Guide

A comprehensive design system and CSS template for building consistent Series-86 applications based on the Media-86 app architecture.

## Table of Contents
1. [Design System Overview](#design-system-overview)
2. [CSS Template](#css-template)
3. [Tailwind Configuration](#tailwind-configuration)
4. [Component Patterns](#component-patterns)
5. [Color Palette](#color-palette)
6. [Typography](#typography)
7. [Layout Patterns](#layout-patterns)
8. [Interactive Elements](#interactive-elements)
9. [Animations & Transitions](#animations--transitions)
10. [Best Practices](#best-practices)

## Design System Overview

Series-86 apps follow a **dark-themed, professional desktop application** design philosophy with:

- **Dark color scheme** (gray-900 background, gray-800 surfaces)
- **Clean, minimal interface** with focus on content
- **Consistent spacing** using Tailwind's spacing scale
- **Subtle animations** for enhanced UX
- **Professional typography** with clear hierarchy
- **Accessible interactions** with proper hover/focus states

## CSS Template

### Base Styles (`App.css`)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* ===========================================
   SERIES-86 BASE STYLES
   =========================================== */

/* Custom Scrollbar Styles */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #2a2e37;
}

::-webkit-scrollbar-thumb {
  background: #4a5568;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #718096;
}

/* ===========================================
   SERIES-86 ANIMATIONS
   =========================================== */

/* Fade In Animation */
@keyframes fadeIn {
  from { 
    opacity: 0; 
    transform: translateY(10px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Animation Classes */
.fade-in {
  animation: fadeIn 0.3s ease-out;
}

.slide-in {
  animation: slideIn 0.3s ease-out;
}

.scale-in {
  animation: scaleIn 0.2s ease-out;
}

/* ===========================================
   SERIES-86 CUSTOM UTILITIES
   =========================================== */

@layer utilities {
  /* Card Hover Effects */
  .card-hover {
    @apply transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5;
  }
  
  /* Button Hover Effects */
  .btn-hover {
    @apply transition-colors duration-200;
  }
  
  /* Image Fade In */
  .image-fade-in {
    animation: fadeIn 0.3s ease-in-out;
  }
  
  /* Focus Ring */
  .focus-ring {
    @apply focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800;
  }
  
  /* Truncate with Tooltip */
  .truncate-tooltip {
    @apply truncate;
    cursor: help;
  }
}

/* ===========================================
   SERIES-86 COMPONENT STYLES
   =========================================== */

/* Checkered Background Pattern (for transparent content) */
.checkered-bg {
  background: linear-gradient(45deg, #1a1a1a 25%, transparent 25%), 
              linear-gradient(-45deg, #1a1a1a 25%, transparent 25%), 
              linear-gradient(45deg, transparent 75%, #1a1a1a 75%), 
              linear-gradient(-45deg, transparent 75%, #1a1a1a 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
}

/* Glass Effect */
.glass-effect {
  backdrop-filter: blur(10px);
  background: rgba(31, 41, 55, 0.8);
  border: 1px solid rgba(75, 85, 99, 0.3);
}

/* Subtle Gradient */
.subtle-gradient {
  background: linear-gradient(135deg, #374151 0%, #1f2937 100%);
}
```

## Tailwind Configuration

### `tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Series-86 Color Palette
        'series': {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        // Custom grays for consistency
        'app-gray': {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        }
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      boxShadow: {
        'series': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
        'series-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
      }
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: ['dark'],
    darkTheme: 'dark',
  },
}
```

## Component Patterns

### 1. Application Shell

```jsx
function AppShell({ children }) {
  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-3">
        {/* Header content */}
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
          {/* Sidebar content */}
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {children}
        </main>
      </div>
      
      {/* Footer (optional) */}
      <footer className="bg-gray-800 border-t border-gray-700 px-4 py-2">
        {/* Footer content */}
      </footer>
    </div>
  );
}
```

### 2. Header Component

```jsx
function AppHeader({ title, logo, actions }) {
  return (
    <header className="bg-gray-800 border-b border-gray-700 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
            <img src={logo} alt={`${title} Logo`} className="w-full h-full object-cover" />
          </div>
          <h1 className="text-xl font-semibold text-white">{title}</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {actions}
        </div>
      </div>
    </header>
  );
}
```

### 3. Sidebar Component

```jsx
function Sidebar({ children, className = "" }) {
  return (
    <aside className={`w-80 bg-gray-800 border-r border-gray-700 flex flex-col ${className}`}>
      <div className="p-4 border-b border-gray-700">
        {/* Sidebar header */}
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto">
        {children}
      </div>
    </aside>
  );
}
```

### 4. Button Components

```jsx
// Primary Button
function PrimaryButton({ children, onClick, disabled = false, className = "" }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        bg-blue-600 hover:bg-blue-700 
        disabled:bg-gray-600 disabled:cursor-not-allowed
        text-white font-medium px-4 py-2 rounded-lg
        transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-blue-500
        ${className}
      `}
    >
      {children}
    </button>
  );
}

// Secondary Button
function SecondaryButton({ children, onClick, disabled = false, className = "" }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        bg-gray-600 hover:bg-gray-700 
        disabled:bg-gray-700 disabled:cursor-not-allowed
        text-white font-medium px-4 py-2 rounded-lg
        transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-gray-500
        ${className}
      `}
    >
      {children}
    </button>
  );
}

// Icon Button
function IconButton({ icon: Icon, onClick, disabled = false, className = "" }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        p-2 rounded-lg bg-gray-700 hover:bg-gray-600 
        disabled:opacity-50 disabled:cursor-not-allowed 
        transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-gray-500
        ${className}
      `}
    >
      <Icon size={18} />
    </button>
  );
}
```

### 5. Modal Component

```jsx
function Modal({ isOpen, onClose, title, children, actions }) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col scale-in">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">{title}</h2>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-white transition-colors"
            >
              <MdClose size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {children}
        </div>

        {actions && (
          <div className="p-6 border-t border-gray-700">
            <div className="flex justify-end space-x-3">
              {actions}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

### 6. Input Components

```jsx
// Text Input
function TextInput({ label, value, onChange, placeholder, className = "" }) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {label}
        </label>
      )}
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="
          w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 
          text-white placeholder-gray-400 
          focus:outline-none focus:ring-2 focus:ring-blue-500
          transition-colors duration-200
        "
      />
    </div>
  );
}

// Select Input
function SelectInput({ label, value, onChange, options, className = "" }) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={onChange}
        className="
          w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 
          text-white focus:outline-none focus:ring-2 focus:ring-blue-500
          transition-colors duration-200
        "
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
```

## Color Palette

### Primary Colors
- **Background**: `bg-gray-900` (#111827)
- **Surface**: `bg-gray-800` (#1f2937)
- **Border**: `border-gray-700` (#374151)
- **Text Primary**: `text-white` (#ffffff)
- **Text Secondary**: `text-gray-300` (#d1d5db)
- **Text Muted**: `text-gray-400` (#9ca3af)

### Accent Colors
- **Primary**: `bg-blue-600` (#2563eb) / `hover:bg-blue-700` (#1d4ed8)
- **Success**: `bg-green-600` (#16a34a) / `hover:bg-green-700` (#15803d)
- **Warning**: `bg-yellow-600` (#ca8a04) / `hover:bg-yellow-700` (#a16207)
- **Error**: `bg-red-600` (#dc2626) / `hover:bg-red-700` (#b91c1c)
- **Purple**: `bg-purple-600` (#9333ea) / `hover:bg-purple-700` (#7c3aed)

### Usage Examples
```css
/* Backgrounds */
.app-bg { @apply bg-gray-900; }
.surface-bg { @apply bg-gray-800; }
.elevated-bg { @apply bg-gray-700; }

/* Text */
.text-primary { @apply text-white; }
.text-secondary { @apply text-gray-300; }
.text-muted { @apply text-gray-400; }

/* Borders */
.border-default { @apply border-gray-700; }
.border-light { @apply border-gray-600; }
```

## Typography

### Font Hierarchy
```css
/* Headers */
.h1 { @apply text-3xl font-bold text-white; }
.h2 { @apply text-2xl font-semibold text-white; }
.h3 { @apply text-xl font-semibold text-white; }
.h4 { @apply text-lg font-medium text-white; }

/* Body Text */
.body-lg { @apply text-base text-gray-300; }
.body { @apply text-sm text-gray-300; }
.body-sm { @apply text-xs text-gray-400; }

/* Special */
.mono { @apply font-mono text-sm; }
.code { @apply font-mono text-xs bg-gray-800 px-2 py-1 rounded; }
```

## Layout Patterns

### 1. Full Height Layout
```jsx
<div className="h-screen bg-gray-900 text-white flex flex-col">
  {/* Content */}
</div>
```

### 2. Sidebar Layout
```jsx
<div className="flex flex-1 overflow-hidden">
  <aside className="w-80 bg-gray-800 border-r border-gray-700">
    {/* Sidebar */}
  </aside>
  <main className="flex-1 flex flex-col overflow-hidden">
    {/* Main content */}
  </main>
</div>
```

### 3. Card Layout
```jsx
<div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
  {/* Card content */}
</div>
```

### 4. Grid Layouts
```jsx
{/* 2-column grid */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {/* Grid items */}
</div>

{/* 3-column grid */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  {/* Grid items */}
</div>
```

## Interactive Elements

### 1. Hover States
```css
/* Buttons */
.btn-primary:hover { @apply bg-blue-700; }
.btn-secondary:hover { @apply bg-gray-700; }

/* Cards */
.card:hover { @apply shadow-lg -translate-y-0.5; }

/* List items */
.list-item:hover { @apply bg-gray-700; }
```

### 2. Focus States
```css
/* Focus ring for accessibility */
.focus-ring:focus {
  @apply outline-none ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-800;
}
```

### 3. Active States
```css
/* Active button */
.btn-active { @apply bg-blue-600 text-white; }

/* Selected item */
.selected { @apply bg-blue-600 text-white; }
```

## Animations & Transitions

### 1. Standard Transitions
```css
/* All interactive elements */
.transition-default { @apply transition-colors duration-200; }

/* Hover effects */
.transition-hover { @apply transition-all duration-200; }

/* Transform effects */
.transition-transform { @apply transition-transform duration-200; }
```

### 2. Loading States
```jsx
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
  );
}
```

### 3. Page Transitions
```jsx
function PageTransition({ children }) {
  return (
    <div className="fade-in">
      {children}
    </div>
  );
}
```

## Best Practices

### 1. Consistency
- Always use the defined color palette
- Maintain consistent spacing using Tailwind's scale
- Use consistent border radius (rounded-lg for most elements)
- Follow the established typography hierarchy

### 2. Accessibility
- Always include focus states for interactive elements
- Use proper contrast ratios
- Include alt text for images
- Use semantic HTML elements

### 3. Performance
- Use CSS classes instead of inline styles when possible
- Leverage Tailwind's purging to reduce bundle size
- Optimize images and use appropriate formats

### 4. Responsive Design
```css
/* Mobile-first approach */
.responsive-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3;
}

.responsive-sidebar {
  @apply w-full md:w-80;
}

.responsive-padding {
  @apply p-2 md:p-4;
}
```

### 5. Dark Theme Considerations
- Use sufficient contrast for text readability
- Avoid pure black backgrounds (use gray-900 instead)
- Use subtle borders to define sections
- Test with actual dark theme users

## Example Implementation

Here's a complete example of a Series-86 app component:

```jsx
import React, { useState } from 'react';
import { MdFolder, MdClose, MdCheck } from 'react-icons/md';
import toast, { Toaster } from 'react-hot-toast';

function ExampleApp() {
  const [showModal, setShowModal] = useState(false);
  
  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <MdFolder className="text-white" size={20} />
            </div>
            <h1 className="text-xl font-semibold text-white">Series-86 App</h1>
          </div>
          
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Open Modal
          </button>
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-lg font-medium text-white mb-4">Navigation</h2>
            <nav className="space-y-2">
              <a href="#" className="block text-gray-300 hover:text-white hover:bg-gray-700 px-3 py-2 rounded-lg transition-colors">
                Dashboard
              </a>
              <a href="#" className="block text-gray-300 hover:text-white hover:bg-gray-700 px-3 py-2 rounded-lg transition-colors">
                Settings
              </a>
            </nav>
          </div>
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 p-6">
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 fade-in">
              <h2 className="text-xl font-semibold text-white mb-4">Welcome to Series-86</h2>
              <p className="text-gray-300">
                This is an example of the Series-86 design system in action.
              </p>
            </div>
          </div>
        </main>
      </div>
      
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg max-w-md w-full scale-in">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Example Modal</h2>
                <button 
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <MdClose size={24} />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <p className="text-gray-300 mb-4">
                This is an example modal following Series-86 design patterns.
              </p>
            </div>
            
            <div className="p-6 border-t border-gray-700">
              <div className="flex justify-end space-x-3">
                <button 
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    setShowModal(false);
                    toast.success('Action completed!');
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <MdCheck size={16} />
                  <span>Confirm</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExampleApp;
```

This guide provides a comprehensive foundation for building consistent, professional Series-86 applications. Remember to adapt these patterns to your specific use case while maintaining the core design principles. 