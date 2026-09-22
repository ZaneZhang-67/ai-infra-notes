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
    title: 'AI Infra 前置基础',
    description: 'Linux、C++、PyTorch、数学与 Transformer 基础。',
    href: '/docs/fundamentals/',
  },
];

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();

  return (
    <header className={styles.heroBanner}>
      <div className={clsx('container', styles.heroContent)}>
        <Heading as="h1" className={styles.heroTitle}>
          {siteConfig.title}
        </Heading>
        <p className={styles.heroSubtitle}>{siteConfig.tagline}</p>
        <p className={styles.heroDescription}>
          从系统、编程、数学和深度学习基础开始，逐步建立扎实的 AI Infra 知识底座。
        </p>
        <p className={styles.referenceNote}>
          本站结构参考{' '}
          <a
            href="https://caomaolufei.github.io/AIInfraGuide/"
            target="_blank"
            rel="noopener noreferrer">
            草帽路飞的 AI Infra Guide
          </a>
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

export default function Home(): ReactNode {
  return (
    <Layout
      title="首页"
      description="系统整理 AI Infra 所需基础知识的个人学习知识库">
      <HomepageHeader />
      <main>
        <TopicGrid />
      </main>
    </Layout>
  );
}
