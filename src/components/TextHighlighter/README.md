# TextHighlighter Component

A React component that allows users to select text, highlight it with different colors, add notes, and translate selected text directly on the page.

## Features

- **Text Selection**: Select any text on the page to activate the highlighter.
- **Color Options**: Choose from multiple colors for highlighting.
- **Notes**: Add personal notes to highlighted text.
- **Translation**: Translate selected text directly from the UI.
- **Responsive**: Works well on both desktop and mobile devices.

## Installation

The TextHighlighter component is part of the TOEIC exam application. It's already integrated into the codebase.

## Usage

```jsx
import TextHighlighter from '../components/TextHighlighter';

// Basic usage
<TextHighlighter>
  This text can be highlighted and translated.
</TextHighlighter>

// With container ID for scoping (optional)
<TextHighlighter containerId="my-container">
  <div id="my-container">
    This text can be highlighted and translated.
  </div>
</TextHighlighter>
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `children` | React.Node | The content to be made highlightable |
| `containerId` | string | (Optional) ID of the container to scope selections to |

## How It Works

1. Select any text within the component
2. A popup appears with highlighting and translation options
3. Choose a color and click "Highlight" to highlight the text
4. Click "Note" to add personal notes to a highlight
5. Click "Translate" to translate the selected text

## Styling

The component uses Ant Design (antd) components and custom CSS defined in `TextHighlighter.css`. You can customize the appearance by modifying this CSS file.

## Dependencies

- React
- Ant Design (antd)
- lucide-react (for icons)

## Notes

- The translation feature uses Google Translate API
- Text highlighting persists during the exam session
- Mobile-friendly with responsive design
