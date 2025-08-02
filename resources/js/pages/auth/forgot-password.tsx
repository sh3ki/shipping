// Components
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';


export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm<Required<{ email: string }>>({
        email: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <>
            <Head title="Forgot password - CargoNest" />
            <div className="relative flex items-center justify-center text-[#1b1b18] dark:text-[#EDEDEC] font-sans" style={{height: '100vh'}}>
                {/* Background Image + Gradient Overlay (same as login page) */}
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
                        <div className="flex items-center gap-2 mb-24">
                            <div className="size-8 rounded-md bg-[#2d3748] shadow-lg flex items-center justify-center">
                                <svg viewBox="0 0 40 42" className="size-5 fill-current text-white" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M17.2 5.63325L8.6 0.855469L0 5.63325V32.1434L16.2 41.1434L32.4 32.1434V23.699L40 19.4767V9.85547L31.4 5.07769L22.8 9.85547V18.2999L17.2 21.411V5.63325ZM38 18.2999L32.4 21.411V15.2545L38 12.1434V18.2999ZM36.9409 10.4439L31.4 13.5221L25.8591 10.4439L31.4 7.36561L36.9409 10.4439ZM24.8 18.2999V12.1434L30.4 15.2545V21.411L24.8 18.2999ZM23.8 20.0323L29.3409 23.1105L16.2 30.411L10.6591 27.3328L23.8 20.0323ZM7.6 27.9212L15.2 32.1434V38.2999L2 30.9666V7.92116L7.6 11.0323V27.9212ZM8.6 9.29991L3.05913 6.22165L8.6 3.14339L14.1409 6.22165L8.6 9.29991ZM30.4 24.8101L17.2 32.1434V38.2999L30.4 30.9666V24.8101ZM9.6 11.0323L15.2 7.92117V22.5221L9.6 25.6333V11.0323Z" />
                                </svg>
                            </div>
                            <span className="ml-2 text-base font-semibold tracking-tight text-[#1b1b18] dark:text-white drop-shadow-sm">CargoNest</span>
                            <span className="ml-3 text-sm font-medium text-[#2d3748] dark:text-[#cbd5e1] opacity-80 tracking-wide hidden sm:inline-block">Strong. Secure. Delivered.</span>
                        </div>
                        <h2 className="text-xl text-center md:text-2xl font-bold text-[#1b1b18] dark:text-white mb-1">Forgot Password</h2>
                        <p className="text-sm text-[#64748b] dark:text-[#cbd5e1] text-center mb-8">Enter your email to receive a password reset link.</p>
                        {status && <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div>}
                        <form className="space-y-4" onSubmit={submit} autoComplete="off">
                            <div>
                                <label htmlFor="email" className="block text-xs font-medium text-[#2d3748] dark:text-[#cbd5e1] mb-1">Email Address</label>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    autoComplete="off"
                                    value={data.email}
                                    autoFocus
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="email@example.com"
                                    className="block w-full rounded-lg border border-[#cbd5e1] dark:border-[#2d3748] bg-white/80 dark:bg-[#18181b]/80 px-4 py-2 text-sm text-[#1b1b18] dark:text-white placeholder-[#64748b] dark:placeholder-[#cbd5e1] focus:outline-none focus:ring-2 focus:ring-[#2d3748]/40 dark:focus:ring-[#cbd5e1]/40 transition-all duration-200"
                                    style={{backdropFilter: 'blur(2px)'}}
                                />
                                <InputError message={errors.email} className="mt-2" />
                            </div>
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full rounded-lg border border-white/70 bg-white/10 px-4 py-2 text-sm font-semibold text-[#1b1b18] dark:text-white shadow-md transition-all duration-200 hover:bg-white/20 hover:border-white/90 focus:outline-none focus:ring-2 focus:ring-[#2d3748]/40 dark:focus:ring-[#cbd5e1]/40 animate-fade-in delay-200 disabled:opacity-60 disabled:cursor-not-allowed"
                                style={{ backdropFilter: 'blur(2px)' }}
                            >
                                {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                Email password reset link
                            </button>
                        </form>
                        <div className="mt-4 mb-20 text-center text-xs text-[#64748b] dark:text-[#cbd5e1]">
                            Or, return to{' '}
                            <a href={route('login')} className="underline underline-offset-4 hover:text-[#2d3748] dark:hover:text-white transition-colors duration-200">
                                log in
                            </a>
                        </div>
                    </div>
                    {/* Right: Brand Side */}
                    <div className="hidden md:flex md:w-2/5 items-center justify-center bg-gradient-to-br from-[#1b2330cc] via-[#2d3748cc] to-[#3b4252cc] relative">
                        <img
                            src="https://as2.ftcdn.net/v2/jpg/11/61/78/86/1000_F_1161788682_2QvQwQwQwQwQwQwQwQwQwQwQwQwQwQwQw.jpg"
                            alt="Shipping containers"
                            className="absolute inset-0 w-full h-full object-cover object-center brightness-95 z-0"
                            loading="eager"
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-[#1b2330cc] via-[#2d3748cc] to-[#3b4252cc] mix-blend-multiply z-10" />
                        <div className="relative z-20 flex flex-col items-center justify-center text-center px-8">
                            <h1 className="text-3xl font-extrabold text-white drop-shadow-lg mb-4 animate-fade-in">CargoNest</h1>
                            <span className="text-lg font-medium text-[#cbd5e1] opacity-80 tracking-wide mb-2 animate-fade-in">Strong. Secure. Delivered.</span>
                            <p className="text-base text-[#e5e7eb] mb-6 font-normal animate-fade-in delay-100">Shipping Containers for a Modern World</p>
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
