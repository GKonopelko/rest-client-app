import React from 'react';
import { Typography } from 'antd';
import Image from 'next/image';
import styles from './styles.module.css';

const { Text, Link: AntLink } = Typography;

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles['footer-content']}>
        <div className={styles['link-container']}>
          <AntLink
            href="https://github.com/sashapervykh"
            target="_blank"
            rel="noopener noreferrer"
            className={styles['footer-link']}
          >
            Aleksandr
          </AntLink>
          <AntLink
            href="https://github.com/Forlocks"
            target="_blank"
            rel="noopener noreferrer"
            className={styles['footer-link']}
          >
            Aleksey
          </AntLink>
          <AntLink
            href="https://github.com/GKonopelko"
            target="_blank"
            rel="noopener noreferrer"
            className={styles['footer-link']}
          >
            Grigori
          </AntLink>
        </div>

        <Text className={styles.yearText}>© {new Date().getFullYear()}</Text>

        <AntLink
          href="https://rs.school/courses/reactjs"
          target="_blank"
          rel="noopener noreferrer"
          className={styles['footer-link']}
        >
          <Image
            src="/assets/icons/rss-logo.svg"
            alt="RS School Logo"
            width={80}
            height={30}
            className={styles['rss-logo']}
          />
        </AntLink>
      </div>
    </footer>
  );
}
