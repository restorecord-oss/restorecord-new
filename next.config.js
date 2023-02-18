/** @type {import('next').NextConfig} */
module.exports = {
    reactStrictMode: false,
    poweredByHeader: false,
    images: {
        domains: [ 'cdn.restorecord.com', 'restorerecord.com',  'cdn.discordapp.com', 'cdn.discord.com', 'i.imgur.com', 'docs.restorecord.com' ],
    },
    distDir: process.env.BUILD_DIR,
};