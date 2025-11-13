import { ChangeEvent, FormEvent, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

export function LoginPage() {
  const { user, login, initializing } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const state = location.state as { from?: { pathname?: string } } | null;
  const from = state?.from?.pathname ?? '/';

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (user) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast.error('Please enter your email and password');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email.trim(), password);
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch {
      // Errors handled inside auth context/toast
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event: ChangeEvent<HTMLInputElement>) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event: ChangeEvent<HTMLInputElement>) => setPassword(event.target.value)}
                placeholder="Your password"
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Login'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 text-sm text-gray-600">
          <p>
            Don't have an account?{' '}
            <Link to="/register" className="text-primary hover:underline">
              Create one
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
