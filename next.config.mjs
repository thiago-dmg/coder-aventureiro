/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Permite imagens de capa hospedadas externamente.
    // Adicione aqui os domínios que você usar.
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
};

export default nextConfig;
