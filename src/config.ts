const hasImportMetaEnv = typeof import.meta !== 'undefined' && typeof (import.meta as any).env !== 'undefined';

const metaEnv = hasImportMetaEnv ? (import.meta as any).env : undefined;

const cmsUrl = metaEnv?.CMS_URL ?? process.env.CMS_URL;
const cmsApiToken = metaEnv?.CMS_API_TOKEN ?? process.env.CMS_API_TOKEN;
const websiteApiName = metaEnv?.WEBSITE_API_NAME ?? process.env.WEBSITE_API_NAME;
const nodeEnv = metaEnv?.NODE_ENV ?? process.env.NODE_ENV;

export const config = {
  cmsUrl,
  cmsApiToken,
  websiteApiName,
  nodeEnv: nodeEnv || 'production',
  isDevelopment: (nodeEnv || 'production') === 'development',
};
