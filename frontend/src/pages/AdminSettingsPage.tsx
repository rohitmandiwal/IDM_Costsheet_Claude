import { useState } from 'react';
import { Plus, Circle, Users, Edit2, Trash2 } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';

interface ApprovalRule {
  id: string;
  minValue: number;
  maxValue: number;
  category: 'Technical' | 'Non-Technical';
  level1: string;
  level2: string;
  level3: string;
  level4: string;
  level5: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: 'Active' | 'Inactive';
  lastLogin: string;
  avatar?: string;
}

const APPROVER_OPTIONS = [
  '-',
  'IDM-Team Lead',
  'IDM-Lead',
  'Head Sourcing & Supply Chain',
  'Head Sourcing',
  'GTO / COO',
  'GCO / CFO',
  'GTO/COO',
  'GCO/CFO',
  'CEO',
];

const initialRules: ApprovalRule[] = [
  { id: '1', minValue: 0, maxValue: 1000000, category: 'Technical', level1: 'IDM-Team Lead', level2: 'IDM-Lead', level3: '-', level4: '-', level5: '-' },
  { id: '2', minValue: 0, maxValue: 1000000, category: 'Non-Technical', level1: 'IDM-Team Lead', level2: 'IDM-Lead', level3: '-', level4: '-', level5: '-' },
  { id: '3', minValue: 1000001, maxValue: 10000000, category: 'Technical', level1: 'IDM-Team Lead', level2: 'IDM-Lead', level3: 'Head Sourcing & Supply Chain', level4: '-', level5: '-' },
  { id: '4', minValue: 1000001, maxValue: 10000000, category: 'Non-Technical', level1: 'IDM-Team Lead', level2: 'IDM-Lead', level3: 'Head Sourcing & Supply Chain', level4: '-', level5: '-' },
  { id: '5', minValue: 10000001, maxValue: 20000000, category: 'Technical', level1: 'IDM-Team Lead', level2: 'IDM-Lead', level3: 'Head Sourcing', level4: 'GTO / COO', level5: '-' },
  { id: '6', minValue: 10000001, maxValue: 20000000, category: 'Non-Technical', level1: 'IDM-Team Lead', level2: 'IDM-Lead', level3: 'Head Sourcing', level4: 'GCO / CFO', level5: '-' },
  { id: '7', minValue: 20000001, maxValue: 50000000, category: 'Technical', level1: 'IDM-Team Lead', level2: 'IDM-Lead', level3: 'Head Sourcing', level4: 'GTO/COO', level5: 'GCO/CFO' },
  { id: '8', minValue: 20000001, maxValue: 50000000, category: 'Non-Technical', level1: 'IDM-Team Lead', level2: 'IDM-Lead', level3: 'Head Sourcing', level4: 'GCO/CFO', level5: '-' },
];

const initialUsers: User[] = [
  { id: '1', name: 'Rajesh Kumar', email: 'rajesh.kumar@company.com', role: 'IDM-Team Lead', department: 'Sourcing', status: 'Active', lastLogin: '2024-11-18 14:30' },
  { id: '2', name: 'Priya Sharma', email: 'priya.sharma@company.com', role: 'IDM-Lead', department: 'Sourcing', status: 'Active', lastLogin: '2024-11-18 09:15' },
  { id: '3', name: 'Amit Patel', email: 'amit.patel@company.com', role: 'Head Sourcing', department: 'Sourcing', status: 'Active', lastLogin: '2024-11-17 16:45' },
  { id: '4', name: 'Sarah Johnson', email: 'sarah.j@company.com', role: 'GTO', department: 'Technology', status: 'Active', lastLogin: '2024-11-18 11:20' },
  { id: '5', name: 'Michael Chen', email: 'michael.chen@company.com', role: 'GCO', department: 'Finance', status: 'Active', lastLogin: '2024-11-16 10:00' },
  { id: '6', name: 'David Williams', email: 'david.w@company.com', role: 'CEO', department: 'Executive', status: 'Active', lastLogin: '2024-11-15 13:30' },
  { id: '7', name: 'John Doe', email: 'john.doe@company.com', role: 'Cost Sheet Creator', department: 'Sourcing', status: 'Active', lastLogin: '2024-11-18 10:00' },
  { id: '8', name: 'Emily Davis', email: 'emily.davis@company.com', role: 'Cost Sheet Creator', department: 'Procurement', status: 'Inactive', lastLogin: '2024-11-10 09:30' },
];

