const isProd = process.env.NODE_ENV === 'production';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  assetPrefix: isProd ? '/StarRailApi/' : '',
  basePath:  isProd ? '/StarRailApi' : '', // 👈 加這個！
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

