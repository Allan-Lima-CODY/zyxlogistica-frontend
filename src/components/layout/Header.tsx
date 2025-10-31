'use client';

import { Menu, Package } from 'lucide-react';
import { Button } from '../ui/button';
import { useStore } from '../../store/useStore';

export const Header = () => {
  const { toggleSidebar } = useStore();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="flex h-16 items-center px-4 gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        <div className="flex items-center gap-2">
          <Package className="h-6 w-6 text-blue-600" />
          <span className="font-semibold">Sistema de Gestão de Estoque</span>
        </div>
      </div>
    </header>
  );
};
