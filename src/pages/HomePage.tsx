import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Heart,
  Sparkles,
  Calendar,
  Send,
  Camera,
  Clock,
  ArrowRight,
  ShieldCheck,
  Smartphone,
  Zap,
  UserPlus,
  Users,
  CheckCircle2,
  LogIn,
  HeartHandshake,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ROUTES } from '@/constants/routes';

export const HomePage: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="container max-w-6xl mx-auto px-4 py-12 md:py-20 space-y-24">
      {/* Hero Section */}
      <section className="text-center space-y-8 max-w-4xl mx-auto relative">
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-400 text-xs font-semibold tracking-wide uppercase shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span>
          </span>
          <Sparkles className="w-3.5 h-3.5" />
          <span>All 5 Core Modules Live & Connected</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight bg-gradient-to-r from-pink-400 via-rose-400 to-purple-400 bg-clip-text text-transparent leading-tight">
          Elevate Your Relationship, <br className="hidden sm:inline" /> One Moment at a Time
        </h1>

        <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
          The ultimate progressive web application for couples to share daily updates, schedule date nights, send spontaneous proposals, capture photo memories, and trace their timeline.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Button asChild size="lg" className="h-12 px-8 rounded-xl font-semibold shadow-lg shadow-pink-500/20 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white border-none">
            <Link to={ROUTES.REGISTER}>
              Get Started Free <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>

          <Button asChild variant="outline" size="lg" className="h-12 px-6 rounded-xl border-border hover:bg-secondary/60">
            <Link to={ROUTES.LOGIN}>
              <LogIn className="mr-2 w-4 h-4" /> Partner Login
            </Link>
          </Button>
        </div>

        {/* Feature Pill Tags */}
        <div className="pt-6 flex flex-wrap justify-center items-center gap-3 sm:gap-6 text-xs text-muted-foreground font-medium">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/40 border border-border/50">
            <Zap className="w-3.5 h-3.5 text-pink-400" /> Real-time Sync
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/40 border border-border/50">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" /> Private & End-to-End
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/40 border border-border/50">
            <Smartphone className="w-3.5 h-3.5 text-rose-400" /> Installable PWA
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/40 border border-border/50">
            <HeartHandshake className="w-3.5 h-3.5 text-emerald-400" /> Built for Two
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid (5 Live Modules) */}
      <section className="space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-bold tracking-tight">Everything You Need to Stay Connected</h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto">
            Explore the five fully integrated feature suites designed to bring you and your partner closer every day.
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {/* Card 1: Daily Status */}
          <motion.div variants={itemVariants}>
            <Card className="h-full flex flex-col justify-between hover:border-pink-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/5 bg-gradient-to-b from-card/90 to-card/40 backdrop-blur-sm group">
              <CardHeader className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 group-hover:scale-110 transition-transform">
                    <Heart className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20">
                    Live • Dashboard
                  </span>
                </div>
                <div>
                  <CardTitle className="text-lg">Daily Status & Mood Sync</CardTitle>
                  <CardDescription className="mt-1.5 leading-relaxed">
                    Share your instant mood, location notes, and availability with your partner in real time.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Mini UI Mockup */}
                <div className="p-3.5 rounded-xl bg-secondary/50 border border-border/60 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground font-medium">Partner Mood</span>
                    <span className="text-pink-400 font-semibold flex items-center gap-1">🥰 Feeling Loved</span>
                  </div>
                  <div className="w-full bg-background/80 rounded-lg p-2 text-muted-foreground text-[11px] flex justify-between items-center">
                    <span>"Can't wait for date night!"</span>
                    <span className="text-[10px] text-pink-400">Synced</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Card 2: Date Planning */}
          <motion.div variants={itemVariants}>
            <Card className="h-full flex flex-col justify-between hover:border-purple-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/5 bg-gradient-to-b from-card/90 to-card/40 backdrop-blur-sm group">
              <CardHeader className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    Live • Plans
                  </span>
                </div>
                <div>
                  <CardTitle className="text-lg">Date Planning & Calendar</CardTitle>
                  <CardDescription className="mt-1.5 leading-relaxed">
                    Build bucket list date ideas, schedule dates on a shared calendar, and complete them together.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Mini UI Mockup */}
                <div className="p-3.5 rounded-xl bg-secondary/50 border border-border/60 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">🌌 Stargazing Picnic</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-medium">Scheduled</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-purple-400" /> Friday at 8:00 PM
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Card 3: Spontaneous Proposals */}
          <motion.div variants={itemVariants}>
            <Card className="h-full flex flex-col justify-between hover:border-rose-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-rose-500/5 bg-gradient-to-b from-card/90 to-card/40 backdrop-blur-sm group">
              <CardHeader className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
                    <Send className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    Live • Proposals
                  </span>
                </div>
                <div>
                  <CardTitle className="text-lg">Spontaneous Proposals</CardTitle>
                  <CardDescription className="mt-1.5 leading-relaxed">
                    Send instant pop-up date requests with custom expiration timers and quick 1-click replies.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Mini UI Mockup */}
                <div className="p-3.5 rounded-xl bg-secondary/50 border border-border/60 text-xs space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-medium text-rose-400">Proposal Alert</span>
                    <span className="text-muted-foreground text-[10px]">Expires in 45m</span>
                  </div>
                  <div className="font-semibold text-foreground">"Late-night Ice Cream Run? 🍦"</div>
                  <div className="flex gap-2 pt-1">
                    <div className="px-2.5 py-1 rounded-md bg-rose-500/20 text-rose-300 text-[10px] font-semibold">Yes!</div>
                    <div className="px-2.5 py-1 rounded-md bg-muted text-muted-foreground text-[10px]">Counter</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Card 4: Memories Gallery */}
          <motion.div variants={itemVariants}>
            <Card className="h-full flex flex-col justify-between hover:border-amber-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/5 bg-gradient-to-b from-card/90 to-card/40 backdrop-blur-sm group">
              <CardHeader className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                    <Camera className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    Live • Memories
                  </span>
                </div>
                <div>
                  <CardTitle className="text-lg">Memories Photo Vault</CardTitle>
                  <CardDescription className="mt-1.5 leading-relaxed">
                    Upload photos, tag favorite dates, and preserve your special moments in a shared gallery.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Mini UI Mockup */}
                <div className="p-3.5 rounded-xl bg-secondary/50 border border-border/60 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">📸 Weekend Getaway</span>
                    <span className="text-amber-400 text-[10px] font-medium">12 Photos</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground">"Best sunset walk ever!"</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Card 5: Relationship Timeline */}
          <motion.div variants={itemVariants}>
            <Card className="h-full flex flex-col justify-between hover:border-emerald-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/5 bg-gradient-to-b from-card/90 to-card/40 backdrop-blur-sm group">
              <CardHeader className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                    <Clock className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Live • Timeline
                  </span>
                </div>
                <div>
                  <CardTitle className="text-lg">Relationship Timeline</CardTitle>
                  <CardDescription className="mt-1.5 leading-relaxed">
                    Map key milestones, anniversary counters, and celebrate how far your relationship has come.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Mini UI Mockup */}
                <div className="p-3.5 rounded-xl bg-secondary/50 border border-border/60 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">💍 2 Years Together</span>
                    <span className="text-emerald-400 text-[10px] font-semibold">Milestone</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground">730 Days & Counting</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Card 6: Partner Pairing */}
          <motion.div variants={itemVariants}>
            <Card className="h-full flex flex-col justify-between hover:border-cyan-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/5 bg-gradient-to-b from-card/90 to-card/40 backdrop-blur-sm group">
              <CardHeader className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                    <Users className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    Live • Pairing
                  </span>
                </div>
                <div>
                  <CardTitle className="text-lg">Instant Partner Pairing</CardTitle>
                  <CardDescription className="mt-1.5 leading-relaxed">
                    Connect instantly using a unique 6-digit invite code or direct pairing link.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Mini UI Mockup */}
                <div className="p-3.5 rounded-xl bg-secondary/50 border border-border/60 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Pair Code</span>
                    <span className="font-mono font-bold text-cyan-400 tracking-wider">TZ-8921</span>
                  </div>
                  <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3 h-3" /> Connected & Synced
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </section>

      {/* 3-Step "How It Works" Section */}
      <section className="p-8 sm:p-12 rounded-3xl bg-secondary/30 border border-border/80 space-y-12">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-semibold">
            Simple Setup
          </div>
          <h2 className="text-3xl font-bold tracking-tight">How Tezā Works in 3 Easy Steps</h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-lg mx-auto">
            Get your shared couple space up and running in less than 2 minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-2xl bg-card/60 border border-border/50">
            <div className="w-14 h-14 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 text-xl font-bold">
              <UserPlus className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold">1. Create Account</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Sign up for free in seconds. Set your profile avatar and relationship preference.
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-2xl bg-card/60 border border-border/50">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 text-xl font-bold">
              <Users className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold">2. Share Partner Code</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Send your 6-digit pair code to your partner so they can link directly to your space.
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-2xl bg-card/60 border border-border/50">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 text-xl font-bold">
              <Sparkles className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold">3. Sync & Cherish</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Start sharing daily moods, date plans, spontaneous proposals, and photo memories together.
            </p>
          </div>
        </div>
      </section>

      {/* "Why Couples Love Tezā" Benefits */}
      <section className="space-y-10">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-bold tracking-tight">Built Exclusively for Two</h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-lg mx-auto">
            No noise, no public feeds—just an intimate digital space reserved for your relationship.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-card/40 border border-border/60 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-pink-500/10 text-pink-400 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="font-semibold text-sm">Real-time Updates</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Changes sync instantaneously across both phones using Supabase real-time channels.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-card/40 border border-border/60 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-semibold text-sm">Private & Secure</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Strict database policies guarantee only you and your paired partner can view your data.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-card/40 border border-border/60 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <h4 className="font-semibold text-sm">PWA Mobile Ready</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Add Tezā to your iPhone or Android home screen for an app-like experience.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-card/40 border border-border/60 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h4 className="font-semibold text-sm">Closer Bonds</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Effortlessly turn routine conversations into fun date ideas and shared memories.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-pink-600/20 via-rose-600/20 to-purple-600/20 border border-pink-500/30 p-8 sm:p-14 text-center space-y-6">
        <div className="max-w-2xl mx-auto space-y-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Build Sweeter Memories Together?
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            Create your account today and experience the ultimate private hub for you and your partner.
          </p>
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Button asChild size="lg" className="h-12 px-8 rounded-xl font-semibold bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/25 border-none">
              <Link to={ROUTES.REGISTER}>
                Create Free Account <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 px-6 rounded-xl border-border">
              <Link to={ROUTES.LOGIN}>
                <LogIn className="mr-2 w-4 h-4" /> Partner Login
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

