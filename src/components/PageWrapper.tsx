import { ReactNode, memo } from "react";

interface PageWrapperProps {
  children: ReactNode;
}

const PageWrapper = memo(({ children }: PageWrapperProps) => {
  return (
    <div className="min-h-screen bg-background page-transition overflow-hidden">
      <div className="min-h-screen transition-all duration-300 ease-out">
        {children}
      </div>
    </div>
  );
});

export default PageWrapper;