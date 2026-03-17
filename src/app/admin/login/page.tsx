'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/admin');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Invalid credentials. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md shadow-2xl border-none">
        <CardHeader className="space-y-4 text-center pb-10">
          <CardTitle className="text-3xl font-headline tracking-[0.3em] text-primary pt-6">VERDE SALON</CardTitle>
          <div className="h-[1px] w-12 bg-accent mx-auto" />
          <CardDescription className="text-[11px] uppercase tracking-widest opacity-60">Management Sanctuary</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-8">
            <div className="space-y-3">
              <Label htmlFor="email" className="text-[10px] uppercase tracking-widest opacity-70">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="editor@verdesalon.com" 
                className="rounded-none border-0 border-b focus-visible:ring-0 focus-visible:border-accent"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="password" title="Password" className="text-[10px] uppercase tracking-widest opacity-70">Secret Password</Label>
              <Input 
                id="password" 
                type="password" 
                className="rounded-none border-0 border-b focus-visible:ring-0 focus-visible:border-accent"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-accent text-white py-8 rounded-none uppercase tracking-[0.4em] text-[11px] transition-all duration-700" 
              disabled={isLoading}
            >
              {isLoading ? "Validating..." : "Enter Workspace"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
