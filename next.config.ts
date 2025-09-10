/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
      {
        protocol: "https",
        hostname: "yt3.ggpht.com", // for channel/artist images
      },
       {
        protocol: "https",
        hostname: "lh3.googleusercontent.com", // for channel/artist images
      },
        {
        protocol: "https",
        hostname: "yt3.googleusercontent.com", // for channel/artist images
      },
        {
        protocol: "https",
        hostname: "www.gstatic.com", // for channel/artist images
      },
    ],
  },
};

module.exports = nextConfig;
