
import React, { useState } from 'react';
import { AppView, User, UserRole } from '../types';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, auth, sendVerificationEmail, resetPassword, signInWithGoogle, fetchUsers, verifyTOTP } from '../services/firebase';

interface AuthPagesProps {
  view: AppView;
  setView: (view: AppView) => void;
  onUltraLogin?: () => void; // New prop for demo
  onLoginSuccess?: (user: Partial<User>) => void; // Pass data back to App
}

const AuthPages: React.FC<AuthPagesProps> = ({ view, setView, onUltraLogin, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [twoFactorToken, setTwoFactorToken] = useState('');
  const [show2FA, setShow2FA] = useState(false);
  const [tempUser, setTempUser] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (view === AppView.LOGIN) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Check if email is verified
        if (!user.emailVerified) {
          setError('Please verify your email before logging in. Check your inbox for the verification link.');
          return;
        }

        // Fetch user data to check 2FA
        const usersResult = await fetchUsers();
        const userData = usersResult.success ? usersResult.data?.find(u => u.id === user.uid) : null;

        if (userData?.twoFactorEnabled) {
          setTempUser(user);
          setShow2FA(true);
          return;
        }

        // In a real app, you'd fetch the user profile from Firestore here
        if (onLoginSuccess) {
              onLoginSuccess({
                  id: user.uid,
                  username: user.email?.split('@')[0] || 'User',
                  email: user.email,
                  role: UserRole.USER,
                  plan: 'premium', // Default for now, should come from DB
                  emailVerified: user.emailVerified,
                  twoFactorEnabled: userData?.twoFactorEnabled
              });
        }
        setView(AppView.HOME);

      } else if (view === AppView.REGISTER) {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;

          // Send verification email
          await sendVerificationEmail();

          // Here you would create the user document in Firestore
          if (onLoginSuccess) {
              onLoginSuccess({
                  id: user.uid,
                  username: username,
                  email: user.email,
                  role: UserRole.USER,
                  plan: 'free',
                  emailVerified: false
              });
          }
          setView(AppView.EMAIL_VERIFICATION);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handle2FAVerification = async () => {
    if (!tempUser) return;

    // Fetch user data to get the secret
    const usersResult = await fetchUsers();
    const userData = usersResult.success ? usersResult.data?.find(u => u.id === tempUser.uid) : null;

    if (userData?.twoFactorSecret && verifyTOTP(userData.twoFactorSecret, twoFactorToken)) {
      if (onLoginSuccess) {
        onLoginSuccess({
          id: tempUser.uid,
          username: tempUser.email?.split('@')[0] || 'User',
          email: tempUser.email,
          role: UserRole.USER,
          plan: 'premium',
          emailVerified: tempUser.emailVerified,
          twoFactorEnabled: true
        });
      }
      setView(AppView.HOME);
      setShow2FA(false);
      setTempUser(null);
      setTwoFactorToken('');
    } else {
      setError('Invalid 2FA code. Please try again.');
    }
  };

  const renderContent = () => {
    if (show2FA) {
      return (
        <>
          <h2 className="text-3xl font-bold text-white mb-2">Two-Factor Authentication</h2>
          <p className="text-gray-400 mb-8">Enter the 6-digit code from your authenticator app.</p>
          {error && <div className="bg-red-900/20 border border-red-900 text-red-400 p-3 rounded-lg mb-4 text-sm">{error}</div>}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Authentication Code</label>
              <input
                type="text"
                value={twoFactorToken}
                onChange={(e) => setTwoFactorToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full bg-black/30 border border-gray-700 rounded-xl p-3 text-white focus:border-brand-500 outline-none text-center text-2xl tracking-widest"
                placeholder="000000"
                maxLength={6}
              />
            </div>
            <button
              onClick={handle2FAVerification}
              disabled={twoFactorToken.length !== 6}
              className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-brand-900/40 transition-all disabled:opacity-50"
            >
              Verify Code
            </button>
            <button
              onClick={() => {
                setShow2FA(false);
                setTempUser(null);
                setTwoFactorToken('');
                setError('');
              }}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-xl transition-all"
            >
              Back to Login
            </button>
          </div>
        </>
      );
    }

    if (view === AppView.LOGIN) {
      return (
        <>
          <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
          <p className="text-gray-400 mb-8">Enter your credentials to access your account.</p>
          {error && <div className="bg-red-900/20 border border-red-900 text-red-400 p-3 rounded-lg mb-4 text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/30 border border-gray-700 rounded-xl p-3 text-white focus:border-brand-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/30 border border-gray-700 rounded-xl p-3 text-white focus:border-brand-500 outline-none"
              />
            </div>
            <div className="flex justify-end">
              <button type="button" onClick={() => setView(AppView.FORGOT_PASSWORD)} className="text-xs text-brand-400 hover:text-brand-300">Forgot Password?</button>
            </div>
            <button type="submit" disabled={isLoading} className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-brand-900/40 transition-all disabled:opacity-50 flex justify-center">
              {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Sign In'}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-dark-card text-gray-400">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={async () => {
                try {
                  const result = await signInWithGoogle();
                  if (result.success && result.data) {
                    const user = result.data.user;
                    if (onLoginSuccess) {
                      onLoginSuccess({
                        id: user.uid,
                        username: user.displayName || user.email?.split('@')[0] || 'User',
                        email: user.email,
                        role: UserRole.USER,
                        plan: 'free',
                        emailVerified: user.emailVerified,
                        avatar: user.photoURL
                      });
                    }
                    setView(AppView.HOME);
                  }
                } catch (err: any) {
                  setError(err.message || 'Google sign in failed');
                }
              }}
              className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            {/* Ultra Demo Button - Disabled for Production */}
            {/* {onUltraLogin && (
                <button type="button" onClick={onUltraLogin} className="w-full bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-900/40 transition-all mt-4 border border-indigo-400/30">
                   <i className="fa-solid fa-atom mr-2"></i> Demo: Sign in as Ultra
                </button>
            )} */}
          </form>
          <div className="mt-6 text-center text-sm text-gray-500">
            Don't have an account? <button onClick={() => setView(AppView.REGISTER)} className="text-white font-bold hover:underline">Sign Up</button>
          </div>
        </>
      );
    }

    if (view === AppView.REGISTER) {
      return (
        <>
          <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
          <p className="text-gray-400 mb-8">Join the premium experience today.</p>
          {error && <div className="bg-red-900/20 border border-red-900 text-red-400 p-3 rounded-lg mb-4 text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-black/30 border border-gray-700 rounded-xl p-3 text-white focus:border-brand-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/30 border border-gray-700 rounded-xl p-3 text-white focus:border-brand-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/30 border border-gray-700 rounded-xl p-3 text-white focus:border-brand-500 outline-none"
              />
            </div>
            <button type="submit" disabled={isLoading} className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-brand-900/40 transition-all disabled:opacity-50 flex justify-center">
              {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Register'}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-dark-card text-gray-400">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={async () => {
                try {
                  const result = await signInWithGoogle();
                  if (result.success && result.data) {
                    const user = result.data.user;
                    if (onLoginSuccess) {
                      onLoginSuccess({
                        id: user.uid,
                        username: user.displayName || user.email?.split('@')[0] || 'User',
                        email: user.email,
                        role: UserRole.USER,
                        plan: 'free',
                        emailVerified: user.emailVerified,
                        avatar: user.photoURL
                      });
                    }
                    setView(AppView.HOME);
                  }
                } catch (err: any) {
                  setError(err.message || 'Google sign in failed');
                }
              }}
              className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
          </form>
          <div className="mt-6 text-center text-sm text-gray-500">
            Already have an account? <button onClick={() => setView(AppView.LOGIN)} className="text-white font-bold hover:underline">Log In</button>
          </div>
        </>
      );
    }

    if (view === AppView.FORGOT_PASSWORD) {
      return (
        <>
          <h2 className="text-3xl font-bold text-white mb-2">Recovery</h2>
          <p className="text-gray-400 mb-8">Enter your email to reset your password.</p>
          <form onSubmit={async (e) => {
            e.preventDefault();
            const emailInput = (e.target as HTMLFormElement).email.value;
            try {
              await resetPassword(emailInput);
              setError('Password reset email sent! Check your inbox.');
            } catch (err: any) {
              setError(err.message || 'Failed to send reset email');
            }
          }} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Email</label>
              <input name="email" type="email" required className="w-full bg-black/30 border border-gray-700 rounded-xl p-3 text-white focus:border-brand-500 outline-none" />
            </div>
            <button type="submit" className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-200 transition-all">
              Send Reset Link
            </button>
          </form>
          <div className="mt-6 text-center">
            <button onClick={() => setView(AppView.LOGIN)} className="text-sm text-gray-400 hover:text-white">Back to Login</button>
          </div>
        </>
      );
    }

    if (view === AppView.EMAIL_VERIFICATION) {
      return (
        <>
          <h2 className="text-3xl font-bold text-white mb-2">Verify Your Email</h2>
          <p className="text-gray-400 mb-8">We've sent a verification link to your email. Please check your inbox and click the link to activate your account.</p>
          <div className="space-y-4">
            <button
              onClick={async () => {
                try {
                  await sendVerificationEmail();
                  setError('Verification email sent! Check your inbox.');
                } catch (err: any) {
                  setError(err.message || 'Failed to send verification email');
                }
              }}
              className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-brand-900/40 transition-all"
            >
              Resend Verification Email
            </button>
            <button
              onClick={() => setView(AppView.LOGIN)}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-xl transition-all"
            >
              Back to Login
            </button>
          </div>
        </>
      );
    }

    return null;
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-black">
        <img src="https://picsum.photos/seed/bg/1920/1080" className="w-full h-full object-cover opacity-20 blur-xl" />
      </div>
      
      <div className="relative z-10 bg-dark-card/90 backdrop-blur-xl border border-gray-800 w-full max-w-md p-8 rounded-3xl shadow-2xl animate-in fade-in zoom-in duration-300">
         <div className="flex justify-center mb-6">
            <div className="w-12 h-12 bg-brand-600 rounded-lg flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-brand-900/50">
                P
            </div>
         </div>
         {renderContent()}
      </div>
    </div>
  );
};

export default AuthPages;
