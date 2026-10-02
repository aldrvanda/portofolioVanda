'use client';

import { useEffect, useRef, useState } from 'react';
import { track } from '@vercel/analytics';
import { Tx, useT } from '@/lib/i18n';
import { S } from '@/lib/strings';
import type { ContactLink, Project } from '@/lib/types';
import { SectionHeader } from './Sections';
import { IconArrowRight, IconClose, IconExternal, IconMail } from './Icons';
import { CountUp } from './Motion';
import { sized } from './HeroGallery';

function MetricStat({ project, inline = false }: { project: Project; inline?: boolean }) {
  if (!project.keyMetricValue) return null;
  const Tag = inline ? 'span' : 'p';
  return (
    <Tag className="metric">
      <CountUp value={project.keyMetricValue} className="metric__value" />{' '}
      <Tx v={project.keyMetricLabel} className="metric__label" />
    </Tag>
  );
}

type CardProps = { project: Project; index: number; onOpen: (p: Project, el: HTMLButtonElement) => void };

function ProjectCard({ project, index, onOpen }: CardProps) {
  const { t } = useT();
  const hasMetric = !!project.keyMetricValue;
  // Nama aksesibel = judul + KPI (brief §10).
  const label = [t(project.title), hasMetric ? `${project.keyMetricValue} ${t(project.keyMetricLabel)}` : '']
    .filter(Boolean)
    .join(', ');
  return (
    <li data-reveal style={{ '--d': `${Math.min(index, 4) * 70}ms` } as React.CSSProperties}>
      <button
        type="button"
        className={`card${project.featured ? ' card--featured' : ''}`}
        aria-haspopup="dialog"
        aria-label={`${label}. ${t(S.projects.readCase)}`}
        onClick={(e) => onOpen(project, e.currentTarget)}
      >
        <span className="card__body">
          <Tx v={project.title} className="card__title" />
          <Tx v={project.summary} className="card__summary" />
          <span className="tags" aria-hidden="true">
            {project.stack.map((s) => (
              <span key={s} className="tag">
                {s}
              </span>
            ))}
          </span>
        </span>
        <span className="card__lead">
          {hasMetric ? (
            <MetricStat project={project} inline />
          ) : (
            <span className="metric__label">{t(S.projects.caseStudy)}</span>
          )}
        </span>
        <span className="card__arrow" aria-hidden="true">
          <IconArrowRight size={22} />
        </span>
      </button>
    </li>
  );
}

/**
 * Kolom foto di studi kasus. Dengan foto: satu foto besar + thumbnail.
 * Tanpa foto: sampul berisi KPI dan stack, jadi kolom tetap utuh.
 */
