import { Metadata } from 'next';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardStats from '@/components/dashboard/DashboardStats';
import RecentActivity from '@/components/dashboard/RecentActivity';

export const metadata: Metadata = {
  title: 'Dashboard | Zafiro CRM',
  description: 'Manage your jewelry business with Zafiro CRM',
};

export default async function DashboardPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <DashboardHeader />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardStats />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RecentActivity />
        <div className="bg-card p-6 rounded-lg border shadow-sm">
          <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
          <div className="space-y-2">
            <a href="/dashboard/customers" className="text-primary hover:underline block">Manage Customers</a>
            <a href="/dashboard/inventory" className="text-primary hover:underline block">Inventory Management</a>
            <a href="/dashboard/orders" className="text-primary hover:underline block">Order Processing</a>
            <a href="/dashboard/reports" className="text-primary hover:underline block">Sales Reports</a>
          </div>
        </div>
      </div>
    </div>
  );
} 