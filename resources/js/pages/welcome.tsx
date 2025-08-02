import { Head, Link } from '@inertiajs/react';
export default function Welcome() {
    return (
        <>
            <Head title="CargoNest">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>
            <div className="min-h-screen flex flex-col bg-[#F5F7FA] dark:bg-[#0a0a0a] text-[#1b1b18] dark:text-[#EDEDEC]">
                {/* Hero Section with Image Background */}
                <div className="relative flex-1 flex flex-col">
                    {/* Background Image + Gradient Overlay */}
                    <div className="absolute inset-0 z-0">
                    <img
                        src="https://as2.ftcdn.net/v2/jpg/09/94/37/85/1000_F_994437850_1wQvQwQwQwQwQwQwQwQwQwQwQwQwQwQw.jpg"
                        alt="Shipping Containers"
                        className="w-full h-full object-cover object-center brightness-95"
                        loading="eager"
                    />
                        <div className="absolute inset-0 bg-gradient-to-br from-[#1b2330cc] via-[#2d3748cc] to-[#3b4252cc] mix-blend-multiply"></div>
                    </div>
                    {/* Header */}
                    <header className="relative z-10 w-full flex items-center justify-between px-6 py-6 md:px-12 md:py-8">
                        <div className="flex items-center gap-3">
                            {/* Logo/Icon */}
                            <div className="flex items-center gap-2">
                                <div className="size-8 rounded-md bg-[#2d3748] shadow-lg flex items-center justify-center">
                                    {/* Use your AppLogoIcon here for brand consistency */}
                                    <svg viewBox="0 0 40 42" className="size-5 fill-current text-white" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M17.2 5.63325L8.6 0.855469L0 5.63325V32.1434L16.2 41.1434L32.4 32.1434V23.699L40 19.4767V9.85547L31.4 5.07769L22.8 9.85547V18.2999L17.2 21.411V5.63325ZM38 18.2999L32.4 21.411V15.2545L38 12.1434V18.2999ZM36.9409 10.4439L31.4 13.5221L25.8591 10.4439L31.4 7.36561L36.9409 10.4439ZM24.8 18.2999V12.1434L30.4 15.2545V21.411L24.8 18.2999ZM23.8 20.0323L29.3409 23.1105L16.2 30.411L10.6591 27.3328L23.8 20.0323ZM7.6 27.9212L15.2 32.1434V38.2999L2 30.9666V7.92116L7.6 11.0323V27.9212ZM8.6 9.29991L3.05913 6.22165L8.6 3.14339L14.1409 6.22165L8.6 9.29991ZM30.4 24.8101L17.2 32.1434V38.2999L30.4 30.9666V24.8101ZM9.6 11.0323L15.2 7.92117V22.5221L9.6 25.6333V11.0323Z" />
                                    </svg>
                                </div>
                                <span className="ml-2 text-lg font-semibold tracking-tight text-white drop-shadow-sm">CargoNest</span>
                            </div>
                            {/* Tagline */}
                            <span className="ml-4 text-base font-medium text-[#cbd5e1] opacity-80 tracking-wide hidden sm:inline-block">Strong. Secure. Delivered.</span>
                        </div>
                        {/* Login Button */}
                        <a
                            href="/login"
                            className="rounded-md border border-white/60 bg-white/10 px-5 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-white/20 hover:border-white/80 focus:outline-none focus:ring-2 focus:ring-white/40"
                            style={{ backdropFilter: 'blur(2px)' }}
                        >
                            Login
                        </a>
                    </header>
                    {/* Hero Content */}
                    <main className="relative z-10 flex flex-1 flex-col items-center justify-center text-center px-6 md:px-0">
                        <div className="max-w-2xl mx-auto py-16 md:py-24">
                            <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg mb-6 animate-fade-in">
                                CargoNest<br />
                                <span className="block text-2xl md:text-3xl font-medium text-[#cbd5e1] mt-2">Shipping Containers for a Modern World</span>
                            </h1>
                            <p className="text-lg md:text-xl text-[#e5e7eb] mb-8 font-normal animate-fade-in delay-100">
                                CargoNest delivers premium shipping containers and logistics solutions worldwide. Experience reliability, security, and speed for your cargo needs.
                            </p>
                            <a
                                href="/login"
                                className="inline-block rounded-lg border border-white/70 bg-white/10 px-6 py-3 text-base font-semibold text-white shadow-md transition-all duration-200 hover:bg-white/20 hover:border-white/90 focus:outline-none focus:ring-2 focus:ring-white/40 animate-fade-in delay-200"
                                style={{ backdropFilter: 'blur(2px)' }}
                            >
                                Get Started
                            </a>
                        </div>
                    </main>
                </div>
                {/* Footer */}
                <footer
                    className="w-full px-6 md:px-12 text-center text-xs text-[#cbd5e1] dark:text-[#A1A09A] absolute bottom-0 left-0 right-0 z-10"
                    style={{
                        background: 'transparent',
                        backdropFilter: 'blur(0.5px)',
                        paddingTop: '0.5rem',
                        paddingBottom: '0.5rem',
                        fontSize: '0.75rem',
                    }}
                >
                    &copy; CargoNest. All rights reserved.
                </footer>
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
