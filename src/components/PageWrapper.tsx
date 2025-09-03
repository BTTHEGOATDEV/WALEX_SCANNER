import { ReactNode } from "react";

interface PageWrapperProps {
  children: ReactNode;
}

const PageWrapper = ({ children }: PageWrapperProps) => {
  return (
    <div className="min-h-screen bg-background page-transition overflow-hidden">
      <div className="min-h-screen transition-all duration-300 ease-out">
        {children}
      </div>
    </div>
  );
};

export default PageWrapper;