import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";
export const maxDuration = 30;

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || undefined,
});

// Curated real courses for top skills (free + paid)
const COURSE_DB: Record<string, Array<{ title: string; platform: string; url: string; cost: "Free" | "Paid" | "Free tier"; duration: string; type: "video" | "interactive" | "documentation" | "project" }>> = {
  python: [
    { title: "Python for Everybody", platform: "Coursera", url: "https://www.coursera.org/specializations/python", cost: "Free tier", duration: "8 months", type: "video" },
    { title: "Learn Python", platform: "freeCodeCamp", url: "https://www.freecodecamp.org/learn/scientific-computing-with-python/", cost: "Free", duration: "6 weeks", type: "interactive" },
    { title: "Python Tutorial", platform: "W3Schools", url: "https://www.w3schools.com/python/", cost: "Free", duration: "Self-paced", type: "interactive" },
  ],
  javascript: [
    { title: "JavaScript Algorithms and Data Structures", platform: "freeCodeCamp", url: "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/", cost: "Free", duration: "300 hours", type: "interactive" },
    { title: "The Odin Project", platform: "The Odin Project", url: "https://www.theodinproject.com/paths/full-stack-javascript", cost: "Free", duration: "6 months", type: "project" },
  ],
  typescript: [
    { title: "TypeScript Handbook", platform: "TypeScript Docs", url: "https://www.typescriptlang.org/docs/handbook/", cost: "Free", duration: "Self-paced", type: "documentation" },
    { title: "TypeScript Course for Beginners", platform: "Udemy", url: "https://www.udemy.com/course/understanding-typescript/", cost: "Paid", duration: "22 hours", type: "video" },
  ],
  react: [
    { title: "React Official Tutorial", platform: "React Docs", url: "https://react.dev/learn", cost: "Free", duration: "Self-paced", type: "interactive" },
    { title: "Scrimba React Course", platform: "Scrimba", url: "https://scrimba.com/learn/learnreact", cost: "Free tier", duration: "12 hours", type: "interactive" },
  ],
  "node.js": [
    { title: "Node.js Introduction", platform: "nodejs.dev", url: "https://nodejs.dev/en/learn/", cost: "Free", duration: "Self-paced", type: "documentation" },
    { title: "Node.js & Express", platform: "freeCodeCamp", url: "https://www.freecodecamp.org/learn/back-end-development-and-apis/", cost: "Free", duration: "4 weeks", type: "interactive" },
  ],
  sql: [
    { title: "SQL Tutorial", platform: "SQLZoo", url: "https://sqlzoo.net/wiki/SQL_Tutorial", cost: "Free", duration: "Self-paced", type: "interactive" },
    { title: "Learn SQL", platform: "Mode Analytics", url: "https://mode.com/sql-tutorial/", cost: "Free", duration: "Self-paced", type: "interactive" },
  ],
  aws: [
    { title: "AWS Cloud Practitioner Essentials", platform: "AWS Training", url: "https://aws.amazon.com/training/digital/aws-cloud-practitioner-essentials/", cost: "Free", duration: "6 hours", type: "video" },
    { title: "AWS Solutions Architect", platform: "A Cloud Guru", url: "https://acloudguru.com/course/aws-certified-solutions-architect-associate-saa-c03", cost: "Paid", duration: "29 hours", type: "video" },
  ],
  docker: [
    { title: "Docker Getting Started", platform: "Docker Docs", url: "https://docs.docker.com/get-started/", cost: "Free", duration: "Self-paced", type: "documentation" },
    { title: "Docker for Beginners", platform: "Play with Docker", url: "https://training.play-with-docker.com/", cost: "Free", duration: "6 hours", type: "interactive" },
  ],
  kubernetes: [
    { title: "Kubernetes Basics", platform: "Kubernetes.io", url: "https://kubernetes.io/docs/tutorials/kubernetes-basics/", cost: "Free", duration: "Self-paced", type: "interactive" },
    { title: "Introduction to Kubernetes", platform: "Linux Foundation", url: "https://training.linuxfoundation.org/training/introduction-to-kubernetes/", cost: "Free", duration: "14 hours", type: "video" },
  ],
  "machine learning": [
    { title: "Machine Learning Specialization", platform: "Coursera (Andrew Ng)", url: "https://www.coursera.org/specializations/machine-learning-introduction", cost: "Free tier", duration: "3 months", type: "video" },
    { title: "Practical Deep Learning", platform: "fast.ai", url: "https://course.fast.ai/", cost: "Free", duration: "7 weeks", type: "video" },
  ],
  "data science": [
    { title: "Data Science with Python", platform: "Kaggle", url: "https://www.kaggle.com/learn", cost: "Free", duration: "Self-paced", type: "interactive" },
    { title: "IBM Data Science Certificate", platform: "Coursera", url: "https://www.coursera.org/professional-certificates/ibm-data-science", cost: "Free tier", duration: "4 months", type: "video" },
  ],
  spark: [
    { title: "Apache Spark Essentials", platform: "Databricks Academy", url: "https://academy.databricks.com/", cost: "Free", duration: "6 hours", type: "video" },
    { title: "Spark: The Definitive Guide", platform: "O'Reilly", url: "https://www.oreilly.com/library/view/spark-the-definitive/9781491912201/", cost: "Paid", duration: "Book", type: "documentation" },
  ],
  airflow: [
    { title: "Intro to Airflow", platform: "Astronomer", url: "https://academy.astronomer.io/", cost: "Free", duration: "4 hours", type: "video" },
    { title: "Apache Airflow Docs", platform: "Apache", url: "https://airflow.apache.org/docs/apache-airflow/stable/tutorial/", cost: "Free", duration: "Self-paced", type: "documentation" },
  ],
  dbt: [
    { title: "dbt Fundamentals", platform: "dbt Learn", url: "https://courses.getdbt.com/courses/fundamentals", cost: "Free", duration: "5 hours", type: "video" },
    { title: "dbt Documentation", platform: "dbt Labs", url: "https://docs.getdbt.com/docs/introduction", cost: "Free", duration: "Self-paced", type: "documentation" },
  ],
  kafka: [
    { title: "Apache Kafka for Beginners", platform: "Confluent", url: "https://developer.confluent.io/courses/apache-kafka/intro/", cost: "Free", duration: "2 hours", type: "interactive" },
  ],
  tensorflow: [
    { title: "TensorFlow Developer Certificate", platform: "TensorFlow", url: "https://www.tensorflow.org/certificate", cost: "Free", duration: "Self-paced", type: "interactive" },
  ],
  pytorch: [
    { title: "PyTorch Tutorials", platform: "PyTorch", url: "https://pytorch.org/tutorials/", cost: "Free", duration: "Self-paced", type: "interactive" },
  ],
  go: [
    { title: "A Tour of Go", platform: "go.dev", url: "https://go.dev/tour/", cost: "Free", duration: "4 hours", type: "interactive" },
  ],
  rust: [
    { title: "The Rust Book", platform: "rust-lang.org", url: "https://doc.rust-lang.org/book/", cost: "Free", duration: "Self-paced", type: "documentation" },
  ],
  graphql: [
    { title: "GraphQL Tutorial", platform: "Apollo Docs", url: "https://www.apollographql.com/tutorials/", cost: "Free", duration: "Self-paced", type: "interactive" },
  ],
  mongodb: [
    { title: "MongoDB University", platform: "MongoDB", url: "https://university.mongodb.com/", cost: "Free", duration: "Self-paced", type: "interactive" },
  ],
  terraform: [
    { title: "HashiCorp Learn Terraform", platform: "HashiCorp", url: "https://developer.hashicorp.com/terraform/tutorials", cost: "Free", duration: "Self-paced", type: "interactive" },
  ],
  "ci/cd": [
    { title: "GitHub Actions Documentation", platform: "GitHub", url: "https://docs.github.com/en/actions", cost: "Free", duration: "Self-paced", type: "documentation" },
  ],
  java: [
    { title: "Java Programming", platform: "MOOC.fi", url: "https://java-programming.mooc.fi/", cost: "Free", duration: "14 weeks", type: "interactive" },
  ],
  "spring boot": [
    { title: "Spring Boot Tutorial", platform: "Spring.io", url: "https://spring.io/guides", cost: "Free", duration: "Self-paced", type: "documentation" },
  ],
  postgresql: [
    { title: "PostgreSQL Tutorial", platform: "PostgreSQL Tutorial", url: "https://www.postgresqltutorial.com/", cost: "Free", duration: "Self-paced", type: "interactive" },
  ],
  redis: [
    { title: "Redis University", platform: "Redis", url: "https://university.redis.com/", cost: "Free", duration: "Self-paced", type: "interactive" },
  ],
  "etl pipelines": [
    { title: "Data Engineering Zoomcamp", platform: "DataTalks.Club", url: "https://github.com/DataTalksClub/data-engineering-zoomcamp", cost: "Free", duration: "9 weeks", type: "project" },
  ],
  "data engineering": [
    { title: "Data Engineering Zoomcamp", platform: "DataTalks.Club", url: "https://github.com/DataTalksClub/data-engineering-zoomcamp", cost: "Free", duration: "9 weeks", type: "project" },
    { title: "Fundamentals of Data Engineering", platform: "O'Reilly", url: "https://www.oreilly.com/library/view/fundamentals-of-data/9781098108298/", cost: "Paid", duration: "Book", type: "documentation" },
  ],
  angular: [
    { title: "Angular Tutorial", platform: "angular.dev", url: "https://angular.dev/tutorials", cost: "Free", duration: "Self-paced", type: "interactive" },
  ],
  vue: [
    { title: "Vue.js Docs", platform: "vuejs.org", url: "https://vuejs.org/tutorial/", cost: "Free", duration: "Self-paced", type: "interactive" },
  ],
  "next.js": [
    { title: "Next.js Tutorial", platform: "next.js", url: "https://nextjs.org/learn", cost: "Free", duration: "Self-paced", type: "interactive" },
  ],
};

