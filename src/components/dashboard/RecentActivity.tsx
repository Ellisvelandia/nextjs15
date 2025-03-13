'use client';

import { 
  CheckCircle2, 
  ClipboardList, 
  Package, 
  UserPlus 
} from 'lucide-react';

const activities = [
  {
    id: 1,
    type: 'new-customer',
    description: 'New customer registered',
    detail: 'Emily Johnson',
    time: '10 minutes ago',
    icon: UserPlus,
    iconColor: 'text-green-500',
  },
  {
    id: 2,
    type: 'new-order',
    description: 'New order placed',
    detail: 'Order #38294',
    time: '1 hour ago',
    icon: ClipboardList,
    iconColor: 'text-blue-500',
  },
  {
    id: 3,
    type: 'order-shipped',
    description: 'Order shipped',
    detail: 'Order #38125',
    time: '3 hours ago',
    icon: Package,
    iconColor: 'text-purple-500',
  },
  {
    id: 4,
    type: 'order-completed',
    description: 'Order completed',
    detail: 'Order #38001',
    time: 'Yesterday',
    icon: CheckCircle2,
    iconColor: 'text-green-500',
  },
];

export default function RecentActivity() {
  return (
    <div className="bg-card p-6 rounded-lg border shadow-sm">
      <h3 className="font-semibold text-lg mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3 pb-3 border-b last:border-b-0 last:pb-0">
            <div className={`mt-0.5 p-1.5 rounded-full bg-opacity-10 ${activity.iconColor.replace('text', 'bg')}`}>
              <activity.icon className={`h-4 w-4 ${activity.iconColor}`} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{activity.description}</p>
              <p className="text-xs text-muted-foreground">{activity.detail}</p>
            </div>
            <div className="text-xs text-muted-foreground">{activity.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
} 