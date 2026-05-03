export const DEFAULT_EXAM_ID = "gate-da";

export const EXAM_CATALOG = [
  {
    id: "gate-da",
    name: "GATE DA",
    title: "GATE DA Preparation Tracker",
    subtitle: "Data Science and Artificial Intelligence preparation workspace",
    category: "GATE",
    syllabusUrl: "./syllabi/gate-da.json"
  },
  {
    id: "gate-cse",
    name: "GATE CSE",
    title: "GATE CSE Preparation Tracker",
    subtitle: "Computer Science Engineering preparation workspace",
    category: "GATE",
    syllabusUrl: "./syllabi/gate-cse.json"
  },
  {
    id: "upsc-cse",
    name: "UPSC CSE",
    title: "UPSC CSE Preparation Tracker",
    subtitle: "Civil Services preparation workspace",
    category: "Civil Services",
    syllabusUrl: "./syllabi/upsc-cse.json"
  },
  {
    id: "cat",
    name: "CAT",
    title: "CAT Preparation Tracker",
    subtitle: "MBA entrance preparation workspace",
    category: "MBA",
    syllabusUrl: "./syllabi/cat.json"
  },
  {
    id: "ssc",
    name: "SSC",
    title: "SSC Preparation Tracker",
    subtitle: "Staff Selection Commission preparation workspace",
    category: "Government Exams",
    syllabusUrl: "./syllabi/ssc.json"
  },
  {
    id: "banking",
    name: "Banking Exams",
    title: "Banking Exams Preparation Tracker",
    subtitle: "Bank PO and Clerk preparation workspace",
    category: "Banking",
    syllabusUrl: "./syllabi/banking.json"
  }
];

export async function loadPreloadedExams() {
  return Promise.all(
    EXAM_CATALOG.map(async exam => {
      const response = await fetch(new URL(exam.syllabusUrl, import.meta.url));

      if (!response.ok) {
        throw new Error(`Unable to load syllabus for ${exam.name}.`);
      }

      return {
        ...exam,
        source: "preloaded",
        syllabus: await response.json()
      };
    })
  );
}
