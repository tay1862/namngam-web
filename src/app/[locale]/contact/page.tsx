'use client';

import { useTranslations, useLocale } from 'next-intl';
import { MessageCircle, Facebook, Phone, Mail, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useSettings } from '@/hooks/useSettings';

export const dynamic = 'force-dynamic';

export default function ContactPage() {
  const t = useTranslations('contact');
  const locale = useLocale();
  const { settings, loading } = useSettings();

  return (
    <div className="min-h-screen">
      <section className="section-padding bg-gradient-to-br from-pink-50 via-white to-pink-50">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl font-heading font-bold mb-4 text-center bg-gradient-to-r from-pink-500 to-pink-600 bg-clip-text text-transparent">
              {t('getInTouch')}
            </h1>
            <p className="text-center text-gray-600 mb-12">
              {t('description')}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {settings?.whatsapp && (
                <a
                  href={`https://wa.me/${settings.whatsapp.replace(/[^\d]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card hover:shadow-pink group cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-green-500 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <MessageCircle size={28} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">WhatsApp</h3>
                      <p className="text-gray-600 text-sm mb-2">
                        {t('whatsappContact')}
                      </p>
                      <p className="text-pink-500 font-medium">{settings.whatsapp}</p>
                    </div>
                  </div>
                </a>
              )}

              {settings?.facebookPage && (
                <a
                  href={settings.facebookPage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card hover:shadow-pink group cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-blue-500 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <Facebook size={28} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">Facebook</h3>
                      <p className="text-gray-600 text-sm mb-2">
                        {t('facebookContact')}
                      </p>
                      <p className="text-pink-500 font-medium">Visit our Facebook</p>
                    </div>
                  </div>
                </a>
              )}

              {settings?.lineId && (
                <a
                  href={`https://line.me/ti/p/~${settings.lineId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card hover:shadow-pink group cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-green-400 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <span className="text-3xl">💚</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">LINE</h3>
                      <p className="text-gray-600 text-sm mb-2">
                        {t('lineContact')}
                      </p>
                      <p className="text-pink-500 font-medium">@{settings.lineId}</p>
                    </div>
                  </div>
                </a>
              )}

              {settings?.phone && (
                <a
                  href={`tel:${settings.phone.replace(/[^\d+]/g, '')}`}
                  className="card hover:shadow-pink group cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-pink-500 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <Phone size={28} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{t('phone')}</h3>
                      <p className="text-gray-600 text-sm mb-2">
                        {t('phoneContact')}
                      </p>
                      <p className="text-pink-500 font-medium">{settings.phone}</p>
                    </div>
                  </div>
                </a>
              )}
            </div>

            {settings?.[`address_${locale}` as keyof typeof settings] && (
              <div className="card">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-pink-100 flex items-center justify-center flex-shrink-0">
                    <MapPin size={28} className="text-pink-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{t('ourAddress')}</h3>
                    <p className="text-gray-600 whitespace-pre-line">
                      {settings[`address_${locale}` as keyof typeof settings]}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
