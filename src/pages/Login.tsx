import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
    Brain, Mail, Lock, User, Stethoscope,
    Shield, Eye, EyeOff, Sparkles, Heart, Zap, ArrowRight, ArrowLeft,
    Activity, Globe, Compass, ShieldCheck
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import Navbar from '@/components/Navbar';

type UserRole = 'user' | 'psychiatrist' | 'admin';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // UI State
    const [step, setStep] = useState<'role' | 'auth'>('role');
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Form State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [role, setRole] = useState<UserRole>('user');
    const [generalError, setGeneralError] = useState('');

    const roleConfigs = {
        user: {
            title: 'Patient',
            description: 'Patient & Explorer',
            icon: Heart,
            color: 'from-teal-400 to-emerald-600',
            textColor: 'text-teal-600',
            bgLight: 'bg-teal-50',
            portal: 'dashboard'
        },
        psychiatrist: {
            title: 'Psychiatrist',
            description: 'Clinical Professional',
            icon: Stethoscope,
            color: 'from-indigo-400 to-violet-600',
            textColor: 'text-indigo-600',
            bgLight: 'bg-indigo-50',
            portal: 'psychiatrist'
        },
        admin: {
            title: 'Admin',
            description: 'System Architect',
            icon: ShieldCheck,
            color: 'from-amber-400 to-orange-600',
            textColor: 'text-amber-600',
            bgLight: 'bg-amber-50',
            portal: 'admin'
        }
    };

    const handleRoleSelect = (selectedRole: UserRole) => {
        setRole(selectedRole);
        setStep('auth');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setGeneralError('');

        try {
            const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
            const payload = isLogin
                ? { email, password, role }
                : { email, password, display_name: displayName, role };

            const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (data.success) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                toast.success(isLogin ? "Login Successful" : "Account Created Successfully", {
                    description: `Welcome to your ${roleConfigs[data.user.role as UserRole].title} dashboard.`,
                });

                if (data.user.role === 'admin') navigate('/admin');
                else if (data.user.role === 'psychiatrist') navigate('/psychiatrist');
                else navigate('/dashboard');
            } else {
                setGeneralError(data.message || "Login Failed");
            }
        } catch (error) {
            console.error("Auth error:", error);
            setGeneralError("Connection failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const config = roleConfigs[role];
    const IconComponent = config.icon;

    return (
        <div className="min-h-screen relative overflow-hidden bg-[#fafafa]">
            <Navbar />

            {/* Zen Foundation Background */}
            <div className="fixed inset-0 z-0 bg-[#fafafa]" />
            <div className="absolute top-0 right-0 p-32 opacity-[0.03] scale-150 rotate-12 pointer-events-none z-0">
                <Brain className="w-96 h-96 text-slate-900" />
            </div>

            <main className="relative z-10 flex items-center justify-center min-h-screen pt-24 pb-20 px-6">
                <div className="w-full max-w-7xl grid lg:grid-cols-12 gap-16 items-center">

                    {/* Brand Context (Left) */}
                    <div className="lg:col-span-12 xl:col-span-5 space-y-12 animate-fade-in text-center xl:text-left">
                        <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full harmonic-glass bg-white/20 border-white/50 animate-breathe mx-auto xl:mx-0">
                            <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-800">Secure Protocol v2.4</span>
                        </div>

                        <div className="space-y-6">
                            <h1 className="text-6xl sm:text-7xl lg:text-9xl font-serif font-black tracking-tighter leading-none text-slate-900 italic">
                                {step === 'role' ? 'Who are you?' : 'Welcome Back.'}
                            </h1>
                            <p className="text-xl sm:text-2xl text-slate-400 font-medium max-w-xl mx-auto xl:mx-0 leading-relaxed">
                                {step === 'role'
                                    ? "Select your role to continue. Choose the option that best describes you."
                                    : `Sign in to your ${config.title} dashboard.`}
                            </p>
                        </div>
                    </div>

                    {/* Authentication Interaction (Right) */}
                    <div className="lg:col-span-12 xl:col-span-7 flex flex-col items-center">

                        {step === 'role' ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full animate-slide-up">
                                {(Object.keys(roleConfigs) as UserRole[]).map((r) => {
                                    const cfg = roleConfigs[r];
                                    const RoleIcon = cfg.icon;
                                    return (
                                        <button
                                            key={r}
                                            onClick={() => handleRoleSelect(r)}
                                            className="group relative p-12 rounded-[4rem] border border-white/60 bg-white/40 backdrop-blur-3xl shadow-soft hover:-translate-y-4 hover:bg-white hover:border-white transition-all duration-700 text-left flex flex-col gap-10 overflow-hidden"
                                        >
                                            <div className="absolute -bottom-8 -right-8 opacity-[0.05] group-hover:opacity-[0.08] transition-all rotate-12 scale-150">
                                                <RoleIcon className="w-32 h-32" />
                                            </div>

                                            <div className={cn("w-20 h-20 rounded-full flex items-center justify-center text-teal-600 border border-white/60 bg-white/40 group-hover:scale-110 transition-transform duration-700", cfg.bgLight, cfg.textColor)}>
                                                <RoleIcon className="w-10 h-10" />
                                            </div>

                                            <div className="space-y-4">
                                                <h3 className="text-4xl font-serif font-black text-slate-900 italic leading-none">{cfg.title}.</h3>
                                                <p className="text-lg text-slate-400 font-medium leading-relaxed">{cfg.description}</p>
                                            </div>

                                            <div className="pt-6">
                                                <div className={cn("inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-widest group-hover:gap-6 transition-all duration-500", cfg.textColor)}>
                                                    Access Portal <ArrowRight className="w-4 h-4" />
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="w-full max-w-xl animate-slide-up">
                                <div className="p-12 lg:p-20 rounded-[4rem] border border-white/60 bg-white/40 backdrop-blur-3xl shadow-iris relative text-center">

                                    {/* 🔙 Back */}
                                    <button
                                        onClick={() => setStep('role')}
                                        className="absolute top-10 left-10 w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-teal-600 hover:border-teal-200 transition-all z-20 group"
                                    >
                                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                                    </button>

                                    <div className="flex flex-col items-center gap-8 mb-16">
                                        <div className={cn("w-20 h-20 rounded-full flex items-center justify-center shadow-lg border border-white", config.bgLight, config.textColor)}>
                                            <IconComponent className="w-10 h-10" />
                                        </div>
                                        <div className="space-y-4 text-center">
                                            <h3 className="text-5xl font-serif font-black italic text-slate-900">{isLogin ? 'Welcome Home.' : 'Begin Your Path.'}</h3>
                                            <p className="text-[10px] font-black tracking-[0.4em] text-teal-600 uppercase">ACCESSING {config.title.toUpperCase()} NODE</p>
                                        </div>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-10 text-left">
                                        {!isLogin && (
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 pl-1">Identifier</label>
                                                <div className="relative group">
                                                    <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-teal-500 transition-colors" />
                                                    <input
                                                        className="input-resonance pl-16 w-full h-16 bg-white/50 border-white/50 focus:bg-white"
                                                        value={displayName}
                                                        onChange={(e) => setDisplayName(e.target.value)}
                                                        placeholder="Zen Name..."
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 pl-1">Email Address</label>
                                            <div className="relative group">
                                                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-teal-500 transition-colors" />
                                                <input
                                                    type="email"
                                                    className="input-resonance pl-16 w-full h-16 bg-white/50 border-white/50 focus:bg-white"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    placeholder="email@mindbridge.edu"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center px-1">
                                                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Security Key</label>
                                                {isLogin && <button type="button" className="text-[10px] font-black text-teal-600 uppercase tracking-widest hover:text-teal-700">Lost Key?</button>}
                                            </div>
                                            <div className="relative group">
                                                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-teal-500 transition-colors" />
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    className="input-resonance pl-16 pr-16 w-full h-16 bg-white/50 border-white/50 focus:bg-white"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    placeholder="Resonance secret..."
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-teal-600 transition-colors"
                                                >
                                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                </button>
                                            </div>
                                        </div>

                                        {generalError && (
                                            <div className="p-6 rounded-3xl bg-rose-50 border border-rose-100 text-rose-600 text-[10px] font-black uppercase tracking-widest text-center animate-pulse">
                                                {generalError}
                                            </div>
                                        )}

                                        <div className="pt-6">
                                            <Button
                                                type="submit"
                                                className="w-full btn-aura h-20 text-md tracking-[0.4em] uppercase shadow-2xl"
                                                disabled={loading}
                                            >
                                                {loading ? "Please wait..." : (isLogin ? "Sign In" : "Create Account")}
                                            </Button>
                                        </div>

                                        <div className="relative py-8 text-center overscroll-none">
                                            <div className="absolute inset-x-0 top-1/2 h-px bg-slate-100" />
                                            <span className="relative bg-white/80 backdrop-blur-md px-10 text-[10px] font-black text-slate-300 tracking-[0.6em] uppercase mx-auto">OR</span>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => setIsLogin(!isLogin)}
                                            className="w-full text-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-teal-600 transition-colors group"
                                        >
                                            {isLogin ? "Create a new account" : "Already have an account? Sign in"}
                                            <ArrowRight className="inline-block ml-3 w-4 h-4 group-hover:translate-x-2 transition-transform" />
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Login;