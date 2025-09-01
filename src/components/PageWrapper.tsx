import { ReactNode } from "react";

interface PageWrapperProps {
  children: ReactNode;
}

const PageWrapper = ({ children }: PageWrapperProps) => {
  return (
    <div className="min-h-screen bg-background page-transition">
      {children}
    </div>
  );
};

export default PageWrapper;