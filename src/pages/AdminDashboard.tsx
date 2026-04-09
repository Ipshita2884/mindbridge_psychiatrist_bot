import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import { Users, Trash2, Search, UserCheck, UserX, RefreshCw, AlertTriangle, Bell, CheckCircle } from 'lucide-react';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, users: 0, psychiatrists: 0, admins: 0 });
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const [toast, setToast] = useState('');
    const token = localStorage.getItem('token');
    const [alerts, setAlerts] = useState<any[]>([]);
    const [alertsLoading, setAlertsLoading] = useState(true);

    useEffect(() => { fetchUsers(); fetchAlerts(); }, []);

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/admin/users`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) {
                setUsers(data.data);
                setStats({
                    total: data.data.length,
                    users: data.data.filter((u: any) => u.role === 'user').length,
                    psychiatrists: data.data.filter((u: any) => u.role === 'psychiatrist').length,
                    admins: data.data.filter((u: any) => u.role === 'admin').length,
                });
            }
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    const fetchAlerts = async () => {
        setAlertsLoading(true);
        try {
            const res = await fetch(`${API_URL}/admin/emergency-alerts`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) setAlerts(data.data || []);
        } catch (e) { console.error(e); }
        setAlertsLoading(false);
    };

    const resolveAlert = async (alertId: number) => {
        try {
            await fetch(`${API_URL}/admin/emergency-alerts/${alertId}/resolve`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` },
            });
            setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'resolved' } : a));
            showToast('Alert resolved!');
        } catch (e) { console.error(e); }
    };

    const updateRole = async (userId: number, newRole: string) => {
        setActionLoading(userId);
        try {
            const res = await fetch(`${API_URL}/users/role`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ userId, role: newRole }),
            });
            const data = await res.json();
            if (data.success) {
                setUsers(prev => prev.map(u => u.user_id === userId ? { ...u, role: newRole } : u));
                showToast(`Role updated to ${newRole}`);
            }
        } catch (e) { console.error(e); }
        setActionLoading(null);
    };

    const toggleActive = async (userId: number, current: boolean) => {
        setActionLoading(userId);
        try {
            const res = await fetch(`${API_URL}/users/toggle`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ userId, isActive: !current }),
            });
            const data = await res.json();
            if (data.success) {
                setUsers(prev => prev.map(u => u.user_id === userId ? { ...u, is_active: !current } : u));
                showToast(`User ${!current ? 'activated' : 'deactivated'}`);
            }
        } catch (e) { console.error(e); }
        setActionLoading(null);
    };

    const deleteUser = async (userId: number) => {
        if (!confirm('Are you sure?')) return;
        setActionLoading(userId);
        try {
            const res = await fetch(`${API_URL}/users/delete/${userId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) {
                setUsers(prev => prev.filter(u => u.user_id !== userId));
                showToast('User deleted');
            }
        } catch (e) { console.error(e); }
        setActionLoading(null);
    };

    const filtered = users.filter(u => {
        const matchSearch = u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
            u.email?.toLowerCase().includes(search.toLowerCase());
        const matchRole = roleFilter === 'all' || u.role === roleFilter;
        return matchSearch && matchRole;
    });

    const roleColors: Record<string, string> = {
        user: 'bg-blue-100 text-blue-700',
        psychiatrist: 'bg-purple-100 text-purple-700',
        admin: 'bg-orange-100 text-orange-700',
    };

    const handleLogout = () => { localStorage.clear(); navigate('/'); };

    return (
        <div className="min-h-screen bg-background">
            <Navbar userRole="admin" onLogout={handleLogout} />

            {toast && (
                <div className="fixed top-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg z-50 text-sm">
                    ✅ {toast}
                </div>
            )}

            <main className="container mx-auto px-4 py-6 max-w-6xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-serif font-bold">Admin Dashboard 🛡️</h1>
                    <p className="text-muted-foreground mt-1">Manage all users, roles and system access</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: 'Total Users', value: stats.total, bg: 'bg-blue-50', icon: '👥' },
                        { label: 'Patients', value: stats.users, bg: 'bg-teal-50', icon: '🧘' },
                        { label: 'Psychiatrists', value: stats.psychiatrists, bg: 'bg-purple-50', icon: '🩺' },
                        { label: 'Admins', value: stats.admins, bg: 'bg-orange-50', icon: '⚙️' },
                    ].map(s => (
                        <Card key={s.label}>
                            <CardContent className={`p-5 ${s.bg} rounded-xl`}>
                                <p className="text-2xl">{s.icon}</p>
                                <p className="text-2xl font-bold mt-1">{s.value}</p>
                                <p className="text-sm text-muted-foreground">{s.label}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <CardTitle className="flex items-center gap-2">
                                <Users className="w-5 h-5" /> User Management
                            </CardTitle>
                            <div className="flex gap-3 flex-wrap">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input value={search} onChange={e => setSearch(e.target.value)}
                                        placeholder="Search users..."
                                        className="pl-9 pr-4 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 w-56" />
                                </div>
                                <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
                                    className="px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none">
                                    <option value="all">All Roles</option>
                                    <option value="user">Patients</option>
                                    <option value="psychiatrist">Psychiatrists</option>
                                    <option value="admin">Admins</option>
                                </select>
                                <button onClick={fetchUsers}
                                    className="flex items-center gap-1 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors">
                                    <RefreshCw className="w-4 h-4" /> Refresh
                                </button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex items-center justify-center h-40">
                                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p>No users found</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-border text-muted-foreground text-left">
                                            <th className="pb-3 font-medium">User</th>
                                            <th className="pb-3 font-medium">Role</th>
                                            <th className="pb-3 font-medium">Status</th>
                                            <th className="pb-3 font-medium">Stress</th>
                                            <th className="pb-3 font-medium">Joined</th>
                                            <th className="pb-3 font-medium">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {filtered.map(user => (
                                            <tr key={user.user_id} className="hover:bg-muted/30 transition-colors">
                                                <td className="py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary text-sm">
                                                            {user.full_name?.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-foreground">{user.full_name}</p>
                                                            <p className="text-xs text-muted-foreground">{user.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3">
                                                    <select value={user.role}
                                                        onChange={e => updateRole(user.user_id, e.target.value)}
                                                        disabled={actionLoading === user.user_id}
                                                        className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${roleColors[user.role]}`}>
                                                        <option value="user">Patient</option>
                                                        <option value="psychiatrist">Psychiatrist</option>
                                                        <option value="admin">Admin</option>
                                                    </select>
                                                </td>
                                                <td className="py-3">
                                                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        {user.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="py-3">
                                                    <span className={`text-xs font-semibold ${!user.latest_stress ? 'text-muted-foreground' :
                                                            user.latest_stress > 60 ? 'text-red-500' :
                                                                user.latest_stress > 30 ? 'text-yellow-500' : 'text-green-500'
                                                        }`}>
                                                        {user.latest_stress ? `${user.latest_stress}` : 'No data'}
                                                    </span>
                                                </td>
                                                <td className="py-3 text-muted-foreground text-xs">
                                                    {new Date(user.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="py-3">
                                                    <div className="flex items-center gap-2">
                                                        <button onClick={() => toggleActive(user.user_id, user.is_active)}
                                                            disabled={actionLoading === user.user_id}
                                                            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                                                            title={user.is_active ? 'Deactivate' : 'Activate'}>
                                                            {user.is_active
                                                                ? <UserX className="w-4 h-4 text-yellow-500" />
                                                                : <UserCheck className="w-4 h-4 text-green-500" />}
                                                        </button>
                                                        <button onClick={() => deleteUser(user.user_id)}
                                                            disabled={actionLoading === user.user_id}
                                                            className="p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                                                            <Trash2 className="w-4 h-4 text-red-500" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* SOS / Emergency Alerts Section */}
                <Card className="mt-8">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-red-600">
                                <AlertTriangle className="w-5 h-5" /> SOS & Emergency Alerts
                                {alerts.filter(a => a.status !== 'resolved').length > 0 && (
                                    <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                                        {alerts.filter(a => a.status !== 'resolved').length} Active
                                    </span>
                                )}
                            </CardTitle>
                            <button onClick={fetchAlerts}
                                className="flex items-center gap-1 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors">
                                <RefreshCw className="w-4 h-4" /> Refresh
                            </button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {alertsLoading ? (
                            <div className="flex items-center justify-center h-24">
                                <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : alerts.length === 0 ? (
                            <div className="text-center py-10 text-muted-foreground">
                                <Bell className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                <p>No emergency alerts at the moment</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {alerts.map(alert => (
                                    <div key={alert.id} className={`flex items-start justify-between p-4 rounded-xl border ${alert.resolved_at !== null ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                        <div className="flex items-start gap-3">
                                            <AlertTriangle className={`w-5 h-5 mt-0.5 ${alert.resolved_at !== null ? 'text-green-500' : 'text-red-500'}`} />
                                            <div>
                                                <p className="font-semibold text-sm">{alert.full_name || 'Unknown User'}</p>
                                                <p className="text-xs text-muted-foreground">{alert.email}</p>
                                                <p className="text-sm mt-1">Trigger: {alert.trigger_type} | Severity: {alert.severity}</p>
                                                <p className="text-xs text-muted-foreground mt-1">{alert.notified_at ? new Date(alert.notified_at).toLocaleString() : 'Unknown time'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${alert.resolved_at !== null ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {alert.resolved_at !== null ? 'Resolved' : 'Active'}
                                            </span>
                                            {alert.status !== 'resolved' && (
                                                <button onClick={() => resolveAlert(alert.id)}
                                                    className="flex items-center gap-1 px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                                                    <CheckCircle className="w-3 h-3" /> Resolve
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    );
};

export default AdminDashboard;