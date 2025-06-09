
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, UserPlus, ArrowLeft } from 'lucide-react';

const Signup = () => {
  const [formData, setFormData] = useState({
    restaurantName: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    vatNumber: '',
    country: 'DE'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Passwort-Fehler",
        description: "Die Passwörter stimmen nicht überein",
        variant: "destructive",
      });
      return;
    }

    if (!acceptedTerms) {
      toast({
        title: "AGB erforderlich",
        description: "Bitte akzeptieren Sie die Nutzungsbedingungen",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Replace with actual signup logic
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Registrierung erfolgreich",
        description: "Ihr Konto wurde erstellt. Sie können sich jetzt anmelden.",
      });
      navigate('/login');
    } catch (error) {
      toast({
        title: "Registrierung fehlgeschlagen",
        description: "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Back Button */}
        <button
          onClick={() => navigate('/login')}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Zurück zur Anmeldung
        </button>

        {/* Logo and Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
               style={{ backgroundColor: '#6B2CF5' }}>
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Synacto POS</h1>
          <p className="text-gray-600">Erstellen Sie Ihr Restaurant-Konto</p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold text-center">Registrierung</CardTitle>
            <p className="text-sm text-gray-600 text-center">
              Füllen Sie alle Felder aus, um Ihr Konto zu erstellen
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="restaurantName">Restaurant Name *</Label>
                <Input
                  id="restaurantName"
                  name="restaurantName"
                  placeholder="Mein Restaurant"
                  value={formData.restaurantName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Vorname *</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    placeholder="Max"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nachname *</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    placeholder="Mustermann"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-Mail *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="max@restaurant.de"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country">Land *</Label>
                  <select
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    required
                  >
                    <option value="DE">Deutschland</option>
                    <option value="AT">Österreich</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vatNumber">USt-IdNr.</Label>
                  <Input
                    id="vatNumber"
                    name="vatNumber"
                    placeholder="DE123456789"
                    value={formData.vatNumber}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Passwort *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Mindestens 8 Zeichen"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="pr-10"
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

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Passwort bestätigen *</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Passwort wiederholen"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1 rounded border-gray-300"
                />
                <label htmlFor="terms" className="text-sm text-gray-600">
                  Ich akzeptiere die{' '}
                  <span className="font-medium hover:underline cursor-pointer" style={{ color: '#6B2CF5' }}>
                    Nutzungsbedingungen
                  </span>{' '}
                  und{' '}
                  <span className="font-medium hover:underline cursor-pointer" style={{ color: '#6B2CF5' }}>
                    Datenschutzerklärung
                  </span>
                </label>
              </div>

              <Button
                type="submit"
                className="w-full text-white font-medium py-2.5"
                style={{ backgroundColor: '#6B2CF5' }}
                disabled={isLoading}
              >
                {isLoading ? 'Konto wird erstellt...' : 'Konto erstellen'}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-center text-sm text-gray-600">
                Bereits ein Konto?{' '}
                <button
                  type="button"
                  className="font-medium hover:underline"
                  style={{ color: '#6B2CF5' }}
                  onClick={() => navigate('/login')}
                >
                  Jetzt anmelden
                </button>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>© 2024 Synacto POS. Alle Rechte vorbehalten.</p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
