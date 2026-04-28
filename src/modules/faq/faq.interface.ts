export interface IFaq {
  question: string;
  answer: string;
  category: string;
  language: 'en' | 'fr';
  order: number;
}
