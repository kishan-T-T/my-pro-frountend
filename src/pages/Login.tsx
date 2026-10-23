import { useAuth } from 'auth/useAuth';
import React, { useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

export const Login: React.FC = () => {
  const { signInWithPassword, signUpWithPassword } = useAuth();
  const history = useHistory();
  const location = useLocation();

  const queryMode = new URLSearchParams(location.search).get('mode');
  const [mode, setMode] = useState<'login' | 'signup'>(queryMode === 'signup' ? 'signup' : 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isSignup = mode === 'signup';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setNotice('');
    setSubmitting(true);
    try {
      if (isSignup) {
        const data = await signUpWithPassword(email, password);
        // With "Confirm email" enabled Supabase returns a user but no session.
        if (data?.session) {
          history.replace('/');
        } else {
          setNotice('Check your email to confirm your account, then log in.');
        }
      } else {
        await signInWithPassword(email, password);
        history.replace('/');
      }
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-lg shadow-modal p-8">
        <div className="flex items-center mb-6">
          <svg width="30" height="30" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="40" height="40" rx="20" fill="#4338CA" />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M26.639 24.0309L29.6377 25.2142C29.785 25.2722 29.9018 25.3891 29.9599 25.5369C30.0613 25.7945 29.9638 26.0816 29.7413 26.2271L29.6385 26.2804L20.5031 29.8998C20.2217 30.0114 19.9138 30.0297 19.6237 29.955L19.4521 29.899L10.3606 26.2799C10.214 26.2216 10.098 26.105 10.0401 25.9578C9.93871 25.7004 10.0362 25.4133 10.2587 25.2678L10.3615 25.2145L13.3453 24.0323L18.6652 26.1507C19.5072 26.4859 20.4443 26.4868 21.2868 26.1529L26.639 24.0309ZM26.639 18.2749L29.6377 19.4581C29.785 19.5163 29.9018 19.6332 29.9599 19.7809C30.0613 20.0385 29.9638 20.3255 29.7413 20.4711L29.6385 20.5243L20.5031 24.1439L20.4468 24.161L20.3306 24.1999C20.284 24.2118 20.2369 24.2214 20.1896 24.2284C20.1739 24.2306 20.159 24.2326 20.1442 24.2343C20.0305 24.248 19.9145 24.2475 19.8 24.233L19.6237 24.1991L19.4521 24.1431L17.6969 23.4433L10.3606 20.524C10.214 20.4656 10.098 20.349 10.0401 20.2018C9.93871 19.9443 10.0362 19.6573 10.2587 19.5117L10.3615 19.4585L13.3453 18.2764L18.6652 20.3948C19.5072 20.73 20.4443 20.7307 21.2868 20.3969L26.639 18.2749ZM19.4543 10.1001C19.7905 9.96692 20.1645 9.96662 20.5009 10.0993L29.6377 13.7021C29.785 13.7602 29.9018 13.8772 29.9599 14.0249C30.0757 14.3192 29.9319 14.6521 29.6385 14.7683L20.5019 18.3883L20.3863 18.4283C20.3569 18.4371 20.3272 18.445 20.2974 18.4518C20.1344 18.4896 19.9658 18.498 19.8 18.4769L19.6237 18.443L19.4521 18.387L10.3606 14.768C10.214 14.7096 10.098 14.593 10.0401 14.4458C9.92423 14.1515 10.0681 13.8187 10.3615 13.7025L19.4543 10.1001Z"
              fill="white"
            />
          </svg>
          <p className="ml-4 font-medium text-gray-700 text-md">Project Board</p>
        </div>

        <h2 className="text-lg font-medium text-gray-700 mb-6">
          {isSignup ? 'Create your account' : 'Log in to your account'}
        </h2>

        <form onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            autoComplete={isSignup ? 'new-password' : 'current-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          {notice && <p className="text-green-600 text-sm mb-4">{notice}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-indigo-600 text-white font-medium py-2 rounded-md hover:bg-indigo-500 disabled:opacity-60"
          >
            {submitting ? 'Please wait…' : isSignup ? 'Sign up' : 'Log in'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode(isSignup ? 'login' : 'signup');
            setError('');
            setNotice('');
          }}
          className="mt-4 w-full text-sm text-indigo-600 hover:underline"
        >
          {isSignup ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
        </button>
      </div>
    </section>
  );
};
