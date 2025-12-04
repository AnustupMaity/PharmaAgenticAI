import { MarkdownRenderer } from '../components/MarkdownRenderer';

const testMarkdown = `**INTELLIGENCE REPORT**

**Subject: Clinical Trials for Diabetes Treatments: A Comprehensive Analysis**

**Date: July 1, 2024**

**1. Executive Summary**

This report provides a comprehensive overview of the current landscape of clinical trials for diabetes treatments. It synthesizes recent developments, key facts and statistics, expert opinions, and relevant trends to offer actionable insights.

**2. Key Findings**

*   **Innovative Therapies:** Clinical trials are exploring novel medications and therapeutic approaches.
*   **Technological Advancements:** Continuous glucose monitors (CGMs) and automated insulin delivery systems are improving patient satisfaction.
*   **Shifting Treatment Paradigms:** There is a notable shift in first-line glucose-lowering therapies.

## Detailed Analysis

### Recent Developments

- Focus on Novel Therapies
- Potential Cures
- Expanding Applications

> **Note:** This is a blockquote with **bold text** inside.

Here's some \`inline code\` and more **bold text** with *italic text*.

### Code Example

\`\`\`python
def analyze_drug(drug_name):
    return f"Analyzing {drug_name}..."
\`\`\`

### Table Example

| Drug Name | Status | Phase |
|-----------|--------|-------|
| DrugA     | Active | III   |
| DrugB     | Completed | IV |

---

**Conclusion:** The **bold text** should render properly now!`;

const MarkdownTest = () => {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-foreground">Markdown Rendering Test</h1>
        
        <div className="bg-card border border-border rounded-lg p-6 shadow-lg">
          <MarkdownRenderer content={testMarkdown} />
        </div>
        
        <div className="mt-8 p-4 bg-muted rounded-lg">
          <h2 className="text-xl font-bold mb-2">What to Check:</h2>
          <ul className="list-disc ml-6 space-y-1">
            <li>Bold text should appear in <strong>bold</strong></li>
            <li>Italic text should appear in <em>italics</em></li>
            <li>Lists should have proper bullets/numbers</li>
            <li>Code blocks should have background</li>
            <li>Tables should have borders</li>
            <li>Blockquotes should have left border</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MarkdownTest;
