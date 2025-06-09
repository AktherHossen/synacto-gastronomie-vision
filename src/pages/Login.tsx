
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, LogIn } from 'lucide-react';

const Login = () => {
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
      // TODO: Replace with actual authentication logic
      if (email === 'admin@synacto.com' && password === 'admin123') {
        toast({
          title: "Anmeldung erfolgreich",
          description: "Willkommen bei Synacto POS",
        });
        navigate('/');
      } else {
        toast({
          title: "Anmeldung fehlgeschlagen",
          description: "Ungültige E-Mail oder Passwort",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Ein unerwarteter Fehler ist aufgetreten",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Synacto POS</h1>
          <p className="text-gray-600">Anmelden um fortzufahren</p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold text-center">Anmeldung</CardTitle>
            <p className="text-sm text-gray-600 text-center">
              Geben Sie Ihre Anmeldedaten ein
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-Mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ihre.email@restaurant.de"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Passwort</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Ihr Passwort"
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
                  <span className="text-sm text-gray-600">Angemeldet bleiben</span>
                </label>
                <button
                  type="button"
                  className="text-sm font-medium hover:underline"
                  style={{ color: '#6B2CF5' }}
                >
                  Passwort vergessen?
                </button>
              </div>

              <Button
                type="submit"
                className="w-full text-white font-medium py-2.5"
                style={{ backgroundColor: '#6B2CF5' }}
                disabled={isLoading}
              >
                {isLoading ? 'Anmelden...' : 'Anmelden'}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-center text-sm text-gray-600">
                Noch kein Konto?{' '}
                <button
                  type="button"
                  className="font-medium hover:underline"
                  style={{ color: '#6B2CF5' }}
                  onClick={() => navigate('/signup')}
                >
                  Jetzt registrieren
                </button>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Demo Credentials */}
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-sm font-medium text-yellow-800 mb-2">Demo-Zugangsdaten:</h3>
          <p className="text-xs text-yellow-700">
            E-Mail: admin@synacto.com<br />
            Passwort: admin123
          </p>
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
