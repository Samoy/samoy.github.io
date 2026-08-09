// 站点全局配置，对应原 Jekyll _config.yml
export const siteConfig = {
  title: '编程手札',
  subtitle: '千里之行,始于足下 万行代码,始于指下',
  welcome: '欢迎光临编程手札',
  description: '一只默默工作程序猿的编程日记',
  author: 'Samoy',
  url: 'https://www.samoy.site',
  postsPerPage: 10,
  baiduVerification: 'codeva-rs0dgQT8lk',
  nav: [
    { title: '博客', url: '/' },
    { title: '目录', url: '/timeline/' },
    { title: '分类', url: '/categories/' },
    { title: '关于', url: '/about/' },
  ],
  social: {
    weibo: 'https://weibo.com/1759693233',
    github: 'https://github.com/Samoy',
    twitter: 'https://twitter.com/samoy_young',
    rss: '/feed.xml',
    mail: 'mailto:samoy_young@163.com',
  },
  giscus: {
    repo: 'Samoy/samoy.github.io',
    repoId: 'MDEwOlJlcG9zaXRvcnkxMTI3MjA1MDM=',
    category: 'Announcements',
    categoryId: 'DIC_kwDOBrf6d84CegUh',
  },
  icp: {
    miit: { label: '豫ICP备2024096491号-2', url: 'https://beian.miit.gov.cn/' },
    mps: {
      label: '豫公网安备41010202003756号',
      url: 'https://beian.mps.gov.cn/#/query/webSearch',
    },
  },
};

export type SiteConfig = typeof siteConfig;
