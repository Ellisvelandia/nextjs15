'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import {
  Users,
  Package,
  ShoppingBag,
  BarChart3,
  Settings,
  Gem,
  LayoutDashboard,
} from 'lucide-react';

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user && !isLoading) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  // Show loading state while checking authentication
  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Customers', href: '/dashboard/customers', icon: Users },
    { name: 'Inventory', href: '/dashboard/inventory', icon: Package },
    { name: 'Orders', href: '/dashboard/orders', icon: ShoppingBag },
    { name: 'Products', href: '/dashboard/products', icon: Gem },
    { name: 'Reports', href: '/dashboard/reports', icon: BarChart3 },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 border-r bg-card hidden md:block">
        <div className="h-16 flex items-center px-6 border-b">
          <h1 className="text-xl font-bold flex items-center">
            <Gem className="h-5 w-5 mr-2" />
            Zafiro CRM
          </h1>
        </div>
        <nav className="p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <a
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </a>
            );
          })}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <div className="h-16 border-b bg-card flex items-center justify-between px-6 md:hidden">
          <h1 className="text-xl font-bold flex items-center">
            <Gem className="h-5 w-5 mr-2" />
            Zafiro CRM
          </h1>
          <button className="p-2">
            <span className="sr-only">Open menu</span>
            {/* Mobile menu icon */}
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
} 