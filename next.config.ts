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
    unoptimized: false,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  webpack: (config, { isServer }) => {
    // Add MongoDB externals to prevent webpack warnings
    if (!isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        'mongodb-client-encryption': 'mongodb-client-encryption',
        'kerberos': 'kerberos',
        '@mongodb-js/zstd': '@mongodb-js/zstd',
        'snappy': 'snappy',
        'aws4': 'aws4',
      });
    }
    
    // Ensure path aliases work correctly
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
    };
    
    // Ensure proper module resolution
    config.resolve.modules = [path.resolve(__dirname, 'src'), 'node_modules'];
    
    // Ignore critical dependency warnings for dynamic imports
    config.ignoreWarnings = [
      { module: /node_modules\/mongodb/ },
      { message: /Critical dependency: the request of a dependency is an expression/ },
      { message: /Module not found: Can't resolve/ }
    ];
    
    // Handle dynamic imports and expressions
    config.module = config.module || {};
    config.module.exprContextCritical = false;
    
    // Suppress specific webpack warnings
    config.stats = {
      ...config.stats,
      warningsFilter: [
        /Critical dependency: the request of a dependency is an expression/,
        /Module not found: Can't resolve/,
        /Can't resolve 'mongodb-client-encryption'/,
        /Can't resolve 'kerberos'/,
        /Can't resolve '@mongodb-js\/zstd'/,
        /Can't resolve 'snappy'/,
        /Can't resolve 'aws4'/
      ]
    };
    
    return config;
  }
};

export default nextConfig;