const ROLE_OPTIONS = [
  'IDM-Team Lead',
  'IDM-Lead',
  'Head Sourcing',
  'Head Sourcing & Supply Chain',
  'GTO',
  'GCO',
  'CEO',
  'Cost Sheet Creator',
];

const DEPARTMENT_OPTIONS = [
  'Sourcing',
  'Procurement',
  'Technology',
  'Finance',
  'Executive',
];

export function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<'approval-matrix' | 'user-assignment'>('approval-matrix');
  const [rules, setRules] = useState<ApprovalRule[]>(initialRules);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: '', department: '', status: 'Active' as const });

  const handleAddRule = () => {
    const newRule: ApprovalRule = {
      id: Date.now().toString(),
      minValue: 0,
      maxValue: 0,
      category: 'Technical',
      level1: '-',
      level2: '-',
      level3: '-',
      level4: '-',
      level5: '-',
    };
    setRules([...rules, newRule]);
  };

  const handleSaveMatrix = () => {
    console.log('Saving approval matrix:', rules);
  };

  const handleRuleChange = (id: string, field: keyof ApprovalRule, value: string | number) => {
    setRules(rules.map(rule =>
      rule.id === id ? { ...rule, [field]: value } : rule
    ));
  };

  const handleAddUser = () => {
    if (newUser.name && newUser.email && newUser.role && newUser.department) {
      const user: User = {
        id: Date.now().toString(),
        ...newUser,
        lastLogin: '-',
      };
      setUsers([...users, user]);
      setNewUser({ name: '', email: '', role: '', department: '', status: 'Active' });
      setShowAddUserModal(false);
    }
  };

  const handleDeleteUser = (id: string) => {
    setUsers(users.filter(u => u.id !== id));
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      'IDM-Team Lead': 'bg-blue-100 text-blue-800',
      'IDM-Lead': 'bg-indigo-100 text-indigo-800',
      'Head Sourcing': 'bg-purple-100 text-purple-800',
      'Head Sourcing & Supply Chain': 'bg-purple-100 text-purple-800',
      'GTO': 'bg-green-100 text-green-800',
      'GCO': 'bg-yellow-100 text-yellow-800',
      'CEO': 'bg-red-100 text-red-800',
      'Cost Sheet Creator': 'bg-orange-100 text-orange-800',
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'Active').length,
    approvers: users.filter(u => !['Cost Sheet Creator'].includes(u.role)).length,
    creators: users.filter(u => u.role === 'Cost Sheet Creator').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Admin Settings</h2>
        <p className="text-gray-600 mt-1">Configure approval workflows and user roles</p>
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('approval-matrix')}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
            activeTab === 'approval-matrix'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Circle className="w-4 h-4" />
          Approval Matrix
        </button>
        <button
          onClick={() => setActiveTab('user-assignment')}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
            activeTab === 'user-assignment'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Users className="w-4 h-4" />
          User Assignment
        </button>
      </div>

      {activeTab === 'approval-matrix' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Approval Matrix Configuration</h3>
              <p className="text-sm text-gray-600">Define approval workflows based on value bands and categories</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleAddRule}>
                <Plus className="w-4 h-4 mr-2" />
                Add Rule
              </Button>
              <Button onClick={handleSaveMatrix}>
                Save Matrix
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-gray-700 text-sm font-medium">Value Band (₹)</th>
                  <th className="text-left py-3 px-4 text-gray-700 text-sm font-medium">Category</th>
                  <th className="text-left py-3 px-4 text-gray-700 text-sm font-medium">Level 1</th>
                  <th className="text-left py-3 px-4 text-gray-700 text-sm font-medium">Level 2</th>
                  <th className="text-left py-3 px-4 text-gray-700 text-sm font-medium">Level 3</th>
                  <th className="text-left py-3 px-4 text-gray-700 text-sm font-medium">Level 4</th>
                  <th className="text-left py-3 px-4 text-gray-700 text-sm font-medium">Level 5</th>
                </tr>
              </thead>
              <tbody>
                {rules.map((rule) => (
                  <tr key={rule.id} className="border-b border-gray-100">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={rule.minValue}
                          onChange={(e) => handleRuleChange(rule.id, 'minValue', parseInt(e.target.value) || 0)}
                          className="w-28 text-sm"
                        />
                        <span className="text-gray-500">-</span>
                        <Input
                          type="number"
                          value={rule.maxValue}
                          onChange={(e) => handleRuleChange(rule.id, 'maxValue', parseInt(e.target.value) || 0)}
                          className="w-28 text-sm"
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={rule.category}
                        onChange={(e) => handleRuleChange(rule.id, 'category', e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
                      >
                        <option value="Technical">Technical</option>
                        <option value="Non-Technical">Non-Technical</option>
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={rule.level1}
                        onChange={(e) => handleRuleChange(rule.id, 'level1', e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white min-w-[150px]"
                      >
                        {APPROVER_OPTIONS.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={rule.level2}
                        onChange={(e) => handleRuleChange(rule.id, 'level2', e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white min-w-[150px]"
                      >
                        {APPROVER_OPTIONS.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={rule.level3}
                        onChange={(e) => handleRuleChange(rule.id, 'level3', e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white min-w-[150px]"
                      >
                        {APPROVER_OPTIONS.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={rule.level4}
                        onChange={(e) => handleRuleChange(rule.id, 'level4', e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white min-w-[150px]"
                      >
                        {APPROVER_OPTIONS.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={rule.level5}
                        onChange={(e) => handleRuleChange(rule.id, 'level5', e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white min-w-[150px]"
                      >
                        {APPROVER_OPTIONS.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'user-assignment' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">User Role Assignment</h3>
              <p className="text-sm text-gray-600">Assign roles and permissions to users in the system</p>
            </div>
            <Button onClick={() => setShowAddUserModal(true)}>
              <Users className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm text-gray-600">Total Users</div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalUsers}</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-sm text-gray-600">Active Users</div>
              <div className="text-2xl font-bold text-gray-900">{stats.activeUsers}</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-sm text-gray-600">Approvers</div>
              <div className="text-2xl font-bold text-gray-900">{stats.approvers}</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="text-sm text-gray-600">Creators</div>
              <div className="text-2xl font-bold text-gray-900">{stats.creators}</div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-gray-700 text-sm font-medium">Name</th>
                  <th className="text-left py-3 px-4 text-gray-700 text-sm font-medium">Email</th>
                  <th className="text-left py-3 px-4 text-gray-700 text-sm font-medium">Role</th>
                  <th className="text-left py-3 px-4 text-gray-700 text-sm font-medium">Department</th>
                  <th className="text-left py-3 px-4 text-gray-700 text-sm font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-gray-700 text-sm font-medium">Last Login</th>
                  <th className="text-left py-3 px-4 text-gray-700 text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="text-gray-900">{user.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{user.email}</td>
                    <td className="py-3 px-4">
                      <Badge className={getRoleBadgeColor(user.role)}>
                        {user.role}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{user.department}</td>
                    <td className="py-3 px-4">
                      <Badge className={user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {user.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{user.lastLogin}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <Edit2 className="w-4 h-4 text-gray-500" />
                        </button>
                        <button
                          className="p-1 hover:bg-gray-100 rounded"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {showAddUserModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add New User</h3>
            <p className="text-sm text-gray-600 mb-4">Create a new user and assign them a role in the system</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <Input
                  placeholder="Enter full name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                <Input
                  type="email"
                  placeholder="user@company.com"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
                >
                  <option value="">Select role</option>
                  {ROLE_OPTIONS.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                <select
                  value={newUser.department}
                  onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
                >
                  <option value="">Select department</option>
                  {DEPARTMENT_OPTIONS.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={newUser.status}
                  onChange={(e) => setNewUser({ ...newUser, status: e.target.value as 'Active' | 'Inactive' })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowAddUserModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleAddUser} className="flex-1">
                <Users className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