function ProjectMedia({ project }: { project: Project }) {
  const { t } = useT();
  const images = project.images ?? [];
  const [current, setCurrent] = useState(0);

  if (images.length === 0) {
    return (
      <div className="pmedia pmedia--cover" aria-hidden="true">
        {project.keyMetricValue ? (
          <>
            <span className="pmedia__value">{project.keyMetricValue}</span>
            <Tx v={project.keyMetricLabel} className="pmedia__label" />
          </>
        ) : (
          <Tx v={project.title} className="pmedia__value pmedia__value--title" />
        )}
        <span className="pmedia__stack">{project.stack.join(' · ')}</span>
      </div>
    );
  }

  const img = images[Math.min(current, images.length - 1)];
  return (
    <div className="pmedia" role="group" aria-label={t(S.projects.photos)}>
      <img key={img.url} className="pmedia__main" src={sized(img.url, 1600)} alt={t(img.alt)} decoding="async" />
      {images.length > 1 && (
        <div className="pmedia__thumbs">
          {images.map((im, i) => (
            <button
              key={im.url + i}
              type="button"
              className="pmedia__thumb"
              aria-pressed={i === current}
              aria-label={t(im.alt) || `${t(S.projects.photos)} ${i + 1}`}
              onClick={() => setCurrent(i)}
            >
              <img src={sized(im.url, 240, 160)} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

type ModalProps = { project: Project | null; links: ContactLink[]; onClosed: () => void };

function ProjectModal({ project, links, onClosed }: ModalProps) {
  const { t } = useT();
  const ref = useRef<HTMLDialogElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (project && d && !d.open) {
      d.showModal();
      titleRef.current?.focus();
    }
  }, [project]);

  const close = () => ref.current?.close();
  const hasLinks = !!(project?.repoUrl || project?.demoUrl);
  const email = links.find((l) => l.type === 'email')?.value;
  const github = links.find((l) => l.type === 'github')?.value;

  return (
    <dialog
      ref={ref}
      className="modal"
      aria-labelledby="modal-title"
      onClose={onClosed}
      onClick={(e) => {
        // Klik di backdrop (di luar panel) menutup modal.
        if (e.target === ref.current) close();
      }}
    >
      {project && (
        <div className="modal__panel">
          <div className="modal__header">
            <div>
              {project.year && <p className="mono muted">{project.year}</p>}
              <h2 id="modal-title" className="modal__title" ref={titleRef} tabIndex={-1}>
                {t(project.title)}
              </h2>
            </div>
            <button type="button" className="icon-btn modal__close" aria-label={t(S.projects.close)} onClick={close}>
              <IconClose />
            </button>
          </div>

          <div className="modal__body">
            <ProjectMedia key={project.slug} project={project} />

            <div className="modal__content">
              <MetricStat project={project} />
              <div className="case">
                <Tx v={S.projects.problem} as="h3" className="label" />
                <Tx v={project.problem} as="p" className="prose" />
                <Tx v={S.projects.solution} as="h3" className="label" />
                <Tx v={project.solution} as="p" className="prose" />
                <Tx v={S.projects.myRole} as="h3" className="label" />
                <Tx v={project.myRole} as="p" className="prose" />
                {project.impact?.en && (
                  <>
                    <Tx v={S.projects.impact} as="h3" className="label" />
                    <Tx v={project.impact} as="p" className="prose" />
                  </>
                )}
                <Tx v={S.projects.stack} as="h3" className="label" />
                <ul className="tags">
                  {project.stack.map((s) => (
                    <li key={s} className="tag">
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="modal__actions">
                {!hasLinks && <Tx v={S.projects.noRepo} as="p" className="modal__note" />}
                <div className="modal__buttons">
                  {project.repoUrl && (
                    <a className="btn btn-primary" href={project.repoUrl} target="_blank" rel="noopener noreferrer">
                      {t(S.projects.repo)} <IconExternal />
                      <span className="sr-only"> {t(S.newTab)}</span>
                    </a>
                  )}
                  {project.demoUrl && (
                    <a
                      className={`btn ${project.repoUrl ? 'btn-secondary' : 'btn-primary'}`}
                      href={project.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t(S.projects.demo)} <IconExternal />
                      <span className="sr-only"> {t(S.newTab)}</span>
                    </a>
                  )}
                  {/* Tombol tanya hanya untuk proyek tanpa repo/demo publik. */}
                  {email && !hasLinks && (
                    <a
                      className="btn btn-primary"
                      href={`mailto:${email}?subject=${encodeURIComponent(t(project.title))}`}
                      onClick={() => track('contact_click', { target: 'project_mailto' })}
                    >
                      <IconMail /> {t(S.projects.askMe)}
                    </a>
                  )}
                  {github && !hasLinks && (
                    <a
                      className="btn btn-secondary"
                      href={github}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => track('contact_click', { target: 'project_github' })}
                    >
                      {t(S.projects.github)} <IconExternal />
                      <span className="sr-only"> {t(S.newTab)}</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </dialog>
  );
}

export default function Projects({ projects, links }: { projects: Project[]; links: ContactLink[] }) {
  const [open, setOpen] = useState<Project | null>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);

  return (
    <section className="section" id="projects" aria-labelledby="projects-title">
      <div className="container">
        <SectionHeader id="projects" heading={S.projects.heading} title={S.projects.title} />
        <ul className="cards">
          {projects.map((p, i) => (
            <ProjectCard
              key={p.slug}
              project={p}
              index={i}
              onOpen={(proj, el) => {
                trigger.current = el;
                setOpen(proj);
              }}
            />
          ))}
        </ul>
      </div>
      <ProjectModal
        project={open}
        links={links}
        onClosed={() => {
          setOpen(null);
          // Fokus kembali ke kartu pemicu; posisi scroll tidak berubah.
          trigger.current?.focus({ preventScroll: true });
        }}
      />
    </section>
  );
}
