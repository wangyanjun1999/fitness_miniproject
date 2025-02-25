import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
}

export function PageContainer({ children }: PageContainerProps) {
  return (
    <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      {children}
    </main>
  );
}