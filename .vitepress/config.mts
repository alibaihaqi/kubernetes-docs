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
      { text: 'Intermediate', link: '/intermediate/' },
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
      {
        text: 'Intermediate',
        collapsed: false,
        items: [
          { text: 'Overview', link: '/intermediate/' },
          { text: '01 Why production-shape it', link: '/intermediate/01-why-production-shape' },
          { text: '02 ConfigMap and env', link: '/intermediate/02-configmap' },
          { text: '03 Probes', link: '/intermediate/03-probes' },
          { text: '04 Resource requests and limits', link: '/intermediate/04-resources' },
          { text: '05 Rolling update', link: '/intermediate/05-rolling-update' },
          { text: '06 Scaling', link: '/intermediate/06-scaling' },
          { text: '07 Wrap-up', link: '/intermediate/07-wrap-up' },
        ],
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/alibaihaqi' },
      { icon: 'linkedin', link: 'https://www.linkedin.com/in/alibaihaqi/' },
    ],
  },
})
