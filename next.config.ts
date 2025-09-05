import type { NextConfig } from "next";
import { defaultConfig } from "next/dist/server/config-shared";
const { PHASE_DEVELOPMENT_SERVER } = require('next/constants');


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

  assetPrefix: '/'

};

module.exports = (phase: any) => {
  if (phase === PHASE_DEVELOPMENT_SERVER) {
    return {}
  }
  else {
    return nextConfigProd;
  }
}