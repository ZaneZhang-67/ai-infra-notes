import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  knowledgeSidebar: [
    {
      type: 'category',
      label: 'AI Infra 前置基础',
      collapsed: false,
      link: {type: 'doc', id: 'fundamentals/overview'},
      items: [
        'fundamentals/programming-basics',
        'fundamentals/math-basics',
        'fundamentals/transformer',
        'fundamentals/pytorch',
        'fundamentals/gpu-hardware',
        'fundamentals/collective-communication',
      ],
    },
  ],
};

export default sidebars;
