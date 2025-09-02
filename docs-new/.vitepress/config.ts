import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'Decoders',
  description: 'Elegant and battle-tested validation library for type-safe input data',

  themeConfig: {
    // logo: '/logo-small@2x.png',

    nav: [
      { text: 'Guide', link: '/guide/' },
      { text: 'API', link: '/api/' },
      { text: 'NPM', link: 'https://www.npmjs.com/package/decoders' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Guide',
          items: [
            { text: 'Getting Started', link: '/guide/' },
            { text: 'Building Your Own', link: '/guide/building-your-own' },
            { text: 'Tips & Tricks', link: '/guide/tips' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'API',
          items: [
            { text: 'Overview', link: '/api/' },
            { text: 'Decoder Class', link: '/api/decoder-class' },
            { text: 'All Decoders', link: '/api/decoders' },
          ],
        },
        {
          text: 'Strings',
          collapsed: false,
          items: [
            { text: 'string', link: '/api/string' },
            { text: 'nonEmptyString', link: '/api/nonEmptyString' },
            { text: 'regex', link: '/api/regex' },
            { text: 'email', link: '/api/email' },
            { text: 'url', link: '/api/url' },
            { text: 'uuid', link: '/api/uuid' },
          ],
        },
        {
          text: 'Numbers',
          collapsed: false,
          items: [
            { text: 'number', link: '/api/number' },
            { text: 'integer', link: '/api/integer' },
            { text: 'positiveNumber', link: '/api/positiveNumber' },
            { text: 'bigint', link: '/api/bigint' },
          ],
        },
        {
          text: 'Objects & Arrays',
          collapsed: false,
          items: [
            { text: 'object', link: '/api/object' },
            { text: 'array', link: '/api/array' },
            { text: 'tuple', link: '/api/tuple' },
            { text: 'record', link: '/api/record' },
          ],
        },
        {
          text: 'Unions & Optionals',
          collapsed: false,
          items: [
            { text: 'either', link: '/api/either' },
            { text: 'oneOf', link: '/api/oneOf' },
            { text: 'optional', link: '/api/optional' },
            { text: 'nullable', link: '/api/nullable' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/nvie/decoders' },
      { icon: 'npm', link: 'https://www.npmjs.com/package/decoders' },
    ],

    editLink: {
      pattern: 'https://github.com/nvie/decoders/edit/main/docs-new/:path',
      text: 'Edit this page on GitHub',
    },

    search: {
      provider: 'local',
      options: {
        locales: {
          root: {
            translations: {
              button: {
                buttonText: 'Search decoders',
                buttonAriaLabel: 'Search decoders',
              },
            },
          },
        },
      },
    },

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2018-present Vincent Driessen',
    },
  },

  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#3c82f6' }],
  ],

  cleanUrls: true,
  lastUpdated: true,

  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark',
    },
    lineNumbers: false,
  },
});
