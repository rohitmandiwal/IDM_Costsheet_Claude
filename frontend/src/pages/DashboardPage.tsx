import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { FileText, CheckSquare, Clock, TrendingUp } from 'lucide-react';

export function DashboardPage() {
  const stats = [
    { title: 'Total PRs', value: '24', icon: FileText, color: 'bg-blue-500' },
    { title: 'Pending Approvals', value: '8', icon: Clock, color: 'bg-yellow-500' },
    { title: 'Approved', value: '12', icon: CheckSquare, color: 'bg-green-500' },
    { title: 'Total Value', value: '₹2.4M', icon: TrendingUp, color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Dashboard</h2>
        <p className="text-muted-foreground mt-1">Welcome to Procurement Cost-Sheet System</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`w-10 h-10 rounded-full ${stat.color} bg-opacity-10 flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color.replace('bg-', 'text-')}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start space-x-3 pb-3 border-b last:border-0">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">PR #{1000 + i} submitted for approval</p>
                    <p className="text-xs text-muted-foreground mt-1">{i} hour{i > 1 ? 's' : ''} ago</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start space-x-3 pb-3 border-b last:border-0">
                  <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Approval required for PR #{2000 + i}</p>
                    <p className="text-xs text-muted-foreground mt-1">Waiting {i} day{i > 1 ? 's' : ''}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
