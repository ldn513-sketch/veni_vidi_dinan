import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Try to fetch the splash.svg file
    fetch('/splash.svg')
      .then(response => {
        if (!response.ok) throw new Error('No splash screen found');
        return response.text();
      })
      .then(svg => {
        // Check if it's actually an SVG
        if (svg.includes('<svg')) {
          setSvgContent(svg);
          
          // Show for at least 3 seconds if found
          const timer = setTimeout(() => {
            setIsVisible(false);
          }, 3500);
          return () => clearTimeout(timer);
        } else {
          throw new Error('Invalid SVG');
        }
      })
      .catch(() => {
        // If not found or error, skip splash screen immediately
        setHasError(true);
        onComplete();
      });
  }, [onComplete]);

  // When exit animation completes, notify parent
  const handleExitComplete = () => {
    onComplete();
  };

  if (hasError) return null;

  return (
    <AnimatePresence onExitComplete={handleExitComplete}>
      {isVisible && svgContent && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] bg-background flex items-center justify-center"
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
      )}
    </AnimatePresence>
  );
}
