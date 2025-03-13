import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Settings | Zafiro CRM',
  description: 'Manage your Zafiro CRM settings',
};

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 mt-6">
        <div className="bg-card rounded-lg border p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Settings Overview</h2>
          <p className="text-muted-foreground mb-4">
            Manage your account settings and preferences.
          </p>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="p-4 border rounded-md">
              <h3 className="font-medium mb-2">User Management</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Manage users, permissions and roles
              </p>
              <a href="/dashboard/settings/users" className="text-sm text-primary hover:underline">
                Manage Users →
              </a>
            </div>
            
            <div className="p-4 border rounded-md">
              <h3 className="font-medium mb-2">General Settings</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Configure general application settings
              </p>
              <a href="/dashboard/settings/general" className="text-sm text-primary hover:underline">
                General Settings →
              </a>
            </div>
            
            <div className="p-4 border rounded-md">
              <h3 className="font-medium mb-2">Billing & Subscription</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Manage your billing information and subscription
              </p>
              <a href="/dashboard/settings/billing" className="text-sm text-primary hover:underline">
                Billing Settings →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 