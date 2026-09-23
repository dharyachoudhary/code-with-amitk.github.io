const fs = require('fs');
const path = require('path');
const {
    DOCS_DIR,
    SEARCH_INDEX_EXCLUDE_FILES,
    getRelativeUrl,
    walkHtmlFiles,
} = require('./site-pages');

const OUTPUT_FILE = path.join(DOCS_DIR, 'search-index.json');

function getPageTitle(filePath, htmlContent) {
    try {
        const titleMatch = htmlContent.match(/<title[^>]*>([^<]+)<\/title>/i);
        if (titleMatch && titleMatch[1].trim()) {
            return titleMatch[1].trim();
        }

        const h1Match = htmlContent.match(/<h1[^>]*>([^<]+)<\/h1>/i);
        if (h1Match && h1Match[1].trim()) {
            return h1Match[1].trim();
        }

        return path.basename(filePath, '.html');
    } catch (e) {
        return path.basename(filePath, '.html');
    }
}

function getPageExcerpt(htmlContent, maxLength = 180) {
    try {
        const contentHtml =
            htmlContent.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] ||
            htmlContent.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i)?.[1] ||
            htmlContent;

        const text = contentHtml
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
            .replace(/<nav\b[^>]*>[\s\S]*?<\/nav>/gi, ' ')
            .replace(/<header\b[^>]*>[\s\S]*?<\/header>/gi, ' ')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();

        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength).trim() + '...' : text;
    } catch (e) {
        return '';
    }
}

function getPageHeadings(htmlContent) {
    try {
        const headingMatches = [...htmlContent.matchAll(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi)];

        const headings = headingMatches
            .map((match) => {
                const text = match[2]
                    .replace(/<[^>]+>/g, ' ')
                    .replace(/&nbsp;/gi, ' ')
                    .replace(/\s+/g, ' ')
                    .trim();

                return text;
            })
            .filter(Boolean);

        return headings.filter((heading, index) => headings.indexOf(heading) === index);
    } catch (e) {
        return [];
    }
}

function generateSearchIndex() {
    const searchIndex = [];
    let fileCount = 0;

    console.log('Building search index...');

    try {
        walkHtmlFiles((filePath) => {
            try {
                const html = fs.readFileSync(filePath, 'utf8');
                const title = getPageTitle(filePath, html);
                const url = getRelativeUrl(filePath);
                const excerpt = getPageExcerpt(html);
                const headings = getPageHeadings(html);

                if (title && url) {
                    searchIndex.push({ title, url, excerpt, headings });
                    fileCount += 1;
                    console.log(`  ✓ ${title} (${url})`);
                }
            } catch (e) {
                console.warn(`Error processing ${filePath}:`, e.message);
            }
        }, SEARCH_INDEX_EXCLUDE_FILES);

        searchIndex.sort((a, b) => a.title.localeCompare(b.title));
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(searchIndex, null, 2));

        console.log('Search index built successfully.');
        console.log(`Indexed ${fileCount} pages`);
        console.log(`Saved to: ${OUTPUT_FILE}`);
    } catch (error) {
        console.error('Error building search index:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    generateSearchIndex();
}

module.exports = {
    getPageTitle,
    getPageExcerpt,
    getPageHeadings,
    generateSearchIndex,
};
