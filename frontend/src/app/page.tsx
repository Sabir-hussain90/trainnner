'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  
  const [message, setMessage] = useState<{ text: string; type: '' | 'error' | 'success' }>({
    text: '',
    type: '',
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // 1. Email Validation
    if (!email.trim()) {
      setMessage({ text: 'Please enter an email.', type: 'error' });
      return;
    }

    // 2. Password Validation
    if (!password) {
      setMessage({ text: 'Please enter a password.', type: 'error' });
      return;
    }

    // Check for Minimum 10 Characters
    if (password.length < 10) {
      setMessage({ text: 'Password must be at least 10 characters long.', type: 'error' });
      return;
    }

    // Check for Mixed Characters (At least 1 letter and 1 number)
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    
    if (!hasLetter || !hasNumber) {
      setMessage({ text: 'Password must be a mix of letters and numbers.', type: 'error' });
      return;
    }

    // Check for Special Character
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>_\-+=[\]\\/;'`~]/.test(password);
    if (!hasSpecial) {
      setMessage({ text: 'Password must include at least one special character (e.g., !@#$%^&*).', type: 'error' });
      return;
    }

    // If all frontend checks pass, proceed to backend
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const response = await fetch('http://localhost:4000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed. Please check your credentials.');
      }

      const { user, token } = data;

      const target = rememberMe ? localStorage : sessionStorage;
      const other = rememberMe ? sessionStorage : localStorage;
      
      other.removeItem('token');
      other.removeItem('user');
      target.setItem('token', token);
      target.setItem('user', JSON.stringify(user));

      setMessage({ text: 'Signed in. Redirecting…', type: 'success' });
      
      setTimeout(() => {
        router.push('/dashboard');
      }, 500);

    } catch (err: any) {
      setMessage({ text: err.message || 'An error occurred. Please try again.', type: 'error' });
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* LEFT SIDE */}
      <div className="flex-1 flex flex-col justify-center px-8 py-12 md:px-20 lg:px-24">
        <h1 className="text-3xl md:text-[34px] font-semibold text-gray-900 mb-3">
          TrainerMetrics 3.0 <span className="text-[#e87c34]">is here.</span>
        </h1>
        <p className="text-gray-600 text-sm md:text-base mb-10">
          Rebuilt from the ground up. Everything you had, faster.
        </p>

        <div className="flex flex-col gap-4 max-w-[440px]">
          <div className="flex gap-3 items-start p-4 border border-gray-200 rounded-xl bg-white">
            <div className="w-10 h-10 rounded-full bg-[#fdefe2] flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-[#e87c34]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-gray-900 mb-1">Fast enough to keep up</h3>
              <p className="text-[13px] text-gray-500 leading-relaxed">
                Rebuilt navigation and interface. No more waiting on your own software.
              </p>
            </div>
          </div>

          <div className="flex gap-3 items-start p-4 border border-gray-200 rounded-xl bg-white">
            <div className="w-10 h-10 rounded-full bg-[#e8effb] flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-[#4a76d4]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.09-4-4L2 16.09z" />
              </svg>
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-gray-900 mb-1">Results happen between sessions</h3>
              <p className="text-[13px] text-gray-500 leading-relaxed">
                Schedule programs and automate check-ins that keep clients moving all week.
              </p>
            </div>
          </div>

          <div className="flex gap-3 items-start p-4 border border-gray-200 rounded-xl bg-white">
            <div className="w-10 h-10 rounded-full bg-[#efe8fb] flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-[#8a5cc7]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z" />
              </svg>
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-gray-900 mb-1">Take it to the floor:</h3>
              <p className="text-[13px] text-gray-500 leading-relaxed">
                Native iPhone and Android apps that work where the wifi doesn&apos;t.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE (Login Form) */}
      <div className="flex-1 flex flex-col justify-center items-center bg-white px-4 py-12">
        <div className="bg-white w-full max-w-[500px] px-10 py-10 rounded-3xl shadow-[0_4px_30px_rgba(0,0,0,0.08)]">
          <div className="flex justify-center items-center gap-1.5 mb-3">
            <svg width="26" height="26" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
              <polygon points="20,6 35,33 5,33" fill="none" stroke="#e87c34" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />
            </svg>
            <span className="text-2xl font-bold tracking-tight leading-none">
              <span className="text-[#e87c34]">TRAINER</span>
              <span className="text-gray-400">METRICS</span>
            </span>
          </div>

          <div className="text-center mb-8">
            <span className="bg-[#e6f4ea] text-[#137333] text-[11px] px-3 py-1 rounded-full font-medium">
              Online
            </span>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-800 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                placeholder="you@example.com"
                className="w-full h-12 px-4 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10 transition text-gray-800 placeholder-gray-400 disabled:opacity-60"
              />
            </div>

            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-800 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  placeholder="••••••••••"
                  className="w-full h-12 pl-4 pr-12 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10 transition text-gray-800 placeholder-gray-400 disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6 text-gray-400 hover:text-gray-700 transition"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center mb-6 text-sm">
              <label className="flex items-center gap-2 text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loading}
                  className="w-4 h-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Remember me
              </label>
              <Link href="/forgot-password" className="text-[#1a73e8] font-semibold hover:underline">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full h-12 rounded-xl font-bold uppercase tracking-wider text-sm transition ${
                loading ? 'bg-[#1e3a6f] text-[#5b7bb0] cursor-not-allowed' : 'bg-[#1a73e8] hover:bg-[#1557b0] text-white'
              }`}
            >
              {loading ? 'SIGNING IN...' : 'CONTINUE'}
            </button>

            {message.text && (
              <p
                className={`mt-4 text-center text-sm font-medium ${
                  message.type === 'success' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {message.text}
              </p>
            )}
          </form>
        </div>

        <div className="mt-8 text-xs text-gray-400 flex gap-4">
          <a href="#" className="hover:text-gray-600">Privacy Policy</a>
          <a href="#" className="hover:text-gray-600">Terms of Service</a>
          <a href="#" className="hover:text-gray-600">Contact</a>
          <span>Version 3.0</span>
        </div>
      </div>
    </main>
  );
}