function findCourses(skill: string) {
  const key = skill.toLowerCase().trim();
  // Exact match
  if (COURSE_DB[key]) return COURSE_DB[key];
  // Partial match
  for (const dbKey of Object.keys(COURSE_DB)) {
    if (key.includes(dbKey) || dbKey.includes(key)) return COURSE_DB[dbKey];
  }
  return null;
}

const AI_COURSE_PROMPT = `You are a learning path expert. For the given skill, suggest 2 specific, real learning resources.
Return ONLY this JSON (no markdown):
{
  "courses": [
    {
      "title": "<exact course or resource name>",
      "platform": "<platform name>",
      "url": "<real URL - must be a real, working URL>",
      "cost": "<Free | Free tier | Paid>",
      "duration": "<e.g. '4 hours' or 'Self-paced'>",
      "type": "<video | interactive | documentation | project>",
      "description": "<one sentence: why this resource is best for this skill>"
    }
  ]
}`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { missingSkills = [], experienceLevel = "mid" } = body;

    if (!missingSkills?.length) {
      return NextResponse.json({ skillCourses: [] });
    }

    const skillCourses: Array<{
      skill: string;
      courses: Array<{ title: string; platform: string; url: string; cost: string; duration: string; type: string; description?: string }>;
    }> = [];

    // For each missing skill, try curated DB first, then AI fallback
    const aiSkills: string[] = [];

    for (const skill of missingSkills.slice(0, 6)) {
      const curated = findCourses(skill);
      if (curated) {
        skillCourses.push({
          skill,
          courses: curated.map(c => ({ ...c, description: `Best ${c.type} resource to learn ${skill} on ${c.platform}` })),
        });
      } else {
        aiSkills.push(skill);
      }
    }

    // Use AI for skills not in curated DB
    if (aiSkills.length > 0) {
      try {
        const aiResults = await Promise.all(
          aiSkills.map(async (skill) => {
            try {
              const completion = await client.chat.completions.create({
                model: "llama-3.1-8b-instant",
                temperature: 0.1,
                response_format: { type: "json_object" },
                messages: [
                  { role: "system", content: AI_COURSE_PROMPT },
                  { role: "user", content: `Skill to learn: ${skill}\nCandidate level: ${experienceLevel}` },
                ],
              });
              const data = JSON.parse(completion.choices[0]?.message?.content ?? "{}");
              return { skill, courses: data.courses ?? [] };
            } catch {
              return { skill, courses: [] };
            }
          })
        );
        skillCourses.push(...aiResults.filter(r => r.courses.length > 0));
      } catch {
        // silently skip AI failures
      }
    }

    return NextResponse.json({ skillCourses });
  } catch (error) {
    console.error("Courses API error:", error);
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 });
  }
}
