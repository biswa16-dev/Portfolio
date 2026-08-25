import React, { useState, useEffect, useRef } from 'react';
import { projects } from './main';

// Mock data
const statsData = [
  { label: 'Projects Built', value: 15, suffix: '+', icon: '<' },
  { label: 'GitHub Contributions', value: 500, suffix: '+', icon: '%' },
  { label: 'Tech Stack', value: 12, suffix: '+', icon: '*' },
  { label: 'Hackathons', value: 5, suffix: '+', icon: '#' }
];

const rolesData = [
  { text: "Full-Stack Developer", icon: "fa-solid fa-code" },
  { text: "AI/Machine Learning", icon: "fa-solid fa-brain" },
  { text: "MERN Stack Developer", icon: "fa-brands fa-react" }
];

function Counter({ value, suffix, delay, duration }: { value: number, suffix: string, delay: number, duration: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        observer.disconnect();

        let startTimestamp: number | null = null;
        const step = (timestamp: number) => {
          if (!startTimestamp) startTimestamp = timestamp;
          const progress = Math.min((timestamp - startTimestamp) / duration, 1);

          // easeOutCubic
          const easeOut = 1 - Math.pow(1 - progress, 3);
          setCount(easeOut * value);

          if (progress < 1) {
            window.requestAnimationFrame(step);
          } else {
            setCount(value);
          }
        };

        setTimeout(() => {
          window.requestAnimationFrame(step);
        }, delay);
      }
    }, { threshold: 0.25 });

    if (ref.current) observer.observe(ref.current);

    return () => observer.disconnect();
  }, [value, delay, duration]);

  // Determine formatting based on the value
  let displayValue = count.toString();
  if (value === 99.99) {
    displayValue = count.toFixed(2);
  } else if (value === 2.4) {
    displayValue = count.toFixed(1);
  } else {
    displayValue = Math.floor(count).toString();
  }

  return <span ref={ref}>{displayValue}{suffix}</span>;
}

