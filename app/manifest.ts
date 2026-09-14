import type { MetadataRoute } from 'next';
export default function manifest(): MetadataRoute.Manifest { return { name: 'CUATESFARMZ', short_name: 'CUATES', description: 'Flower & Wax visual catalog.', start_url: '/', display: 'standalone', background_color: '#ffffff', theme_color: '#ef1818', icons: [{ src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' }] }; }
