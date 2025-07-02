# Series-86 Design Guide

A comprehensive design system and style guide for building consistent Series-86 applications based on the Media-86 app architecture.

## Overview

Series-86 is a design system for professional desktop applications built with **Tauri**, **React**, and **Tailwind CSS**. It emphasizes a **dark-themed, clean interface** that prioritizes content and functionality while maintaining visual consistency across all applications in the series.

## Core Design Principles

### 1. **Dark-First Design**
- Primary background: `bg-gray-900` (#111827)
- Surface backgrounds: `bg-gray-800` (#1f2937)
- Elevated surfaces: `bg-gray-700` (#374151)

### 2. **Content-Focused Layout**
- Clean, minimal interface with focus on primary content
- Consistent sidebar navigation (320px width)
- Header with app branding and key actions
- Optional footer for navigation/status

### 3. **Professional Typography**
- Clear hierarchy with consistent font weights
- High contrast text for readability
- Monospace fonts for technical content

### 4. **Subtle Interactions**
- Smooth transitions (200ms duration)
- Hover states for all interactive elements
- Focus rings for accessibility
- Gentle animations for state changes

## File Structure

When implementing Series-86 design, organize your files as follows:

```
src/
├── styles/
│   ├── App.css              # Main CSS file
│   ├── series-86.css        # Series-86 template
│   └── components.css       # Component-specific styles
├── components/
│   ├── ui/                  # Reusable UI components
│   │   ├── Button.jsx
│   │   ├── Modal.jsx
│   │   ├── Input.jsx
│   │   └── Card.jsx
│   ├── layout/              # Layout components
│   │   ├── AppShell.jsx
│   │   ├── Header.jsx
│   │   ├── Sidebar.jsx
│   │   └── Footer.jsx
│   └── features/            # Feature-specific components
└── App.jsx                  # Main app component
```

## Color System

### Base Colors
```css
/* Backgrounds */
--bg-app: #111827;          /* gray-900 */
--bg-surface: #1f2937;      /* gray-800 */
--bg-elevated: #374151;     /* gray-700 */
--bg-input: #374151;        /* gray-700 */

/* Borders */
--border-default: #374151;  /* gray-700 */
--border-light: #4b5563;    /* gray-600 */

/* Text */
--text-primary: #ffffff;    /* white */
--text-secondary: #d1d5db;  /* gray-300 */
--text-muted: #9ca3af;      /* gray-400 */
--text-accent: #60a5fa;     /* blue-400 */
```

### Accent Colors
```css
/* Primary Actions */
--primary: #2563eb;         /* blue-600 */
--primary-hover: #1d4ed8;   /* blue-700 */

/* Secondary Actions */
--secondary: #4b5563;       /* gray-600 */
--secondary-hover: #374151; /* gray-700 */

/* Status Colors */
--success: #16a34a;         /* green-600 */
--warning: #ca8a04;         /* yellow-600 */
--error: #dc2626;           /* red-600 */
--info: #0891b2;           /* cyan-600 */

/* Special */
--purple: #9333ea;          /* purple-600 */
--purple-hover: #7c3aed;    /* purple-700 */
```

## Typography Scale

### Headings
```css
.h1 { font-size: 1.875rem; font-weight: 700; } /* text-3xl font-bold */
.h2 { font-size: 1.5rem; font-weight: 600; }   /* text-2xl font-semibold */
.h3 { font-size: 1.25rem; font-weight: 600; }  /* text-xl font-semibold */
.h4 { font-size: 1.125rem; font-weight: 500; } /* text-lg font-medium */
```

### Body Text
```css
.body-lg { font-size: 1rem; }      /* text-base */
.body { font-size: 0.875rem; }     /* text-sm */
.body-sm { font-size: 0.75rem; }   /* text-xs */
.caption { font-size: 0.625rem; }  /* text-[10px] */
```

### Code/Monospace
```css
.mono { font-family: ui-monospace, 'SF Mono', monospace; }
.code { 
  font-family: ui-monospace, 'SF Mono', monospace;
  background: var(--bg-elevated);
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
}
```

## Layout Components

### 1. App Shell
The foundation layout for all Series-86 applications:

```jsx
function AppShell({ children }) {
  return (
    <div className="app-shell">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="app-main">
          {children}
        </main>
      </div>
      <Footer /> {/* Optional */}
    </div>
  );
}
```

### 2. Header Pattern
Consistent header with branding and actions:

```jsx
function Header() {
  return (
    <header className="app-header">
      <div className="app-header-content">
        <div className="flex items-center space-x-3">
          <div className="app-logo">
            <img src="/icon.png" alt="App Logo" />
          </div>
          <h1 className="app-title">App Name</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Action buttons */}
        </div>
      </div>
    </header>
  );
}
```

### 3. Sidebar Pattern
320px fixed sidebar with navigation:

```jsx
function Sidebar() {
  return (
    <aside className="app-sidebar">
      <div className="sidebar-header">
        {/* Sidebar header content */}
      </div>
      <div className="sidebar-content">
        {/* Scrollable sidebar content */}
      </div>
    </aside>
  );
}
```

## UI Components

### Buttons

#### Primary Button
```jsx
<button className="btn-primary">
  Primary Action
</button>
```

#### Secondary Button
```jsx
<button className="btn-secondary">
  Secondary Action
</button>
```

#### Icon Button
```jsx
<button className="btn-icon">
  <Icon size={18} />
</button>
```

#### Button with Icon
```jsx
<button className="btn-primary">
  <Icon size={16} />
  <span>Action</span>
</button>
```

### Inputs

#### Text Input
```jsx
<div>
  <label className="block text-sm font-medium text-gray-300 mb-2">
    Label
  </label>
  <input className="input-base" placeholder="Placeholder..." />
</div>
```

#### Select Input
```jsx
<div>
  <label className="block text-sm font-medium text-gray-300 mb-2">
    Select Option
  </label>
  <select className="input-base">
    <option>Option 1</option>
    <option>Option 2</option>
  </select>
</div>
```

### Cards

#### Basic Card
```jsx
<div className="card">
  <h3 className="text-lg font-medium text-white mb-2">Card Title</h3>
  <p className="text-gray-300">Card content goes here.</p>
</div>
```

#### Hoverable Card
```jsx
<div className="card-hover">
  {/* Card content */}
</div>
```

#### Elevated Card
```jsx
<div className="card-elevated">
  {/* Card content */}
</div>
```

### Modals

#### Standard Modal
```jsx
function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;
  
  return (
    <div className="modal-overlay">
      <div className="modal-content scale-in">
        <div className="modal-header">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">{title}</h2>
            <button onClick={onClose} className="btn-ghost p-1">
              <CloseIcon size={20} />
            </button>
          </div>
        </div>
        
        <div className="modal-body">
          {children}
        </div>
        
        <div className="modal-footer">
          <div className="flex justify-end space-x-3">
            <button onClick={onClose} className="btn-ghost">
              Cancel
            </button>
            <button className="btn-primary">
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

## Interactive Patterns

### List Items

#### Default List Item
```jsx
<div className="list-item list-item-default">
  <Icon size={16} />
  <span className="truncate">Item Name</span>
</div>
```

#### Active List Item
```jsx
<div className="list-item list-item-active">
  <Icon size={16} />
  <span className="truncate">Active Item</span>
</div>
```

#### Selectable List Item
```jsx
<div className="list-item list-item-default">
  <input type="checkbox" className="mr-2" />
  <Icon size={16} />
  <span className="truncate">Selectable Item</span>
</div>
```

### Grid Items

#### Basic Grid Item
```jsx
<div className="grid-item grid-item-hover">
  <img src="..." className="w-full h-20 object-cover" />
  <div className="p-2">
    <p className="text-xs text-white truncate">Item Name</p>
  </div>
</div>
```

#### Active Grid Item
```jsx
<div className="grid-item grid-item-active">
  {/* Grid item content */}
</div>
```

## Animation Guidelines

### Standard Transitions
All interactive elements should use consistent transition timing:

```css
/* Standard transition for colors */
.transition-colors { transition: color 200ms ease-in-out; }

/* Standard transition for all properties */
.transition-all { transition: all 200ms ease-in-out; }

/* Transform transitions */
.transition-transform { transition: transform 200ms ease-in-out; }
```

### Entry Animations
Use these classes for elements entering the view:

```css
.fade-in { animation: fadeIn 0.3s ease-out; }
.slide-in { animation: slideIn 0.3s ease-out; }
.scale-in { animation: scaleIn 0.2s ease-out; }
```

### Loading States
```jsx
// Loading spinner
<div className="loading-spinner" />

// Loading overlay
<div className="loading-overlay">
  <div className="loading-spinner" />
</div>
```

## Accessibility Guidelines

### Focus Management
- All interactive elements must have visible focus states
- Use `focus-ring` class for consistent focus styling
- Implement proper tab order

### Color Contrast
- Maintain WCAG AA contrast ratios
- Primary text: 4.5:1 minimum
- Secondary text: 3:1 minimum

### Screen Readers
- Use semantic HTML elements
- Provide alt text for images
- Use `sr-only` class for screen reader only content

### Keyboard Navigation
- All functionality must be keyboard accessible
- Implement proper arrow key navigation for lists/grids
- Use escape key to close modals/dropdowns

## Responsive Design

### Breakpoints
```css
/* Mobile-first approach */
.responsive-grid-2 { 
  grid-template-columns: 1fr;
}

@media (min-width: 768px) {
  .responsive-grid-2 { 
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .responsive-grid-3 { 
    grid-template-columns: repeat(3, 1fr);
  }
}
```

### Sidebar Behavior
- Desktop: Fixed 320px sidebar
- Tablet: Collapsible sidebar
- Mobile: Overlay sidebar

## Implementation Checklist

### Setup
- [ ] Install Tailwind CSS and DaisyUI
- [ ] Copy Series-86 CSS template
- [ ] Configure Tailwind with dark theme
- [ ] Set up React Hot Toast for notifications

### Layout
- [ ] Implement AppShell component
- [ ] Create Header with logo and title
- [ ] Build Sidebar with navigation
- [ ] Set up main content area
- [ ] Add Footer if needed

### Components
- [ ] Create button variants
- [ ] Build input components
- [ ] Implement modal system
- [ ] Design card components
- [ ] Set up loading states

### Interactions
- [ ] Add hover states to all interactive elements
- [ ] Implement focus management
- [ ] Test keyboard navigation
- [ ] Add smooth transitions
- [ ] Test with screen readers

### Polish
- [ ] Add entry animations
- [ ] Implement loading states
- [ ] Test responsive behavior
- [ ] Optimize for performance
- [ ] Add error boundaries

## Common Patterns

### File List with Selection
```jsx
function FileList({ files, selectedFiles, onToggleSelection }) {
  return (
    <div className="space-y-1">
      {files.map((file, index) => (
        <div 
          key={file.id}
          className={`list-item ${
            selectedFiles.has(file.id) 
              ? 'list-item-selected' 
              : 'list-item-default'
          }`}
        >
          <input
            type="checkbox"
            checked={selectedFiles.has(file.id)}
            onChange={() => onToggleSelection(file.id)}
          />
          <FileIcon size={16} />
          <span className="truncate">{file.name}</span>
        </div>
      ))}
    </div>
  );
}
```

### Settings Panel
```jsx
function SettingsPanel() {
  return (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-lg font-medium text-white mb-4">General</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Theme
            </label>
            <select className="input-base">
              <option>Dark</option>
              <option>Auto</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Status Bar
```jsx
function StatusBar({ status, progress }) {
  return (
    <div className="app-footer">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-300">{status}</span>
        {progress !== undefined && (
          <div className="flex items-center space-x-2">
            <div className="progress-bar w-32">
              <div 
                className="progress-fill" 
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs text-gray-400">{progress}%</span>
          </div>
        )}
      </div>
    </div>
  );
}
```

## Best Practices

### Performance
- Use CSS classes instead of inline styles
- Leverage Tailwind's purging for smaller bundles
- Optimize images with proper formats
- Lazy load non-critical components

### Maintainability
- Follow consistent naming conventions
- Document component props and usage
- Use TypeScript for better type safety
- Implement proper error handling

### User Experience
- Provide immediate feedback for actions
- Use loading states for async operations
- Implement proper error messages
- Maintain consistent behavior across features

### Testing
- Test keyboard navigation
- Verify screen reader compatibility
- Check color contrast ratios
- Test responsive behavior on different screen sizes

This design guide provides a comprehensive foundation for building consistent, professional Series-86 applications while maintaining the clean, functional aesthetic established by Media-86. 