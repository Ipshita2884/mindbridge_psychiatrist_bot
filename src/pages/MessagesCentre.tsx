import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import {
  ArrowLeft,
  Search,
  Send,
  MoreVertical,
  ChevronRight,
  MessageSquareOff,
  MessageSquare,
  Activity,
  HeartPulse,
  LayoutDashboard
} from 'lucide-react';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api';

interface Message {
  id: string;
  patientId: number;
  content: string;
  timestamp: string;
  read: boolean;
  sender: 'patient' | 'psychiatrist';
}

const MessagesCenter = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialPatientId = searchParams.get('patient');
  
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageText, setMessageText] = useState('');
  const [activeConversation, setActiveConversation] = useState<number | null>(initialPatientId ? parseInt(initialPatientId) : null);
  const [messages, setMessages] = useState<Message[]>([]);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await fetch(`${API_URL}/psychiatrist/patients`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setPatients(data.data);
      }
    } catch (e) {
      console.error('Error fetching patients:', e);
    } finally {
      setLoading(false);
    }
  };

  const currentPatient = patients.find(p => p.user_id === activeConversation);

  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation);
      const interval = setInterval(() => fetchMessages(activeConversation), 3000);
      return () => clearInterval(interval);
    }
  }, [activeConversation]);

  const fetchMessages = async (patientId: number) => {
    try {
      const res = await fetch(`${API_URL}/psychiatrist/messages/${patientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setMessages(data.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation);
      const interval = setInterval(() => fetchMessages(activeConversation), 3000);
      return () => clearInterval(interval);
    }
  }, [activeConversation]);

  

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !activeConversation) return;
    const text = messageText;
    setMessageText('');
    try {
      await fetch(`${API_URL}/psychiatrist/messages/${activeConversation}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: text }),
      });
      fetchMessages(activeConversation);
    } catch (e) { console.error(e); }
  };

  const filteredPatients = patients.filter(p =>
    (p.full_name || p.display_name)?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar userRole="psychiatrist" onLogout={handleLogout} />

      <main className="container mx-auto px-6 pt-40 pb-12 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
           <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/psychiatrist')}
                className="p-3 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all text-slate-500 hover:text-indigo-600 border border-slate-100"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl font-serif font-bold text-slate-900 tracking-tight">Clinical Correspondence</h1>
                <p className="text-slate-500 font-medium">Securely coordinate care with your protocol patient list</p>
              </div>
           </div>
           <button 
             onClick={() => navigate('/psychiatrist/dashboard')}
             className="flex items-center gap-2 text-indigo-600 font-bold bg-indigo-50 px-6 py-3 rounded-xl hover:bg-indigo-100 transition-colors"
           >
             <LayoutDashboard className="w-5 h-5" /> Dashboard
           </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 h-[700px]">
          {/* Patient Registry Column */}
          <Card className="lg:col-span-1 rounded-3xl border-none shadow-sm flex flex-col overflow-hidden bg-white">
            <CardHeader className="p-6 border-b border-slate-100 bg-slate-50/30">
               <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Registry search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border-none bg-white shadow-sm text-slate-900 focus:ring-2 focus:ring-indigo-600/20 font-medium placeholder:text-slate-400"
                />
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-slate-200 bg-white">
              {loading ? (
                <div className="p-4 space-y-4 animate-pulse">
                  {[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-slate-50 rounded-2xl" />)}
                </div>
              ) : filteredPatients.length > 0 ? (
                filteredPatients.map((p) => (
                  <button
                    key={p.user_id}
                    onClick={() => setActiveConversation(p.user_id)}
                    className={`w-full p-4 mb-2 rounded-2xl transition-all text-left flex items-center justify-between group border ${
                      activeConversation === p.user_id ? 'bg-indigo-50 border-indigo-100 ring-1 ring-indigo-600/10' : 'bg-white border-transparent hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg transition-colors ${
                         activeConversation === p.user_id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600'
                      }`}>
                        {(p.full_name || p.display_name)?.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3 className={`font-bold truncate ${activeConversation === p.user_id ? 'text-indigo-900' : 'text-slate-900'}`}>
                          {p.full_name || p.display_name}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {p.can_message ? (
                            <span className="text-[10px] text-indigo-600 font-black uppercase tracking-wider bg-indigo-50/50 px-2 py-0.5 rounded-full border border-indigo-100">Messaging Open</span>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">Restricted</span>
                          )}
                        </div>
                      </div>
                    </div>
                    {activeConversation === p.user_id && <ChevronRight className="w-5 h-5 text-indigo-400" />}
                  </button>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-24 text-slate-400 px-8 text-center italic">
                  <MessageSquareOff className="w-10 h-10 mb-4 opacity-20" />
                  No matching patients found in clinical registry
                </div>
              )}
            </CardContent>
          </Card>

          {/* Secure Dialogue Column */}
          <Card className="lg:col-span-2 rounded-3xl border-none shadow-sm flex flex-col overflow-hidden bg-white">
            {activeConversation && currentPatient ? (
              <>
                <CardHeader className="p-6 border-b border-slate-100 flex-row items-center justify-between bg-white shadow-sm z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white text-lg shadow-md shadow-indigo-100">
                      {(currentPatient.full_name || currentPatient.display_name)?.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-900 truncate">{currentPatient.full_name || currentPatient.display_name}</h3>
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-500">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Live Protocol Channel
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="rounded-xl font-bold text-indigo-600 border-indigo-100 hover:bg-indigo-50 shadow-sm"
                      onClick={() => navigate(`/psychiatrist/patient/${activeConversation}`)}
                    >
                      Medical Records
                    </Button>
                    <Button variant="outline" size="icon" className="rounded-xl text-slate-400 border-slate-200">
                      <MoreVertical className="w-5 h-5" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-thin scrollbar-thumb-slate-200 bg-slate-50/10">
                  {!currentPatient.can_message && (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-start gap-4 text-amber-800 shadow-sm">
                      <div className="p-2 bg-amber-100 rounded-xl mt-0.5">
                        <MessageSquareOff className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-black text-sm uppercase tracking-wider mb-1">Communication Locked</p>
                        <p className="text-sm font-medium opacity-80 leading-relaxed">Messaging for this patient has been restricted. You can restore access via the patient's Clinical Profile settings.</p>
                      </div>
                    </div>
                  )}

                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
                      <MessageSquare className="w-10 h-10 text-indigo-300 mb-4" />
                      <p className="font-medium text-slate-500">No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((msg: any) => {
                        const user = JSON.parse(localStorage.getItem('user') || '{}');
                        const isMine = msg.sender_id === user.id;
                        return (
                          <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] px-5 py-3 rounded-2xl text-sm font-medium shadow-sm ${isMine ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-white text-slate-800 rounded-bl-sm border border-slate-100'}`}>
                              <p>{msg.content}</p>
                              <p className={`text-[10px] mt-1 ${isMine ? 'text-indigo-200' : 'text-slate-400'}`}>
                                {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>

                <div className="p-6 border-t border-slate-100 bg-white">
                  <div className="flex gap-4">
                    <input
                      type="text"
                      placeholder={currentPatient.can_message ? "Send clinical response..." : "Enable messaging in profile..."}
                      disabled={!currentPatient.can_message}
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1 px-6 py-5 rounded-2xl border-none bg-slate-50 text-slate-900 focus:ring-2 focus:ring-indigo-600/20 font-medium disabled:bg-slate-100 disabled:opacity-50 transition-all shadow-inner"
                    />
                    <Button 
                      onClick={handleSendMessage} 
                      disabled={!messageText.trim() || !currentPatient.can_message}
                      className="bg-indigo-600 hover:bg-indigo-700 h-16 w-16 rounded-2xl shadow-xl shadow-indigo-100 transition-all p-0 flex items-center justify-center disabled:bg-slate-300 transform active:scale-95"
                    >
                      <Send className="w-7 h-7 text-white" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-white">
                <div className="w-28 h-28 rounded-[2.5rem] bg-indigo-50 flex items-center justify-center mb-8 animate-in fade-in zoom-in duration-500">
                  <MessageSquare className="w-14 h-14 text-indigo-300" />
                </div>
                <h3 className="text-3xl font-serif font-bold text-slate-900 mb-2 tracking-tight">Patient Correspondence</h3>
                <p className="max-w-sm font-medium text-slate-500 leading-relaxed text-lg">Select a patient from the clinical registry on the left to review dialogue audit or initiate contact.</p>
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
};

export default MessagesCenter;