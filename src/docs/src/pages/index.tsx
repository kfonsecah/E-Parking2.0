import React, { JSX } from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import styles from './index.module.css';

export default function Home(): JSX.Element {
  return (
    <Layout
      title="Park Xpress System"
      description="Smart parking management system with AI integration"
    >
      <header className="hero hero--primary">
        <div className="container">
          <h1 className="hero__title">Park Xpress System</h1>
          <p className="hero__subtitle">
            Powerful, fast, and intelligent parking control system with AI integration.
          </p>
          <div>
            <Link className="button button--secondary button--lg" to="/docs/intro">
              Get Started 🚀
            </Link>
          </div>
        </div>
      </header>
      <main>
        <section className="container padding-vert--lg">
          <div className="row">
            <div className="col col--4">
              <h3>🧠 AI Integration</h3>
              <p>License plate recognition and smart features powered by artificial intelligence.</p>
            </div>
            <div className="col col--4">
              <h3>💼 Cashier Management</h3>
              <p>Full control of cashier sessions, income tracking, and secure session validation with JWT.</p>
            </div>
            <div className="col col--4">
              <h3>⚙️ Built for Speed</h3>
              <p>Fast and intuitive system, built with Next.js, Prisma, and TypeScript for scalability and ease of use.</p>
            </div>
          </div>
        </section>
        {/* Tech Stack section */}
        <section className="hero hero--light">
          <div className="container padding-vert--lg">
            <h2 className="text--center">🚀 Technologies Used</h2>
            <div className="row">
              <div className="col col--2 text--center"><strong>Next.js</strong></div>
              <div className="col col--2 text--center"><strong>Prisma</strong></div>
              <div className="col col--2 text--center"><strong>PostgreSQL</strong></div>
              <div className="col col--2 text--center"><strong>Tailwind CSS</strong></div>
              <div className="col col--2 text--center"><strong>JWT</strong></div>
              <div className="col col--2 text--center"><strong>TypeScript</strong></div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
