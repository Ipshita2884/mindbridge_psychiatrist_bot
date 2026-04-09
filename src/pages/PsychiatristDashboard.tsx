import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import { 
  Users, AlertTriangle, TrendingUp, MessageCircle, 
  Search, Eye, Mail, UserPlus, Phone, Activity,
  ChevronRight, HeartPulse, Calendar, ShieldCheck,
  FileText
} from 'lucide-react';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api';

const PsychiatristDashboard = () => {
    const navigate = useNavigate();
    const [patients, setPatients] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, highStress: 0, active: 0 });
    const [selectedPatient, setSelectedPatient] = useState<any>(null);
    const [medicalHistory, setMedicalHistory] = useState<any[]>([]);
    const [stressLogs, setStressLogs] = useState<any[]>([]);
    
    const token = localStorage.getItem('token');
    const doctorName = localStorage.getItem('userName') || 'Doctor';

    useEffect(() => { fetchPatients(); }, []);

    useEffect(() => {
        if (selectedPatient) {
            fetchPatientDetails(selectedPatient.user_id);
        }
    }, [selectedPatient]);

    const fetchPatients = async () => {
        try {
            const res = await fetch(`${API_URL}/psychiatrist/patients`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) {
                setPatients(data.data);
                if (data.data.length > 0 && !selectedPatient) {
                    setSelectedPatient(data.data[0]);
                }
                const critical = data.data.filter((u: any) => (u.latest_stress || 0) > 75).length;
                setStats({ total: data.data.length, highStress: critical, active: data.data.length });
            }
        } catch (e) {
            console.error('Fetch error:', e);
        }
        setLoading(false);
    };

    const fetchPatientDetails = async (id: number) => {
        try {
            const resM = await fetch(`${API_URL}/psychiatrist/patients/${id}/medical-history`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const dataM = await resM.json();
            if (dataM.success) setMedicalHistory(dataM.data);

            const resS = await fetch(`${API_URL}/psychiatrist/patients/${id}/stress`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const dataS = await resS.json();
            if (dataS.success) setStressLogs(dataS.data);
        } catch (e) {
            console.error('Error fetching details:', e);
        }
    };

    const getStressColor = (level: number) => {
        if (!level) return 'bg-slate-100 text-slate-600';
        if (level <= 30) return 'bg-emerald-100 text-emerald-700';
        if (level <= 60) return 'bg-amber-100 text-amber-700';
        return 'bg-rose-100 text-rose-700';
    };

    const getStressLabel = (level: number) => {
        if (!level) return 'Stable';
        if (level <= 30) return 'Stable';
        if (level <= 60) return 'Observation';
        return 'Critical';
    };

    const filtered = patients.filter(p =>
        (p.full_name || p.display_name)?.toLowerCase().includes(search.toLowerCase()) ||
        p.email?.toLowerCase().includes(search.toLowerCase())
    );

    const handleLogout = () => { localStorage.clear(); navigate('/'); };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar userRole="psychiatrist" onLogout={handleLogout} />
      
      <main className="container mx-auto px-6 pt-48 pb-12 max-w-7xl tracking-tight">
        {/* Modern Header Section */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-5xl font-serif font-black text-slate-900 tracking-tight">
              Clinical Hub <span className="text-slate-300 mx-2 font-normal">/</span> Dr. {doctorName} 🩺
            </h1>
            <p className="text-slate-500 mt-3 text-xl font-medium">
              Overseeing <span className="text-indigo-600 font-bold">{stats.total} patient protocols</span> in current session.
            </p>
          </div>
          <div className="flex items-center gap-3">
             <div className="bg-white px-6 py-3 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                <span className="text-sm font-black text-slate-800 uppercase tracking-widest">Protocol Active</span>
             </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {[
            { 
              label: 'Patient Registry', 
              value: stats.total, 
              icon: Users, 
              color: 'from-indigo-600 to-indigo-800',
              bg: 'bg-indigo-50',
              iconColor: 'text-indigo-600'
            },
            { 
              label: 'Urgent Cases', 
              value: stats.highStress, 
              icon: AlertTriangle, 
              color: 'from-rose-500 to-rose-700',
              bg: 'bg-rose-50',
              iconColor: 'text-rose-600'
            },
            { 
              label: 'Active Sync', 
              value: stats.active, 
              icon: TrendingUp, 
              color: 'from-emerald-500 to-emerald-700',
              bg: 'bg-emerald-50',
              iconColor: 'text-emerald-600'
            }
          ].map((stat, i) => (
            <Card key={i} className="overflow-hidden border-none shadow-sm hover:shadow-2xl transition-all duration-500 group rounded-[2.5rem] bg-white">
               <div className={`absolute top-0 left-0 w-2 h-full bg-gradient-to-b ${stat.color}`} />
              <CardContent className="p-8">
                <div className="flex items-center gap-6">
                  <div className={`w-16 h-16 rounded-3xl ${stat.bg} ${stat.iconColor} flex items-center justify-center transition-transform group-hover:scale-110 duration-500`}>
                    <stat.icon className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-4xl font-black text-slate-900">{stat.value}</p>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mt-1">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start h-[800px]">
          
          {/* LEFT: Patient Registry Column */}
          <div className="lg:col-span-4 h-full">
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
              <div className="p-8 pb-4">
                <h2 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">Patient Registry</h2>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search identity records..."
                    className="w-full pl-12 pr-4 py-4 text-sm border-none bg-slate-50 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium placeholder:text-slate-400 shadow-inner"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-4 pb-8 scrollbar-thin scrollbar-thumb-slate-200">
                {loading ? (
                  <div className="flex items-center justify-center p-12 h-64">
                    <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="text-center py-20 px-8">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Users className="w-10 h-10 text-slate-200" />
                    </div>
                    <p className="font-bold text-slate-900 text-lg">No matching records</p>
                    <p className="text-sm text-slate-400 mt-2 font-medium">Please verify the clinical identifier.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filtered.map(patient => (
                      <button 
                        key={patient.user_id}
                        onClick={() => setSelectedPatient(patient)}
                        className={`group relative w-full flex items-center gap-5 p-5 rounded-[2rem] transition-all duration-300 border h-24 ${
                          selectedPatient?.user_id === patient.user_id 
                            ? 'bg-indigo-50 border-indigo-100 shadow-lg shadow-indigo-100/50 scale-[1.02]' 
                            : 'hover:bg-slate-50 border-transparent bg-white shadow-sm'
                        }`}
                      >
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-md transition-colors ${
                           selectedPatient?.user_id === patient.user_id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600'
                        }`}>
                          {(patient.full_name || patient.display_name)?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <p className={`font-black tracking-tight truncate ${selectedPatient?.user_id === patient.user_id ? 'text-indigo-900' : 'text-slate-900'}`}>
                            {patient.full_name || patient.display_name}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`w-2 h-2 rounded-full ${patient.can_message ? 'bg-indigo-500 shadow-[0_0_5px_rgba(99,102,241,0.5)]' : 'bg-slate-300'}`} />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">{patient.email}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                           <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${getStressColor(patient.latest_stress)}`}>
                             {patient.latest_stress ? `${patient.latest_stress}%` : '--'}
                           </span>
                           <ChevronRight className={`w-5 h-5 transition-all transform ${selectedPatient?.user_id === patient.user_id ? 'text-indigo-600 translate-x-1 opacity-100' : 'text-slate-200 opacity-0'}`} />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Selection Detail Column */}
          <div className="lg:col-span-8 h-full">
            {selectedPatient ? (
              <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full animate-in fade-in slide-in-from-right-8 duration-500">
                {/* Header Banner */}
                <div className="relative h-44 bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800">
                   <div className="absolute -bottom-16 left-12 flex items-end gap-8">
                      <div className="w-36 h-36 rounded-[2.5rem] bg-white p-3 shadow-2xl border border-white/20">
                         <div className="w-full h-full rounded-[1.8rem] bg-indigo-50 border border-indigo-100 flex items-center justify-center font-black text-5xl text-indigo-600">
                            {(selectedPatient.full_name || selectedPatient.display_name)?.charAt(0).toUpperCase()}
                         </div>
                      </div>
                      <div className="mb-4">
                         <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-4xl font-black text-slate-900 tracking-tighter">{selectedPatient.full_name || selectedPatient.display_name}</h2>
                            {selectedPatient.can_message && <div className="p-1 px-3 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase rounded-full border border-indigo-100 tracking-tighter shadow-sm">Messaging Open</div>}
                         </div>
                         <p className="text-slate-400 text-lg font-bold flex items-center gap-4 group px-1">
                           <Mail className="w-5 h-5 text-slate-300" /> {selectedPatient.email}
                           <span className="opacity-10 text-slate-200">|</span>
                           <Phone className="w-5 h-5 text-slate-300" /> {selectedPatient.phone || 'Registry empty'}
                         </p>
                      </div>
                   </div>
                   <div className="absolute top-8 right-8 flex gap-4">
                      <Button 
                        variant="secondary" 
                        size="lg"
                        className="bg-white/20 hover:bg-white/40 text-white border-none backdrop-blur-xl rounded-2xl px-10 font-black shadow-lg shadow-black/10 transition-all active:scale-95"
                        onClick={() => navigate(`/psychiatrist/patient/${selectedPatient.user_id}`)}
                      >
                         <Eye className="w-5 h-5 mr-3" /> Detailed Clinical Protocol
                      </Button>
                   </div>
                </div>

                <div className="flex-1 pt-24 p-12 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-100 space-y-12 bg-white">
                   {/* Clinical Stats Row */}
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100 shadow-inner group">
                         <div className="flex items-center gap-3 mb-4">
                            <Activity className="w-5 h-5 text-indigo-600" />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Biometric Score</p>
                         </div>
                         <div className="flex items-center gap-3">
                            <p className="text-3xl font-black text-slate-900">{selectedPatient.latest_stress ? `${100 - selectedPatient.latest_stress}%` : 'N/A'}</p>
                            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">Wellness</span>
                         </div>
                      </div>
                      <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100 shadow-inner">
                         <div className="flex items-center gap-3 mb-4">
                            <AlertTriangle className="w-5 h-5 text-rose-500" />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Clinical Risk</p>
                         </div>
                         <div className="flex items-center gap-3">
                            <span className={`w-3.5 h-3.5 rounded-full ${selectedPatient.latest_stress > 75 ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)] animate-pulse' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'}`} />
                            <p className="text-2xl font-black text-slate-900">{getStressLabel(selectedPatient.latest_stress)}</p>
                         </div>
                      </div>
                      <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100 shadow-inner">
                         <div className="flex items-center gap-3 mb-4">
                            <ShieldCheck className="w-5 h-5 text-indigo-500" />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol Intake</p>
                         </div>
                         <p className="text-2xl font-black text-slate-900 truncate font-mono">{new Date(selectedPatient.created_at || Date.now()).toLocaleDateString()}</p>
                      </div>
                   </div>

                   {/* Intelligence Grid */}
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      {/* Medical History Preview */}
                      <div className="space-y-6">
                         <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3 pb-4 border-b border-slate-50">
                            <HeartPulse className="w-5 h-5 text-rose-500" /> Clinical History Feed
                         </h3>
                         {medicalHistory.length > 0 ? (
                           <div className="space-y-4 max-h-[350px] overflow-y-auto pr-3 scrollbar-thin scrollbar-thumb-slate-100">
                              {medicalHistory.map((h, i) => (
                                 <div key={i} className="p-5 bg-white border border-slate-100 rounded-3xl shadow-sm hover:border-indigo-200 transition-all border-l-4 border-l-indigo-600">
                                    <h4 className="font-black text-slate-900 text-sm mb-1 uppercase tracking-tight">{h.condition}</h4>
                                    <p className="text-[10px] text-slate-400 font-bold opacity-70 mb-3 italic">Diagnostic Node: {h.diagnosed_by || 'Aura AI Registry'}</p>
                                    <p className="text-xs text-slate-600 leading-relaxed font-bold bg-slate-50 p-4 rounded-2xl italic">{h.notes || 'No observation notes available.'}</p>
                                 </div>
                              ))}
                           </div>
                         ) : (
                           <div className="py-20 bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-200 text-center px-8">
                             <FileText className="w-10 h-10 text-slate-200 mx-auto mb-4" />
                             <p className="text-slate-400 font-bold text-sm tracking-tighter italic">No history records detected.</p>
                           </div>
                         )}
                      </div>

                      {/* Stress Trajectory Preview */}
                      <div className="space-y-6">
                         <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3 pb-4 border-b border-slate-50">
                            <TrendingUp className="w-5 h-5 text-indigo-600" /> Biometric Trajectory
                         </h3>
                         {stressLogs.length > 0 ? (
                            <div className="space-y-4 pr-3">
                               {stressLogs.slice(0, 4).map((log, i) => (
                                  <div key={i} className="p-5 bg-white border border-slate-100 rounded-3xl shadow-sm">
                                     <div className="flex justify-between items-center mb-3">
                                        <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest">{new Date(log.recorded_date).toLocaleDateString()}</p>
                                        <span className={`text-xs font-black ${log.stress_level > 60 ? 'text-rose-600' : 'text-emerald-600'}`}>{log.stress_level}% Level</span>
                                     </div>
                                     <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                        <div className={`h-full transition-all duration-700 ${log.stress_level > 60 ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]' : 'bg-emerald-500'}`} style={{ width: `${log.stress_level}%` }} />
                                     </div>
                                  </div>
                               ))}
                               <Button 
                                 variant="link" 
                                 className="text-indigo-600 font-black text-xs uppercase tracking-widest p-0 decoration-2 underline-offset-4 mt-2"
                                 onClick={() => navigate(`/psychiatrist/patient/${selectedPatient.user_id}`)}
                               >
                                 Open Protocol Timeline &rarr;
                               </Button>
                            </div>
                         ) : (
                            <div className="py-20 bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-200 text-center px-8">
                              <Activity className="w-10 h-10 text-slate-200 mx-auto mb-4" />
                              <p className="text-slate-400 font-bold text-sm tracking-tighter italic">Syncing biometric trajectory...</p>
                            </div>
                         )}
                      </div>
                   </div>
                   
                   {/* Action Footer */}
                   <div className="pt-12 border-t border-slate-100 flex gap-6 mt-auto">
                      <Button 
                        onClick={() => navigate(`/psychiatrist/messages?patient=${selectedPatient.user_id}`)}
                        disabled={!selectedPatient.can_message}
                        className="flex-1 h-20 rounded-[1.8rem] bg-indigo-600 hover:bg-indigo-700 shadow-2xl shadow-indigo-200 gap-4 font-black text-xl transition-all active:scale-95 disabled:bg-slate-300 disabled:shadow-none"
                      >
                         <MessageCircle className="w-8 h-8" /> Private Clinical Portal
                      </Button>
                      <Button 
                        variant="outline"
                        className="w-20 h-20 rounded-[1.8rem] border-slate-200 hover:bg-slate-50 flex items-center justify-center p-0 shadow-sm transition-all active:scale-95 group"
                      >
                         <AlertTriangle className="w-8 h-8 text-slate-300 group-hover:text-rose-500 transition-colors" />
                      </Button>
                   </div>
                </div>
              </div>
            ) : (
              <div className="h-full bg-slate-50/30 rounded-[3rem] border-4 border-dashed border-slate-200 flex flex-col items-center justify-center text-center p-20 animate-pulse">
                <div className="w-32 h-32 bg-white rounded-[2.8rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] flex items-center justify-center mb-10 ring-8 ring-white/50">
                  <HeartPulse className="w-16 h-16 text-indigo-100" />
                </div>
                <h3 className="text-4xl font-serif font-black text-slate-900 tracking-tighter mb-4">Patient Decision Node</h3>
                <p className="text-slate-400 text-xl font-bold max-w-sm leading-relaxed tracking-tight">
                  Initialize a selection from the clinical registry on the left to sync biometric trajectory and medical history.
                </p>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};

export default PsychiatristDashboard;