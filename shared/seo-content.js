export const SITE_ORIGIN = "https://academy.htbconsults.com";
export const SOCIAL_IMAGE_URL = `${SITE_ORIGIN}/images/htb-academy-social.jpg`;

export function makePageTitle(title) {
  const suffix = " | HTB Consult Academy";
  const value = String(title || "HTB Consult Academy").trim();
  const titleLimit = 60 - suffix.length;
  const concise = value.length > titleLimit ? `${value.slice(0, titleLimit - 1).trimEnd()}…` : value;
  return `${concise}${suffix}`;
}

export function publishedCoursesInDisplayOrder(courses = []) {
  if (!Array.isArray(courses)) return [];
  return courses
    .filter((course) => course?.id && typeof course.title === "string" && course.title.trim() && course.published !== false)
    .sort((a, b) => {
      const numberFromTitle = (title) => {
        const match = String(title).match(/\d+/);
        return match ? Number(match[0]) : Infinity;
      };
      return numberFromTitle(a.title) - numberFromTitle(b.title);
    });
}

export function courseListSchema(courses = []) {
  const publicCourses = publishedCoursesInDisplayOrder(courses);
  if (publicCourses.length < 3) return null;
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: publicCourses.map((course, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${SITE_ORIGIN}/course/${encodeURIComponent(String(course.id))}`,
    })),
  };
}

export const SEO_PAGES = {
  "/": {
    title: "HTB Consult Academy | Practical Career Training",
    description: "Build practical business analysis, digital transformation and leadership skills with industry-led training, project simulations and expert mentorship.",
    h1: "Build Capability for the Future of Work",
    intro: "Practical learning, real project simulation and industry readiness. Develop the skills, mindset and confidence to excel in today's workplace.",
  },
  "/courses": {
    title: "Business Analysis Courses | HTB Consult Academy",
    description: "Explore practical business analysis, digital transformation, leadership and professional development courses from HTB Consult Academy.",
    h1: "Practical Training for Professional Growth",
    intro: "Browse hands-on courses in business analysis, project delivery, digital transformation and professional development, built from real consulting experience.",
  },
  "/services": {
    title: "Professional Learning Pathways | HTB Academy",
    description: "Explore HTB Academy learning pathways in business analysis, leadership, Agile delivery and industry specialisation.",
    h1: "Learning Pathways for Professional Growth",
    intro: "Choose a structured pathway that matches your experience, builds practical capability and helps you apply your learning in real work.",
  },
  "/about": {
    title: "About HTB Consult Academy | Our Learning Approach",
    description: "Learn how HTB Consult Academy combines practical training, real-world projects and expert mentorship to build workplace capability.",
    h1: "About HTB Consult Academy",
    intro: "We help professionals build practical skills, confidence and experience through structured learning and industry-focused training.",
  },
  "/about-htb": {
    title: "About HTB Consult Ltd | Consulting & Academy",
    description: "Discover HTB Consult's consulting and capability-development work, and how its Academy prepares professionals for workplace impact.",
    h1: "About HTB Consult",
    intro: "HTB Consult supports organisations and professionals through consulting, capability development and practical training.",
  },
  "/contact": {
    title: "Contact HTB Consult Academy | Course Enquiries",
    description: "Contact HTB Consult Academy about courses, learning pathways, enrolment and professional training for your team.",
    h1: "Contact HTB Consult Academy",
    intro: "Talk to our team about course options, learning pathways and training enquiries.",
  },
  "/blog": {
    title: "Business Analysis Blog & Guides | HTB Academy",
    description: "Read practical insights, guides and updates on business analysis, project delivery, leadership and professional development.",
    h1: "Insights, Guides and Updates",
    intro: "Explore articles and practical guidance from the HTB Consult team and Academy contributors.",
  },
  "/mentors": {
    title: "Meet Our Industry Mentors | HTB Academy",
    description: "Meet the industry mentors helping HTB Academy learners develop practical skills and confidence for professional roles.",
    h1: "Learn with Industry Mentors",
    intro: "Build your capability with guidance from experienced professionals and mentors.",
  },
};

export const PRIVATE_ROUTE_PREFIXES = [
  "/admin", "/dashboard", "/profile", "/notifications", "/emails", "/messages",
  "/chat", "/saved", "/settings", "/mentor-dashboard", "/my-learning", "/onboarding",
  "/mentor/articles", "/auth", "/reset-password", "/verify-email", "/payment",
  "/explore", "/sessions",
];
