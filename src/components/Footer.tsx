import React from 'react';

export default function Footer() {
  return (
    <footer style={{ textAlign: 'center' }}>
      REST Client App ©{new Date().getFullYear()} Created with Ant Design
    </footer>
  );
}
