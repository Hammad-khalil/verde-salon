'use client';

import { useState, useEffect } from 'react';
import { useDoc, useFirestore, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Search, 
  Globe, 
  Save, 
  CreditCard, 
  Webhook, 
  Zap, 
  Link as LinkIcon, 
  ZapOff,
  ShieldCheck,
  Settings as SettingsIcon,
  Monitor
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function SeoAnalyticsEditor() {
  const { toast } = useToast();
  const db = useFirestore();

  const settingsRef = useMemoFirebase(() => doc(db, 'settings', 'global'), [db]);
  const { data: settings, isLoading } = useDoc(settingsRef);

  const [form, setForm] = useState({
    titlePrefix: 'Verde Salon | ',
    autoSitemap: true,
    robotsTxt: 'User-agent: *\nAllow: /\nDisallow: /admin/',
    googleAnalyticsId: '',
    googleTagManagerId: '',
    facebookPixelId: '',
    googleSearchConsole: '',
    zapierWebhookUrl: '',
    hubspotPortalId: '',
    stripePublicKey: '',
    paypalClientId: '',
    razorpayKeyId: '',
    minifyCss: true,
    minifyJs: true,
    imageOptimization: true,
    lazyLoading: true,
    cacheDuration: 60
  });

  useEffect(() => {
    if (settings) {
      setForm({
        titlePrefix: settings.seo?.titlePrefix || 'Verde Salon | ',
        autoSitemap: settings.seo?.autoSitemap ?? true,
        robotsTxt: settings.seo?.robotsTxt || 'User-agent: *\nAllow: /\nDisallow: /admin/',
        googleAnalyticsId: settings.integrations?.googleAnalyticsId || '',
        googleTagManagerId: settings.integrations?.googleTagManagerId || '',
        facebookPixelId: settings.integrations?.facebookPixelId || '',
        googleSearchConsole: settings.integrations?.googleSearchConsole || '',
        zapierWebhookUrl: settings.integrations?.zapierWebhookUrl || '',
        hubspotPortalId: settings.integrations?.hubspotPortalId || '',
        stripePublicKey: settings.payments?.stripePublicKey || '',
        paypalClientId: settings.payments?.paypalClientId || '',
        razorpayKeyId: settings.payments?.razorpayKeyId || '',
        minifyCss: settings.performance?.minifyCss ?? true,
        minifyJs: settings.performance?.minifyJs ?? true,
        imageOptimization: settings.performance?.imageOptimization ?? true,
        lazyLoading: settings.performance?.lazyLoading ?? true,
        cacheDuration: settings.performance?.cacheDuration ?? 60
      });
    }
  }, [settings]);

  function handleSaveSettings() {
    setDocumentNonBlocking(settingsRef, {
      ...settings,
      seo: {
        titlePrefix: form.titlePrefix,
        autoSitemap: form.autoSitemap,
        robotsTxt: form.robotsTxt
      },
      integrations: {
        googleAnalyticsId: form.googleAnalyticsId,
        googleTagManagerId: form.googleTagManagerId,
        facebookPixelId: form.facebookPixelId,
        googleSearchConsole: form.googleSearchConsole,
        zapierWebhookUrl: form.zapierWebhookUrl,
        hubspotPortalId: form.hubspotPortalId
      },
      payments: {
        stripePublicKey: form.stripePublicKey,
        paypalClientId: form.paypalClientId,
        razorpayKeyId: form.razorpayKeyId
      },
      performance: {
        minifyCss: form.minifyCss,
        minifyJs: form.minifyJs,
        imageOptimization: form.imageOptimization,
        lazyLoading: form.lazyLoading,
        cacheDuration: form.cacheDuration
      }
    }, { merge: true });

    toast({
      title: "Settings Published",
      description: "External integrations, SEO, and performance profiles have been updated.",
    });
  }

  if (isLoading) return <div className="py-20 text-center animate-pulse">Loading Configurations...</div>;

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline font-bold">System Configuration</h1>
          <p className="text-muted-foreground">Manage SEO, marketing stack, performance, and payments.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90" onClick={handleSaveSettings}>
          <Save className="w-4 h-4 mr-2" /> Save All Settings
        </Button>
      </div>

      <Tabs defaultValue="seo" className="space-y-8">
        <TabsList className="bg-white border p-1 rounded-sm">
          <TabsTrigger value="seo" className="px-8 rounded-none">SEO & Search</TabsTrigger>
          <TabsTrigger value="integrations" className="px-8 rounded-none">Marketing & CRM</TabsTrigger>
          <TabsTrigger value="performance" className="px-8 rounded-none">Performance</TabsTrigger>
          <TabsTrigger value="payments" className="px-8 rounded-none">Payments (Future)</TabsTrigger>
        </TabsList>

        <TabsContent value="seo" className="grid grid-cols-1 lg:grid-cols-2 gap-8 outline-none">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <div className="flex items-center space-x-3 text-primary">
                <Search className="w-5 h-5" />
                <CardTitle>Global SEO</CardTitle>
              </div>
              <CardDescription>Control how your brand appears on Google</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Global Title Prefix</Label>
                <Input value={form.titlePrefix ?? ''} onChange={(e) => setForm({...form, titlePrefix: e.target.value})} />
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <div className="space-y-0.5">
                  <Label>Auto Sitemap Generation</Label>
                  <p className="text-[10px] text-muted-foreground">Automatically update sitemap.xml on changes.</p>
                </div>
                <Switch checked={form.autoSitemap} onCheckedChange={(val) => setForm({...form, autoSitemap: val})} />
              </div>
              <div className="space-y-2 pt-2">
                <Label>Google Search Console Verification</Label>
                <Input placeholder="Verification HTML tag content" value={form.googleSearchConsole ?? ''} onChange={(e) => setForm({...form, googleSearchConsole: e.target.value})} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <div className="flex items-center space-x-3 text-primary">
                <ShieldCheck className="w-5 h-5" />
                <CardTitle>Technical SEO</CardTitle>
              </div>
              <CardDescription>Crawling and Indexing directives</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>robots.txt Editor</Label>
                <Textarea 
                  className="font-mono text-xs min-h-[200px]"
                  value={form.robotsTxt ?? ''}
                  onChange={(e) => setForm({...form, robotsTxt: e.target.value})}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="grid grid-cols-1 lg:grid-cols-2 gap-8 outline-none">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <div className="flex items-center space-x-3 text-blue-600">
                <Globe className="w-5 h-5" />
                <CardTitle>Marketing Analytics</CardTitle>
              </div>
              <CardDescription>Track visitor behavior and conversion events</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Google Analytics 4 ID</Label>
                <Input placeholder="G-XXXXXXXXXX" value={form.googleAnalyticsId ?? ''} onChange={(e) => setForm({...form, googleAnalyticsId: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Google Tag Manager ID</Label>
                <Input placeholder="GTM-XXXXXXX" value={form.googleTagManagerId ?? ''} onChange={(e) => setForm({...form, googleTagManagerId: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Meta (Facebook) Pixel ID</Label>
                <Input placeholder="Pixel ID" value={form.facebookPixelId ?? ''} onChange={(e) => setForm({...form, facebookPixelId: e.target.value})} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <div className="flex items-center space-x-3 text-orange-500">
                <Zap className="w-5 h-5" />
                <CardTitle>CRM & Webhooks</CardTitle>
              </div>
              <CardDescription>Sync lead data to external workflows</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center"><LinkIcon className="w-3 h-3 mr-2" /> Zapier Webhook</Label>
                <Input placeholder="https://hooks.zapier.com/..." value={form.zapierWebhookUrl ?? ''} onChange={(e) => setForm({...form, zapierWebhookUrl: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>HubSpot Portal ID</Label>
                <Input placeholder="Portal ID" value={form.hubspotPortalId ?? ''} onChange={(e) => setForm({...form, hubspotPortalId: e.target.value})} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="grid grid-cols-1 lg:grid-cols-2 gap-8 outline-none">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <div className="flex items-center space-x-3 text-emerald-600">
                <ZapOff className="w-5 h-5" />
                <CardTitle>Optimization Engine</CardTitle>
              </div>
              <CardDescription>Improve PageSpeed and Core Web Vitals</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between border-b pb-4">
                <div className="space-y-0.5">
                  <Label>Image Optimization</Label>
                  <p className="text-[10px] text-muted-foreground">Auto-compression and WebP generation.</p>
                </div>
                <Switch checked={form.imageOptimization} onCheckedChange={(val) => setForm({...form, imageOptimization: val})} />
              </div>
              <div className="flex items-center justify-between border-b pb-4">
                <div className="space-y-0.5">
                  <Label>Code Minification</Label>
                  <p className="text-[10px] text-muted-foreground">Minify CSS/JS for faster delivery.</p>
                </div>
                <Switch checked={form.minifyCss} onCheckedChange={(val) => setForm({...form, minifyCss: val})} />
              </div>
              <div className="flex items-center justify-between border-b pb-4">
                <div className="space-y-0.5">
                  <Label>Lazy Loading</Label>
                  <p className="text-[10px] text-muted-foreground">Defer non-critical assets.</p>
                </div>
                <Switch checked={form.lazyLoading} onCheckedChange={(val) => setForm({...form, lazyLoading: val})} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <div className="flex items-center space-x-3 text-primary">
                <SettingsIcon className="w-5 h-5" />
                <CardTitle>Edge Caching</CardTitle>
              </div>
              <CardDescription>Content delivery network settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Cache Duration (Minutes)</Label>
                <Input type="number" value={form.cacheDuration} onChange={(e) => setForm({...form, cacheDuration: parseInt(e.target.value) || 0})} />
                <p className="text-[10px] text-muted-foreground">How long browsers should store your content before re-validation.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="grid grid-cols-1 gap-8 outline-none">
          <Card className="border-none shadow-sm bg-muted/10">
            <CardHeader>
              <div className="flex items-center space-x-3 text-emerald-600">
                <CreditCard className="w-5 h-5" />
                <CardTitle>Payment Gateways (Future-Ready)</CardTitle>
              </div>
              <CardDescription>Keys will be securely used once Booking Logic is activated.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-2">
                <Label>Stripe Public Key</Label>
                <Input placeholder="pk_test_..." value={form.stripePublicKey ?? ''} onChange={(e) => setForm({...form, stripePublicKey: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>PayPal Client ID</Label>
                <Input placeholder="Client ID" value={form.paypalClientId ?? ''} onChange={(e) => setForm({...form, paypalClientId: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Razorpay Key ID</Label>
                <Input placeholder="rzp_test_..." value={form.razorpayKeyId ?? ''} onChange={(e) => setForm({...form, razorpayKeyId: e.target.value})} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
