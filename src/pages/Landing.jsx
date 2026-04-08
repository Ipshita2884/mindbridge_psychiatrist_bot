import { Link } from 'react-router-dom';
import { 
  Sparkles, Shield, Activity, Brain, ArrowRight, MessageCircle, 
  Heart, Zap, Star, Globe, ShieldCheck, Sun, Moon, Wind
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import NeuralPulse from '@/components/NeuralPulse';
import { cn } from '@/lib/utils';

const Landing = () => {
    return (
        <div className="min-h-screen relative overflow-hidden bg-[#fafafa]">
            <Navbar />

            {/* Ultra-Clean Zen Foundation - Zero Orbs */}
            <div className="fixed inset-0 z-0 bg-[#fafafa]" />

            <main className="relative z-10 pt-64 pb-40">
                <div className="container mx-auto px-6">
                    
                    {/* High-Authority Hero Section */}
                    <div className="max-w-5xl mx-auto text-center space-y-12 mb-32">
                        <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full harmonic-glass bg-white/20 border-white/50 animate-breathe">
                            <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-800">Platform v2.0 • MindBridge</span>
                        </div>
                        
                        <div className="space-y-6 animate-slide-up px-6 relative z-20">
                            <h1 className="text-6xl sm:text-7xl lg:text-[10rem] font-serif font-black tracking-tighter leading-none text-slate-900 italic drop-shadow-sm">
                                Mindful <br /> 
                                <span className="text-teal-600 not-italic">Wellness.</span>
                            </h1>
                            <p className="text-xl sm:text-3xl text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed pt-8">
                                A safe space for mental health and emotional support. <br />
                                <span className="text-slate-800 font-black underline decoration-teal-200">AI-powered support</span> designed for your wellbeing.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-12 relative z-30">
                            <Link to="/login">
                                <Button className="btn-aura h-16 sm:h-20 px-12 sm:px-16 text-lg tracking-widest uppercase shadow-2xl transition-all">
                                    Get Started
                                    <ArrowRight className="ml-3 w-5 h-5" />
                                </Button>
                            </Link>
                            <Button variant="ghost" className="btn-aura-outline h-16 sm:h-20 px-12 sm:px-16 text-lg tracking-widest uppercase">
                                Learn More
                            </Button>
                        </div>

                        {/* The Free-Floating Neural Core - Pure Floating */}
                        <div className="pt-32 relative flex justify-center">
                            <div className="relative animate-float-harmonic transition-all duration-1000">
                                <div className="absolute inset-0 bg-gradient-to-br from-teal-400/20 via-indigo-400/10 to-rose-400/20 blur-[120px] rounded-full opacity-60" />
                                <NeuralPulse size="xl" />
                            </div>
                        </div>
                    </div>

                    {/* The Pure Feature Grid (Zen-Minimalist) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-16 lg:gap-32 max-w-7xl mx-auto mb-60 pt-40">
                         {[
                            { title: 'Seeker', desc: 'Secure emotional offloading via sentient node mapping.', icon: Heart },
                            { title: 'Guide', desc: 'Clinical visualization of patient subconscious trends.', icon: Brain },
                            { title: 'Admin', desc: 'Full control over the platform and users.', icon: ShieldCheck }
                         ].map((f, i) => (
                             <div key={i} className="text-left space-y-10 group transition-all duration-700 hover:-translate-y-4 px-8">
                                 <div className="w-20 h-20 rounded-full bg-white/40 backdrop-blur-xl shadow-soft flex items-center justify-center text-teal-600 border border-white/60 group-hover:bg-white transition-colors">
                                     <f.icon className="w-10 h-10" />
                                 </div>
                                 <div className="space-y-6">
                                     <h3 className="text-4xl font-serif font-black text-slate-900 italic leading-none">{f.title}.</h3>
                                     <p className="text-xl text-slate-500 font-medium leading-relaxed">{f.desc}</p>
                                 </div>
                                 <div className="pt-6">
                                     <div className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-teal-600 group-hover:gap-6 transition-all duration-500">
                                         Establish Link <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-3 transition-transform" />
                                     </div>
                                 </div>
                             </div>
                         ))}
                    </div>

                    {/* Integrated Resonance Map (Simplified & Clean) */}
                    <div className="max-w-7xl mx-auto">
                         <div className="relative z-10 grid lg:grid-cols-2 gap-32 items-center text-left">
                             <div className="space-y-12">
                                 <div className="inline-flex items-center gap-4 px-6 py-2 rounded-full bg-white/50 border border-white text-[10px] font-black uppercase tracking-widest text-teal-700">
                                     <Activity className="w-4 h-4 animate-ping" />
                                     Secure & Private
                                 </div>
                                 <h2 className="text-6xl md:text-8xl font-serif font-black tracking-tighter text-slate-900 leading-none italic">
                                     Witness the <span className="text-teal-600 not-italic">Subconscious.</span>
                                 </h2>
                                 <p className="text-2xl text-slate-400 font-medium leading-relaxed">
                                     Our AI listens, understands, and helps you track your mental wellbeing over time with simple and clear insights.
                                 </p>
                             </div>
                             <div className="relative animate-float-harmonic">
                                 <div className="absolute inset-0 bg-teal-200/20 blur-[120px] rounded-full" />
                                 <div className="relative grid grid-cols-2 gap-8">
                                     {[Sun, Moon, Wind, Activity].map((Icon, i) => (
                                         <div key={i} className="aspect-square rounded-[3rem] bg-white/40 shadow-iris flex items-center justify-center backdrop-blur-3xl border border-white/60">
                                             <Icon className="w-12 h-12 text-slate-400" />
                                         </div>
                                     ))}
                                 </div>
                             </div>
                         </div>
                    </div>

                </div>
            </main>

            {/* Bottom Floating Identity Hub */}
            <footer className="relative z-10 pb-20">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-12 p-12 harmonic-glass bg-white/20 border-white/40 rounded-[4rem]">
                         <div className="flex items-center gap-6">
                             <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center shadow-2xl ring-4 ring-white/20">
                                 <Globe className="w-8 h-8 text-white animate-pulse" />
                             </div>
                             <div className="space-y-1">
                                 <p className="text-xl font-serif font-black text-slate-900 italic">MindBridge Network</p>
                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Decentralized Wellness Infrastructure</p>
                             </div>
                         </div>
                         <div className="flex gap-8">
                             {['About', 'Privacy', 'Support', 'Dashboard'].map((link, i) => (
                                 <a key={i} href="#" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-teal-600 transition-colors">{link}</a>
                             ))}
                         </div>
                         <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">© 2026 MindBridge • All Rights Reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;