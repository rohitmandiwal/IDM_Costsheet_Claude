import { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { Edit2, Trash2, Save, X, UserPlus } from 'lucide-react';
import type { User, CreateUserRequest, UpdateUserRequest } from '../../types/admin.types';
import { ALL_ROLES, ROLE_DISPLAY_NAMES, DEPARTMENTS } from '../../constants/admin.constants';

interface UserAssignmentTabProps {
    users: User[];
    onCreateUser: (data: CreateUserRequest) => Promise<void>;
    onUpdateUser: (id: number, data: UpdateUserRequest) => Promise<void>;
    onDeleteUser: (id: number) => Promise<void>;
    isLoading: boolean;
}

export function UserAssignmentTab({
    users,
    onCreateUser,
    onUpdateUser,
    onDeleteUser,
    isLoading,
}: UserAssignmentTabProps) {
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const stats = {
        totalUsers: users.length,
        activeUsers: users.filter((u) => u.is_active).length,
        approvers: users.filter((u) =>
            u.role_assignments?.some((r) => r.role.startsWith('approver_'))
        ).length,
        initiators: users.filter((u) =>
            u.role_assignments?.some((r) => r.role === 'initiator')
        ).length,
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            return;
        }

        try {
            await onDeleteUser(id);
        } catch (error: any) {
            alert(error.message || 'Failed to delete user');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800">User Role Assignment</h3>
                    <p className="text-sm text-gray-500">Assign roles and permissions to users in the system</p>
                </div>
                <Button onClick={() => setShowAddModal(true)} disabled={isLoading}>
                    <UserPlus size={16} className="mr-2" />
                    Add User
                </Button>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-6">
                <StatCard title="Total Users" value={stats.totalUsers} />
                <StatCard title="Active Users" value={stats.activeUsers} />
                <StatCard title="Approvers" value={stats.approvers} />
                <StatCard title="Initiators" value={stats.initiators} />
            </div>

            <UserTable
                users={users}
                editingId={editingId}
                onEdit={setEditingId}
                onUpdate={onUpdateUser}
                onDelete={handleDelete}
                onCancelEdit={() => setEditingId(null)}
                isLoading={isLoading}
            />

            {showAddModal && (
                <AddUserModal
                    onAdd={onCreateUser}
                    onClose={() => setShowAddModal(false)}
                    isLoading={isLoading}
                />
            )}
        </div>
    );
}

const StatCard = ({ title, value }: { title: string; value: number }) => (
    <div className="bg-gray-50 p-4 rounded-lg border">
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
);

interface UserTableProps {
    users: User[];
    editingId: number | null;
    onEdit: (id: number) => void;
    onUpdate: (id: number, data: UpdateUserRequest) => Promise<void>;
    onDelete: (id: number) => void;
    onCancelEdit: () => void;
    isLoading: boolean;
}

const UserTable = ({ users, editingId, onEdit, onUpdate, onDelete, onCancelEdit, isLoading }: UserTableProps) => {
    const [editFormData, setEditFormData] = useState<UpdateUserRequest>({});

    const handleEdit = (user: User) => {
        onEdit(user.id);
        setEditFormData({
            username: user.username,
            full_name: user.full_name,
            email: user.email,
            department: user.department || undefined,
            is_active: user.is_active,
            roles: user.role_assignments?.map((r) => r.role) || [],
        });
    };

    const handleUpdate = async (id: number) => {
        try {
            await onUpdate(id, editFormData);
            onCancelEdit();
            setEditFormData({});
        } catch (error: any) {
            alert(error.message || 'Failed to update user');
        }
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b">
                        <th className="p-3 text-left text-sm font-medium text-gray-600">User</th>
                        <th className="p-3 text-left text-sm font-medium text-gray-600">Role</th>
                        <th className="p-3 text-left text-sm font-medium text-gray-600">Department</th>
                        <th className="p-3 text-left text-sm font-medium text-gray-600">Status</th>
                        <th className="p-3 text-right text-sm font-medium text-gray-600">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.id} className="border-b hover:bg-gray-50">
                            {editingId === user.id ? (
                                <>
                                    <td className="p-3" colSpan={5}>
                                        <div className="space-y-3">
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-xs font-medium mb-1">Username</label>
                                                    <Input
                                                        value={editFormData.username || ''}
                                                        onChange={(e) => setEditFormData({ ...editFormData, username: e.target.value })}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium mb-1">Full Name</label>
                                                    <Input
                                                        value={editFormData.full_name || ''}
                                                        onChange={(e) => setEditFormData({ ...editFormData, full_name: e.target.value })}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium mb-1">Email</label>
                                                    <Input
                                                        type="email"
                                                        value={editFormData.email || ''}
                                                        onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium mb-1">Department</label>
                                                    <select
                                                        className="w-full p-2 border border-gray-300 rounded-md"
                                                        value={editFormData.department || ''}
                                                        onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value || null })}
                                                    >
                                                        <option value="">Select department</option>
                                                        {DEPARTMENTS.map((dept) => (
                                                            <option key={dept} value={dept}>
                                                                {dept}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium mb-1">Status</label>
                                                    <select
                                                        className="w-full p-2 border border-gray-300 rounded-md"
                                                        value={editFormData.is_active ? 'active' : 'inactive'}
                                                        onChange={(e) =>
                                                            setEditFormData({ ...editFormData, is_active: e.target.value === 'active' })
                                                        }
                                                    >
                                                        <option value="active">Active</option>
                                                        <option value="inactive">Inactive</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-medium mb-2">Role (Select exactly one)</label>
                                                <div className="flex flex-wrap gap-2">
                                                    {ALL_ROLES.map((role) => {
                                                        const isSelected = editFormData.roles?.includes(role);
                                                        return (
                                                            <button
                                                                key={role}
                                                                type="button"
                                                                onClick={() => {
                                                                    // Single role selection - toggle on/off
                                                                    setEditFormData({
                                                                        ...editFormData,
                                                                        roles: isSelected ? [] : [role],
                                                                    });
                                                                }}
                                                                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${isSelected
                                                                    ? 'bg-blue-600 text-white'
                                                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                                    }`}
                                                            >
                                                                {ROLE_DISPLAY_NAMES[role]}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            <div className="flex justify-end gap-2">
                                                <Button size="sm" onClick={() => handleUpdate(user.id)} disabled={isLoading}>
                                                    <Save size={14} className="mr-1" />
                                                    Save
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        onCancelEdit();
                                                        setEditFormData({});
                                                    }}
                                                >
                                                    <X size={14} className="mr-1" />
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    </td>
                                </>
                            ) : (
                                <>
                                    <td className="p-3">
                                        <p className="font-medium text-gray-800">{user.full_name}</p>
                                        <p className="text-xs text-gray-500">{user.email}</p>
                                        <p className="text-xs text-gray-400">@{user.username}</p>
                                    </td>
                                    <td className="p-3">
                                        {user.role_assignments?.map((ra) => (
                                            <Badge key={ra.id} variant="default">
                                                {ROLE_DISPLAY_NAMES[ra.role]}
                                            </Badge>
                                        ))}
                                    </td>
                                    <td className="p-3">
                                        <p className="text-sm text-gray-700">{user.department || '-'}</p>
                                    </td>
                                    <td className="p-3">
                                        <Badge variant={user.is_active ? 'default' : 'secondary'}>
                                            {user.is_active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </td>
                                    <td className="p-3">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEdit(user)}
                                                disabled={isLoading || editingId !== null}
                                            >
                                                <Edit2 size={16} />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => onDelete(user.id)}
                                                disabled={isLoading || editingId !== null}
                                            >
                                                <Trash2 size={16} className="text-red-500" />
                                            </Button>
                                        </div>
                                    </td>
                                </>
                            )}
                        </tr>
                    ))}

                    {users.length === 0 && (
                        <tr>
                            <td colSpan={5} className="p-8 text-center text-gray-500">
                                No users found. Click "Add User" to create one.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

interface AddUserModalProps {
    onAdd: (data: CreateUserRequest) => Promise<void>;
    onClose: () => void;
    isLoading: boolean;
}

const AddUserModal = ({ onClose, onAdd, isLoading }: AddUserModalProps) => {
    const [formData, setFormData] = useState<CreateUserRequest>({
        username: '',
        full_name: '',
        email: '',
        password: '',
        department: undefined,
        is_active: true,
        roles: [],
    });

    const handleAdd = async () => {
        if (!formData.username || !formData.full_name || !formData.email || !formData.password) {
            alert('Please fill in username, full name, email, and password');
            return;
        }

        if (formData.password.length < 8) {
            alert('Password must be at least 8 characters long');
            return;
        }

        if (formData.roles.length === 0) {
            alert('Please select exactly one role');
            return;
        }

        if (formData.roles.length > 1) {
            alert('Only one role can be assigned per user');
            return;
        }

        try {
            await onAdd(formData);
            onClose();
        } catch (error: any) {
            alert(error.message || 'Failed to create user');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">Add New User</h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Username *</label>
                                <Input
                                    placeholder="e.g., john.doe"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Full Name *</label>
                                <Input
                                    placeholder="e.g., John Doe"
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Email *</label>
                                <Input
                                    type="email"
                                    placeholder="john.doe@example.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Password *</label>
                                <Input
                                    type="password"
                                    placeholder="Min. 8 characters"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                                <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Department</label>
                                <select
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    value={formData.department || ''}
                                    onChange={(e) => setFormData({ ...formData, department: e.target.value || undefined })}
                                >
                                    <option value="">Select department</option>
                                    {DEPARTMENTS.map((dept) => (
                                        <option key={dept} value={dept}>
                                            {dept}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Status</label>
                                <select
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    value={formData.is_active ? 'active' : 'inactive'}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'active' })}
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Role * (Select exactly one)</label>
                            <div className="flex flex-wrap gap-2">
                                {ALL_ROLES.map((role) => {
                                    const isSelected = formData.roles.includes(role);
                                    return (
                                        <button
                                            key={role}
                                            type="button"
                                            onClick={() => {
                                                // Single role selection - toggle on/off
                                                setFormData({
                                                    ...formData,
                                                    roles: isSelected ? [] : [role],
                                                });
                                            }}
                                            className={`px-3 py-2 rounded-full text-sm transition-colors ${isSelected
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                }`}
                                        >
                                            {ROLE_DISPLAY_NAMES[role]}
                                        </button>
                                    );
                                })}
                            </div>
                            <p className="text-xs text-gray-500 mt-2">Click to select one role. Click again to deselect.</p>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-6">
                        <Button variant="outline" onClick={onClose} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button onClick={handleAdd} disabled={isLoading}>
                            <UserPlus size={16} className="mr-2" />
                            Add User
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
