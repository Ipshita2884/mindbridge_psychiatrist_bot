import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import { UserPlus, ArrowLeft, Mail, Lock, User, Phone, Calendar, HeartPulse } from 'lucide-react';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api';

const AddPatient = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    gender: '',
    dob: '',
  });

  const token = localStorage.getItem('token');

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const handleSubmit = async () => {
    if (!form.full_name || !form.email || !form.password) {
      setError('Full Name, Email and Password are required!');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          display_name: form.full_name,
          email: form.email,
          password: form.password,
          phone: form.phone,
          gender: form.gender,
          dob: form.dob,
          role: 'user'
        })
      });
      const data = await res.json();

      if (res.ok) {
        setToast('Patient registered successfully!');
        setTimeout(() => navigate('/psychiatrist/patients'), 1500);
      } else {
        setError(data.message || 'Failed to add patient');
      }
    } catch (e: any) {
      setError(e.message || 'Something went wrong. Try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar userRole="psychiatrist" onLogout={handleLogout} />

      {toast && (
        <div className="fixed bottom-8 right-8 bg-[#10b981] text-white px-6 py-4 rounded-2xl shadow-2xl z-[100] animate-in slide-in-from-bottom-4 duration-300 flex items-center gap-3 font-bold border border-white/20 backdrop-blur-md">
           <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              ✅
           </div>
           {toast}
        </div>
      )}

      <main className="container mx-auto px-6 pt-40 pb-20 max-w-3xl">
        <button 
          onClick={() => navigate('/psychiatrist/patients')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-8 font-bold group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Back to Records
        </button>

        <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-slate-200/50 overflow-hidden bg-white">
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-12 py-10">
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                <UserPlus className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white tracking-tight">Register Patient</h2>
            </div>
            <p className="text-indigo-100 font-medium">Create a new clinical profile for clinical monitoring.</p>
          </div>

          <CardContent className="p-12">
            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-600 px-6 py-4 rounded-2xl text-sm font-bold flex items-center gap-3 mb-8">
                <div className="w-6 h-6 rounded-full bg-rose-200 flex items-center justify-center text-rose-600 text-xs">!</div>
                {error}
              </div>
            )}

            <div className="space-y-8">
              {/* Personal Section */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Full Identity Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input name="full_name" value={form.full_name} onChange={handleChange}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-600/20 text-slate-900 placeholder:text-slate-400 font-medium"
                        placeholder="John Doe" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Email Identifier</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input name="email" type="email" value={form.email} onChange={handleChange}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-600/20 text-slate-900 placeholder:text-slate-400 font-medium"
                        placeholder="patient@example.com" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Section */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Secure Access</h3>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Assigned Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input name="password" type="password" value={form.password} onChange={handleChange}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-600/20 text-slate-900 placeholder:text-slate-400 font-medium"
                      placeholder="••••••••" />
                  </div>
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* Clinical Details */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Clinical Metadata</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Contact Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input name="phone" value={form.phone} onChange={handleChange}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-600/20 text-slate-900 placeholder:text-slate-400 font-medium"
                        placeholder="+1 (555) 000-0000" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Birth Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input name="dob" type="date" value={form.dob} onChange={handleChange}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-600/20 text-slate-900 placeholder:text-slate-400 font-medium" />
                    </div>
                  </div>

                   <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Clinical Gender Identification</label>
                    <select 
                      name="gender" 
                      value={form.gender} 
                      onChange={handleChange}
                      className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-600/20 text-slate-900 font-medium appearance-none"
                    >
                      <option value="">Select gender identification...</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other / Non-binary</option>
                    </select>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-8 text-lg font-bold rounded-2xl shadow-xl shadow-indigo-100 bg-indigo-600 hover:bg-indigo-700 transition-all"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing Registry...
                  </div>
                ) : 'Confirm Registration'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AddPatient;