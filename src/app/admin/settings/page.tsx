'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Save, 
  Upload, 
  Globe, 
  Phone, 
  Mail, 
  MessageSquare, 
  Facebook, 
  Settings as SettingsIcon,
  Eye,
  Palette,
  Shield,
  Database,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingPage } from '@/components/shared/Loading';
import ImagePicker from '@/components/admin/forms/ImagePicker';
import RichTextEditor from '@/components/admin/forms/RichTextEditor';

interface SiteSettings {
  siteName_lo: string;
  siteName_th: string;
  siteName_zh: string;
  siteName_en: string;
  logo?: string;
  favicon?: string;
  homeBg?: string;
  aboutBg?: string;
  productsBg?: string;
  articlesBg?: string;
  heroWelcome_lo: string;
  heroWelcome_th: string;
  heroWelcome_zh: string;
  heroWelcome_en: string;
  heroTitle_lo: string;
  heroTitle_th: string;
  heroTitle_zh: string;
  heroTitle_en: string;
  heroSubtitle_lo: string;
  heroSubtitle_th: string;
  heroSubtitle_zh: string;
  heroSubtitle_en: string;
  heroBadgeImage?: string;
  heroBadgeText_lo: string;
  heroBadgeText_th: string;
  heroBadgeText_zh: string;
  heroBadgeText_en: string;
  heroDesignImage?: string;
  email?: string;
  phone?: string;
  address_lo?: string;
  address_th?: string;
  address_zh?: string;
  address_en?: string;
  whatsapp?: string;
  whatsappMessage_lo?: string;
  whatsappMessage_th?: string;
  whatsappMessage_zh?: string;
  whatsappMessage_en?: string;
  facebookPage?: string;
  lineId?: string;
  defaultMetaDesc_lo?: string;
  defaultMetaDesc_th?: string;
  defaultMetaDesc_zh?: string;
  defaultMetaDesc_en?: string;
  googleAnalyticsId?: string;
  facebookPixelId?: string;
  isUnderMaintenance: boolean;
  maintenanceMessage_lo?: string;
  maintenanceMessage_th?: string;
  maintenanceMessage_zh?: string;
  maintenanceMessage_en?: string;
}

