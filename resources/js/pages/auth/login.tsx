
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import InputError from '@/components/input-error';
import { router, usePage } from '@inertiajs/react';

interface AuthUser {
    role?: string;
    [key: string]: any;
}

interface LoginProps {
    status?: string;
    canResetPassword?: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });
    const [showPassword, setShowPassword] = useState(false);
    const [redirecting, setRedirecting] = useState(false);
    const page = usePage();

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onSuccess: () => {
                // Type guard for page.props.auth.user
                const auth = (page.props as { auth?: { user?: AuthUser } }).auth;
                const user = auth?.user;
                if (user && user.role) {
                    setRedirecting(true);
                    if (user.role === 'admin') {
                        router.visit('/admin/dashboard');
                    } else if (user.role === 'staff') {
                        router.visit('/staff/dashboard');
                    } else {
                        router.visit('/unauthorized');
                    }
                }
            },
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Login - CargoNest" />
            <div className="relative flex items-center justify-center text-[#1b1b18] dark:text-[#EDEDEC] font-sans" style={{height: '100vh'}}>
                {/* Background Image + Gradient Overlay (same as welcome page) */}
                <img
                    src="https://as2.ftcdn.net/v2/jpg/09/94/37/85/1000_F_994437850_1wQvQwQwQwQwQwQwQwQwQwQwQwQwQwQw.jpg"
                    alt="Shipping containers background"
                    className="absolute inset-0 w-full h-full object-cover object-center brightness-70 z-0"
                    loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-[#1b2330cc] via-[#2d3748cc] to-[#3b4252cc] mix-blend-multiply z-0" />
                <div className="relative w-full max-w-3xl mx-auto flex flex-col md:flex-row bg-white/80 dark:bg-[#18181b]/80 rounded-2xl shadow-2xl overflow-hidden animate-fade-in" style={{backdropFilter: 'blur(4px)', height: '85vh', margin: 'auto'}}>
                    {/* Left: Form */}
                    <div className="w-full md:w-3/5 md:px-16 md:py-8 flex flex-col justify-center" style={{height: '100%'}}>
                        {/* Brand Header */}
                        <div className="flex items-center gap-2 mb-10">
                            <div className="size-8 rounded-md bg-[#2d3748] shadow-lg flex items-center justify-center">
                                <svg viewBox="0 0 40 42" className="size-5 fill-current text-white" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M17.2 5.63325L8.6 0.855469L0 5.63325V32.1434L16.2 41.1434L32.4 32.1434V23.699L40 19.4767V9.85547L31.4 5.07769L22.8 9.85547V18.2999L17.2 21.411V5.63325ZM38 18.2999L32.4 21.411V15.2545L38 12.1434V18.2999ZM36.9409 10.4439L31.4 13.5221L25.8591 10.4439L31.4 7.36561L36.9409 10.4439ZM24.8 18.2999V12.1434L30.4 15.2545V21.411L24.8 18.2999ZM23.8 20.0323L29.3409 23.1105L16.2 30.411L10.6591 27.3328L23.8 20.0323ZM7.6 27.9212L15.2 32.1434V38.2999L2 30.9666V7.92116L7.6 11.0323V27.9212ZM8.6 9.29991L3.05913 6.22165L8.6 3.14339L14.1409 6.22165L8.6 9.29991ZM30.4 24.8101L17.2 32.1434V38.2999L30.4 30.9666V24.8101ZM9.6 11.0323L15.2 7.92117V22.5221L9.6 25.6333V11.0323Z" />
                                </svg>
                            </div>
                            <span className="ml-2 text-base font-semibold tracking-tight text-[#1b1b18] dark:text-white drop-shadow-sm">CargoNest</span>
                            <span className="ml-3 text-sm font-medium text-[#2d3748] dark:text-[#cbd5e1] opacity-80 tracking-wide hidden sm:inline-block">Strong. Secure. Delivered.</span>
                        </div>
                        <h2 className="text-xl text-center md:text-2xl font-bold text-[#1b1b18] dark:text-white mb-1">Sign In</h2>
                        <p className="text-sm text-[#64748b] dark:text-[#cbd5e1] text-center mb-8">Welcome back! Please enter your credentials to access your account.</p>
                        <form className="space-y-4" onSubmit={submit} autoComplete="off">
                            <div>
                                <label htmlFor="email" className="block text-xs font-medium text-[#2d3748] dark:text-[#cbd5e1] mb-1">Email Address</label>
                                <div className="relative">
                                    <input
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        onChange={e => setData('email', e.target.value)}
                                    className={`w-full rounded-lg border border-[#cbd5e1] dark:border-[#3b4252] bg-white/80 dark:bg-[#18181b]/80 px-3 py-2 text-sm text-[#1b1b18] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2d3748] dark:focus:ring-[#cbd5e1] transition-all duration-200 shadow-sm placeholder:text-[#94a3b8] dark:placeholder:text-[#A1A09A] ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                                        placeholder="email@example.com"
                                        autoFocus
                                    />
                                </div>
                                <InputError message={errors.email} className="mt-2" />
                            </div>
                            <div>
                                <label htmlFor="password" className="block text-xs font-medium text-[#2d3748] dark:text-[#cbd5e1] mb-1">Password</label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={data.password}
                                        onChange={e => setData('password', e.target.value)}
                                    className={`w-full rounded-lg border border-[#cbd5e1] dark:border-[#3b4252] bg-white/80 dark:bg-[#18181b]/80 px-3 py-2 text-sm text-[#1b1b18] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2d3748] dark:focus:ring-[#cbd5e1] transition-all duration-200 shadow-sm placeholder:text-[#94a3b8] dark:placeholder:text-[#A1A09A] pr-10 ${errors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
                                        placeholder="Password"
                                    />
                                    <button
                                        type="button"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[#64748b] dark:text-[#cbd5e1] hover:text-[#2d3748] dark:hover:text-white transition-colors duration-200 focus:outline-none"
                                        onClick={() => setShowPassword(v => !v)}
                                        tabIndex={-1}
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                                    </button>
                                </div>
                                <InputError message={errors.password} className="mt-2" />
                            </div>
                            <div className="flex items-center justify-between mt-2 mb-10">
                                <label className="flex items-center gap-1 text-xs text-[#64748b] dark:text-[#cbd5e1]">
                                    <input
                                        type="checkbox"
                                        name="remember"
                                        checked={!!data.remember}
                                        onChange={e => setData('remember', Boolean(e.target.checked))}
                                        className="rounded border-[#cbd5e1] dark:border-[#3b4252] focus:ring-[#2d3748] dark:focus:ring-[#cbd5e1] h-4 w-4"
                                    />
                                    Remember me
                                </label>
                                {canResetPassword && (
                                    <Link href={route('password.request')} className="text-xs text-[#2d3748] dark:text-[#cbd5e1] underline underline-offset-4 hover:text-[#1b1b18] dark:hover:text-white transition-colors duration-200">
                                        Forgot password?
                                    </Link>
                                )}
                            </div>
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full rounded-lg border border-white/70 bg-white/10 px-4 py-2 text-sm font-semibold text-[#1b1b18] dark:text-white shadow-md transition-all duration-200 hover:bg-white/20 hover:border-white/90 focus:outline-none focus:ring-2 focus:ring-[#2d3748]/40 dark:focus:ring-[#cbd5e1]/40 animate-fade-in delay-200 disabled:opacity-60 disabled:cursor-not-allowed"
                                style={{ backdropFilter: 'blur(2px)' }}
                            >
                                Log In
                            </button>
                        </form>
                        <div className="mt-4 text-center text-xs text-[#64748b] dark:text-[#cbd5e1]">
                            Don't have an account?{' '}
                            <Link href={route('register')} className="underline underline-offset-4 hover:text-[#2d3748] dark:hover:text-white transition-colors duration-200">
                                Sign up
                            </Link>
                        </div>
                        {status && <div className="mt-2 text-center text-xs font-medium text-green-600">{status}</div>}
                    </div>
                    {/* Right: Welcome/Brand Side */}
                    <div className="hidden md:flex md:w-2/5 items-center justify-center bg-gradient-to-br from-[#1b2330cc] via-[#2d3748cc] to-[#3b4252cc] relative">
                        <img
                            src="https://as2.ftcdn.net/v2/jpg/11/61/78/86/1000_F_1161788682_2QvQwQwQwQwQwQwQwQwQwQwQwQwQwQwQw.jpg"
                            alt="Shipping containers"
                            className="absolute inset-0 w-full h-full object-cover object-center brightness-100 z-0"
                            loading="eager"
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-[#1b2330cc] via-[#2d3748cc] to-[#3b4252cc] mix-blend-multiply z-10" />
                        <div className="relative z-20 flex flex-col items-center justify-center text-center px-8">
                            <h1 className="text-3xl font-extrabold text-white drop-shadow-lg mb-4 animate-fade-in">CargoNest</h1>
                            <span className="text-lg font-medium text-[#cbd5e1] opacity-80 tracking-wide mb-2 animate-fade-in">Strong. Secure. Delivered.</span>
                            <p className="text-base text-[#e5e7eb] mb-6 font-normal animate-fade-in delay-100">Shipping Containers for a Modern World</p>
                            <div className="flex gap-4 justify-center">
                                <a href="#" className="text-white/70 hover:text-white transition-colors duration-200"><svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-facebook"><path d="M18 2h-3a4 4 0 0 0-4 4v3H7v4h4v8h4v-8h3l1-4h-4V6a1 1 0 0 1 1-1h3z"/></svg></a>
                                <a href="#" className="text-white/70 hover:text-white transition-colors duration-200"><svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-twitter"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53A4.48 4.48 0 0 0 22.5.36a9.09 9.09 0 0 1-2.88 1.1A4.48 4.48 0 0 0 16.5 0c-2.5 0-4.5 2-4.5 4.5 0 .35.04.7.1 1.03A12.94 12.94 0 0 1 3 1.64a4.48 4.48 0 0 0-.61 2.27c0 1.57.8 2.96 2.02 3.77A4.48 4.48 0 0 1 2 6.13v.06c0 2.2 1.56 4.03 3.64 4.45a4.48 4.48 0 0 1-2.02.08c.57 1.78 2.23 3.08 4.2 3.12A9.05 9.05 0 0 1 0 19.54a12.94 12.94 0 0 0 7 2.05c8.4 0 13-6.96 13-13v-.59A9.18 9.18 0 0 0 24 4.59a9.05 9.05 0 0 1-2.61.72z"/></svg></a>
                                <a href="#" className="text-white/70 hover:text-white transition-colors duration-200"><svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-linkedin"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg></a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Animations */}
            <style>{`
                .animate-fade-in {
                    animation: fadeIn 1.2s cubic-bezier(0.4,0,0.2,1) both;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: none; }
                }
            `}</style>
        </>
    );
}
