import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { 
  Brain, Activity, MessageCircle, Gamepad2, Music, 
  Sparkles, Camera, Zap, ShieldCheck, HeartPulse, ArrowRight, Loader2, Target, AlertTriangle, User, Moon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';
import StressGauge from '@/components/StressGauge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

/**
 * ── AURA VISION HUB (REAL-AI COLOR-SYNC) ──
 */
const API = 'http://localhost:5000/api';
const getToken = () => localStorage.getItem('token');

const UserDashboard = () => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState<any>(null);
    const [analytics, setAnalytics] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    
    // Scanner States
    const [scanning, setScanning] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [scanResult, setScanResult] = useState<any>(null);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [currentStress, setCurrentStress] = useState(42);
    
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const fetchData = async () => {
        try {
            const token = getToken();
            const [profRes, analRes] = await Promise.all([
                fetch(`${API}/user/profile`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`${API}/chat/analytics/stress`, { headers: { Authorization: `Bearer ${token}` } })
            ]);
            const profData = await profRes.json();
            const analData = await analRes.json();
            if (profData.success) {
                setUserData(profData.user);
                setCurrentStress(profData.user.stress_level || 42);
            }
            if (analData.success) setAnalytics(analData.summary);
        } catch (error) {
            console.error("Dashboard Feed Error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const startScan = async () => {
        setScanning(true);
        setCameraError(null);
        setScanResult(null);
        setIsAnalyzing(false);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err: any) {
            console.error("Camera Denial:", err);
            setCameraError("Camera access denied. Aura vision requires biometric access.");
            toast.error("Neural Link Blocked");
        }
    };

    const stopScan = () => {
        if (videoRef.current?.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
    };

    const captureAndAnalyze = async () => {
        if (!videoRef.current || !canvasRef.current || isAnalyzing) return;
        setIsAnalyzing(true);
        try {
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
                ctx.drawImage(videoRef.current, 0, 0, 400, 300);
                const image = canvasRef.current.toDataURL('image/jpeg', 0.8);
                const res = await fetch(`${API}/chat/scan`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
                    body: JSON.stringify({ image })
                });
                const data = await res.json();
                if (data.success) {
                    setScanResult(data.analysis);
                    setCurrentStress(data.analysis.stress);
                    setScanning(false);
                    stopScan();
                } else {
                    toast.error("Analysis Link Failed.");
                }
            }
        } catch (err) {
            toast.error("Vision Processing Degraded.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    if (loading) return (
		<div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
			<div className="flex flex-col items-center gap-12 text-center">
				<div className="relative flex justify-center">
					<div className="absolute inset-0 bg-teal-500/10 blur-[80px] rounded-full animate-pulse" />
					<Activity className="w-16 h-16 text-teal-600 animate-float-harmonic" />
				</div>
				<p className="text-[10px] font-black uppercase tracking-[0.5em] text-teal-700/50 italic animate-pulse">Establishing Neural Link...</p>
			</div>
		</div>
    );

    return (
        <div className="min-h-screen relative selection:bg-teal-100 selection:text-teal-900 pt-32 pb-40 overflow-hidden bg-[#fafafa] text-left">
            <Navbar userRole="user" onLogout={handleLogout} />
            <div className="fixed inset-0 z-0 bg-[#fafafa]" />

            {/* 🛡️ ROLE IDENTITY BRANDING ── INSTANT SEPARATION */}
            <div className="fixed top-24 left-0 right-0 z-40 px-6 animate-slide-down pointer-events-none">
                <div className="container mx-auto flex justify-end">
                    <div className="harmonic-glass border-teal-500/20 bg-teal-50/80 px-8 py-3 rounded-2xl flex items-center gap-4 shadow-xl backdrop-blur-xl border-l-[6px] border-l-teal-600">
                        <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center shadow-lg">
                            <HeartPulse className="w-5 h-5 text-white animate-pulse" />
                        </div>
                        <div className="text-left">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-700/60 leading-none mb-1">Session Protocol</p>
                            <h3 className="text-lg font-black text-slate-800 tracking-tighter italic">SEEKER <span className="text-teal-600">(PATIENT)</span></h3>
                        </div>
                    </div>
                </div>
            </div>

            <main className="container mx-auto px-6 space-y-16 relative z-10">
                
                {/* ── BIO-SCANNER OVERLAY (REAL-AI COLOR SYNC) ── */}
                {scanning && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-3xl bg-slate-900/40 p-6 animate-fade-in shadow-2xl text-center">
                        <div className="max-w-xl w-full harmonic-glass border-white p-12 space-y-10 shadow-iris relative overflow-hidden text-center rounded-[4rem]">
                             <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-teal-500 to-transparent animate-scan-beam" />
                             
                             <div className="space-y-4">
                                <h2 className="text-5xl font-serif font-black italic tracking-tighter text-slate-800">Aura Vision Scanner</h2>
                                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-teal-600">
                                    {isAnalyzing ? 'Mapping Neural Core...' : cameraError ? 'Device Unresponsive' : 'Bio-Sync Active: Real-AI Color Mapping'}
                                </p>
                             </div>

                             <div className="relative aspect-video rounded-[3rem] overflow-hidden border-4 border-white shadow-harmonic bg-slate-900">
                                {cameraError ? (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center space-y-6 text-rose-400 p-12">
                                        <AlertTriangle className="w-14 h-14 animate-pulse" />
                                        <p className="text-sm font-black uppercase tracking-widest text-center">{cameraError}</p>
                                    </div>
                                ) : (
                                    <video ref={videoRef} autoPlay playsInline className={cn("w-full h-full object-cover brightness-110", isAnalyzing && 'opacity-30')} />
                                )}
                                
                                {isAnalyzing && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center space-y-6 text-white bg-black/20 backdrop-blur-sm">
                                        <Loader2 className="w-12 h-12 animate-spin text-teal-400" />
                                        <p className="text-[10px] font-black uppercase tracking-[0.4em] italic shadow-glow">Neural Mapping Live...</p>
                                    </div>
                                )}
                             </div>

                             <canvas ref={canvasRef} width={400} height={300} className="hidden" />

                             <div className="flex gap-6 justify-center pt-2">
                                <Button onClick={() => { setScanning(false); stopScan(); }} variant="ghost" disabled={isAnalyzing} className="h-16 px-12 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50">Abort Protocol</Button>
                                {!cameraError && (
                                    <Button onClick={captureAndAnalyze} disabled={isAnalyzing} className="btn-aura h-16 px-16 shadow-2xl uppercase tracking-[0.3em] font-black text-xs">
                                        {isAnalyzing ? 'Analysing...' : 'Run Neural Map'}
                                    </Button>
                                )}
                             </div>
                        </div>
                    </div>
                )}

                {/* ── SHOWCASE RESULT MODAL (PERSISTENCE) ── */}
                {scanResult && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center backdrop-blur-3xl bg-white/40 p-6 animate-fade-in" onClick={() => setScanResult(null)}>
                        <Card className="max-w-md w-full harmonic-glass border-white p-12 space-y-10 shadow-iris text-center rounded-[4rem] group" onClick={e => e.stopPropagation()}>
                             <div className="w-24 h-24 rounded-[3rem] bg-teal-50 flex items-center justify-center border border-white mx-auto shadow-inner group-hover:scale-105 transition-all text-left">
                                <Sparkles className="w-12 h-12 text-teal-600 animate-pulse mx-auto" />
                             </div>
                             <div className="space-y-4">
                                <h3 className="text-4xl font-serif font-black italic text-slate-900 tracking-tight">Neuro-Sync Finalized</h3>
                                <div className="flex items-center justify-center gap-4">
                                    <Badge className="bg-teal-500 rounded-full px-6 py-2 text-[10px] uppercase font-black tracking-[0.2em]">{scanResult.mood}</Badge>
                                    <Badge className="bg-indigo-500 rounded-full px-6 py-2 text-[10px] uppercase font-black tracking-[0.2em]">Intensity: {scanResult.stress}</Badge>
                                </div>
                             </div>
                             <p className="text-xl font-medium text-slate-500 italic leading-relaxed text-center">"{scanResult.insight}"</p>
                             <div className="p-10 rounded-[3rem] bg-indigo-50/50 border border-indigo-100 border-dashed text-center text-xs">
                                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-4 underline decoration-indigo-200">Aura Protocol Recommendation</p>
                                <p className="text-xl font-black text-indigo-900 tracking-tight italic">{scanResult.recommendation}</p>
                             </div>
                             <Button onClick={() => setScanResult(null)} className="btn-aura w-full h-16 uppercase tracking-[0.3em] text-[10px] font-black shadow-xl">Synchronize & Baseline</Button>
                        </Card>
                    </div>
                )}

                <header className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-12 text-center lg:text-left">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full harmonic-glass border-white/50 text-[10px] font-black uppercase tracking-[0.4em] text-teal-700 shadow-soft">
                            <Sparkles className="w-4 h-4 text-emerald-500" />
                            Aura Clinic: Real-AI Sync Authorized
                        </div>
                        <h1 className="text-6xl lg:text-8xl font-serif font-black tracking-tighter text-slate-900 leading-tight italic">
                            Biometric <span className="text-aura-gradient not-italic">Sanctuary.</span>
                        </h1>
                        <p className="text-2xl text-slate-400 font-medium max-w-2xl text-left leading-relaxed">
                            Welcome, <span className="font-black text-slate-800 underline decoration-teal-200">{userData?.display_name || 'Friend'}</span>. Your neural baseline has been established via the <span className="text-teal-600 font-bold italic">Real-AI Aura Platform</span>. 
                        </p>
                    </div>

                    <div className="p-12 harmonic-glass-hover border-white rounded-[4rem] text-left space-y-8 shadow-iris group animate-float-harmonic">
						<div className="flex items-center gap-8">
							<div className="w-20 h-20 rounded-[2.5rem] bg-teal-50 flex items-center justify-center border border-white shadow-inner group-hover:scale-110 transition-all">
								<Camera className="w-10 h-10 text-teal-600" />
							</div>
							<div className="space-y-1">
								<p className="text-2xl font-serif font-black italic tracking-tight text-slate-800 uppercase underline decoration-teal-100">Aura Vision</p>
								<p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Neural Real-AI Scan</p>
							</div>
						</div>
                        <Button onClick={startScan} className="btn-aura h-20 w-full px-16 text-[12px] tracking-[0.4em] uppercase font-black shadow-2xl border-2 border-white transition-all active:scale-95">
                            Initialize Real-Sync
                            <Zap className="ml-4 w-5 h-5 text-amber-300 animate-pulse" />
                        </Button>
                    </div>
                </header>

                <div className="grid lg:grid-cols-3 gap-12 text-left">
                    <Card className="lg:col-span-2 harmonic-glass border-white p-12 space-y-12 shadow-iris relative">
                        <div className="space-y-4">
                            <CardTitle className="text-4xl font-serif font-black text-slate-900 italic">Neural Baseline Oscillations</CardTitle>
                            <CardDescription className="text-lg font-medium text-slate-400 leading-relaxed italic">Mapping your latest emotional health spectrum via the Aura Biometric Layer.</CardDescription>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={analytics?.stress_trend || []}>
                                    <Area type="monotone" dataKey="avg_stress" stroke="#14b8a6" strokeWidth={6} fill="#2dd4bf22" animationDuration={4000} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    <Card className="harmonic-glass border-white p-12 flex flex-col items-center justify-between text-center shadow-iris">
                         <div className="space-y-3">
                            <CardTitle className="text-3xl font-serif font-black text-slate-800 italic underline decoration-teal-100 uppercase">Core Pulse</CardTitle>
                            <p className="text-[11px] font-black uppercase tracking-[0.4em] text-teal-600/50">Establishing Baseline...</p>
                         </div>
                         <StressGauge level={currentStress} className="scale-125" />
                         <div className="w-full space-y-6 pt-12 border-t border-teal-50">
                            {[
                                { label: 'Cognitive Load', val: 'Nominal', icon: Brain, color: 'text-teal-600' },
                                { label: 'Basal Rhythm', val: '98%', icon: ShieldCheck, color: 'text-emerald-600' },
                            ].map((stat, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <stat.icon className={cn("w-5 h-5", stat.color)} />
                                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
                                    </div>
                                    <span className="text-base font-black text-slate-900 italic">{stat.val}</span>
                                </div>
                            ))}
                         </div>
                    </Card>
                </div>

                {/* Quick Actions Hub */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 text-center">
                     {[
                        { icon: MessageCircle, title: 'AI Companion', path: '/chat', desc: 'Secure Neural Chat', color: 'bg-teal-50' },
                        { icon: Gamepad2, title: 'Aura Arcade', path: '/games', desc: 'Clinical Relief Games', color: 'bg-emerald-50' },
                        { icon: HeartPulse, title: 'Bio-Sync', path: '/stress', desc: 'Clinical Biometrics', color: 'bg-rose-50' },
                        { icon: Music, title: 'Zen Audio', path: '/music', desc: 'Neural Wave Waves', color: 'bg-indigo-50' },
                        { icon: User, title: 'Bio-Profile', path: '/profile', desc: 'Medical Data Hub', color: 'bg-slate-50' },
                    ].map((btn, i) => (
                        <Card key={i} onClick={() => navigate(btn.path)} className="harmonic-glass border-white p-8 cursor-pointer hover:scale-[1.05] active:scale-95 transition-all text-center space-y-4 shadow-soft group">
                            <div className={cn("w-16 h-16 rounded-[2rem] bg-white flex items-center justify-center border border-white mx-auto shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-all", btn.color)}>
								<btn.icon className="w-8 h-8 text-slate-700" />
							</div>
                            <div className="space-y-1">
								<h3 className="font-serif text-xl font-black italic text-slate-800 uppercase tracking-tighter transition-colors group-hover:text-teal-600 leading-none">{btn.title}</h3>
								<p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-tight italic">"{btn.desc}"</p>
							</div>
                        </Card>
                    ))}
                </div>

                {/* 🔔 NEURAL REMINDERS SECTION */}
                <section className="space-y-8">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1 text-left">
                            <h2 className="text-4xl font-serif font-black italic text-slate-800 tracking-tight">Neural Reminders</h2>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-teal-600/60 leading-none">Establishing Routine Consistency...</p>
                        </div>
                        <Button onClick={() => navigate('/notifications')} variant="ghost" className="rounded-full gap-2 text-slate-400 font-black tracking-widest uppercase text-[10px]">
                            Manage Hub <ArrowRight size={14} />
                        </Button>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
                        {[
                            { title: 'Zen Meditation', time: '08:00 AM', days: 'Daily', desc: '10min Deep Resonance', icon: Brain, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                            { title: 'Neural Scan', time: '12:00 PM', days: 'Mon, Wed, Fri', desc: 'Bio-Metric Baseline', icon: Camera, color: 'text-teal-600', bg: 'bg-teal-50' },
                            { title: 'Clinical Rest', time: '10:30 PM', days: 'Daily', desc: 'Parasympathetic Prep', icon: Moon, color: 'text-sky-600', bg: 'bg-sky-50' },
                        ].map((rem, i) => (
                            <Card key={i} className="harmonic-glass-hover border-white p-8 flex items-center gap-6 group shadow-soft">
                                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner shrink-0 group-hover:scale-110 transition-all", rem.bg)}>
                                    <rem.icon className={cn("w-6 h-6", rem.color)} />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-black text-slate-800 italic underline decoration-slate-200">{rem.title}</h4>
                                        <Badge variant="outline" className="text-[8px] uppercase tracking-tighter px-2 border-slate-100">{rem.days}</Badge>
                                    </div>
                                    <p className="text-xl font-black text-slate-900 leading-none">{rem.time}</p>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic">"{rem.desc}"</p>
                                </div>
                            </Card>
                        ))}
                    </div>
                </section>

				{/* Identity Banner */}
				<Card className="relative overflow-hidden rounded-[5rem] border-white shadow-harmonic group bg-gradient-to-br from-teal-500 to-indigo-700 p-24 text-white text-left">
					 <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px]" />
					 <div className="relative z-10 flex flex-col md:flex-row items-center gap-20">
						<div className="w-40 h-40 rounded-[3.5rem] bg-white/20 backdrop-blur-3xl border border-white/40 flex items-center justify-center shrink-0 shadow-2xl animate-float-harmonic group-hover:rotate-12 transition-all">
							<ShieldCheck className="w-20 h-20 text-white" />
						</div>
						<div className="flex-1 space-y-8 text-left">
							<h3 className="text-5xl lg:text-7xl font-serif font-black tracking-tighter italic">MindBridge Neural Protocol</h3>
							<p className="text-2xl text-white/80 font-medium max-w-3xl leading-relaxed italic text-left">
								Your emotional resonance is mapped locally via <span className="text-white font-black underline decoration-white/40">RSA-4096 Secure Synapses</span>. Aura Vision baseline is currently Clinical Tier 1.
							</p>
						</div>
						<Button className="bg-white text-teal-700 hover:bg-teal-50 h-24 px-24 rounded-[3.5rem] font-black shadow-2xl transition-all active:scale-95 text-[12px] tracking-[0.4em] uppercase">
							Baseline Established
						</Button>
					 </div>
				</Card>
            </main>
        </div>
    );
};

export default UserDashboard;