function App() {
  const isNavigating = useRef(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeRole, setActiveRole] = useState(0);
  const [activeNav, setActiveNav] = useState('Home');
  const [githubData, setGithubData] = useState({ repos: 42, contributions: '158' });
  const [leetcodeData, setLeetcodeData] = useState({ easy: 120, medium: 45, hard: 12 });
  const [activeProjectFilter, setActiveProjectFilter] = useState('All');
  const [activeExperienceTab, setActiveExperienceTab] = useState<'Professional' | 'Hackathons'>('Professional');
  const [currentView, setCurrentView] = useState<'main' | 'experience'>('main');
  
  const [formState, setFormState] = useState({ name: '', email: '', message: '' });
  const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name || !formState.email || !formState.message) return;
    
    setFormStatus('loading');
    
    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: import.meta.env.VITE_WEB3FORMS_ACCESS_KEY,
          name: formState.name,
          email: formState.email,
          message: formState.message,
        }),
      });
      
      const result = await response.json();
      if (result.success) {
        setFormStatus('success');
        setFormState({ name: '', email: '', message: '' });
        setTimeout(() => setFormStatus('idle'), 5000);
      } else {
        setFormStatus('error');
        setTimeout(() => setFormStatus('idle'), 5000);
      }
    } catch (error) {
      setFormStatus('error');
      setTimeout(() => setFormStatus('idle'), 5000);
    }
  };

  const filteredProjects = projects.filter(project => {
    if (activeProjectFilter === 'All') return true;
    if (activeProjectFilter === 'MERN Stack' && project.title === 'EmoSync') return true;
    if (activeProjectFilter === 'Full Stack' && project.title === 'EmoSync') return true;
    if (activeProjectFilter === 'Web' && project.title === 'Truvix') return true;
    return false;
  });

  useEffect(() => {
    fetch('https://api.github.com/users/biswa1601nk-hub')
      .then(res => res.json())
      .then(data => {
        if (data.public_repos !== undefined) {
          setGithubData(prev => ({ ...prev, repos: data.public_repos }));
        }
      })
      .catch(console.error);

    const fetchLeetCodeData = async () => {
      try {
        // Try public API first
        const res = await fetch('https://alfa-leetcode-api.onrender.com/biswa_17/solved');
        if (!res.ok) throw new Error('Public API rate limited');
        const data = await res.json();

        if (data && data.easySolved !== undefined && data.easySolved !== null) {
          setLeetcodeData({ easy: data.easySolved, medium: data.mediumSolved, hard: data.hardSolved });
          return;
        }
      } catch (err) {
        console.warn('Public LeetCode API failed, falling back to local server...', err);
        try {
          // Fallback to our own server proxy
          const backendUrl = import.meta.env.VITE_API_URL || 'https://portfolio-backend-99dj.onrender.com';
          const fallbackRes = await fetch(`${backendUrl}/api/leetcode/biswa_17`);
          const fallbackData = await fallbackRes.json();
          if (fallbackData && fallbackData.easySolved !== undefined) {
            setLeetcodeData({ easy: fallbackData.easySolved, medium: fallbackData.mediumSolved, hard: fallbackData.hardSolved });
          }
        } catch (fallbackErr) {
          console.error('Both public and local LeetCode fetch failed:', fallbackErr);
        }
      }
    };

    fetchLeetCodeData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveRole((prev) => (prev + 1) % rolesData.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (isNavigating.current) return;
      const sectionElements = document.querySelectorAll('section');
      let currentNav = '';

      sectionElements.forEach((section) => {
        const sectionTop = section.offsetTop;
        if (window.scrollY >= sectionTop - window.innerHeight / 3) {
          const id = section.getAttribute('id') || '';
          const match = ['Home', 'Skills', 'Experience', 'Projects', 'Contact'].find(
            item => item.toLowerCase() === id
          );
          if (match) {
            currentNav = match;
          }
        }
      });

      if (currentNav) {
        setActiveNav(currentNav);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDownloadResume = () => {
    const link = document.createElement('a');
    link.href = '/CV.pdf';
    link.download = 'Biswajit-Nayak-Resume.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-bg text-text min-h-screen font-sans selection:bg-white/20 overflow-x-hidden">
      {/* Navigation Header */}
      <header className="fixed top-0 w-full z-50 px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 anim-slide-down">
        <div className="max-w-[720px] mx-auto flex items-center justify-between gap-[clamp(18px,2.8vw,28px)]">
          {/* Logo */}
          <button
            onClick={() => {
              isNavigating.current = true;
              setTimeout(() => { isNavigating.current = false; }, 1000);
              setActiveNav('Home');

              if (currentView !== 'main') {
                setCurrentView('main');
                setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
              } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="w-[clamp(40px,4.4vw,46px)] h-[clamp(40px,4.4vw,46px)] rounded-full bg-black shadow-nav flex items-center justify-center shrink-0 transition-transform hover:scale-[1.04] overflow-hidden border border-white/20"
          >
            <span className="font-display text-white text-[clamp(18px,2vw,22px)] tracking-wider mt-[2px]">BN</span>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex flex-1 max-w-[540px] h-[clamp(44px,5.2vw,48px)] bg-white rounded-full shadow-nav px-3 items-center justify-between">
            {['Home', 'Skills', 'Experience', 'Projects', 'Contact'].map((item) => (
              <a
                key={item}
                href={item === 'Experience' ? '#' : `#${item.toLowerCase()}`}
                onClick={(e) => {
                  isNavigating.current = true;
                  setTimeout(() => { isNavigating.current = false; }, 1000);

                  if (item === 'Experience') {
                    e.preventDefault();
                    setCurrentView('experience');
                    setActiveNav('Experience');
                    window.scrollTo(0,0);
                  } else {
                    if (currentView !== 'main') {
                      setCurrentView('main');
                      setActiveNav(item);
                      setTimeout(() => {
                        document.getElementById(item.toLowerCase())?.scrollIntoView({ behavior: 'smooth' });
                      }, 50);
                    } else {
                      setActiveNav(item);
                    }
                  }
                }}
                className={`relative px-4 py-2 text-[clamp(13px,1.4vw,15px)] tracking-[-0.01em] transition-all duration-300 ${activeNav === item ? 'text-black font-bold' : 'text-black font-medium'}`}
              >
                {item}
                {activeNav === item && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-[2px] transition-all duration-300">
                    <span className="w-[3px] h-[3px] bg-black rounded-full" style={{ boxShadow: '-5px 0 0 black, 5px 0 0 black' }}></span>
                  </span>
                )}
              </a>
            ))}
          </nav>

          {/* Sign In / Resume Button */}
          <button onClick={handleDownloadResume} className="hidden md:block bg-[#1a1a1a] text-white px-[22px] py-[11px] rounded-full text-[14.5px] font-medium tracking-wide transition-all hover:bg-black hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:-translate-y-[1px]">
            Resume
          </button>

          {/* Mobile Burger */}
          <button
            className="md:hidden w-12 h-12 rounded-full bg-pillDark flex flex-col items-center justify-center gap-[4px] z-50"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span className={`w-[18px] h-[1.5px] bg-white transition-all ${menuOpen ? 'rotate-45 translate-y-[5.5px]' : ''}`}></span>
            <span className={`w-[18px] h-[1.5px] bg-white transition-all ${menuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`w-[18px] h-[1.5px] bg-white transition-all ${menuOpen ? '-rotate-45 -translate-y-[5.5px]' : ''}`}></span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center">
        {currentView === 'main' ? (
          <>
            {/* 1. Landing Page (Hero) */}
        <section id="home" className="relative flex flex-col items-center justify-center min-h-[100dvh] w-full px-4 pt-24 pb-12 overflow-hidden bg-black">

          {/* Background Video */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <video
              className="w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
            >
              <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260809_012548_ef22562c-c0ae-4816-ad9d-f8922af4e6a7.mp4" type="video/mp4" />
            </video>
          </div>

          <div className="w-full max-w-[900px] flex flex-col items-center text-center flex-1 justify-center z-10 relative">

            {/* Trust Row / Roles */}
            <div className="flex items-center mb-[clamp(16px,2.5vh,26px)] anim-reveal" style={{ '--d': '0.05s' } as React.CSSProperties}>

              {/* Logos Container */}
              <div
                className="relative flex items-center h-[var(--trust-size,clamp(36px,4.5vw,42px))]"
                style={{ width: 'calc(var(--trust-size, 42px) * 2.16)', zIndex: 10 }}
              >
                {rolesData.map((role, i) => {
                  const posCalculated = (i - activeRole + 5) % 3;

                  return (
                    <div
                      key={role.icon}
                      className="absolute top-0 flex items-center justify-center bg-trustBg border border-trustBorder rounded-full p-[5px] transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                      style={{
                        width: 'var(--trust-size, clamp(36px, 4.5vw, 42px))',
                        height: 'var(--trust-size, clamp(36px, 4.5vw, 42px))',
                        transform: `translateX(calc(var(--trust-size, clamp(36px, 4.5vw, 42px)) * ${posCalculated * 0.58}))`,
                        zIndex: posCalculated, // Pos 2 (rightmost) has highest z-index
                      }}
                    >
                      <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                        <i className={`${role.icon} text-[#111]`} style={{ fontSize: 'calc(var(--trust-size, 42px) * 0.34)' }}></i>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Capsule */}
              <div
                className="bg-trustBg border border-trustBorder rounded-full flex items-center h-[var(--trust-size,clamp(36px,4.5vw,42px))] overflow-hidden"
                style={{
                  marginLeft: 'calc(var(--trust-size, 42px) * -0.42)', // overlaps the rightmost logo
                  paddingLeft: 'calc(var(--trust-size, 42px) * 0.58)',
                  paddingRight: '16px',
                  zIndex: 3
                }}
              >
                <div className="w-[145px] sm:w-[155px] relative h-full flex items-center">
                  {rolesData.map((role, i) => (
                    <span
                      key={role.icon}
                      className={`absolute left-0 text-trustText font-medium text-[clamp(12px,1.4vw,13.5px)] tracking-wide whitespace-nowrap transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${activeRole === i ? 'opacity-100 translate-y-0 delay-100' : 'opacity-0 translate-y-4 pointer-events-none'}`}
                    >
                      {role.text}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Headline */}
            <h1 className="font-display text-white text-[clamp(28px,6.2vw,80px)] tracking-[-0.04em] leading-[1.12] whitespace-nowrap overflow-hidden flex items-center justify-center">
              <span className="block anim-headline-fade" style={{ '--d': '0.12s' } as React.CSSProperties}>Biswajit Nayak</span>
            </h1>

            {/* Subhead */}
            <p className="mt-[clamp(16px,2vh,24px)] max-w-[min(650px,92%)] text-[#e0e0e0] opacity-90 text-[clamp(18px,2vw,24px)] leading-[1.6] font-serif italic anim-reveal" style={{ '--d': '0.28s' } as React.CSSProperties}>
              crafting elegant digital experiences where complex logic meets seamless interaction.
            </p>

            {/* CTA */}
            <button
              onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
              className="mt-8 bg-white text-black font-semibold text-[clamp(13.5px,1.5vw,14.5px)] px-[clamp(22px,3vw,28px)] py-[clamp(11px,1.6vh,13px)] rounded-full anim-pulse transition-all hover:-translate-y-[2px] hover:scale-[1.02]"
              style={{
                '--d': '0.4s',
                boxShadow: '0 0 0 1px rgba(255,255,255,0.15), 0 0 22px rgba(255,255,255,0.32), 0 0 44px rgba(255,255,255,0.12)'
              } as React.CSSProperties}
            >
              Get Started
            </button>
          </div>

          {/* Stats Footer */}
          <div className="w-full max-w-[920px] grid grid-cols-2 md:grid-cols-4 gap-6 shrink-0 pt-12 pb-6 z-10 relative">
            {statsData.map((stat, i) => (
              <div key={stat.label} className="flex flex-col items-center text-center anim-reveal" style={{ '--d': `${0.5 + i * 0.08}s` } as React.CSSProperties}>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-display text-[clamp(22px,3vw,33px)] text-white">{stat.icon}</span>
                  <span className="font-sans font-medium tabular-nums text-white text-[clamp(18px,2.2vw,26px)] tracking-[-0.025em]">
                    <Counter value={stat.value} suffix={stat.suffix} delay={480 + i * 90} duration={1500 + i * 80} />
                  </span>
                </div>
                <span className="text-muted text-[clamp(11px,1.2vw,12.5px)] tracking-wide uppercase">{stat.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 2. About Me */}
        <section id="about" className="w-full min-h-screen py-24 px-4 flex justify-center">
          <div className="w-full max-w-[1000px]">
            <h2 className="text-[clamp(32px,5vw,48px)] font-display text-white mb-12 tracking-tight">About Me</h2>
            <div className="grid md:grid-cols-2 gap-12 lg:gap-24">
              <div className="space-y-6 text-lg text-[#d0d0d0] leading-relaxed">
                <p className="text-[clamp(18px,2vw,22px)] font-serif italic font-light tracking-wide">
                  I am a full-stack developer focused on building intelligent systems that solve real-world problems-not just demos that look good on GitHub.
                </p>
                <p className="text-[clamp(18px,2vw,22px)] font-serif italic font-light tracking-wide">
                  I enjoy working across frontend, backend and AI-driven applications, while continuously learning through real projects, hackathons and open source.
                </p>
                <div className="mt-12 p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
                  <h3 className="text-white font-medium mb-4 uppercase tracking-wider text-sm">Currently Exploring</h3>
                  <div className="flex flex-wrap gap-2">
                    {['AI Engineering', 'Cloud Computing', 'Open Source', 'System Design'].map(topic => (
                      <span key={topic} className="px-4 py-2 rounded-full bg-black border border-white/10 text-sm text-white/90">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="p-8 rounded-3xl border border-white/10 bg-black/40 backdrop-blur-md relative overflow-hidden group hover:border-white/20 transition-colors">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-white/10 transition-colors"></div>
                  <h3 className="text-white/50 uppercase tracking-widest text-xs font-semibold mb-6">Education</h3>
                  <p className="text-white text-xl font-medium mb-1">B.Tech Computer Science</p>
                  <p className="text-muted mb-4">Specialization: AI / ML</p>
                  <p className="text-white/80">Lovely Professional University</p>
                  <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center text-sm">
                    <span className="text-muted">2025 — 2029</span>
                    <span className="text-[#a0a0a0] flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div> In Progress</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Skill Matrix */}
        <section id="skills" className="w-full min-h-screen py-24 px-4 flex justify-center bg-black/40">
          <div className="w-full max-w-[1000px]">
            <h2 className="text-[clamp(32px,5vw,48px)] font-display text-white mb-4 tracking-tight">Technical Arsenal</h2>
            <p className="text-muted text-lg mb-12">Technologies I use to build scalable products.</p>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {[
                { name: 'React', imgUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg', category: 'Frontend' },
                { name: 'TypeScript', imgUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg', category: 'Language' },
                { name: 'Node.js', imgUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg', category: 'Backend' },
                { name: 'Python', imgUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg', category: 'AI / ML' },
                { name: 'MongoDB', imgUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mongodb/mongodb-original.svg', category: 'Database' },
                { name: 'Git', imgUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/git/git-original.svg', category: 'Tools' },
                { name: 'Docker', imgUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/docker/docker-original.svg', category: 'DevOps', extraClasses: 'scale-[1.25]' },
                { name: 'Google Cloud', imgUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/googlecloud/googlecloud-original.svg', category: 'Cloud' },
                { name: 'C++', imgUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/cplusplus/cplusplus-original.svg', category: 'Language' },
                { name: 'PostgreSQL', imgUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postgresql/postgresql-original.svg', category: 'Database' },
                { name: 'MySQL', imgUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mysql/mysql-original.svg', category: 'Database' },
                { name: 'Next.js', imgUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nextjs/nextjs-original.svg', category: 'Frontend', extraClasses: 'bg-white rounded-full' },
                { name: 'Firebase', imgUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/firebase/firebase-original.svg', category: 'Backend' },
                { name: 'Express.js', imgUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23333333'/%3E%3Ctext x='50' y='68' font-family='Arial, sans-serif' font-size='55' font-weight='bold' fill='white' text-anchor='middle' letter-spacing='-2'%3Eex%3C/text%3E%3C/svg%3E", category: 'Framework' },
                { name: 'Tailwind CSS', imgUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg', category: 'Framework' },
                { name: 'FastAPI', imgUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/fastapi/fastapi-original.svg', category: 'Backend' },
                { name: 'PyTorch', imgUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/pytorch/pytorch-original.svg', category: 'AI / ML' },
                { name: 'GitHub', imgUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/github/github-original.svg', category: 'Tools', extraClasses: 'invert' },
                { name: 'Linux', imgUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/linux/linux-original.svg', category: 'OS' }
              ].map((skill) => (
                <div key={skill.name} className="group relative p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 transition-all duration-300 cursor-pointer flex flex-col items-center gap-4 hover:-translate-y-1 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <img
                    src={skill.imgUrl}
                    alt={skill.name}
                    className={`w-9 h-9 z-10 transition-all duration-300 ${skill.extraClasses || ''}`}
                  />
                  <div className="flex flex-col items-center text-center z-10">
                    <span className="font-medium text-white/90 group-hover:text-white transition-colors duration-300">{skill.name}</span>
                    <span className="text-[10px] uppercase tracking-widest text-muted mt-1">{skill.category}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Coding Profiles */}
        <section id="activity" className="w-full py-24 px-4 flex justify-center">
          <div className="w-full max-w-[1000px]">
            <h2 className="text-[clamp(32px,5vw,48px)] font-display text-white mb-4 tracking-tight">Coding Activity</h2>
            <p className="text-muted text-lg mb-12">Proof of work and consistency.</p>

            <div className="grid md:grid-cols-2 gap-6">
              {/* GitHub Card */}
              <div className="p-8 rounded-3xl border border-white/10 bg-black/40 hover:border-white/20 transition-colors flex flex-col">
                <div className="flex items-center gap-4 mb-8">
                  <i className="fa-brands fa-github text-4xl text-white"></i>
                  <div>
                    <h3 className="text-xl font-medium text-white">GitHub</h3>
                    <p className="text-muted text-sm">@biswa1601nk-hub</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-auto">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                    <p className="text-muted text-xs uppercase tracking-wider mb-1">Repositories</p>
                    <p className="text-2xl font-display text-white">{githubData.repos}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                    <p className="text-muted text-xs uppercase tracking-wider mb-1">Contributions</p>
                    <p className="text-2xl font-display text-white">{githubData.contributions}</p>
                  </div>
                </div>
                <a href="https://github.com/biswa1601nk-hub" target="_blank" rel="noreferrer" className="mt-6 flex items-center justify-center gap-2 text-sm text-white/70 hover:text-white transition-colors py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10">
                  View Profile <i className="fa-solid fa-arrow-right text-xs"></i>
                </a>
              </div>

              {/* LeetCode Card */}
              <div className="p-8 rounded-3xl border border-white/10 bg-black/40 hover:border-white/20 transition-colors flex flex-col">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-10 h-10 flex items-center justify-center">
                    <img src="https://raw.githubusercontent.com/rahuldkjain/github-profile-readme-generator/master/src/images/icons/Social/leet-code.svg" alt="LeetCode" className="w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-white">LeetCode</h3>
                    <p className="text-muted text-sm">@biswa_17</p>
                  </div>
                </div>
                <div className="flex gap-4 mt-auto">
                  <div className="flex-1 p-4 rounded-xl bg-[#00B8A3]/10 border border-[#00B8A3]/20 flex flex-col items-center">
                    <p className="text-[#00B8A3] text-2xl font-display">{leetcodeData.easy}</p>
                    <p className="text-muted text-[10px] uppercase mt-1">Easy</p>
                  </div>
                  <div className="flex-1 p-4 rounded-xl bg-[#FFC01E]/10 border border-[#FFC01E]/20 flex flex-col items-center">
                    <p className="text-[#FFC01E] text-2xl font-display">{leetcodeData.medium}</p>
                    <p className="text-muted text-[10px] uppercase mt-1">Medium</p>
                  </div>
                  <div className="flex-1 p-4 rounded-xl bg-[#FF375F]/10 border border-[#FF375F]/20 flex flex-col items-center">
                    <p className="text-[#FF375F] text-2xl font-display">{leetcodeData.hard}</p>
                    <p className="text-muted text-[10px] uppercase mt-1">Hard</p>
                  </div>
                </div>
                <a href="https://leetcode.com/u/biswa_17/" target="_blank" rel="noreferrer" className="mt-6 flex items-center justify-center gap-2 text-sm text-white/70 hover:text-white transition-colors py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10">
                  View Profile <i className="fa-solid fa-arrow-right text-xs"></i>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Project Workspace */}
        <section id="projects" className="w-full py-24 px-4 flex justify-center bg-black/60 border-t border-white/5">
          <div className="w-full max-w-[1000px]">
            <h2 className="text-[clamp(32px,5vw,48px)] font-display text-white mb-4 tracking-tight">Project Workspace</h2>
            <p className="text-muted text-lg mb-12">Things I've built, broken, learned from, and shipped.</p>

            <div className="flex gap-4 mb-8 overflow-x-auto pb-4 scrollbar-hide">
              {['All', 'MERN Stack', 'Full Stack', 'Web'].map((filter) => (
                <button 
                  key={filter} 
                  onClick={() => setActiveProjectFilter(filter)}
                  className={`whitespace-nowrap px-6 py-2 rounded-full border text-sm transition-all ${activeProjectFilter === filter ? 'bg-white text-black border-white font-medium' : 'bg-transparent text-muted border-white/20 hover:border-white/50 hover:text-white'}`}
                >
                  {filter}
                </button>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {filteredProjects.map((project) => (
                <div key={project.id} className={`group relative rounded-3xl overflow-hidden border border-white/10 bg-black/50 hover:border-white/30 transition-all duration-500 ${project.featured ? 'md:col-span-2' : ''}`}>
                  <div className={`relative w-full ${project.featured ? 'h-[400px]' : 'h-[250px]'} overflow-hidden`}>
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10"></div>
                    <img src={project.image} alt={project.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    {project.featured && (
                      <div className="absolute top-6 left-6 z-20 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-xs text-white uppercase tracking-wider font-medium">
                        Featured Project
                      </div>
                    )}
                  </div>
                  <div className="p-8">
                    <h3 className="text-2xl font-medium text-white mb-3">{project.title}</h3>
                    <p className="text-muted leading-relaxed mb-6">{project.description}</p>
                    <div className="flex flex-wrap gap-2 mb-8">
                      {project.technologies.map(tech => (
                        <span key={tech} className="px-3 py-1 rounded-md bg-white/5 border border-white/10 text-xs text-white/80">
                          {tech}
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-4 pt-6 border-t border-white/10">
                      <a href={project.github || '#'} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors">
                        <i className="fa-brands fa-github"></i> Source Code
                      </a>
                      <a href={project.live || '#'} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors ml-auto">
                        Live Demo <i className="fa-solid fa-arrow-up-right-from-square text-xs"></i>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. Let's Work Together */}
        <section id="contact" className="w-full py-32 px-4 flex justify-center">
          <div className="w-full max-w-[800px] text-center">
            <h2 className="text-[clamp(40px,7vw,80px)] font-display text-white mb-6 tracking-tight leading-none">Let's Work Together.</h2>
            <p className="text-muted text-[clamp(16px,2vw,20px)] max-w-[600px] mx-auto mb-12">
              I'm always open to interesting projects, internships, collaborations, open-source opportunities, and conversations around technology.
            </p>

            <div className="max-w-[500px] mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12 text-left">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <i className="fa-regular fa-envelope text-white text-lg"></i>
                </div>
                <div>
                  <p className="text-muted text-sm mb-0.5">Email</p>
                  <p className="text-white font-medium text-[14px]">biswa.bn2436@gmail.com</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <i className="fa-solid fa-location-dot text-white text-lg"></i>
                </div>
                <div>
                  <p className="text-muted text-sm mb-0.5">Location</p>
                  <p className="text-white font-medium text-[14px] whitespace-nowrap">Available for Remote Work</p>
                </div>
              </div>
            </div>

            <form className="max-w-[500px] mx-auto text-left space-y-4 mb-16" onSubmit={handleFormSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-muted mb-2 ml-1">Name</label>
                  <input type="text" required value={formState.name} onChange={e => setFormState({...formState, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-white/40 transition-colors" placeholder="Your Name" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-muted mb-2 ml-1">Email</label>
                  <input type="email" required value={formState.email} onChange={e => setFormState({...formState, email: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-white/40 transition-colors" placeholder="Your Email" />
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-muted mb-2 ml-1">Message</label>
                <textarea rows={4} required value={formState.message} onChange={e => setFormState({...formState, message: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-white/40 transition-colors resize-none" placeholder="Your Message..."></textarea>
              </div>
              <button disabled={formStatus === 'loading'} type="submit" className={`w-full font-semibold py-4 rounded-xl transition-all ${formStatus === 'loading' ? 'bg-white/20 text-white/50 cursor-not-allowed' : 'bg-white text-black hover:bg-gray-200 hover:-translate-y-1'}`}>
                {formStatus === 'loading' ? 'Sending...' : 'Send Message'}
              </button>
              {formStatus === 'success' && <p className="text-green-400 text-sm text-center mt-2">Message sent successfully! I'll get back to you soon.</p>}
              {formStatus === 'error' && <p className="text-red-400 text-sm text-center mt-2">Failed to send message. Please try again later.</p>}
            </form>
          </div>
        </section>
          </>
        ) : (
          <div className="w-full min-h-screen pt-24 bg-black flex flex-col items-center">
            {/* Experience Section */}
            <section id="experience" className="w-full py-24 px-4 flex justify-center">
              <div className="w-full max-w-[1000px]">
                <h2 className="text-[clamp(32px,5vw,48px)] font-display text-white mb-4 tracking-tight">Experience</h2>
                <p className="text-muted text-lg mb-12">My journey through tech, work, and hackathons.</p>

                <div className="flex flex-wrap items-center gap-4 mb-8 border-b border-white/10 pb-4">
                  <button
                    onClick={() => setActiveExperienceTab('Professional')}
                    className={`font-display text-2xl tracking-wider px-4 py-2 transition-colors relative ${activeExperienceTab === 'Professional' ? 'text-white' : 'text-muted hover:text-white'}`}
                  >
                    Work Experience
                    {activeExperienceTab === 'Professional' && (
                      <span className="absolute -bottom-[17px] left-0 w-full h-[2px] bg-white rounded-t-full"></span>
                    )}
                  </button>
                  <button
                    onClick={() => setActiveExperienceTab('Hackathons')}
                    className={`font-display text-2xl tracking-wider px-4 py-2 transition-colors relative ${activeExperienceTab === 'Hackathons' ? 'text-white' : 'text-muted hover:text-white'}`}
                  >
                    Hackathons
                    {activeExperienceTab === 'Hackathons' && (
                      <span className="absolute -bottom-[17px] left-0 w-full h-[2px] bg-white rounded-t-full"></span>
                    )}
                  </button>
                </div>

                <div className="min-h-[300px]">
                  {activeExperienceTab === 'Professional' ? (
                    <div className="space-y-6">
                      {/* GirlScript Summer of Code */}
                      <div className="p-8 rounded-3xl border border-white/10 bg-black/40 hover:border-white/20 transition-colors">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 shadow-lg border border-white/10 bg-white flex items-center justify-center p-1.5">
                              <img src="/gssoc-logo.png" alt="GSSoC Logo" className="w-full h-full object-contain" />
                            </div>
                            <div>
                              <h3 className="text-2xl font-display text-white mb-1">Open Source Contributor</h3>
                              <p className="text-muted">GirlScript Summer of Code</p>
                            </div>
                          </div>
                          <div className="flex flex-col items-start sm:items-end">
                            <span className="text-sm text-muted bg-white/5 px-4 py-2 rounded-full border border-white/10">May 2026 - Aug 2026</span>
                            <span className="text-xs text-white/40 mt-2 mr-2 hidden sm:block">4 mos</span>
                          </div>
                        </div>
                        <ul className="space-y-3 text-[#d0d0d0] list-disc list-inside mb-6">
                          <li>Actively contributed to various open-source repositories, resolving bugs and implementing new features.</li>
                          <li>Collaborated with project maintainers and global developers through code reviews and documentation.</li>
                        </ul>
                        <div className="inline-flex items-start sm:items-center gap-3 p-3 sm:px-4 sm:py-2.5 rounded-2xl sm:rounded-full bg-white/5 border border-white/10 relative overflow-hidden group">
                          <div className="absolute inset-0 bg-gradient-to-r from-[#ff7e5f]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <i className="fa-solid fa-trophy text-[#ff7e5f] mt-0.5 sm:mt-0"></i>
                          <span className="text-sm font-medium text-white/90 shrink-0">Achievement:</span>
                          <span className="text-sm text-white/60">Ranked 1,456 globally among 47,951 participants (Top 4%)</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Solution Challenge 2026 */}
                      <div className="p-8 rounded-3xl border border-white/10 bg-black/40 hover:border-white/20 transition-colors">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                          <div>
                            <h3 className="text-2xl font-display text-white mb-1">Solution Challenge 2026</h3>
                            <p className="text-muted">Google for Developers</p>
                          </div>
                          <span className="text-sm text-muted bg-white/5 px-4 py-2 rounded-full border border-white/10">July 2026</span>
                        </div>
                        
                        <div className="space-y-6">
                          <div>
                            <ul className="space-y-2 text-[#d0d0d0] list-disc list-inside text-sm sm:text-base">
                              <li>Developed a successful prototype integrating AI for problem-solving.</li>
                              <li>Contributed to the spirit of innovation and problem-solving powered by Hack2Skill.</li>
                            </ul>
                          </div>

                          <div>
                            <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                              <i className="fa-solid fa-trophy text-[#ff7e5f]"></i>
                              Achievement
                            </h4>
                            <p className="text-sm sm:text-base text-[#d0d0d0]">Awarded Certificate of Participation for successful prototype submission.</p>
                          </div>

                          {/* Certificates */}
                          <div className="flex flex-col sm:flex-row flex-wrap gap-4 pt-2">
                            <div className="inline-flex items-center justify-between sm:justify-start gap-4 p-2 pr-2 pl-5 rounded-full bg-white/5 border border-white/10 w-full sm:w-auto transition-colors hover:bg-white/10 hover:border-white/20">
                              <span className="text-sm font-medium text-white/90 whitespace-nowrap">Certificate</span>
                              <a href="/certificate.jpeg" target="_blank" rel="noreferrer" className="bg-[#ff7e5f] text-white text-xs px-5 py-2 rounded-full font-bold uppercase tracking-wider hover:bg-[#ff6a4a] hover:-translate-y-[1px] hover:shadow-[0_4px_12px_rgba(255,126,95,0.3)] transition-all shrink-0">
                                Click Here
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>


                      {/* Code-A-Haunt 3.0 Hackathon */}
                      <div className="p-8 rounded-3xl border border-white/10 bg-black/40 hover:border-white/20 transition-colors">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                          <div>
                            <h3 className="text-2xl font-display text-white mb-1">Code-A-Haunt 3.0</h3>
                            <p className="text-muted">Coding Blocks</p>
                          </div>
                          <span className="text-sm text-muted bg-white/5 px-4 py-2 rounded-full border border-white/10">March 2026</span>
                        </div>
                        
                        <div className="space-y-6">
                          <div>
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-200/90 text-sm font-medium">
                              <i className="fa-solid fa-star text-yellow-400"></i>
                              <span>National-Level Inter-University Hackathon</span>
                            </div>
                          </div>

                          <div>
                            <ul className="space-y-2 text-[#d0d0d0] list-disc list-inside text-sm sm:text-base">
                              <li>24 hours of intensive hackathon coding.</li>
                              <li>8 hours of dedicated mentorship from industry experts.</li>
                            </ul>
                          </div>

                          <div>
                            <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                              <i className="fa-solid fa-trophy text-[#ff7e5f]"></i>
                              Achievement
                            </h4>
                            <p className="text-sm sm:text-base text-[#d0d0d0]">Secured a spot in the Top 15 teams among participants from 30+ universities.</p>
                          </div>

                          {/* Certificates */}
                          <div className="flex flex-col sm:flex-row flex-wrap gap-4 pt-2">
                            <div className="inline-flex items-center justify-between sm:justify-start gap-4 p-2 pr-2 pl-5 rounded-full bg-white/5 border border-white/10 w-full sm:w-auto transition-colors hover:bg-white/10 hover:border-white/20">
                              <span className="text-sm font-medium text-white/90 whitespace-nowrap">Certificate</span>
                              <a href="/CodeAHaunt_Participation.png" target="_blank" rel="noreferrer" className="bg-[#ff7e5f] text-white text-xs px-5 py-2 rounded-full font-bold uppercase tracking-wider hover:bg-[#ff6a4a] hover:-translate-y-[1px] hover:shadow-[0_4px_12px_rgba(255,126,95,0.3)] transition-all shrink-0">
                                Click Here
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* INFERNOVERSE Hackathon */}
                      <div className="p-8 rounded-3xl border border-white/10 bg-black/40 hover:border-white/20 transition-colors">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                          <div>
                            <h3 className="text-2xl font-display text-white mb-1">INFERNOVERSE 24 HOUR HACKATHON</h3>
                            <p className="text-muted">GeeksforGeeks & HiDevs</p>
                          </div>
                          <span className="text-sm text-muted bg-white/5 px-4 py-2 rounded-full border border-white/10">November 2025</span>
                        </div>
                        
                        <div className="space-y-6">
                          <div>
                            <ul className="space-y-2 text-[#d0d0d0] list-disc list-inside text-sm sm:text-base">
                              <li>Built a fully functional product in a 24-hour time constraint.</li>
                              <li>Contributed to advancing the spirit of innovation.</li>
                            </ul>
                          </div>

                          <div>
                            <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                              <i className="fa-solid fa-trophy text-[#ff7e5f]"></i>
                              Achievement
                            </h4>
                            <p className="text-sm sm:text-base text-[#d0d0d0]">Successfully participated in the hackathon conducted by Student Organization Inferno in association with GFG LPU and powered by HiDevs.</p>
                          </div>

                          {/* Certificates */}
                          <div className="flex flex-col sm:flex-row gap-4 pt-2">
                            <div className="inline-flex items-center justify-between sm:justify-start gap-4 p-2 pr-2 pl-5 rounded-full bg-white/5 border border-white/10 w-full sm:w-auto transition-colors hover:bg-white/10 hover:border-white/20">
                              <span className="text-sm font-medium text-white/90 whitespace-nowrap">GeeksforGeeks Certificate</span>
                              <a href="/GFG+Infernoverse Hackathon.png" target="_blank" rel="noreferrer" className="bg-[#ff7e5f] text-white text-xs px-5 py-2 rounded-full font-bold uppercase tracking-wider hover:bg-[#ff6a4a] hover:-translate-y-[1px] hover:shadow-[0_4px_12px_rgba(255,126,95,0.3)] transition-all shrink-0">
                                Click Here
                              </a>
                            </div>
                            <div className="inline-flex items-center justify-between sm:justify-start gap-4 p-2 pr-2 pl-5 rounded-full bg-white/5 border border-white/10 w-full sm:w-auto transition-colors hover:bg-white/10 hover:border-white/20">
                              <span className="text-sm font-medium text-white/90 whitespace-nowrap">HiDevs Certificate</span>
                              <a href="/HiDevs+Infernoverse Hackathon.png" target="_blank" rel="noreferrer" className="bg-[#ff7e5f] text-white text-xs px-5 py-2 rounded-full font-bold uppercase tracking-wider hover:bg-[#ff6a4a] hover:-translate-y-[1px] hover:shadow-[0_4px_12px_rgba(255,126,95,0.3)] transition-all shrink-0">
                                Click Here
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        )}

        {/* 7. Footer */}
        <footer className="w-full py-8 px-4 flex justify-center border-t border-white/10 bg-black">
          <div className="w-full max-w-[1000px] flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-white font-medium flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-black border border-white/20 flex items-center justify-center shrink-0">
                <span className="font-display text-white text-[14px] mt-[1px]">BN</span>
              </div>
              <span className="text-muted text-sm border-l border-white/20 pl-2 ml-1">Building things that matter.</span>
            </div>

            <div className="flex items-center gap-6 text-muted">
              <a href="https://github.com/biswa1601nk-hub" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                <i className="fa-brands fa-github text-lg"></i>
              </a>
              <a href="https://www.linkedin.com/in/nayak08/" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                <i className="fa-brands fa-linkedin text-lg"></i>
              </a>
              <a href="#contact" onClick={(e) => { e.preventDefault(); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-white transition-colors relative group">
                <i className="fa-solid fa-envelope text-lg"></i>
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#1a1a1a] border border-white/10 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap pointer-events-none">
                  biswa.bn2436@gmail.com
                </span>
              </a>
            </div>

            <div className="text-muted text-xs flex flex-col items-end">
              <span>© 2026 Biswajit Nayak</span>
              <span className="opacity-50">All rights reserved.</span>
            </div>
          </div>
        </footer>

      </main>
    </div>
  );
}

export default App;
