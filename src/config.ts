export const config = {
  cmsUrl: import.meta.env.CMS_URL,
  cmsApiToken: import.meta.env.CMS_API_TOKEN,
  websiteApiName: import.meta.env.WEBSITE_API_NAME,
  nodeEnv: import.meta.env.NODE_ENV || 'production',
  isDevelopment: (import.meta.env.NODE_ENV || 'production') === 'development',
};