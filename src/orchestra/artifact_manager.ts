import * as fs from 'fs';
import * as path from 'path';

export interface Artifact {
    id: string;
    type: 'markdown' | 'json' | 'code' | 'plan';
    title: string;
    content: string;
    createdAt: number;
    path?: string;
}

export class ArtifactManager {
    private storageDir: string;

    constructor(baseDir: string) {
        this.storageDir = path.join(baseDir, 'artifacts');
        if (!fs.existsSync(this.storageDir)) {
            fs.mkdirSync(this.storageDir, { recursive: true });
        }
    }

    public save(artifact: Artifact): string {
        const sanitizedTitle = artifact.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const filename = `${artifact.type}_${sanitizedTitle}_${artifact.id}.md`;
        const filePath = path.join(this.storageDir, filename);

        let fileContent = artifact.content;
        
        // Wrap JSON/Code in markdown if needed
        if (artifact.type === 'json' && !artifact.content.startsWith('```')) {
            fileContent = `\`\`\`json\n${JSON.stringify(JSON.parse(artifact.content), null, 2)}\n\`\`\``;
        }

        const header = `---
id: ${artifact.id}
title: ${artifact.title}
type: ${artifact.type}
created: ${new Date(artifact.createdAt).toISOString()}
---

`;

        fs.writeFileSync(filePath, header + fileContent);
        return filePath;
    }

    public list(): string[] {
        return fs.readdirSync(this.storageDir);
    }
}
