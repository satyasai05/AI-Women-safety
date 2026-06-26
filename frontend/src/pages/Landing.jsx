import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Eye, MapPin, MessageSquare, AlertTriangle, PhoneCall, Star, ArrowRight } from 'lucide-react';

const Landing = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const features = [
    {
      title: "Real-Time AI Scan",
      desc: "Upload images or stream live webcam feeds to scan for threat objects (weapons, fire) instantly.",
      icon: Eye,
      color: "from-blue-500/20 to-cyan-500/10 border-blue-500/20 text-blue-400"
    },
    {
      title: "One-Tap SOS Dispatch",
      desc: "Instantly broadcast your exact GPS coordinates and alert details to chosen emergency contacts.",
      icon: PhoneCall,
      color: "from-safety-500/20 to-rose-500/10 border-safety-500/20 text-safety-400"
    },
    {
      title: "Safe Route Mapping",
      desc: "Navigate using safe passages plotted with real-time locations of nearby police and emergency rooms.",
      icon: MapPin,
      color: "from-emerald-500/20 to-teal-500/10 border-emerald-500/20 text-emerald-400"
    },
    {
      title: "AI Chat Assistant",
      desc: "Discuss self-defense strategies, legal definitions, and Zero-FIR filing instructions with safety AI.",
      icon: MessageSquare,
      color: "from-purple-500/20 to-indigo-500/10 border-purple-500/20 text-purple-400"
    },
    {
      title: "Geotagged Reports",
      desc: "File detailed safety reports with categories, location markers, and evidence uploads.",
      icon: AlertTriangle,
      color: "from-amber-500/20 to-orange-500/10 border-amber-500/20 text-amber-400"
    },
    {
      title: "Central Admin Portal",
      desc: "Equip security forces with interactive incident analysis, SOS tracking grids, and status tools.",
      icon: Shield,
      color: "from-pink-500/20 to-rose-500/10 border-pink-500/20 text-pink-400"
    }
  ];

  return (
    <div className="relative overflow-hidden min-h-screen">
      {/* Decorative Blur Backdrops */}
      <div className="absolute top-1/4 left-1/10 h-72 w-72 rounded-full bg-safety-500/10 blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/10 h-80 w-80 rounded-full bg-rose-700/10 blur-[120px]" />

      {/* Hero Section */}
      <div className="mx-auto max-w-7xl px-4 pt-16 pb-20 sm:px-6 lg:px-8 lg:pt-24">
        <motion.div 
          className="text-center space-y-6"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div 
            variants={itemVariants}
            className="inline-flex items-center space-x-2 rounded-full border border-safety-500/30 bg-safety-500/5 px-4 py-1.5 text-xs font-semibold text-safety-400"
          >
            <Shield className="h-3.5 w-3.5" />
            <span>AI-POWERED WOMEN SAFETY PLATFORM</span>
          </motion.div>

          <motion.h1 
            variants={itemVariants}
            className="font-outfit text-4xl font-extrabold tracking-tight text-white sm:text-6xl"
          >
            Your Digital Shield For <br/>
            <span className="bg-gradient-to-r from-safety-400 via-rose-500 to-rose-600 bg-clip-text text-transparent">
              Complete Safety Assurance
            </span>
          </motion.h1>

          <motion.p 
            variants={itemVariants}
            className="mx-auto max-w-2xl text-base text-gray-400 sm:text-lg"
          >
            A multi-layered defense suite built to secure women. Includes real-time camera object scanner, one-tap crisis SOS dispatcher, legal guidelines assistance, and safety routes maps.
          </motion.p>

          <motion.div 
            variants={itemVariants}
            className="flex flex-wrap justify-center gap-4 pt-4"
          >
            <Link
              to="/register"
              className="glow-btn flex items-center space-x-2 rounded-xl bg-gradient-to-r from-safety-500 to-rose-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg transition-all"
            >
              <span>Protect Yourself Now</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/login"
              className="rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-semibold text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              Access Dashboard
            </Link>
          </motion.div>
        </motion.div>

        {/* Platform Key Statistics */}
        <motion.div 
          className="mt-20 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:gap-8"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          {[
            { metric: "99.2%", label: "Scan Accuracy" },
            { metric: "< 2s", label: "SOS Alert Dispatches" },
            { metric: "100%", label: "Encrypted Backups" },
            { metric: "24/7", label: "AI Safety Coverage" }
          ].map((stat, i) => (
            <div key={i} className="glass-panel p-5 text-center rounded-2xl border border-white/5">
              <p className="font-outfit text-2xl font-extrabold text-white sm:text-3xl">{stat.metric}</p>
              <p className="mt-1 text-xs text-gray-400 font-medium uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Core Features Grid */}
        <div className="mt-24">
          <div className="text-center space-y-3 mb-16">
            <h2 className="font-outfit text-2xl font-bold text-white sm:text-4xl">Comprehensive Security Features</h2>
            <p className="text-gray-400 text-sm sm:text-base max-w-xl mx-auto">
              Equipped with multiple modular systems working dynamically to ensure response speeds and assistance.
            </p>
          </div>

          <motion.div 
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
          >
            {features.map((feat, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className={`glass-panel glass-panel-hover p-6 rounded-2xl border flex flex-col space-y-4 bg-gradient-to-b ${feat.color}`}
              >
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <feat.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-outfit text-lg font-bold text-white">{feat.title}</h3>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed flex-1">
                  {feat.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Footer */}
        <div className="mt-28 border-t border-white/5 pt-8 text-center text-xs text-gray-500">
          <p>© {new Date().getFullYear()} GuardHer Security. Built for College Major Project.</p>
        </div>
      </div>
    </div>
  );
};

export default Landing;
