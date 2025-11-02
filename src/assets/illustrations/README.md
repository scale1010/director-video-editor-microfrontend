# Frame Placeholder Illustrations

This directory contains GIF placeholder illustrations for different frame types in the board view.

## Required GIF Files

Please add the following GIF files to this directory:

1. **intro.gif** - For Intro frames
   - Suggested: Forest/mountain landscape with deer (serene, blue/gray tones)

2. **main-content.gif** - For Main Content/Middle frames  
   - Suggested: Person looking at sky or serene landscape in oval frame

3. **outro.gif** - For Outro frames
   - Suggested: Dark nocturnal landscape with moon and stars

4. **default.gif** - For default/other frames
   - Suggested: Generic placeholder illustration

## File Naming Convention

The GIF files must be named exactly as shown above to be automatically detected and used by the FramePreview component.

## Usage

Once the GIF files are added, they will be automatically:
- Loaded when frames are displayed in board view
- Responsively sized to fit different frame dimensions (mobile, tablet, desktop)
- Centered within the frame preview
- Used only when frames are empty (no layers/content)

## Future: Screenshot Integration

When frames have content (layers), screenshots from the simple editor will be displayed instead of these GIF placeholders. The GIFs will continue to be used for empty frames.

