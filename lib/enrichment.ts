import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

type OpenAIResult = {
  result: string | null;
  confidence: number;
  reasoning: string;
  stepsTaken: string[];
};

type EnrichLeadResult = {
  ownerName: string;
  ownerConfidence: number;
  ownerReasoning: string;
  ownerStepsTaken: string[];
  source: string;
  email: string;
  linkedinUrl: string;
  facebookUrl: string;
  instagramUrl: string;
  emailVerified: boolean;
};

function hasFirstAndLastName(name: string): boolean {
  if (!name) return false;
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2;
}

export async function enrichLead(lead: any): Promise<EnrichLeadResult> {
  const domain = lead.website || '';
  const prompt = `#CONTEXT#\n\nYou are an AI agent tasked with identifying the owner of a small or local business by researching publicly available online sources.\n\nYour goal is to extract the **owner's full name (first and last)** with **90% or greater confidence** using the company's website and associated online presence.\n\n---\n\n#OBJECTIVE#\n\nGiven a company website, find and return the first and last name of the **owner, founder, or person in charge**, based on the most trustworthy information available.\n\n---\n\n#INSTRUCTIONS#\n\n1. Start by visiting the domain: ${domain}.\n2. Look for any page or section that mentions a person with a title like: "owner", "founder", "CEO", "president", "managing director", etc.\n3. If the website doesn't provide this, search LinkedIn or Google for "[company name] owner site:linkedin.com".\n4. If LinkedIn fails, search Facebook for individuals associated with the business and check for ownership context.\n5. If no high-confidence match is found, return null.\n\n---\n\n#OUTPUT FORMAT#\n\nReturn a **valid JSON object** with the following keys:\n\n{\n  "result": "First Last",\n  "confidence": 0.95,\n  "reasoning": "Found matching LinkedIn profile with title 'owner' at this business.",\n  "stepsTaken": [\n    "Visited homepage: ${domain}",\n    "Found no owner name on About or Contact page",\n    "Searched Google for LinkedIn owner match",\n    "Found match: Jane Smith, Owner at Blue Parrot"\n  ]\n}\n\nIf no confident match is found, return:\n\n{\n  "result": null,\n  "confidence": 0,\n  "reasoning": "No high-confidence match found across site or LinkedIn.",\n  "stepsTaken": [ ... ]\n}\n\n#REQUIREMENTS#\n\nResult must only be returned if confidence is ≥ 0.90\n\nThe reasoning must explain how the name was verified\n\nDo not guess or fabricate names\n\nDo not invent titles not explicitly found\n\nDo not return placeholder values like "John Doe"\n\n#INPUT EXAMPLE#\n\nDomain: ${domain}\n\n#OUTPUT EXAMPLE#\n\n{\n  "result": "Andrew Smith",\n  "confidence": 0.95,\n  "reasoning": "Found on LinkedIn as the owner of Lake Mountain Coffee.",\n  "stepsTaken": [\n    "Visited website: lakemountaincoffee.com",\n    "Searched LinkedIn: 'Lake Mountain Coffee owner'",\n    "Found LinkedIn profile: Andrew Smith, Owner"\n  ]\n}\n`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert at extracting business owner information. Follow the instructions and output format exactly. Do not fabricate data.'
        },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' }
    });
    const content = response.choices[0].message.content;
    if (typeof content !== 'string') {
      throw new Error('OpenAI response content is null or not a string');
    }
    const result: OpenAIResult = JSON.parse(content);
    const ownerName: string = typeof result.result === 'string' ? result.result : '';
    const confidence: number = typeof result.confidence === 'number' ? result.confidence : 0;
    const reasoning: string = result.reasoning ?? '';
    const stepsTaken: string[] = Array.isArray(result.stepsTaken) ? result.stepsTaken : [];

    if (ownerName && confidence >= 0.9 && hasFirstAndLastName(ownerName)) {
      return {
        ownerName,
        ownerConfidence: confidence,
        ownerReasoning: reasoning,
        ownerStepsTaken: stepsTaken,
        source: 'openai',
        email: '',
        linkedinUrl: '',
        facebookUrl: '',
        instagramUrl: '',
        emailVerified: false
      };
    }
    return {
      ownerName: '',
      ownerConfidence: confidence,
      ownerReasoning: reasoning,
      ownerStepsTaken: stepsTaken,
      source: 'openai',
      email: '',
      linkedinUrl: '',
      facebookUrl: '',
      instagramUrl: '',
      emailVerified: false
    };
  } catch (error) {
    return {
      ownerName: '',
      ownerConfidence: 0,
      ownerReasoning: 'OpenAI error',
      ownerStepsTaken: [],
      source: 'openai_error',
      email: '',
      linkedinUrl: '',
      facebookUrl: '',
      instagramUrl: '',
      emailVerified: false
    };
  }
} 