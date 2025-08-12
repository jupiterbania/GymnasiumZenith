import type {NextConfig} from 'next';
import path from 'path';

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
  webpack: (config, { isServer }) => {
    config.externals.push({
      'mongodb-client-encryption': 'mongodb-client-encryption',
      'kerberos': 'kerberos',
      '@mongodb-js/zstd': '@mongodb-js/zstd',
      'snappy': 'snappy',
      'aws4': 'aws4',
    });
    
    // Ensure path aliases work correctly
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
    };
    
    // Ensure proper module resolution
    config.resolve.modules = [path.resolve(__dirname, 'src'), 'node_modules'];
    
    return config;
  }
};

export default nextConfig;
