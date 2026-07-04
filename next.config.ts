import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // Allow access to remote image placeholder.
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**', // This allows any path under the hostname
      },
    ],
  },
  output: process.env.VERCEL === '1' || process.env.NEXT_DISABLE_STANDALONE === 'true' ? undefined : 'standalone',
  outputFileTracingRoot: process.cwd(),
  transpilePackages: ['motion'],
  experimental: {
    // Keep CI/Vercel builds deterministic on hosts exposing many virtual CPUs.
    cpus: 2,
    staticGenerationMaxConcurrency: 2,
    staticGenerationMinPagesPerWorker: 1,
  },
  webpack: (config, {dev}) => {
    // Optional: disable file watching in constrained development environments.
    if (dev && process.env.DISABLE_HMR === 'true') {
      config.watchOptions = {
        ignored: /.*/,
      };
    }
    return config;
  },
};

export default nextConfig;
