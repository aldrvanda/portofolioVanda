import { groq } from 'next-sanity';

export const CONTENT_QUERY = groq`{
  "profile": *[_type == "profile"][0]{
    fullName, roleTitle, tagline, about, education, seoDescription,
    "gallery": gallery[]{ "url": asset->url, alt, caption }
  },
  "skills": *[_type == "skill"] | order(order asc){ name, category, order },
  "projects": *[_type == "project" && status == "published"] | order(featured desc, order asc){
    "slug": slug.current, title, year, keyMetricValue, keyMetricLabel,
    summary, problem, solution, myRole, impact, stack, repoUrl, demoUrl, featured, order,
    "images": images[]{ "url": asset->url, alt }
  },
  "experiences": *[_type == "experience" && status == "published"] | order(startDate desc){
    "id": _id, role, organization, type, startDate, endDate, highlights,
    "photo": photo{ "url": asset->url, alt },
    "photoBack": photoBack{ "url": asset->url, alt }
  },
  "contactLinks": *[_type == "contactLink"] | order(order asc){ type, label, value, order }
}`;
