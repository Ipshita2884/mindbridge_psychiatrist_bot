import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import { 
  Users, UserPlus, Search, Filter, Mail, 
  Activity, AlertCircle, ShieldCheck, HeartPulse,
  TrendingUp, AlertTriangle, Eye, ChevronRight
} from 'lucide-react';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api';

const PatientManagement = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState({ total: 0, critical: 0, monitoring: 0, stable: 0 });
  const token = localStorage.getItem('token');

  useEffect(() => { fetchPatients(); }, []);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/psychiatrist/patients`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setPatients(data.data);
        setStats({
          total: data.data.length,
          critical: data.data.filter((u: any) => (u.latest_stress || 0) > 75).length,
          monitoring: data.data.filter((u: any) => (u.latest_stress || 0) > 40 && (u.latest_stress || 0) <= 75).length,
          stable: data.data.filter((u: any) => !(u.latest_stress || 0) || (u.latest_stress || 0) <= 40).length,
        });
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const filtered = patients.filter(p =>
    (p.full_name || p.display_name)?.toLowerCase().includes(search.toLowerCase()) ||
    p.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleLogout = () => { localStorage.clear(); navigate('/'); };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar userRole="psychiatrist" onLogout={handleLogout} />
      
      <main className="container mx-auto px-6 pt-40 pb-12 max-w-7xl">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-serif font-bold text-slate-900 tracking-tight">Patient Management</h1>
            <p className="text-slate-500 text-lg mt-2">Oversee and manage clinical records for your patient network.</p>
          </div>
          <button 
            onClick={() => navigate('/psychiatrist/add-patient')}
            className="flex items-center gap-3 bg-indigo-600 text-white px-8 py-4 rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 font-bold"
          >
            <UserPlus className="w-5 h-5" /> Register New Patient
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="rounded-3xl border-none shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
            <CardContent className="p-0">
               <div className="p-8 bg-white flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Total Patients</p>
                    <p className="text-4xl font-bold text-slate-900">{stats.total}</p>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 transition-transform group-hover:scale-110">
                    <Users className="w-7 h-7" />
                  </div>
               </div>
               <div className="h-1.5 bg-indigo-600" />
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-none shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
            <CardContent className="p-0">
               <div className="p-8 bg-white flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">High Risk</p>
                    <p className="text-4xl font-bold text-rose-600">{stats.critical}</p>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 transition-transform group-hover:scale-110">
                    <AlertCircle className="w-7 h-7" />
                  </div>
               </div>
               <div className="h-1.5 bg-rose-500" />
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-none shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
            <CardContent className="p-0">
               <div className="p-8 bg-white flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Observation</p>
                    <p className="text-4xl font-bold text-amber-600">{stats.monitoring}</p>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 transition-transform group-hover:scale-110">
                    <Activity className="w-7 h-7" />
                  </div>
               </div>
               <div className="h-1.5 bg-amber-500" />
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-none shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
            <CardContent className="p-0">
               <div className="p-8 bg-white flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Stable</p>
                    <p className="text-4xl font-bold text-emerald-600">{stats.stable}</p>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 transition-transform group-hover:scale-110">
                    <ShieldCheck className="w-7 h-7" />
                  </div>
               </div>
               <div className="h-1.5 bg-emerald-500" />
            </CardContent>
          </Card>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search patients by name or email identifier..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-600/20 text-slate-900 placeholder:text-slate-400 font-medium"
            />
          </div>
          <button className="flex items-center gap-2 px-6 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 transition-colors">
            <Filter className="w-5 h-5" /> Filters
          </button>
        </div>

        {/* Patient Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 bg-white rounded-3xl border border-slate-200" />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((patient) => (
              <Card 
                key={patient.user_id}
                onClick={() => navigate(`/psychiatrist/patient/${patient.user_id}`)}
                className="rounded-3xl border-slate-200 hover:border-indigo-400 hover:shadow-xl transition-all cursor-pointer group bg-white"
              >
                <CardContent className="p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-2xl font-bold text-indigo-600">
                      {(patient.full_name || patient.display_name || patient.email)?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${
                        (patient.latest_stress || 0) > 75 ? 'bg-rose-100 text-rose-600' : 
                        (patient.latest_stress || 0) > 40 ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
                      }`}>
                        {(patient.latest_stress || 0) > 75 ? 'Critical' : (patient.latest_stress || 0) > 40 ? 'Monitoring' : 'Stable'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {patient.full_name || patient.display_name || 'Unnamed Patient'}
                      </h3>
                      <p className="text-slate-500 flex items-center gap-2 mt-1 font-medium truncate">
                        <Mail className="w-4 h-4" /> {patient.email}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 text-slate-600 text-sm font-medium">
                        <Activity className="w-4 h-4 text-slate-400" />
                        <span>{patient.latest_stress || '0'}% Stress</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600 text-sm font-medium">
                        <TrendingUp className="w-4 h-4 text-slate-400" />
                        <span>Active</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-300">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
               <Users className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">No patients found</h3>
            <p className="text-slate-500 max-w-sm mx-auto">
              Your patient clinical registry is currently empty or matches no search results.
            </p>
            <button 
              onClick={() => navigate('/psychiatrist/add-patient')}
              className="mt-8 px-6 py-3 bg-indigo-50 text-indigo-600 rounded-xl font-bold hover:bg-indigo-100 transition-colors"
            >
              + Add your first patient
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default PatientManagement;