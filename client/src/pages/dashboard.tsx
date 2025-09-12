import UserDashboard from '@/components/UserDashboard';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <UserDashboard />
      </div>
    </div>
  );
}