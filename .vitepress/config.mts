import { defineConfig } from 'vitepress'

export default defineConfig({
  base: '/kubernetes-docs/',
  cleanUrls: true,
  lang: 'en-US',
  lastUpdated: true,
  srcDir: 'src',

  title: 'Kubernetes Documentation',
  description: 'Kubernetes Documentation Collection',

  head: [
    ['link', { rel: 'icon', href: 'https://www.alibaihaqi.com/favicon.ico' }],
  ],

  themeConfig: {
    nav: [
      { text: 'Introduction', link: '/introduction/' },
      { text: 'Beginner', link: '/beginner/' },
    ],

    search: { provider: 'local' },

    footer: {
      copyright: 'Copyright © 2023 - Present by Fadli Al Baihaqi',
    },

    sidebar: [
      {
        text: 'Introduction',
        items: [
          { text: 'Introduction', link: '/introduction/' },
          { text: 'Getting Started', link: '/introduction/getting-started' },
        ],
      },
      {
        text: 'Beginner',
        collapsed: false,
        items: [
          { text: 'Overview', link: '/beginner/' },
          { text: '01 What is Kubernetes', link: '/beginner/01-what-is-kubernetes' },
          { text: '02 Local cluster with kind', link: '/beginner/02-local-cluster' },
          { text: '03 A Pod', link: '/beginner/03-pod' },
          { text: '04 A Deployment', link: '/beginner/04-deployment' },
          { text: '05 A Service', link: '/beginner/05-service' },
          { text: '06 Reach the app', link: '/beginner/06-reach-the-app' },
          { text: '07 Teardown', link: '/beginner/07-teardown' },
        ],
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/alibaihaqi' },
      { icon: 'linkedin', link: 'https://www.linkedin.com/in/alibaihaqi/' },
    ],
  },
})
