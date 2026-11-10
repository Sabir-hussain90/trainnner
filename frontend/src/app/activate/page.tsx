'use client';

import { useEffect, useState, FormEvent, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

function ActivateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [verifying, setVerifying] = useState(true);
  const [valid, setValid] = useState(false);
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [error, setError] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ [k: string]: string }>({});

  useEffect(() => {
    if (!token) {
      setVerifying(false);
      setError('No activation token provided in the URL.');
      return;
    }

    // Call the backend verify-token endpoint
    (async () => {
      try {
        const res = await fetch(
          `${API_URL}/auth/verify-token?token=${encodeURIComponent(token)}`,
          { method: 'GET', headers: { 'Content-Type': 'application/json' } },
        );
        const data = await res.json().catch(() => ({}));

        if (res.ok && data.valid) {
          setValid(true);
          setEmail(data.email || '');
          setFirstName(data.firstName || '');
        } else {
          setError(data.message || 'Invalid or expired activation link.');
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to verify token. Is the backend running?');
      } finally {
        setVerifying(false);
      }
    })();
  }, [token]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errs: { [k: string]: string } = {};

    // 1. Required Check
    if (!newPassword) {
      errs.newPassword = 'Password is required';
    } 
    // 2. Cannot be greater than 10 characters
    else if (newPassword.length > 10) {
      errs.newPassword = 'Password cannot be greater than 10 characters';
    }
    // 3. Mix of Letters and Numbers
    else if (!/[a-zA-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      errs.newPassword = 'Password must be a mix of letters and numbers';
    } 
    // 4. At least one Special Character
    else if (!/[!@#$%^&*(),.?":{}|<>_\-+=[\]\\/;'`~]/.test(newPassword)) {
      errs.newPassword = 'Password must include at least one special character';
    }

    // Confirm Password Checks
    if (!confirmPassword) {
      errs.confirmPassword = 'Please confirm your password';
    } else if (newPassword !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }

    setFieldErrors({});
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/auth/activate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword, confirmPassword }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          Array.isArray(data?.message)
            ? data.message.join(', ')
            : data?.message || `Activation failed (${res.status})`,
        );
      }

      setSuccess(true);
      setTimeout(() => router.push('/'), 3000);
    } catch (err: any) {
      setError(err?.message || 'Activation failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white px-4 py-12">
      <div className="w-full max-w-[480px]">
        <div className="flex justify-center items-center gap-1.5 mb-8">
          <svg width="28" height="28" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            <polygon
              points="20,6 35,33 5,33"
              fill="none"
              stroke="#e87c34"
              strokeWidth="4"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </svg>
          <span className="text-2xl font-bold tracking-tight leading-none">
            <span className="text-[#e87c34]">TRAINER</span>
            <span className="text-gray-400">METRICS</span>
          </span>
        </div>

        <div className="bg-white w-full px-8 py-10 rounded-3xl shadow-[0_4px_30px_rgba(0,0,0,0.08)] border border-gray-100">
          {verifying ? (
            <div className="text-center py-10">
              <svg
                className="w-8 h-8 mx-auto text-gray-400 animate-spin mb-4"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
              <p className="text-sm text-gray-500">Verifying your activation link...</p>
            </div>
          ) : success ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                <svg
                  className="w-7 h-7 text-emerald-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Account Activated!</h2>
              <p className="text-sm text-gray-500 mb-6">
                Your password has been set. Redirecting you to login...
              </p>
              <Link
                href="/"
                className="inline-block px-6 h-11 leading-[44px] bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-xl font-semibold text-sm transition"
              >
                Go to Login
              </Link>
            </div>
          ) : !valid ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-red-50 flex items-center justify-center mb-4">
                <svg
                  className="w-7 h-7 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Activation Failed</h2>
              <p className="text-sm text-gray-500 mb-6">
                {error || 'This activation link is invalid or has expired.'}
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
                <h2 className="text-[22px] font-bold text-gray-900 mb-1">Set Your Password</h2>
                <p className="text-sm text-gray-500">
                  Hi {firstName}, set a password for <strong>{email}</strong>
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNew ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        if (fieldErrors.newPassword)
                          setFieldErrors({ ...fieldErrors, newPassword: '' });
                      }}
                      disabled={submitting}
                      placeholder="Max 10 chars, letter, number, special"
                      className={`w-full h-12 pl-4 pr-12 border rounded-xl text-sm outline-none transition text-gray-800 placeholder-gray-400 disabled:opacity-60 ${
                        fieldErrors.newPassword
                          ? 'border-red-400 focus:ring-4 focus:ring-red-500/10'
                          : 'border-gray-200 focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew((v) => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6 text-gray-400 hover:text-gray-700 transition"
                      tabIndex={-1}
                    >
                      {showNew ? (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                  {fieldErrors.newPassword && (
                    <p className="text-xs text-red-500 mt-1.5">{fieldErrors.newPassword}</p>
                  )}
                </div>

                <div className="mb-5">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (fieldErrors.confirmPassword)
                          setFieldErrors({ ...fieldErrors, confirmPassword: '' });
                      }}
                      disabled={submitting}
                      placeholder="Repeat password"
                      className={`w-full h-12 pl-4 pr-12 border rounded-xl text-sm outline-none transition text-gray-800 placeholder-gray-400 disabled:opacity-60 ${
                        fieldErrors.confirmPassword
                          ? 'border-red-400 focus:ring-4 focus:ring-red-500/10'
                          : 'border-gray-200 focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6 text-gray-400 hover:text-gray-700 transition"
                      tabIndex={-1}
                    >
                      {showConfirm ? (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                  {fieldErrors.confirmPassword && (
                    <p className="text-xs text-red-500 mt-1.5">
                      {fieldErrors.confirmPassword}
                    </p>
                  )}
                </div>

                {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

                <button
                  type="submit"
                  disabled={submitting}
                  className={`w-full h-12 rounded-xl font-bold uppercase tracking-wider text-sm transition ${
                    submitting
                      ? 'bg-[#1e3a6f] text-[#5b7bb0] cursor-not-allowed'
                      : 'bg-[#1a73e8] hover:bg-[#1557b0] text-white'
                  }`}
                >
                  {submitting ? 'ACTIVATING...' : 'ACTIVATE ACCOUNT'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

export default function ActivatePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-gray-400">
          Loading...
        </div>
      }
    >
      <ActivateContent />
    </Suspense>
  );
}