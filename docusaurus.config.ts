import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';

const githubRepository = process.env.GITHUB_REPOSITORY;
const [organizationName, projectName] = githubRepository?.split('/') ?? [
  'YOUR_GITHUB_USERNAME',
  'ai-infra-notes',
];
const repositoryUrl = `https://github.com/${organizationName}/${projectName}`;
const isUserPage = projectName === `${organizationName}.github.io`;

const config: Config = {
  title: 'AI Infra 学习笔记',
  tagline: '系统整理 AI Infra 所需的基础知识',
  favicon: 'img/logo.svg',

  future: {
    v4: true,
  },

  url:
    organizationName === 'YOUR_GITHUB_USERNAME'
      ? 'https://example.com'
      : `https://${organizationName}.github.io`,
  baseUrl: isUserPage ? '/' : `/${projectName}/`,
  organizationName,
  projectName,
  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'zh-Hans',
    locales: ['zh-Hans'],
    localeConfigs: {
      'zh-Hans': {
        label: '简体中文',
        htmlLang: 'zh-CN',
      },
    },
  },

  markdown: {
    mermaid: true,
  },

  themes: [
    '@docusaurus/theme-mermaid',
    [
      '@easyops-cn/docusaurus-search-local',
      {
        hashed: true,
        language: ['en', 'zh'],
        highlightSearchTermsOnTargetPage: true,
        explicitSearchResultPath: true,
      },
    ],
  ],

  stylesheets: [
    {
      href: 'https://cdn.jsdelivr.net/npm/katex@0.16.22/dist/katex.min.css',
      type: 'text/css',
      crossorigin: 'anonymous',
    },
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: 'docs',
          sidebarPath: './sidebars.ts',
          editUrl: githubRepository ? `${repositoryUrl}/edit/main/` : undefined,
          remarkPlugins: [remarkMath],
          rehypePlugins: [rehypeKatex],
          showLastUpdateTime: Boolean(githubRepository),
        },
        blog: {
          routeBasePath: 'blog',
          blogTitle: 'AI Infra 学习日志',
          blogDescription: '记录学习过程、实验结果和阶段复盘',
          showReadingTime: true,
          blogSidebarTitle: '全部日志',
          blogSidebarCount: 'ALL',
          postsPerPage: 10,
          editUrl: githubRepository ? `${repositoryUrl}/edit/main/` : undefined,
          remarkPlugins: [remarkMath],
          rehypePlugins: [rehypeKatex],
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          onInlineTags: 'warn',
          onInlineAuthors: 'ignore',
          onUntruncatedBlogPosts: 'ignore',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    metadata: [
      {
        name: 'keywords',
        content: 'AI Infra, Linux, C++, PyTorch, GPU, Transformer',
      },
    ],
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'AI Infra Notes',
      logo: {
        alt: 'AI Infra Notes',
        src: 'img/logo.svg',
      },
      hideOnScroll: true,
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'knowledgeSidebar',
          position: 'left',
          label: '知识库',
        },
        {
          to: '/docs/roadmap',
          label: '学习路线',
          position: 'left',
        },
        {
          to: '/blog',
          label: '学习日志',
          position: 'left',
        },
        ...(githubRepository
          ? [
              {
                href: repositoryUrl,
                label: 'GitHub',
                position: 'right' as const,
              },
            ]
          : []),
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: '学习内容',
          items: [
            {label: '知识库', to: '/docs/'},
            {label: '学习路线', to: '/docs/roadmap'},
            {label: '学习日志', to: '/blog'},
          ],
        },
        {
          title: '当前模块',
          items: [
            {label: '基础知识', to: '/docs/fundamentals/'},
          ],
        },
        ...(githubRepository
          ? [
              {
                title: '项目',
                items: [{label: 'GitHub', href: repositoryUrl}],
              },
            ]
          : []),
      ],
      copyright: `Copyright © ${new Date().getFullYear()} AI Infra Notes. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'python', 'cpp', 'json', 'yaml'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
