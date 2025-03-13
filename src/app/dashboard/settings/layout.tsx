export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container p-6 mx-auto">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        </div>
        <div className="border-b pb-5">
          <nav className="flex space-x-4">
            <a 
              href="/dashboard/settings/users" 
              className="text-sm font-medium text-primary border-b-2 border-primary px-1 py-2"
            >
              Users
            </a>
            <a 
              href="/dashboard/settings/general" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground px-1 py-2"
            >
              General
            </a>
            <a 
              href="/dashboard/settings/billing" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground px-1 py-2"
            >
              Billing
            </a>
          </nav>
        </div>
        {children}
      </div>
    </div>
  );
} 