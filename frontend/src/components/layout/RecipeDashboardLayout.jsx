import React from 'react';
import { Outlet } from 'react-router-dom';
import RecipeSidebar from './RecipeSidebar';

export default function RecipeDashboardLayout() {
  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 70px)' }}>
      <RecipeSidebar />
      <main style={{ flex: 1, padding: '30px', maxWidth: '1000px', margin: '0 auto' }}>
        <Outlet />
      </main>
    </div>
  );
}
