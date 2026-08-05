import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, Mail, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { ROUTES } from '@/constants/routes';

export const LoginPage: React.FC = () => {
  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Welcome Back</CardTitle>
        <CardDescription>
          Sign in to reconnect with your partner
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5" /> Email
          </label>
          <Input type="email" placeholder="you@example.com" disabled />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" /> Password
          </label>
          <Input type="password" placeholder="••••••••" disabled />
        </div>

        <div className="p-3 rounded-xl bg-pink-500/10 border border-pink-500/20 text-center">
          <p className="text-xs font-medium text-pink-400">
            Coming Soon — Authentication logic will be connected with Supabase in Phase 2
          </p>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col space-y-3">
        <Button className="w-full" disabled>
          Sign In <ArrowRight className="w-4 h-4 ml-1.5" />
        </Button>
        <p className="text-xs text-center text-muted-foreground">
          Don't have an account?{' '}
          <Link to={ROUTES.REGISTER} className="text-primary hover:underline font-semibold">
            Register here
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
};
