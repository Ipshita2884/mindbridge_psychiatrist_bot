import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import { 
  ArrowLeft, Phone, Mail, MessageSquare, 
  Activity, AlertCircle, HeartPulse, 
  Calendar, ShieldCheck, Clock, FileText,
  User, CheckCircle2, XCircle, TrendingUp
} from 'lucide-react';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api';

const PatientDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [patient, setPatient] = useState<any>(null);
  const [medicalHistory, setMedicalHistory] = useState<any[]>([]);
  const [stressLogs, setStressLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (id) {
       fetchPatientData();
    }
  }, [id]);

  const fetchPatientData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Patient Basic Info
      const resP = await fetch(`${API_URL}/psychiatrist/patients`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const dataP = await resP.json();
      if (dataP.success) {
        const found = dataP.data.find((u: any) => String(u.user_id) === String(id));
        setPatient(found);
      }

      // 2. Fetch Medical History
      const resM = await fetch(`${API_URL}/psychiatrist/patients/${id}/medical-history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const dataM = await resM.json();
      if (dataM.success) setMedicalHistory(dataM.data);

      // 3. Fetch Stress Logs
      const resS = await fetch(`${API_URL}/psychiatrist/patients/${id}/stress`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const dataS = await resS.json();
      if (dataS.success) setStressLogs(dataS.data);

    } catch (e) {
      console.error('Error fetching clinical data:', e);
    }
    setLoading(false);
  };

  const toggleMessaging = async () => {
    if (!patient) return;
    setToggling(true);
    try {
      const res = await fetch(`${API_URL}/psychiatrist/patients/${id}/toggle-messaging`, {
        method: 'PUT',
        headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ can_message: !patient.can_message })
      });
      if (res.ok) {
        setPatient({ ...patient, can_message: !patient.can_message });
      }
    } catch (e) {
      console.error('Toggle error:', e);
    }
    setToggling(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  if (loading) return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
       <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 font-bold animate-pulse">Loading Clinical Profile...</p>
       </div>
    </div>
  );

  if (!patient) return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
       <Card className="p-12 text-center rounded-3xl shadow-xl">
          <AlertCircle className="w-16 h-16 text-rose-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Patient Not Found</h2>
          <p className="text-slate-500 mb-8">This record may have been moved or removed from the registry.</p>
          <Button onClick={() => navigate('/psychiatrist/patients')} className="bg-indigo-600 rounded-2xl px-8 h-14 font-bold shadow-lg shadow-indigo-100">
             Return to Records
          </Button>
       </Card>
    </div>
  );

  const latestStress = stressLogs.length > 0 ? stressLogs[0].stress_level : (patient.latest_stress || 0);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar userRole="psychiatrist" onLogout={handleLogout} />

      <main className="container mx-auto px-6 pt-40 pb-20 max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div className="flex items-center gap-6">
                <button 
                  onClick={() => navigate('/psychiatrist/patients')}
                  className="p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all text-slate-500 hover:text-indigo-600 group border border-slate-100"
                >
                  <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                </button>
                <div>
                   <h1 className="text-4xl font-serif font-bold text-slate-900 tracking-tight">{patient.full_name || patient.display_name}</h1>
                   <div className="flex items-center gap-3 mt-1 text-slate-500 font-medium">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      Patient ID: <span className="text-slate-900 font-bold">#CLIN-{id}</span>
                      <span className="mx-2 opacity-20">|</span>
                      {patient.gender || 'Not specified'}
                      <span className="mx-2 opacity-20">|</span>
                      {patient.dob ? new Date(patient.dob).toLocaleDateString() : 'DOB unknown'}
                   </div>
                </div>
            </div>
            
            <div className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                <div className={`w-3 h-3 rounded-full animate-pulse ${patient.can_message ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-slate-300'}`} />
                <span className="text-sm font-bold text-slate-700">Messaging: {patient.can_message ? 'Active' : 'Restricted'}</span>
                <Button 
                   onClick={toggleMessaging}
                   disabled={toggling}
                   variant={patient.can_message ? 'outline' : 'default'}
                   className={`rounded-xl h-10 px-6 font-bold transition-all ${
                     patient.can_message 
                        ? 'border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300' 
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-100'
                   }`}
                >
                   {toggling ? 'Updating...' : (patient.can_message ? 'Restrict' : 'Allow')}
                </Button>
            </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Vitals & Quick Actions */}
          <div className="space-y-8 lg:col-span-1">
             {/* Stress Meter Card */}
             <Card className="rounded-[2rem] border-none shadow-sm overflow-hidden bg-white group">
                <div className="bg-indigo-600 p-8 text-white">
                   <div className="flex items-center justify-between mb-4">
                      <p className="text-xs font-bold uppercase tracking-widest opacity-80">Current Stress Intensity</p>
                      <Activity className="w-5 h-5 opacity-80" />
                   </div>
                   <div className="flex items-baseline gap-2">
                      <span className="text-6xl font-bold">{latestStress}%</span>
                      <span className="font-bold opacity-80">Score</span>
                   </div>
                </div>
                <CardContent className="p-8">
                   <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mb-6">
                      <div className={`h-full transition-all duration-1000 ${
                         latestStress > 75 ? 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)]' : 
                         latestStress > 40 ? 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                      }`} style={{ width: `${latestStress}%` }} />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50 rounded-2xl">
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
                         <p className={`font-bold ${latestStress > 75 ? 'text-rose-600' : latestStress > 40 ? 'text-amber-600' : 'text-emerald-600'}`}>
                            {latestStress > 75 ? 'Critical Risk' : latestStress > 40 ? 'Observation' : 'Stable'}
                         </p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-2xl">
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Last Sync</p>
                         <p className="font-bold text-slate-700">{stressLogs[0] ? new Date(stressLogs[0].recorded_date).toLocaleDateString() : 'N/A'}</p>
                      </div>
                   </div>
                </CardContent>
             </Card>

             {/* Personal Details */}
             <Card className="rounded-[2rem] border-none shadow-sm bg-white p-8 space-y-6">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-50 pb-4">Contact Protocol</h3>
                <div className="flex items-center gap-4 group">
                   <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
                      <Mail className="w-5 h-5" />
                   </div>
                   <div>
                      <p className="text-xs font-bold text-slate-400 uppercase">Email Identity</p>
                      <p className="font-bold text-slate-800">{patient.email}</p>
                   </div>
                </div>
                <div className="flex items-center gap-4 group">
                   <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
                      <Phone className="w-5 h-5" />
                   </div>
                   <div>
                      <p className="text-xs font-bold text-slate-400 uppercase">Secure Line</p>
                      <p className="font-bold text-slate-800">{patient.phone || 'No phone recorded'}</p>
                   </div>
                </div>
                
                <Button 
                   onClick={() => navigate(`/psychiatrist/messages?patient=${id}`)}
                   disabled={!patient.can_message}
                   className="w-full py-7 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xl shadow-indigo-100 transition-all gap-3"
                >
                   <MessageSquare className="w-5 h-5" /> Open Dialogue
                </Button>
             </Card>
          </div>

          {/* Right Column - Medical History & Logs */}
          <div className="lg:col-span-2 space-y-8">
             {/* Medical History Section */}
             <Card className="rounded-[2.5rem] border-none shadow-sm bg-white p-10 overflow-hidden">
                <div className="flex items-center justify-between mb-10">
                   <div>
                      <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                         <HeartPulse className="w-7 h-7 text-rose-500" />
                         Clinical Medical History
                      </h2>
                      <p className="text-slate-500 font-medium">Documented conditions and clinical observation history.</p>
                   </div>
                </div>
                
                {medicalHistory.length > 0 ? (
                  <div className="space-y-4">
                     {medicalHistory.map((h, i) => (
                        <div key={i} className="p-6 bg-slate-50 rounded-3xl border border-transparent hover:border-slate-200 transition-all group">
                           <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
                                    <FileText className="w-5 h-5 text-indigo-600" />
                                 </div>
                                 <div>
                                    <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{h.condition}</h4>
                                    <p className="text-sm text-slate-500 font-medium">Diagnosed by: {h.diagnosed_by || 'Aura AI Registry'}</p>
                                 </div>
                              </div>
                              <span className="px-4 py-1.5 bg-white border border-slate-200 rounded-full text-[10px] font-black uppercase tracking-wider text-slate-600">
                                 {h.status || 'Active'}
                              </span>
                           </div>
                           <p className="text-slate-600 text-sm font-medium leading-relaxed bg-white/50 p-4 rounded-xl italic">
                              {h.notes || 'No observation notes recorded for this diagnosis.'}
                           </p>
                        </div>
                     ))}
                  </div>
                ) : (
                  <div className="text-center py-20 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                     <AlertCircle className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                     <p className="text-slate-500 font-bold tracking-tight">No medical history records detected.</p>
                     <p className="text-slate-400 text-sm max-w-xs mx-auto mt-1">Initialize medical intake during the next clinical session.</p>
                  </div>
                )}
             </Card>

             {/* Stress Level Timeline */}
             <Card className="rounded-[2.5rem] border-none shadow-sm bg-white p-10 overflow-hidden">
                <div className="flex items-center justify-between mb-10">
                   <div>
                      <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                         <TrendingUp className="w-7 h-7 text-indigo-600" />
                         Clinical Stress Trajectory
                      </h2>
                      <p className="text-slate-500 font-medium">Longitudinal monitoring of emotional intensity logs.</p>
                   </div>
                </div>

                {stressLogs.length > 0 ? (
                   <div className="relative pl-8 border-l-2 border-slate-100 space-y-10 py-2">
                      {stressLogs.slice(0, 10).map((log, i) => (
                         <div key={i} className="relative">
                            <div className={`absolute -left-[41px] top-1 w-5 h-5 rounded-full border-4 border-white shadow-md ${
                               log.stress_level > 75 ? 'bg-rose-500' : log.stress_level > 40 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`} />
                            <div className="flex items-center justify-between mb-2">
                               <p className="text-sm font-black text-slate-800 uppercase tracking-widest">{new Date(log.recorded_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                               <span className={`text-sm font-black ${
                                  log.stress_level > 75 ? 'text-rose-600' : log.stress_level > 40 ? 'text-amber-600' : 'text-emerald-600'
                               }`}>
                                  {log.stress_level}% Level
                               </span>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between">
                               <div className="flex items-center gap-3 text-slate-600 text-sm font-bold">
                                  <Activity className="w-4 h-4 opacity-40" />
                                  Source: <span className="text-indigo-600 uppercase tracking-tighter text-xs">{log.source || 'Session Capture'}</span>
                               </div>
                               <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                  <div className={`h-full ${
                                      log.stress_level > 75 ? 'bg-rose-500' : log.stress_level > 40 ? 'bg-amber-500' : 'bg-emerald-500'
                                  }`} style={{ width: `${log.stress_level}%` }} />
                               </div>
                            </div>
                         </div>
                      ))}
                   </div>
                ) : (
                   <div className="text-center py-20 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                     <TrendingUp className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                     <p className="text-slate-500 font-bold tracking-tight">No biometric stress trajectory data.</p>
                     <p className="text-slate-400 text-sm max-w-xs mx-auto mt-1">Stress logs will populate as the patient interacts with the platform.</p>
                  </div>
                )}
             </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PatientDetails;