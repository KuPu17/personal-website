/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: process.env.APP_AWS_S3_BUCKET_NAME
          ? `${process.env.APP_AWS_S3_BUCKET_NAME}.s3.${process.env.APP_AWS_REGION || 'us-east-1'}.amazonaws.com`
          : '*.s3.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: '*.cloudfront.net',
      },
    ],
  },
  async redirects() {
    return [{ source: '/blog', destination: '/blogs', permanent: true }];
  },
  experimental: {
    serverComponentsExternalPackages: ['pg', 'bcrypt'],
    instrumentationHook: true,
  },
};

module.exports = nextConfig;
