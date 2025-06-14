
import React from 'react';
import AppProviders from '@/components/routing/AppProviders';
import AppRoutes from '@/components/routing/AppRoutes';

function App() {
  return (
    <AppProviders>
      <AppRoutes />
    </AppProviders>
  );
}

export default App;
