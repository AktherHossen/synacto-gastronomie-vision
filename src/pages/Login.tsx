import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { setupInitialAdmin } from '@/api/setupAdmin';
import { useTranslation } from 'react-i18next';

const Login = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('Attempting login with:', { email, password }); // Debug log

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login Error:', error); // Debug log
        throw error;
      }

      if (!data.user) {
        throw new Error('No user returned from login');
      }

      // Get staff role
      const { data: staffData, error: staffError } = await supabase
        .from('staff')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (staffError) {
        console.error('Staff Error:', staffError); // Debug log
        throw new Error('Failed to fetch staff role');
      }

      toast({
        title: "Anmeldung erfolgreich",
        description: `Willkommen ${staffData?.role === 'admin' ? '(Administrator)' : ''}`,
      });
      
      // Small delay before navigation to ensure toast is shown
      setTimeout(() => {
        navigate('/');
      }, 500);
    } catch (error: any) {
      console.error('Login Error Details:', error); // Debug log
      
      let errorMessage = 'Ein Fehler ist aufgetreten';
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Ungültige Anmeldedaten. Bitte überprüfen Sie Ihre E-Mail und Ihr Passwort.';
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = 'E-Mail-Adresse wurde noch nicht bestätigt. Bitte prüfen Sie Ihren Posteingang.';
      }

      toast({
        title: "Anmeldung fehlgeschlagen",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetupAdmin = async () => {
    try {
      setIsLoading(true);
      console.log('Starting admin setup...'); // Debug log
      
      const result = await setupInitialAdmin();
      console.log('Admin setup result:', result); // Debug log
      
      if (result && result.success && result.credentials) {
        // Clear any existing values
        setEmail('');
        setPassword('');
        
        // Small delay before setting new values
        setTimeout(() => {
          setEmail(result.credentials.email);
          setPassword(result.credentials.password);
          
          toast({
            title: "Admin-Konto erstellt",
            description: "Anmeldedaten wurden in die Felder eingetragen. Klicken Sie jetzt auf 'Anmelden'.",
          });
        }, 100);
      } else {
        throw new Error('Ungültige Antwort vom Server');
      }
    } catch (error: any) {
      console.error('Admin setup error:', error); // Debug log
      toast({
        title: "Fehler bei der Admin-Einrichtung",
        description: error.message || 'Ein unerwarteter Fehler ist aufgetreten',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMagicLink = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      toast({
        title: "Magic link error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Magic link sent",
        description: "Check your email for the magic link!",
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
               style={{ backgroundColor: '#6B2CF5' }}>
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('login.title')}</h1>
          <p className="text-gray-600">{t('login.subtitle')}</p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold text-center">Anmeldung</CardTitle>
            <p className="text-sm text-gray-600 text-center">
              {t('login.enter_credentials')}
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t('login.email_label')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('login.email_placeholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center">
                  <Label htmlFor="password">{t('login.password_label')}</Label>
                  <Link
                    to="/forgot-password"
                    className="ml-auto inline-block text-sm underline"
                  >
                    {t('login.forgot_password')}
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('login.password_placeholder')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded border-gray-300" />
                  <span className="text-sm text-gray-600">{t('login.stay_logged_in')}</span>
                </label>
              </div>

              <Button
                type="submit"
                className="w-full text-white font-medium py-2.5"
                style={{ backgroundColor: '#6B2CF5' }}
                disabled={isLoading}
              >
                {isLoading ? 'Anmelden...' : t('login.login_button')}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-center text-sm text-gray-600">
                {t('login.no_account')}
                <Link
                  to="/signup"
                  className="font-medium hover:underline"
                  style={{ color: '#6B2CF5' }}
                >
                  {t('login.sign_up')}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Demo Credentials */}
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-sm font-medium text-yellow-800 mb-2">{t('login.demo_credentials')}:</h3>
          <p className="text-xs text-yellow-700">
            E-Mail: admin.reset@synacto.com<br />
            Passwort: admin123
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-2 w-full text-yellow-800 border-yellow-300 hover:bg-yellow-100"
            onClick={handleSetupAdmin}
            disabled={isLoading}
          >
            Admin-Konto einrichten
          </Button>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>© 2024 Synacto POS. Alle Rechte vorbehalten.</p>
          <p className="mt-1">
            <span className="hover:underline cursor-pointer">Datenschutz</span> •{' '}
            <span className="hover:underline cursor-pointer">AGB</span> •{' '}
            <span className="hover:underline cursor-pointer">Impressum</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
