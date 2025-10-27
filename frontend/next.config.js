/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure allowed development origins to prevent cross-origin warnings
  allowedDevOrigins: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://172.20.32.1:3000', // Add the IP from the warning
    'http://172.20.32.1:3001', // Add the IP from the warning with different port
  ],
  
  // If you need to allow more origins, add them here
  // You can also use wildcards for subdomains if needed
  experimental: {
    // Other experimental features if needed
  },
   eslint: {
    ignoreDuringBuilds: true,
  },
}
 
 
module.exports = nextConfig;