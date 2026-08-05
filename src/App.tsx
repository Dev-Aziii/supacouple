import React, { useEffect } from 'react';
import { RouterProvider as ReactRouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';
import { router } from '@/routes';
import { QueryProvider } from '@/providers/QueryProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { AuthProvider } from '@/context/AuthContext';
import { settingsService } from '@/services/settings/settingsService';

export const App: React.FC = () => {
  useEffect(() => {
    settingsService.initLocalStylePreferences();
  }, []);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="supa_couple_theme">
      <QueryProvider>
        <AuthProvider>
          <ReactRouterProvider router={router} />
          <Toaster position="top-right" richColors closeButton />
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
};

export default App;
