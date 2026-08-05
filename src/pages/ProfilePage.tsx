import React from 'react';
import { User, Heart, Shield, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export const ProfilePage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <User className="w-7 h-7 text-pink-400" />
          <span>Profile & Pair Status</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your personal details and partner pairing
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <User className="w-5 h-5 text-primary" /> My Profile
            </CardTitle>
            <CardDescription>Personal account info</CardDescription>
          </CardHeader>
          <CardContent className="p-8 text-center space-y-2">
            <Sparkles className="w-8 h-8 text-muted-foreground mx-auto" />
            <p className="text-sm font-semibold text-foreground">Profile Management</p>
            <p className="text-xs text-muted-foreground">Coming Soon</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-500 fill-pink-500" /> Pair Connection
            </CardTitle>
            <CardDescription>Partner pairing code & status</CardDescription>
          </CardHeader>
          <CardContent className="p-8 text-center space-y-2">
            <Shield className="w-8 h-8 text-muted-foreground mx-auto" />
            <p className="text-sm font-semibold text-foreground">Partner Pairing System</p>
            <p className="text-xs text-muted-foreground">Coming Soon</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
