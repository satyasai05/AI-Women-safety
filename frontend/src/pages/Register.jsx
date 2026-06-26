import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, User, Mail, Phone, Lock, AlertCircle, ArrowRight } from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !phone || !password) {
      setError('Please fill in all fields.');
      return;
    }
    
    setError('');
    setLoading(true);

    const result = await register(name, email, phone, password);
    setLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="relative w-full max-w-md">
        
        {/* Blur accent */}
        <div className="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-safety-500/10 blur-[50px]"></div>
        <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-rose-700/10 blur-[50px]"></div>

        <div className="glass-panel p-8 rounded-2xl border border-white/5 shadow-2xl relative z-10">
          
          <div className="flex flex-col items-center space-y-2 mb-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-safety-500 to-rose-600 shadow-md">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <h2 className="font-outfit text-2xl font-bold text-white">Create Account</h2>
            <p className="text-sm text-gray-400">Join GuardHer to activate your cloud-linked shield</p>
          </div>

          {error && (
            <div className="flex items-center space-x-2 rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 mb-6 text-sm text-rose-400">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Name field */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  <User className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#161420] py-3 pl-10 pr-4 text-sm text-white placeholder-gray-500 outline-none focus:border-safety-500/50 transition-colors"
                  placeholder="Jane Doe"
                  required
                />
              </div>
            </div>

            {/* Email field */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#161420] py-3 pl-10 pr-4 text-sm text-white placeholder-gray-500 outline-none focus:border-safety-500/50 transition-colors"
                  placeholder="name@domain.com"
                  required
                />
              </div>
            </div>

            {/* Phone field */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Phone Number</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  <Phone className="h-4 w-4" />
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#161420] py-3 pl-10 pr-4 text-sm text-white placeholder-gray-500 outline-none focus:border-safety-500/50 transition-colors"
                  placeholder="+91 XXXXX XXXXX"
                  required
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#161420] py-3 pl-10 pr-4 text-sm text-white placeholder-gray-500 outline-none focus:border-safety-500/50 transition-colors"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Register button */}
            <button
              type="submit"
              disabled={loading}
              className="glow-btn w-full mt-4 flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-safety-500 to-rose-600 py-3.5 text-sm font-semibold text-white shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-safety-400 hover:text-safety-300 font-semibold">
              Sign In
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
};

export default Register;
