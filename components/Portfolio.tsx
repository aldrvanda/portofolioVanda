'use client';

import { LanguageProvider, useT } from '@/lib/i18n';
import { S } from '@/lib/strings';
import type { Content } from '@/lib/types';
import Header from './Header';
import IntroLoader from './IntroLoader';
import { About, Footer, Hero } from './Sections';
import ExperienceCarousel from './ExperienceCarousel';
import Projects from './Projects';
import Contact from './Contact';
import { ScrollProgress, useSiteMotion } from './Motion';

function Page({ content }: { content: Content }) {
  const { t, locale } = useT();
  const sections = {
    projects: content.projects.length > 0,
    experience: content.experiences.length > 0,
  };
  useSiteMotion([locale]);
  return (
    <>
      <a href="#content" className="skip-link">
        {t(S.skip)}
      </a>
      <IntroLoader name={content.profile.fullName} />
      <ScrollProgress />
      <div className="site">
        <Header sections={sections} />
        <main id="content" tabIndex={-1}>
          <Hero profile={content.profile} showProjects={sections.projects} />
          <About profile={content.profile} skills={content.skills} experiences={content.experiences} />
          {sections.projects && <Projects projects={content.projects} links={content.contactLinks} />}
          {sections.experience && <ExperienceCarousel experiences={content.experiences} />}
          <Contact links={content.contactLinks} />
        </main>
        <Footer name={content.profile.fullName} links={content.contactLinks} />
      </div>
    </>
  );
}

export default function Portfolio({ content }: { content: Content }) {
  return (
    <LanguageProvider>
      <Page content={content} />
    </LanguageProvider>
  );
}
