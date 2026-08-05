import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Sparkles, Calendar, MessageSquare, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ROUTES } from '@/constants/routes';

export const HomePage: React.FC = () => {
  return (
    <div className="container max-w-5xl mx-auto px-4 py-12 md:py-20 space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs font-semibold tracking-wide uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Phase 1 Architecture Ready</span>
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-pink-400 via-rose-400 to-purple-400 bg-clip-text text-transparent">
          Stay Connected & Plan Together
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
          The ultimate progressive web application for couples to share daily updates, plan date nights, propose spontaneous trips, and cherish memories.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link to={ROUTES.DASHBOARD}>
              Explore Dashboard Demo <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
            <Link to={ROUTES.LOGIN}>Partner Login</Link>
          </Button>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:border-pink-500/40 transition-colors">
          <CardHeader>
            <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-400 mb-2">
              <Heart className="w-6 h-6" />
            </div>
            <CardTitle>Daily Status</CardTitle>
            <CardDescription>
              Share mood, current location, and availability in real-time.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-muted text-muted-foreground">
              Coming Soon in Phase 2
            </span>
          </CardContent>
        </Card>

        <Card className="hover:border-purple-500/40 transition-colors">
          <CardHeader>
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-2">
              <Calendar className="w-6 h-6" />
            </div>
            <CardTitle>Date Planning</CardTitle>
            <CardDescription>
              Create bucket lists, schedule dates, and save shared memories.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-muted text-muted-foreground">
              Coming Soon in Phase 3
            </span>
          </CardContent>
        </Card>

        <Card className="hover:border-rose-500/40 transition-colors">
          <CardHeader>
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400 mb-2">
              <MessageSquare className="w-6 h-6" />
            </div>
            <CardTitle>Spontaneous Proposals</CardTitle>
            <CardDescription>
              Send instant pop-up date requests with quick reply buttons.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-muted text-muted-foreground">
              Coming Soon in Phase 4
            </span>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
