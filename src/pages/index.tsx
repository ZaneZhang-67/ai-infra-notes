import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

const topics = [
  {
    index: '01',
    title: '基础知识',
    description: 'Linux、C++、PyTorch、数学与 Transformer 基础。',
    href: '/docs/fundamentals/',
  },
  {
    index: '02',
    title: 'GPU 与 CUDA',
    description: 'GPU 架构、CUDA 编程、经典算子与性能优化。',
    href: '/docs/gpu-cuda/',
  },
  {
    index: '03',
    title: '分布式训练',
    description: '集合通信、并行策略、训练框架与集群实践。',
    href: '/docs/distributed-training/',
  },
  {
    index: '04',
    title: '大模型推理',
    description: '推理引擎、KV Cache、调度、量化与服务化。',
    href: '/docs/inference-serving/',
  },
  {
    index: '05',
    title: '性能分析',
    description: 'Profiling、Benchmark、指标体系与优化方法论。',
    href: '/docs/performance/',
  },
  {
    index: '06',
    title: '项目与实验',
    description: '保存可复现实验、工程实践、踩坑和阶段复盘。',
    href: '/docs/practice/',
  },
];

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();

  return (
    <header className={styles.heroBanner}>
      <div className={clsx('container', styles.heroContent)}>
        <span className={styles.eyebrow}>持续更新 · Markdown 驱动</span>
        <Heading as="h1" className={styles.heroTitle}>
          {siteConfig.title}
        </Heading>
        <p className={styles.heroSubtitle}>{siteConfig.tagline}</p>
        <p className={styles.heroDescription}>
          记录概念理解、源码阅读、性能实验和工程复盘，逐步构建完整的 AI Infra 知识体系。
        </p>
        <div className={styles.buttons}>
          <Link className="button button--primary button--lg" to="/docs/">
            开始阅读
          </Link>
          <Link className="button button--outline button--secondary button--lg" to="/docs/roadmap">
            查看学习路线
          </Link>
        </div>
      </div>
    </header>
  );
}

function TopicGrid() {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.sectionHeading}>
          <span className={styles.sectionLabel}>KNOWLEDGE BASE</span>
          <Heading as="h2">知识地图</Heading>
          <p>按主题组织长期知识，用学习日志记录阶段进展。</p>
        </div>
        <div className={styles.topicGrid}>
          {topics.map((topic) => (
            <Link className={styles.topicCard} to={topic.href} key={topic.href}>
              <span className={styles.topicIndex}>{topic.index}</span>
              <Heading as="h3">{topic.title}</Heading>
              <p>{topic.description}</p>
              <span className={styles.topicLink}>进入模块 →</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function WritingFlow() {
  return (
    <section className={styles.workflowSection}>
      <div className={clsx('container', styles.workflow)}>
        <div>
          <span className={styles.sectionLabel}>WORKFLOW</span>
          <Heading as="h2">专注内容，发布交给自动化</Heading>
        </div>
        <div className={styles.workflowSteps}>
          <span>编写 Markdown</span>
          <span aria-hidden="true">→</span>
          <span>提交到 GitHub</span>
          <span aria-hidden="true">→</span>
          <span>自动发布</span>
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  return (
    <Layout
      title="首页"
      description="从 GPU、CUDA 到分布式训练与大模型推理的 AI Infra 学习知识库">
      <HomepageHeader />
      <main>
        <TopicGrid />
        <WritingFlow />
      </main>
    </Layout>
  );
}
