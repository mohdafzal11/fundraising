export type Table = {
    id?: string;
    title: string;
    tableOfContent: string;
    headers: string[];
    rows: any[];
    isActive: boolean;
    isTableOfContentVisible: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export type Section = {
    id: string;
    title: string;
    tableOfContent : string
    description: string;
    isActive: boolean;
    isTableOfContentVisible: boolean;
    createdAt: Date;
    updatedAt: Date;
    tables: Table[];
}