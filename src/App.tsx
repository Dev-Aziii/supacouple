import React from 'react';
import { RouterProvider as ReactRouterProvider } from 'react-router-dom';
import { router } from '@/routes';
import { QueryProvider } from '@/providers/QueryProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';

export const App: React.FC = () => {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="supa_couple_theme">
      <QueryProvider>
        <ReactRouterProvider router={router} />
      </QueryProvider>
    </ThemeProvider>
  );
};

export default App;
