import React, { useState } from 'react';
import { KeyRound, Download, LogOut, Trash2, AlertTriangle, Loader2, Mail, ShieldAlert } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/authStore';
import { useSettings } from '@/hooks/useSettings';
import { authService } from '@/services/auth/authService';

export const AccountSettingsSection: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { exportAccountData } = useSettings();

  const [isExporting, setIsExporting] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await exportAccountData();
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail) return;
    try {
      setIsUpdatingEmail(true);
      setEmailSuccess(false);
      await authService.updateEmail(newEmail);
      setEmailSuccess(true);
      setNewEmail('');
    } catch (err) {
      console.error('Change email error:', err);
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    try {
      setIsUpdatingPassword(true);
      setPasswordSuccess(false);
      await authService.updatePassword(newPassword);
      setPasswordSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update password';
      setPasswordError(message);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;
    try {
      setIsDeleting(true);
      await authService.deleteAccount();
      await logout();
    } catch (err) {
      console.error('Delete account error:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Account Details & Security */}
      <Card className="border-border/60 shadow-sm bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <span>Account Security</span>
          </CardTitle>
          <CardDescription>Manage credentials, password, and active session</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Change Email */}
          <form onSubmit={handleChangeEmail} className="space-y-3 p-4 rounded-2xl border border-border/40 bg-card/40">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-400" /> Change Email Address
            </h4>
            <p className="text-xs text-muted-foreground">Current email: {user?.email}</p>
            <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
              <Input
                type="email"
                placeholder="Enter new email address"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="rounded-xl text-sm"
                required
              />
              <Button type="submit" size="sm" disabled={isUpdatingEmail} className="rounded-xl flex-shrink-0">
                {isUpdatingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Email'}
              </Button>
            </div>
            {emailSuccess && (
              <p className="text-xs text-emerald-400 font-medium">
                Confirmation email sent! Please check your inbox.
              </p>
            )}
          </form>

          {/* Change Password */}
          <form onSubmit={handleChangePassword} className="space-y-3 p-4 rounded-2xl border border-border/40 bg-card/40">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-purple-400" /> Change Password
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <Input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="rounded-xl text-sm"
                required
              />
              <Input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="rounded-xl text-sm"
                required
              />
            </div>
            {passwordError && <p className="text-xs text-rose-400 font-medium">{passwordError}</p>}
            {passwordSuccess && <p className="text-xs text-emerald-400 font-medium">Password updated successfully!</p>}
            <Button type="submit" size="sm" disabled={isUpdatingPassword} className="rounded-xl">
              {isUpdatingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Password'}
            </Button>
          </form>

          {/* Data Export & Session Management */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleExport}
              disabled={isExporting}
              className="rounded-xl border-border/60 hover:border-primary/40 text-xs font-semibold"
            >
              {isExporting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Download className="w-4 h-4 mr-2 text-pink-400" />}
              Export Account Data (JSON)
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={() => logout()}
              className="rounded-xl text-xs text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out Everywhere
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-rose-500/30 bg-rose-500/5 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2.5 text-rose-500">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <span>Danger Zone</span>
          </CardTitle>
          <CardDescription>Irreversible account actions</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-semibold text-foreground">Delete Account</h4>
            <p className="text-xs text-muted-foreground">
              Permanently delete your profile, user settings, and remove couple association.
            </p>
          </div>
          <Button
            type="button"
            variant="destructive"
            onClick={() => setShowDeleteModal(true)}
            className="rounded-xl flex-shrink-0"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Account
          </Button>
        </CardContent>
      </Card>

      {/* Account Deletion Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-rose-500/40 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <div className="flex items-center gap-3 text-rose-500">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-bold">Confirm Account Deletion</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              This action is permanent and cannot be undone. All your settings, notification logs, and profile records will be deleted.
            </p>
            <div className="space-y-2 pt-2">
              <label className="text-xs font-semibold text-foreground">
                Type <strong className="text-rose-400">DELETE</strong> to confirm:
              </label>
              <Input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                className="rounded-xl border-rose-500/30"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteModal(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE' || isDeleting}
                className="rounded-xl"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : 'Confirm Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
