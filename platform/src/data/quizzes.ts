// Topic-wise quiz registry.
//
// Each key is a TOPIC SLUG (see src/topics.generated.json). A topic that has an
// entry here automatically gets an interactive practice quiz at
// /topics/<slug>/quiz and a "Practice quiz" call-to-action on its topic page.
//
// To add a quiz for another topic: create a question bank (see aws-ccp-quiz.ts),
// import it, and add an entry below keyed by that topic's slug.

import { AWS_CCP_QUIZ, type QuizQuestion } from './aws-ccp-quiz';

export interface TopicQuiz {
  /** Short label shown on the quiz page, e.g. an exam code. */
  badge?: string;
  /** One-line intro for the quiz page. */
  intro: string;
  questions: QuizQuestion[];
}

export const QUIZZES: Record<string, TopicQuiz> = {
  'aws-cloud-practitioner-mcq': {
    badge: 'CLF-C02',
    intro:
      'Practice questions across the four AWS Cloud Practitioner exam domains. Pick an answer to reveal whether you were right and why - nothing is shown until you commit, so you can genuinely test yourself.',
    questions: AWS_CCP_QUIZ,
  },
};

export function quizForTopic(slug: string): TopicQuiz | undefined {
  return QUIZZES[slug];
}

export function topicHasQuiz(slug: string): boolean {
  return slug in QUIZZES;
}
