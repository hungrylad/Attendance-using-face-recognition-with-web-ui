import React from 'react';
import { Header } from './components/Header';
import { MainActions } from './components/MainActions';
import { BottomActions } from './components/BottomActions';
import { AppStateProvider } from './context/AppStateContext';

function App() {
  return (
    <AppStateProvider>
      <div className="min-h-screen bg-gradient-to-br from-teal-600 to-teal-700">
        <div className="container mx-auto py-8 flex flex-col min-h-screen">
          <Header />
          
          <main className="flex-1 flex flex-col items-center justify-center gap-12 py-12">
            <MainActions />
          </main>
          
          <footer className="py-8">
            <BottomActions />
          </footer>
        </div>
      </div>
    </AppStateProvider>
  );
}

export default App;