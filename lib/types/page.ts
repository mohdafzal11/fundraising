export type Page = {
    id: string;
    title: string;
    path: string;
    isActive: boolean;
    content: string;
    contents: Content[];
    faqs: FAQ[];
    createdAt?: Date | string;
    updatedAt?: Date | string;
  }
  
  export type Content = {
    id: string;
    title: string;
    content: string;
    order: number;
    isActive: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  }
  
  export type FAQ = {
    id: string;
    question: string;
    answer: string;
    order: number;
    isActive: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  }