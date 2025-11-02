/// <reference types="vite/client" />

// Declare module for GIF imports
declare module '*.gif' {
  const src: string;
  export default src;
}
