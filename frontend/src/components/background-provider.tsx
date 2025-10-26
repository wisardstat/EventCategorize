"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

interface BackgroundProviderProps {
  children: React.ReactNode;
}

export default function BackgroundProvider({ children }: BackgroundProviderProps) {
  const pathname = usePathname();

  // Check if current page should have black background
  const blackBackgroundPages = ["index","create-question", "answer_list", "answer_analytic"];
  
  // Debug logs
  console.log("pathname:", pathname);
  console.log("blackBackgroundPages:", blackBackgroundPages);
  
  const shouldHaveBlackBackground = blackBackgroundPages.some(page => {

    console.log("page:", page, "includes:", pathname.includes(`/${page}`));

    return pathname.includes(`/${page}`);
  });
  
  console.log("shouldHaveBlackBackground:", shouldHaveBlackBackground);
  
  useEffect(() => {
    // Apply background style to html and body elements
    const htmlElement = document.documentElement;
    const bodyElement = document.body;
    
    const backgroundStyle = shouldHaveBlackBackground
      ? 'linear-gradient(135deg, #220f45ff, #020004ff)'
      : '#F5F5F7';
    
    const textColor = shouldHaveBlackBackground ? '#e0e0e0' : 'inherit';
    
    // Apply styles to html and body
    htmlElement.style.background = backgroundStyle;
    htmlElement.style.minHeight = '100vh';
    htmlElement.style.width = '100%';
    htmlElement.style.color = textColor;
    
    bodyElement.style.background = backgroundStyle;
    bodyElement.style.minHeight = '100vh';
    bodyElement.style.width = '100%';
    bodyElement.style.color = textColor;
    bodyElement.style.margin = '0';
    bodyElement.style.padding = '0';
    
    // Cleanup function to reset styles when component unmounts or path changes
    return () => {
      htmlElement.style.background = '';
      htmlElement.style.minHeight = '';
      htmlElement.style.width = '';
      htmlElement.style.color = '';
      
      bodyElement.style.background = '';
      bodyElement.style.minHeight = '';
      bodyElement.style.width = '';
      bodyElement.style.color = '';
      bodyElement.style.margin = '';
      bodyElement.style.padding = '';
    };
  }, [shouldHaveBlackBackground]);

  return (
    <div>
      {children}
    </div>
  );
}