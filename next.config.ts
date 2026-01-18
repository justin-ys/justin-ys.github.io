import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from 'next/constants';


const nextConfigProd: NextConfig = {
  /**
   * Enable static exports.
   *
   * @see https://nextjs.org/docs/app/building-your-application/deploying/static-exports
   */
  output: "export",

  /**
   * Set base path. This is the slug of your GitHub repository.
   *
   * @see https://nextjs.org/docs/app/api-reference/next-config-js/basePath
   */
  basePath: "/justin-ys.github.io",

  /**
   * Disable server-based image optimization. Next.js does not support
   * dynamic features with static exports.
   *
   * @see https://nextjs.org/docs/app/api-reference/components/image#unoptimized
   */
  images: {
    unoptimized: true,
  },

  assetPrefix: '/',

  turbopack: {
    rules: {
      '*.vtxt': {
        loaders: ['raw-loader'],
        as: '*.js',
      },
    },
    resolveExtensions: ['.vtxt', '.tsx', '.ts', '.jsx', '.js', '.mjs', '.json'],
  },

};

const nextConfigDev: NextConfig = {
  turbopack: {
    rules: {
      '*.vtxt': {
        loaders: ['raw-loader'],
        as: '*.js',
      },
    },
    resolveExtensions: ['.vtxt', '.tsx', '.ts', '.jsx', '.js', '.mjs', '.json'],
  },
};

module.exports = (phase: string) => {
  if (phase === PHASE_DEVELOPMENT_SERVER) {
    return nextConfigDev;
  }
  else {
    return nextConfigProd;
  }
}