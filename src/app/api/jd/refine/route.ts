import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface RefinementData {
  satisfied: boolean | null;
  feedback: string;
}

interface Refinements {
  [key: string]: RefinementData;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface RefineRequest {
  currentJD: any;
  refinements: Refinements;
  chatHistory?: ChatMessage[];
}

interface ChangeInfo {
  section: string;
  refinementKey: string;
  feedback: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: RefineRequest = await req.json();
    const { currentJD, refinements, chatHistory = [] } = body;

    // Validate input
    if (!currentJD || !refinements) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required fields: currentJD and refinements' 
        },
        { status: 400 }
      );
    }

    // Build the refinement prompt
    const refinementPrompt = buildRefinementPrompt(currentJD, refinements, chatHistory);

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT
        },
        {
          role: "user",
          content: refinementPrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000,
      response_format: { type: "json_object" }
    });

    // Parse the response
    const responseText = completion.choices[0].message.content;
    if (!responseText) {
      throw new Error('No response from OpenAI');
    }

    const updatedJD = JSON.parse(responseText);
    
    // Identify what changed
    const changedSections = identifyChanges(currentJD, updatedJD, refinements);

    // Return the refined JD with metadata
    return NextResponse.json({
      success: true,
      data: {
        updatedJD,
        changedSections,
        summary: generateChangeSummary(changedSections, refinements),
        timestamp: new Date().toISOString(),
        tokensUsed: completion.usage?.total_tokens || 0
      }
    });

  } catch (error) {
    console.error('Refinement error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to refine job description';
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to refine job description',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}

// System prompt for the refinement task
const SYSTEM_PROMPT = `You are an expert job description refinement assistant. Your role is to take an existing job description and user feedback, then produce an updated version that incorporates their requested changes.

CRITICAL RULES:
1. ONLY modify sections where the user provided feedback (satisfied: false)
2. Maintain the exact JSON structure provided
3. Keep all other sections completely unchanged
4. Be precise and surgical with edits - don't over-modify
5. Ensure consistency across related fields (e.g., if responsibilities change, skills might need adjustment)
6. Return ONLY valid JSON in this exact format:
   {
     "what_you_told_us": "...",
     "roles": [...],
     "split_table": [...],
     "service_recommendation": {...},
     "onboarding_2w": {...},
     "risks": [...],
     "assumptions": [...]
   }
7. Preserve all original formatting, arrays, and nested structures

REFINEMENT APPROACH:
- If user says "remove X", completely remove references to X from ALL related sections
- If user says "focus more on Y", emphasize Y in relevant sections
- If user says "mark as good to have", adjust the language (e.g., "Proficient in X (nice to have)")
- If user says "add more", expand the section with relevant additions
- Always maintain professional tone and specificity
- When removing something like "ETL", check: responsibilities, skills, tools, and sample_week

IMPORTANT: You must return valid JSON that matches the exact structure of the input.`;

// Build the refinement prompt
function buildRefinementPrompt(currentJD: any, refinements: Refinements, chatHistory: ChatMessage[]): string {
  // Extract unsatisfied sections
  const unsatisfiedSections = Object.entries(refinements)
    .filter(([_, data]) => !data.satisfied && data.feedback)
    .map(([section, data]) => ({
      section,
      feedback: data.feedback
    }));

  if (unsatisfiedSections.length === 0) {
    return `The user is satisfied with all sections. Return the job description unchanged as valid JSON.

Current JD:
${JSON.stringify(currentJD, null, 2)}`;
  }

  // Build context from chat history (last 3 exchanges)
  const recentContext = chatHistory.slice(-6).map((msg: ChatMessage) => 
    `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
  ).join('\n');

  return `# Current Job Description
${JSON.stringify(currentJD, null, 2)}

# User Refinement Requests
The user has reviewed the job description and provided the following feedback on specific sections:

${unsatisfiedSections.map(item => `
**Section: ${item.section}**
User Feedback: "${item.feedback}"
Action Required: Update this section based on the feedback
`).join('\n')}

${chatHistory.length > 0 ? `\n# Previous Conversation Context\n${recentContext}\n` : ''}

# Your Task
Refine ONLY the sections mentioned above based on the user's feedback. 

Specific instructions per section:
${unsatisfiedSections.map(item => {
  const instructions = generateSectionInstructions(item.section, item.feedback);
  return `\n**${item.section}**:\n- Feedback: ${item.feedback}\n- Action: ${instructions}`;
}).join('\n')}

CRITICAL REMINDERS:
1. Keep all OTHER sections exactly as they are (do not modify sections marked satisfied: true)
2. Maintain the exact JSON structure
3. If removing content (like ETL), remove it from ALL related sections:
   - responsibilities array
   - skills array  
   - tools array
   - sample_week descriptions
4. If marking something as "nice to have", update the language in the relevant arrays
5. Ensure changes are cohesive and consistent across the document
6. Return the COMPLETE updated job description as valid JSON

Return ONLY the JSON object, no explanations or markdown.`;
}

// Generate specific instructions based on section and feedback
function generateSectionInstructions(section: string, feedback: string): string {
  const lowerFeedback = feedback.toLowerCase();
  
  if (lowerFeedback.includes('remove') || lowerFeedback.includes('delete')) {
    const toRemove = extractWhatToRemove(feedback);
    return `Remove all references to "${toRemove}" from the ${section} section and any related sections (responsibilities, skills, tools, sample_week).`;
  }
  
  if (lowerFeedback.includes('good to have') || lowerFeedback.includes('nice to have') || lowerFeedback.includes('optional')) {
    const skill = extractSkillName(feedback);
    return `Update the language to mark "${skill}" as optional/nice-to-have. Example: "Proficient in ${skill} (nice to have)" or "Bonus: Experience with ${skill}".`;
  }
  
  if (lowerFeedback.includes('focus more') || lowerFeedback.includes('emphasize')) {
    const focus = extractFocusArea(feedback);
    return `Increase emphasis on "${focus}" throughout the ${section} section. Add more detail and prominence.`;
  }
  
  if (lowerFeedback.includes('add') || lowerFeedback.includes('include')) {
    return `Add relevant content to the ${section} section based on the feedback: "${feedback}"`;
  }
  
  return `Modify the ${section} section according to: "${feedback}"`;
}

// Helper to extract what needs to be removed
function extractWhatToRemove(feedback: string): string {
  const patterns = [
    /remove (?:the )?(.+?)(?:\s+part|\s+can|\s+and|$)/i,
    /delete (?:the )?(.+?)(?:\s+part|\s+can|\s+and|$)/i,
  ];
  
  for (const pattern of patterns) {
    const match = feedback.match(pattern);
    if (match) return match[1].trim();
  }
  
  return 'specified content';
}

// Helper to extract skill name
function extractSkillName(feedback: string): string {
  const patterns = [
    /mark (?:the )?(.+?) (?:as|skills)/i,
    /(.+?) (?:as good to have|as nice to have)/i,
  ];
  
  for (const pattern of patterns) {
    const match = feedback.match(pattern);
    if (match) return match[1].trim();
  }
  
  return 'mentioned skills';
}

// Helper to extract focus area
function extractFocusArea(feedback: string): string {
  const patterns = [
    /focus more on (?:the )?(.+?)(?:\s+part|$)/i,
    /emphasize (?:the )?(.+?)(?:\s+part|$)/i,
  ];
  
  for (const pattern of patterns) {
    const match = feedback.match(pattern);
    if (match) return match[1].trim();
  }
  
  return 'specified area';
}

// Identify what changed between old and new JD
function identifyChanges(oldJD: any, newJD: any, refinements: Refinements): ChangeInfo[] {
  const changes: ChangeInfo[] = [];
  
  // Check each unsatisfied section
  Object.entries(refinements).forEach(([section, data]) => {
    if (!data.satisfied) {
      // Map refinement keys to JD structure
      const jdPaths = mapRefinementKeyToJDPath(section);
      
      // Check if any of the paths changed
      const pathsArray = Array.isArray(jdPaths) ? jdPaths : [jdPaths];
      
      pathsArray.forEach(jdPath => {
        if (hasChanged(oldJD, newJD, jdPath)) {
          changes.push({
            section: jdPath,
            refinementKey: section,
            feedback: data.feedback
          });
        }
      });
    }
  });
  
  return changes;
}

// Map refinement keys to actual JD paths
function mapRefinementKeyToJDPath(refinementKey: string): string | string[] {
  const mapping: Record<string, string | string[]> = {
    'role': 'roles[0].title',
    'outcomes': 'roles[0].core_outcomes',
    'responsibilities': 'roles[0].responsibilities',
    'skills-tools': ['roles[0].skills', 'roles[0].tools'],
    'skills': 'roles[0].skills',
    'tools': 'roles[0].tools',
    'kpis': 'roles[0].kpis',
    'service': 'service_recommendation.best_fit',
    'personality': 'roles[0].personality',
    'sample-week': 'roles[0].sample_week',
    'onboarding': 'onboarding_2w',
    'communication': 'roles[0].communication_norms',
    'overlap': 'roles[0].overlap_requirements'
  };
  
  return mapping[refinementKey] || refinementKey;
}

// Check if a specific path has changed
function hasChanged(oldObj: any, newObj: any, path: string): boolean {
  const oldValue = getNestedValue(oldObj, path);
  const newValue = getNestedValue(newObj, path);
  
  return JSON.stringify(oldValue) !== JSON.stringify(newValue);
}

// Get nested value from object using path string
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current: any, key: string) => {
    // Handle array notation like "roles[0]"
    const arrayMatch = key.match(/(\w+)\[(\d+)\]/);
    if (arrayMatch) {
      const [, arrayKey, index] = arrayMatch;
      return current?.[arrayKey]?.[parseInt(index)];
    }
    return current?.[key];
  }, obj);
}

// Generate a human-readable summary of changes
function generateChangeSummary(changedSections: ChangeInfo[], refinements: Refinements): string {
  if (changedSections.length === 0) {
    return "No changes were made to the job description.";
  }
  
  const summaries = changedSections.map(change => {
    const sectionName = change.refinementKey
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (c: string) => c.toUpperCase());
    return `• **${sectionName}**: ${change.feedback}`;
  });
  
  return `I've updated ${changedSections.length} section${changedSections.length > 1 ? 's' : ''} based on your feedback:\n\n${summaries.join('\n')}`;
}
