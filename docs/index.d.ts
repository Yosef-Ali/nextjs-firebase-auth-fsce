// Type definitions for documentation system
declare module 'docs/*' {
    interface DocumentationPage {
        frontmatter: {
            title: string;
            description: string;
            category: string;
            weight: number;
            published: boolean;
        };
        content: string;
        slug: string[];
    }

    interface RevisionHistory {
        version: string;
        date: string;
        author: string;
        changes: string[];
    }
}
