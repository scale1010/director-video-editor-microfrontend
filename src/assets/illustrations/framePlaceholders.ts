/**
 * Frame placeholder illustration assets
 * 
 * Place your GIF files in this directory with the following naming:
 * - intro.gif (for Intro frames) - Forest/mountain landscape with deer
 * - main-content.gif (for Main Content/Middle frames) - Person looking at sky or serene landscape
 * - outro.gif (for Outro frames) - Dark nocturnal landscape with moon and stars
 * - default.gif (for default/other frames) - Generic placeholder
 * 
 * The GIFs will be automatically imported and used in FramePreview component.
 * They will be responsively sized and centered within the frame preview.
 * 
 * IMPORTANT: Add your GIF files to this directory, then uncomment the imports below
 * and remove the placeholder paths.
 */

// TODO: Add your GIF files to this directory, then uncomment these imports:
import introGif from './intro.gif';
import mainContentGif from './main-content.gif';
import outroGif from './outro.gif';
import defaultGif from './default.gif';

// Placeholder paths - replace these once GIF files are added and imports are uncommented
// Using public path format as fallback until actual GIFs are added
// const introGif = '/assets/illustrations/intro.gif';
// const mainContentGif = '/assets/illustrations/main-content.gif';
// const outroGif = '/assets/illustrations/outro.gif';
// const defaultGif = '/assets/illustrations/default.gif';

export const FRAME_PLACEHOLDERS = {
  intro: introGif,
  mainContent: mainContentGif,
  outro: outroGif,
  default: defaultGif,
} as const;

export type FramePlaceholderType = keyof typeof FRAME_PLACEHOLDERS;

