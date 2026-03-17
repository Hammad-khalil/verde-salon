
'use client';

import { useState, useEffect } from 'react';
import { useDoc, useFirestore, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Search, 
  Globe, 
  Save, 
  CreditCard, 
  Webhook, 
  Zap, 
  Link as LinkIcon 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
    zapierWebhookUrl: '',
    hubspotPortalId: '',
    stripePublicKey: '',
    paypalClientId: '',
    razorpayKeyId: ''
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
        zapierWebhookUrl: settings.integrations?.zapierWebhookUrl || '',
        hubspotPortalId: settings.integrations?.hubspotPortalId || '',
        stripePublicKey: settings.payments?.stripePublicKey || '',
        paypalClientId: settings.payments?.paypalClientId || '',
        razorpayKeyId: settings.payments?.razorpayKeyId || ''
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
        zapierWebhookUrl: form.zapierWebhookUrl,
        hubspotPortalId: form.hubspotPortalId
      },
      payments: {
        stripePublicKey: form.stripePublicKey,
        paypalClientId: form.paypalClientId,
        razorpayKeyId: form.razorpayKeyId
      }
    }, { merge: true });

    toast({
      title: "Settings Published",
      description: "External integrations and payment profiles have been updated.",
    });
  }

  if (isLoading) return <div className="py-20 text-center animate-pulse">Loading Configurations...</div>;

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline font-bold">External Integrations</h1>
          <p className="text-muted-foreground">Connect your marketing stack, search engines, and payment tools.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90" onClick={handleSaveSettings}>
          <Save className="w-4 h-4 mr-2" /> Save All Integrations
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* SEO & Search */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Search className="w-5 h-5 text-primary" />
              <CardTitle>Search Optimization</CardTitle>
            </div>
            <CardDescription>Control how your brand appears on Google</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Global Title Prefix</Label>
              <Input 
                value={form.titlePrefix} 
                onChange={(e) => setForm({...form, titlePrefix: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>robots.txt</Label>
              <Textarea 
                className="font-mono text-xs min-h-[100px]"
                value={form.robotsTxt}
                onChange={(e) => setForm({...form, robotsTxt: e.target.value})}
              />
            </div>
          </CardContent>
        </Card>

        {/* CRM & Webhooks */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Zap className="w-5 h-5 text-orange-500" />
              <CardTitle>CRM & Automation</CardTitle>
            </div>
            <CardDescription>Sync lead data to Zapier, HubSpot, or GoHighLevel</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center">
                <LinkIcon className="w-3 h-3 mr-2" /> Zapier Webhook URL
              </Label>
              <Input 
                placeholder="https://hooks.zapier.com/..." 
                value={form.zapierWebhookUrl}
                onChange={(e) => setForm({...form, zapierWebhookUrl: e.target.value})}
              />
              <p className="text-[10px] text-muted-foreground">Trigger workflows for every new inquiry or booking.</p>
            </div>
            <div className="space-y-2">
              <Label>HubSpot Portal ID (Optional)</Label>
              <Input 
                placeholder="Portal ID" 
                value={form.hubspotPortalId}
                onChange={(e) => setForm({...form, hubspotPortalId: e.target.value})}
              />
            </div>
          </CardContent>
        </Card>

        {/* Marketing Analytics */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Globe className="w-5 h-5 text-blue-600" />
              <CardTitle>Marketing Analytics</CardTitle>
            </div>
            <CardDescription>Track visitor behavior and conversion events</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label>Google Analytics ID</Label>
                <Input 
                  placeholder="G-XXXXXXXXXX" 
                  value={form.googleAnalyticsId}
                  onChange={(e) => setForm({...form, googleAnalyticsId: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Meta (Facebook) Pixel ID</Label>
                <Input 
                  placeholder="Pixel ID" 
                  value={form.facebookPixelId}
                  onChange={(e) => setForm({...form, facebookPixelId: e.target.value})}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Gateways */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <CreditCard className="w-5 h-5 text-emerald-600" />
              <CardTitle>Payment Gateways</CardTitle>
            </div>
            <CardDescription>Configure keys for digital transactions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Stripe Public Key</Label>
              <Input 
                placeholder="pk_test_..." 
                value={form.stripePublicKey}
                onChange={(e) => setForm({...form, stripePublicKey: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>PayPal Client ID</Label>
              <Input 
                placeholder="Client ID" 
                value={form.paypalClientId}
                onChange={(e) => setForm({...form, paypalClientId: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Razorpay Key ID</Label>
              <Input 
                placeholder="rzp_test_..." 
                value={form.razorpayKeyId}
                onChange={(e) => setForm({...form, razorpayKeyId: e.target.value})}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