export default function AdminSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'appearance' | 'contact' | 'seo' | 'maintenance'>('general');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchSettings();
    }
  }, [session]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/settings');
      const data = await response.json();
      
      if (data.success) {
        setSettings(data.data);
      } else {
        setError(data.error || 'Failed to fetch settings');
      }
    } catch (err) {
      console.error('Settings fetch error:', err);
      setError('Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (updatedSettings: Partial<SiteSettings>) => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedSettings),
      });

      const data = await response.json();

      if (data.success) {
        setSettings(prev => prev ? { ...prev, ...updatedSettings } : updatedSettings as SiteSettings);
        setSuccess('Settings saved successfully!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.error || 'Failed to save settings');
      }
    } catch (err) {
      console.error('Settings save error:', err);
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'contact', label: 'Contact', icon: Phone },
    { id: 'seo', label: 'SEO', icon: Globe },
    { id: 'maintenance', label: 'Maintenance', icon: Shield },
  ];

  if (status === 'loading' || loading) {
    return <LoadingPage />;
  }

  if (!session) {
    return null;
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Loading Settings</h2>
          <p className="text-gray-600">Please wait while we load your settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-heading font-bold">Site Settings</h1>
        <Button
          onClick={() => saveSettings(settings)}
          disabled={saving}
          className="flex items-center gap-2"
        >
          <Save size={20} />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          <div className="flex items-center gap-2">
            <AlertTriangle size={20} />
            <span>{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
          <div className="flex items-center gap-2">
            <CheckCircle size={20} />
            <span>{success}</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <Card>
        <CardContent className="p-0">
          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'text-pink-600 border-pink-500'
                      : 'text-gray-600 border-transparent hover:text-gray-800'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Tab Content */}
      <Card>
        <CardContent className="pt-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold mb-4">General Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Site Name (Lao)</label>
                  <Input
                    value={settings.siteName_lo}
                    onChange={(e) => setSettings(prev => prev ? { ...prev, siteName_lo: e.target.value } : null)}
                    placeholder="NAMNGAM"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Site Name (Thai)</label>
                  <Input
                    value={settings.siteName_th}
                    onChange={(e) => setSettings(prev => prev ? { ...prev, siteName_th: e.target.value } : null)}
                    placeholder="NAMNGAM"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Site Name (Chinese)</label>
                  <Input
                    value={settings.siteName_zh}
                    onChange={(e) => setSettings(prev => prev ? { ...prev, siteName_zh: e.target.value } : null)}
                    placeholder="NAMNGAM"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Site Name (English)</label>
                  <Input
                    value={settings.siteName_en}
                    onChange={(e) => setSettings(prev => prev ? { ...prev, siteName_en: e.target.value } : null)}
                    placeholder="NAMNGAM"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold mb-4">Appearance</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <ImagePicker
                    value={settings.logo}
                    onChange={(url: string) => setSettings(prev => prev ? { ...prev, logo: url } : null)}
                    folder="logos"
                    label="Logo"
                  />
                </div>
                
                <div>
                  <ImagePicker
                    value={settings.favicon}
                    onChange={(url: string) => setSettings(prev => prev ? { ...prev, favicon: url } : null)}
                    folder="favicons"
                    label="Favicon"
                  />
                </div>
                
                <div>
                  <ImagePicker
                    value={settings.homeBg}
                    onChange={(url: string) => setSettings(prev => prev ? { ...prev, homeBg: url } : null)}
                    folder="backgrounds"
                    label="Home Background"
                  />
                </div>
                
                <div>
                  <ImagePicker
                    value={settings.aboutBg}
                    onChange={(url: string) => setSettings(prev => prev ? { ...prev, aboutBg: url } : null)}
                    folder="backgrounds"
                    label="About Background"
                  />
                </div>
                
                <div>
                  <ImagePicker
                    value={settings.heroDesignImage}
                    onChange={(url: string) => setSettings(prev => prev ? { ...prev, heroDesignImage: url } : null)}
                    folder="general"
                    label="Hero Design Image (Large Box)"
                  />
                </div>
                
                <div>
                  <ImagePicker
                    value={settings.heroBadgeImage}
                    onChange={(url: string) => setSettings(prev => prev ? { ...prev, heroBadgeImage: url } : null)}
                    folder="general"
                    label="Hero Badge Image"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hero Badge Text (Lao)</label>
                  <Input
                    value={settings.heroBadgeText_lo}
                    onChange={(e) => setSettings(prev => prev ? { ...prev, heroBadgeText_lo: e.target.value } : null)}
                    placeholder="Available Now"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hero Badge Text (Thai)</label>
                  <Input
                    value={settings.heroBadgeText_th}
                    onChange={(e) => setSettings(prev => prev ? { ...prev, heroBadgeText_th: e.target.value } : null)}
                    placeholder="Available Now"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hero Badge Text (Chinese)</label>
                  <Input
                    value={settings.heroBadgeText_zh}
                    onChange={(e) => setSettings(prev => prev ? { ...prev, heroBadgeText_zh: e.target.value } : null)}
                    placeholder="Available Now"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hero Badge Text (English)</label>
                  <Input
                    value={settings.heroBadgeText_en}
                    onChange={(e) => setSettings(prev => prev ? { ...prev, heroBadgeText_en: e.target.value } : null)}
                    placeholder="Available Now"
                  />
                </div>
                
                <div className="md:col-span-2 mt-6">
                  <h4 className="text-md font-semibold text-gray-800 mb-4">Hero Section Content</h4>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hero Welcome Text (Lao)</label>
                  <Input
                    value={settings.heroWelcome_lo}
                    onChange={(e) => setSettings(prev => prev ? { ...prev, heroWelcome_lo: e.target.value } : null)}
                    placeholder="ຍິນດີຕ້ອນຮັບ"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hero Welcome Text (Thai)</label>
                  <Input
                    value={settings.heroWelcome_th}
                    onChange={(e) => setSettings(prev => prev ? { ...prev, heroWelcome_th: e.target.value } : null)}
                    placeholder="ยินดีต้อนรับ"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hero Welcome Text (Chinese)</label>
                  <Input
                    value={settings.heroWelcome_zh}
                    onChange={(e) => setSettings(prev => prev ? { ...prev, heroWelcome_zh: e.target.value } : null)}
                    placeholder="欢迎"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hero Welcome Text (English)</label>
                  <Input
                    value={settings.heroWelcome_en}
                    onChange={(e) => setSettings(prev => prev ? { ...prev, heroWelcome_en: e.target.value } : null)}
                    placeholder="Welcome to"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hero Title (Lao)</label>
                  <Input
                    value={settings.heroTitle_lo}
                    onChange={(e) => setSettings(prev => prev ? { ...prev, heroTitle_lo: e.target.value } : null)}
                    placeholder="NAMNGAM ORIGINAL"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hero Title (Thai)</label>
                  <Input
                    value={settings.heroTitle_th}
                    onChange={(e) => setSettings(prev => prev ? { ...prev, heroTitle_th: e.target.value } : null)}
                    placeholder="NAMNGAM ORIGINAL"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hero Title (Chinese)</label>
                  <Input
                    value={settings.heroTitle_zh}
                    onChange={(e) => setSettings(prev => prev ? { ...prev, heroTitle_zh: e.target.value } : null)}
                    placeholder="NAMNGAM ORIGINAL"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hero Title (English)</label>
                  <Input
                    value={settings.heroTitle_en}
                    onChange={(e) => setSettings(prev => prev ? { ...prev, heroTitle_en: e.target.value } : null)}
                    placeholder="NAMNGAM ORIGINAL"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hero Subtitle (Lao)</label>
                  <textarea
                    value={settings.heroSubtitle_lo}
                    onChange={(e) => setSettings(prev => prev ? { ...prev, heroSubtitle_lo: e.target.value } : null)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="ຜະລິດຕະພັນຄຸນນະພາບສູງ ສຳລັບຄວາມງາມຂອງທ່ານ"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hero Subtitle (Thai)</label>
                  <textarea
                    value={settings.heroSubtitle_th}
                    onChange={(e) => setSettings(prev => prev ? { ...prev, heroSubtitle_th: e.target.value } : null)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="ผลิตภัณฑ์คุณภาพสูงสำหรับความงามของคุณ"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hero Subtitle (Chinese)</label>
                  <textarea
                    value={settings.heroSubtitle_zh}
                    onChange={(e) => setSettings(prev => prev ? { ...prev, heroSubtitle_zh: e.target.value } : null)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="为您的美丽提供高品质产品"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hero Subtitle (English)</label>
                  <textarea
                    value={settings.heroSubtitle_en}
                    onChange={(e) => setSettings(prev => prev ? { ...prev, heroSubtitle_en: e.target.value } : null)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Quality products for your beauty"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <Input
                    type="email"
                    value={settings.email || ''}
                    onChange={(e) => setSettings(prev => prev ? { ...prev, email: e.target.value } : null)}
                    placeholder="contact@namngam.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <Input
                    type="tel"
                    value={settings.phone || ''}
                    onChange={(e) => setSettings(prev => prev ? { ...prev, phone: e.target.value } : null)}
                    placeholder="+856 123 4567"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address (Lao)</label>
                  <textarea
                    value={settings.address_lo || ''}
                    onChange={(e) => setSettings(prev => prev ? { ...prev, address_lo: e.target.value } : null)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Vientiane, Laos"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp</label>
                  <Input
                    value={settings.whatsapp || ''}
                    onChange={(e) => setSettings(prev => prev ? { ...prev, whatsapp: e.target.value } : null)}
                    placeholder="+856 123 4567"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Facebook Page</label>
                  <Input
                    value={settings.facebookPage || ''}
                    onChange={(e) => setSettings(prev => prev ? { ...prev, facebookPage: e.target.value } : null)}
                    placeholder="https://facebook.com/namngam"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">LINE ID</label>
                  <Input
                    value={settings.lineId || ''}
                    onChange={(e) => setSettings(prev => prev ? { ...prev, lineId: e.target.value } : null)}
                    placeholder="@namngam"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'seo' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold mb-4">SEO Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Default Meta Description (Lao)</label>
                  <textarea
                    value={settings.defaultMetaDesc_lo || ''}
                    onChange={(e) => setSettings(prev => prev ? { ...prev, defaultMetaDesc_lo: e.target.value } : null)}
                    rows={3}
                    maxLength={160}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Default description for search engines"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Google Analytics ID</label>
                  <Input
                    value={settings.googleAnalyticsId || ''}
                    onChange={(e) => setSettings(prev => prev ? { ...prev, googleAnalyticsId: e.target.value } : null)}
                    placeholder="G-XXXXXXXXXX"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Facebook Pixel ID</label>
                  <Input
                    value={settings.facebookPixelId || ''}
                    onChange={(e) => setSettings(prev => prev ? { ...prev, facebookPixelId: e.target.value } : null)}
                    placeholder="XXXXXXXXXXXXXXXX"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'maintenance' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold mb-4">Maintenance Mode</h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="maintenance-mode"
                    checked={settings.isUnderMaintenance}
                    onChange={(e) => setSettings(prev => prev ? { ...prev, isUnderMaintenance: e.target.checked } : null)}
                    className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                  />
                  <label htmlFor="maintenance-mode" className="text-sm font-medium text-gray-700">
                    Enable Maintenance Mode
                  </label>
                </div>
                
                {settings.isUnderMaintenance && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Maintenance Message (Lao)</label>
                    <textarea
                      value={settings.maintenanceMessage_lo || ''}
                      onChange={(e) => setSettings(prev => prev ? { ...prev, maintenanceMessage_lo: e.target.value } : null)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      placeholder="We're currently undergoing maintenance. Please check back soon."
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
