import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Allow any hostname
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '**', // Allow any hostname
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config) => {
    config.externals.push({
      'mongodb-client-encryption': 'mongodb-client-encryption',
      'kerberos': 'kerberos',
      '@mongodb-js/zstd': '@mongodb-js/zstd',
      'snappy': 'snappy',
      'aws4': 'aws4',
    });
    return config;
  }
};

export default nextConfig;
