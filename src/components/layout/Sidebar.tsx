'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Truck, 
  User, 
  Package,
  PackagePlus,
  ShoppingCart,
  SendHorizontal,
  X
} from 'lucide-react';
import { cn } from '../ui/utils';
import { useStore } from '@/store/useStore';
import { Button } from '../ui/button';

const menuItems = [
  {
    title: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'Caminhões',
    href: '/trucks',
    icon: Truck,
  },
  {
    title: 'Motoristas',
    href: '/drivers',
    icon: User,
  },
  {
    title: 'Inventário',
    href: '/inventory',
    icon: Package,
  },
  {
    title: 'Entradas de Materiais',
    href: '/inbound-entries',
    icon: PackagePlus,
  },
  {
    title: 'Pedidos',
    href: '/orders',
    icon: ShoppingCart,
  },
  {
    title: 'Expedições',
    href: '/expeditions',
    icon: SendHorizontal,
  },
];

export const Sidebar = () => {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useStore();

  return (
    <>
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-screen w-64 bg-white border-r transition-transform lg:translate-x-0 lg:static',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center justify-between px-6 border-b lg:justify-center">
          <span className="font-semibold lg:hidden">Menu</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="space-y-1 p-4">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  // Close sidebar on mobile after navigation
                  if (window.innerWidth < 1024) {
                    setSidebarOpen(false);
                  }
                }}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-gray-100',
                  isActive && 'bg-blue-50 text-blue-600 hover:bg-blue-50'
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
};
