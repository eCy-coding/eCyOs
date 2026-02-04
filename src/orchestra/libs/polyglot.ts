/**
 * The Alexandria Polyglot Engine.
 * Supports snippets for 25 Programming Languages.
 */

export const Polyglot = {
    languages: [
        'python', 'javascript', 'typescript', 'rust', 'c', 'cpp', 'go', 'java',
        'swift', 'kotlin', 'php', 'ruby', 'lua', 'r', 'matlab', 'sql', 'html',
        'css', 'scss', 'json', 'xml', 'yaml', 'markdown', 'shell', 'powershell'
    ],

    generateHello: (lang: string): string => {
        switch(lang.toLowerCase()) {
            case 'python': return 'print("Hello World")';
            case 'javascript': return '// console.log("Hello World");';
            case 'typescript': return '// console.log("Hello World");';
            case 'rust': return 'println!("Hello World");';
            case 'c': return 'printf("Hello World\\n");';
            case 'cpp': return 'std::cout << "Hello World" << std::endl;';
            case 'go': return 'fmt.Println("Hello World")';
            case 'java': return 'System.out.println("Hello World");';
            case 'swift': return 'print("Hello World")';
            case 'kotlin': return 'println("Hello World")';
            case 'php': return 'echo "Hello World";';
            case 'ruby': return 'puts "Hello World"';
            case 'lua': return 'print("Hello World")';
            case 'r': return 'print("Hello World")';
            case 'matlab': return 'disp("Hello World")';
            case 'sql': return 'SELECT "Hello World";';
            case 'html': return '<h1>Hello World</h1>';
            case 'css': return 'body::before { content: "Hello World"; }';
            case 'scss': return 'body { &::before { content: "Hello World"; } }';
            case 'json': return '{ "msg": "Hello World" }';
            case 'xml': return '<msg>Hello World</msg>';
            case 'yaml': return 'msg: Hello World';
            case 'markdown': return '# Hello World';
            case 'shell': return 'echo "Hello World"';
            case 'powershell': return 'Write-Host "Hello World"';
            default: return '// Unknown Language';
        }
    }
};
