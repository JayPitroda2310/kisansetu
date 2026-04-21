// Import the success badge image
import successBadgeImg from 'figma:asset/f9038db935f9a4dc9d7606a9f4d48bd83f940637.png';

// Function to convert image to base64 data URI for embedding in receipts
export async function getSuccessBadgeDataUri(): Promise<string> {
  try {
    const response = await fetch(successBadgeImg);
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error loading success badge:', error);
    // Fallback to a simple green checkmark SVG if image fails to load
    const fallbackSvg = `<svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="90" fill="#7BC142"/>
      <path d="M70 100L90 120L130 75" stroke="white" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
    return `data:image/svg+xml;base64,${btoa(fallbackSvg)}`;
  }
}

// Export the image path for direct use in React components
export const successBadgeImage = successBadgeImg;
