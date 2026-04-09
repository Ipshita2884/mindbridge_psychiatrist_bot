import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api';

const ResetPassword = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [apiError, setApiError] = useState('');

    useEffect(() => {
        if (!token) {
            navigate('/login');
        }
    }, [token, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const errs: Record<string, string> = {};
        if (!password) errs.password = 'Password is required';
        else if (password.length < 6) errs.password = 'Minimum 6 characters';
        if (!confirmPassword) errs.confirmPassword = 'Please confirm your password';
        else if (confirmPassword !== password) errs.confirmPassword = 'Passwords do not match';
        setErrors(errs);
        if (Object.keys(errs).length) return;

        setLoading(true);
        setApiError('');
        try {
            const res = await fetch(`${API_URL}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword: password }),
            });
            const data = await res.json();
            if (data.success) {
                setSuccess(true);
                setTimeout(() => navigate('/login'), 3000);
            } else {
                setApiError(data.message || 'Reset failed. Link may have expired.');
            }
        } catch {
            setApiError('Connection error. Make sure the server is running.');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/10 blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-secondary/20 blur-3xl" />
            </div>

            <Card variant="glass" className="w-full max-w-md fade-in-up">
                <CardHeader className="text-center space-y-2">
                    <CardTitle className="font-serif text-2xl">
                        {success ? 'Password Reset!' : 'Set New Password'}
                    </CardTitle>
                    <CardDescription>
                        {success ? 'Redirecting to login...' : 'Enter your new password below'}
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {success ? (
                        <div className="text-center space-y-4">
                            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                                <svg className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Your password has been reset successfully!<br />
                                Redirecting to login in 3 seconds...
                            </p>
                            <Link to="/login">
                                <Button variant="hero" className="w-full">Go to Login</Button>
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <Label>New Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <Input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Min. 6 characters"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className={`pl-10 pr-10 h-12 ${errors.password ? 'border-red-500' : ''}`}
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label>Confirm Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <Input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        placeholder="Re-enter password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className={`pl-10 pr-10 h-12 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                                    />
                                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                {errors.confirmPassword && <p className="text-red-500 text-xs">{errors.confirmPassword}</p>}
                            </div>

                            {apiError && <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-lg">{apiError}</p>}

                            <Button type="submit" variant="hero" className="w-full" disabled={loading}>
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </Button>

                            <div className="text-center">
                                <Link to="/login" className="text-sm text-primary hover:underline flex items-center justify-center gap-1">
                                    <ArrowLeft className="w-4 h-4" /> Back to Sign In
                                </Link>
                            </div>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default ResetPassword;