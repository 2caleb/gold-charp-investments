
import { useEffect } from 'react';
import { useIsMobile } from './use-mobile';

/**
 * Hook to redirect mobile users to desktop view
 * Sets viewport meta tag to force desktop view on mobile devices
 */
export function useDesktopRedirect() {
  const isMobile = useIsMobile();
  
  useEffect(() => {
    if (isMobile) {
      // Find the viewport meta tag
      let viewportMeta = document.querySelector('meta[name="viewport"]');
      
      // If it doesn't exist, create it
      if (!viewportMeta) {
        viewportMeta = document.createElement('meta');
        viewportMeta.setAttribute('name', 'viewport');
        document.head.appendChild(viewportMeta);
      }
      
      // Set the viewport to desktop width (1024px)
      viewportMeta.setAttribute('content', 'width=1024, initial-scale=0.6');
      
      console.log('Redirected to desktop view on mobile device');
    }
    
    // Cleanup function to restore normal viewport if needed
    return () => {
      if (isMobile) {
        const viewportMeta = document.querySelector('meta[name="viewport"]');
        if (viewportMeta) {
          viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0');
        }
      }
    };
  }, [isMobile]);
}
