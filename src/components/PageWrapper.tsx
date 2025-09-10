import { ReactNode, useEffect, useState } from "react";

interface PageWrapperProps {
  children: ReactNode;
}

const PageWrapper = ({ children }: PageWrapperProps) => {
  const [isEntering, setIsEntering] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsEntering(false), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <div
        className={`min-h-screen transition-all duration-500 ease-out ${
          isEntering
            ? "opacity-0 translate-y-3"
            : "opacity-100 translate-y-0"
        }`}
      >
        {children}
      </div>
    </div>
  );
};

export default PageWrapper;
