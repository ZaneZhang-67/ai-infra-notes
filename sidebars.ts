import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  knowledgeSidebar: [
    {
      type: 'category',
      label: 'AI Infra 前置基础',
      collapsed: false,
      link: {type: 'doc', id: 'fundamentals/overview'},
      items: [
        {
          type: 'category',
          label: '第1章：编程语言基础',
          collapsed: true,
          link: {type: 'doc', id: 'fundamentals/programming-basics'},
          items: [
            'fundamentals/programming/python-engineering',
            'fundamentals/programming/cpp-core',
            'fundamentals/programming/linux-toolchain',
          ],
        },
        {
          type: 'category',
          label: '第2章：数学基础',
          collapsed: true,
          link: {type: 'doc', id: 'fundamentals/math-basics'},
          items: [
            'fundamentals/math/linear-algebra',
            'fundamentals/math/probability-statistics',
            'fundamentals/math/calculus-numerical',
            {
              type: 'doc',
              id: 'fundamentals/math-basics',
              label: '2.5 范数、误差与数值容差',
            },
          ],
        },
        {
          type: 'category',
          label: '第3章：AI Infra 工程师学 Transformer',
          collapsed: true,
          link: {type: 'doc', id: 'fundamentals/transformer'},
          items: [
            'fundamentals/transformer/architecture',
            'fundamentals/transformer/self-attention',
            'fundamentals/transformer/ffn-norm-residual',
            'fundamentals/transformer/autoregressive-kv-cache',
          ],
        },
        {
          type: 'category',
          label: '第4章：PyTorch 框架',
          collapsed: true,
          link: {type: 'doc', id: 'fundamentals/pytorch'},
          items: [
            'fundamentals/pytorch/tensor-storage',
            'fundamentals/pytorch/autograd',
            'fundamentals/pytorch/training-profiling',
          ],
        },
        {
          type: 'category',
          label: '第5章：GPU 硬件概论',
          collapsed: true,
          link: {type: 'doc', id: 'fundamentals/gpu-hardware'},
          items: [
            'fundamentals/gpu/architecture',
            'fundamentals/gpu/memory-hierarchy',
            'fundamentals/gpu/tensor-core-interconnect',
          ],
        },
        {
          type: 'category',
          label: '第6章：集合通信基础',
          collapsed: true,
          link: {type: 'doc', id: 'fundamentals/collective-communication'},
          items: [
            'fundamentals/communication/collective-primitives',
            'fundamentals/communication/ring-tree',
            'fundamentals/communication/nccl-basics',
          ],
        },
      ],
    },
  ],
};

export default sidebars;
