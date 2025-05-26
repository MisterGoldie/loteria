"use client";

import { useEffect } from 'react';

// This component fixes the SVG width="small" and height="small" attributes that cause errors
// by intercepting the createElement method and fixing invalid SVG attributes
export function SvgFixer() {
  useEffect(() => {
    // Only run this on the client side
    if (typeof window === 'undefined') return;
    
    try {
      // Store the original createElement function
      const originalCreateElement = document.createElement.bind(document);
      
      // Override createElement to intercept SVG creation
      document.createElement = function(tagName: string, options?: ElementCreationOptions) {
        // Create the element using the original method
        const element = originalCreateElement(tagName, options);
        
        // If it's an SVG element, add a MutationObserver to fix invalid attributes
        if (tagName.toLowerCase() === 'svg') {
          // Watch for attribute changes on this SVG
          const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
              if (mutation.type === 'attributes') {
                const svg = mutation.target as SVGElement;
                
                // Fix width="small" -> width="16px"
                if (svg.getAttribute('width') === 'small') {
                  svg.setAttribute('width', '16px');
                }
                
                // Fix height="small" -> height="16px"
                if (svg.getAttribute('height') === 'small') {
                  svg.setAttribute('height', '16px');
                }
              }
            });
          });
          
          // Start observing the SVG for attribute changes
          observer.observe(element, { attributes: true });
        }
        
        return element;
      };
      
      // Also scan for existing SVGs with width="small" or height="small"
      const fixExistingSvgs = () => {
        const svgs = document.querySelectorAll('svg');
        svgs.forEach(svg => {
          if (svg.getAttribute('width') === 'small') {
            svg.setAttribute('width', '16px');
          }
          if (svg.getAttribute('height') === 'small') {
            svg.setAttribute('height', '16px');
          }
        });
      };
      
      // Run initial scan
      fixExistingSvgs();
      
      // Set up a periodic scan for good measure
      const intervalId = setInterval(fixExistingSvgs, 500);
      
      // Clean up
      return () => {
        clearInterval(intervalId);
        document.createElement = originalCreateElement;
      };
    } catch (error) {
      console.error('Error in SvgFixer:', error);
    }
  }, []);
  
  // This component doesn't render anything
  return null;
}
