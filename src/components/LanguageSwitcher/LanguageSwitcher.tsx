'use client';

import React from 'react';
import { Button, Space } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useSwitchLocale } from '@/hooks/useSwitchLocale';

interface LanguageSwitcherProps {
  showText?: boolean;
  className?: string;
}

export default function LanguageSwitcher({
  showText = true,
  className = '',
}: LanguageSwitcherProps) {
  const t = useTranslations('AppLayout');
  const params = useParams();
  const switchLocale = useSwitchLocale();

  const currentLocale =
    typeof params?.locale === 'string' ? params.locale : 'en';

  const handleLocaleSwitch = (targetLocale: string) => {
    window.dispatchEvent(
      new CustomEvent('localechange', {
        detail: { from: currentLocale, to: targetLocale },
      })
    );
    switchLocale(targetLocale);
  };

  return (
    <Space.Compact className={className}>
      <Button
        type={currentLocale === 'en' ? 'primary' : 'default'}
        onClick={() => handleLocaleSwitch('en')}
        icon={!showText ? <GlobalOutlined /> : undefined}
        aria-label={t('localeEn')}
        size="small"
      >
        {showText ? t('localeEn') : 'EN'}
      </Button>
      <Button
        type={currentLocale === 'ru' ? 'primary' : 'default'}
        onClick={() => handleLocaleSwitch('ru')}
        icon={!showText ? <GlobalOutlined /> : undefined}
        aria-label={t('localeRu')}
        size="small"
      >
        {showText ? t('localeRu') : 'RU'}
      </Button>
    </Space.Compact>
  );
}
