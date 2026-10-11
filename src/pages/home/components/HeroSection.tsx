import { useEffect, useRef } from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'dotlottie-wc': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        src?: string;
        autoplay?: boolean | string;
        loop?: boolean | string;
        style?: React.CSSProperties;
      };
    }
  }
}

export default function HeroSection() {
  const titleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    setTimeout(() => {
      el.style.transition = 'opacity 0.9s ease, transform 0.9s ease';
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }, 100);
  }, []);

  return (
    <section
      className="relative min-h-screen overflow-hidden flex flex-col"
      style={{ backgroundColor: '#F9F6FF' }}
    >
      {/* Background gradient blobs */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden" style={{ zIndex: 0 }}>
        <div
          className="absolute top-[-8%] right-[-4%] w-[600px] h-[600px] rounded-full opacity-40"
          style={{ backgroundColor: '#DDD6FE', filter: 'blur(90px)' }}
        />
        <div
          className="absolute bottom-[5%] left-[-6%] w-[500px] h-[500px] rounded-full opacity-30"
          style={{ backgroundColor: '#C4B5FD', filter: 'blur(110px)' }}
        />
        <div
          className="absolute top-[45%] left-[35%] w-[350px] h-[350px] rounded-full opacity-20"
          style={{ backgroundColor: '#A78BFA', filter: 'blur(80px)' }}
        />
      </div>

      {/* Floating accent pills */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden" style={{ zIndex: 10 }}>
        <div
          className="absolute top-[20%] left-[6%] px-4 py-2 rounded-full text-xs font-semibold text-white hidden md:flex items-center gap-2"
          style={{ backgroundColor: '#7C3AED' }}
        >
          <i className="ri-brain-line"></i> IA Emp&aacute;tica
        </div>
        <div
          className="absolute top-[32%] right-[8%] px-4 py-2 rounded-full text-xs font-semibold text-black hidden md:flex items-center gap-2"
          style={{ backgroundColor: '#A78BFA' }}
        >
          <i className="ri-heart-pulse-line"></i> Bienestar integral
        </div>
        <div
          className="absolute bottom-[30%] left-[10%] px-4 py-2 rounded-full text-xs font-semibold text-black hidden md:flex items-center gap-2"
          style={{ backgroundColor: '#EDE9FE' }}
        >
          <i className="ri-trophy-line"></i> L&iacute;deres al m&aacute;ximo potencial
        </div>
        <div
          className="absolute bottom-[22%] right-[6%] px-4 py-2 rounded-full text-xs font-semibold text-white hidden md:flex items-center gap-2"
          style={{ backgroundColor: '#5B21B6' }}
        >
          <i className="ri-shield-check-line"></i> Privacidad garantizada
        </div>
      </div>

      {/* Main content */}
      <div
        className="relative flex flex-col justify-center items-center flex-1 pt-32 pb-10 px-6 md:px-16 w-full"
        style={{ zIndex: 20 }}
      >
        <div ref={titleRef} className="text-center flex flex-col items-center max-w-5xl mx-auto">
          <div className="mt-16">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-8"
              style={{ backgroundColor: '#EDE9FE', color: '#7C3AED' }}
            >
              <i className="ri-sparkling-line"></i>
              IA + Coaching humano &mdash; juntos, m&aacute;s poderosos
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-black leading-tight mb-4">
              El compa&ntilde;ero que
            </h1>
            <h1
              className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-tight mb-4"
              style={{ color: '#7C3AED' }}
            >
              escucha, entiende
            </h1>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-black leading-tight mb-10">
              y transforma.
            </h1>

            <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed mb-12">
              Cogniflow lleva el trabajo de los mejores coaches profesionales a cada persona en tu organizaci&oacute;n &mdash; de forma personalizada, emp&aacute;tica y medible.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="/lets-talk"
                className="inline-flex items-center gap-2 text-white font-semibold px-8 py-4 rounded-full transition-colors duration-200 cursor-pointer whitespace-nowrap text-sm"
                style={{ backgroundColor: '#7C3AED' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#6D28D9')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#7C3AED')}
              >
                Solicitar demo
                <i className="ri-arrow-right-line text-base"></i>
              </a>
              <a
                href="/what-we-do"
                className="inline-flex items-center gap-2 font-semibold px-8 py-4 rounded-full transition-colors duration-200 cursor-pointer whitespace-nowrap text-sm border border-gray-200 hover:border-gray-400 text-gray-700"
              >
                Ver la plataforma
                <i className="ri-arrow-right-line text-base"></i>
              </a>
            </div>

            {/* Lottie animation with floating stats */}
            <div className="relative mt-4 w-full max-w-4xl mx-auto">
              {/* Floating stat cards */}
              <div
                className="absolute bottom-36 left-4 z-10 px-5 py-3 rounded-2xl text-left hidden sm:block"
                style={{ backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)' }}
              >
                <p className="text-2xl font-black text-black">+34%</p>
                <p className="text-xs text-gray-400 font-medium">Productividad promedio</p>
              </div>
              <div
                className="absolute bottom-36 right-4 z-10 px-5 py-3 rounded-2xl text-left hidden sm:block"
                style={{ backgroundColor: 'rgba(124,58,237,0.9)', backdropFilter: 'blur(8px)' }}
              >
                <p className="text-2xl font-black text-white">-58%</p>
                <p className="text-xs text-white/70 font-medium">&Iacute;ndice de burnout</p>
              </div>
              <div
                className="absolute top-20 right-4 z-10 px-4 py-2 rounded-full text-xs font-bold text-white hidden md:flex items-center gap-2"
                style={{ backgroundColor: 'rgba(124,58,237,0.75)', backdropFilter: 'blur(8px)' }}
              >
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                Sesi&oacute;n activa &middot; Coach Mar&iacute;a
              </div>

              <div className="pointer-events-none select-none flex justify-center">
                <dotlottie-wc
                  src="https://lottie.host/b760429c-4772-46b6-a39b-c608fc6d3c08/zycpBFPPQT.lottie"
                  autoplay
                  loop
                  style={{ width: '720px', height: '720px', display: 'block' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}