'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          Array.isArray(data?.message)
            ? data.message.join(', ')
            : data?.message || `Request failed (${res.status})`,
        );
      }

      setSent(true);
    } catch (err: any) {
      setError(err?.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white px-4 py-12">
      <div className="w-full max-w-[480px]">
        <div className="flex justify-center items-center gap-1.5 mb-8">
          <svg width="28" height="28" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            <polygon points="20,6 35,33 5,33" fill="none" stroke="#e87c34" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />
          </svg>
          <span className="text-2xl font-bold tracking-tight leading-none">
            <span className="text-[#e87c34]">TRAINER</span>
            <span className="text-gray-400">METRICS</span>
          </span>
        </div>

        <div className="bg-white w-full px-8 py-10 rounded-3xl shadow-[0_4px_30px_rgba(0,0,0,0.08)] border border-gray-100">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Check your email</h2>
              <p className="text-sm text-gray-500 mb-6">
                If an account exists for <strong>{email}</strong>, you&apos;ll receive a password reset link shortly.
              </p>
              <Link
                href="/"
                className="inline-block px-6 h-11 leading-[44px] bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-xl font-semibold text-sm transition"
              >
                Back to Login
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <h2 className="text-[22px] font-bold text-gray-900 mb-1">Forgot Password?</h2>
                <p className="text-sm text-gray-500">Enter your email and we&apos;ll send you a reset link.</p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-5">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if (error) setError(''); }}
                    disabled={loading}
                    placeholder="you@example.com"
                    className={`w-full h-12 px-4 border rounded-xl text-sm outline-none transition text-gray-800 placeholder-gray-400 disabled:opacity-60 ${
                      error
                        ? 'border-red-400 focus:ring-4 focus:ring-red-500/10'
                        : 'border-gray-200 focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10'
                    }`}
                  />
                  {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full h-12 rounded-xl font-bold uppercase tracking-wider text-sm transition ${
                    loading
                      ? 'bg-[#1e3a6f] text-[#5b7bb0] cursor-not-allowed'
                      : 'bg-[#1a73e8] hover:bg-[#1557b0] text-white'
                  }`}
                >
                  {loading ? 'SENDING...' : 'SEND RESET LINK'}
                </button>

                <div className="text-center mt-5">
                  <Link href="/" className="text-sm text-[#1a73e8] hover:underline font-medium">
                    Back to Login
                  </Link>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}