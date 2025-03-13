'use client';

import { 
  Users, 
  Package, 
  ShoppingCart, 
  DollarSign 
} from 'lucide-react';

const stats = [
  {
    title: 'Total Customers',
    value: '127',
    change: '+12% from last month',
    icon: Users,
    color: 'text-blue-500',
  },
  {
    title: 'Active Inventory',
    value: '843',
    change: '+3% from last month',
    icon: Package,
    color: 'text-green-500',
  },
  {
    title: 'Pending Orders',
    value: '24',
    change: '-5% from last month',
    icon: ShoppingCart,
    color: 'text-orange-500',
  },
  {
    title: 'Monthly Revenue',
    value: '$48,375',
    change: '+18% from last month',
    icon: DollarSign,
    color: 'text-purple-500',
  },
];

export default function DashboardStats() {
  return (
    <>
      {stats.map((stat, index) => (
        <div key={index} className="bg-card rounded-lg border p-6 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <span className={`p-2 rounded-full bg-opacity-10 ${stat.color.replace('text', 'bg')}`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </span>
            <span className="text-xs text-muted-foreground">{stat.change}</span>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
            <p className="text-2xl font-bold">{stat.value}</p>
          </div>
        </div>
      ))}
    </>
  );
} 