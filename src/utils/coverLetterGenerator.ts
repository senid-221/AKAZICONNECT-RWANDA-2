import { Job } from '../types';

export interface CoverLetterForm {
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  applicantLocation: string;
  highestDegree: string;
  yearsOfExperience: string;
  keyHighlights: string;
  customNotes?: string;
}

export function generateRwandanCoverLetter(job: Job, form: CoverLetterForm): string {
  const today = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  const locationText = form.applicantLocation || 'Kigali, Rwanda';
  const name = form.applicantName || 'Amara Mukamana';
  const email = form.applicantEmail || 'amara.mukamana@example.rw';
  const phone = form.applicantPhone || '+250 788 123 456';
  const degree = form.highestDegree || 'Bachelor’s Degree in related field';
  const years = form.yearsOfExperience || (job.experience ? job.experience.replace(/[^0-9]/g, '') || '3' : '3');
  const highlights = form.keyHighlights || (job.keySkills ? job.keySkills.join(', ') : 'strong analytical, interpersonal, and execution competencies');

  return `${name}
${locationText}
Tel: ${phone}
Email: ${email}

${today}

To:
The Head of Human Resources / Recruitment Panel
${job.company}
${job.district || job.location || 'Kigali, Rwanda'}

SUBJECT: APPLICATION FOR THE POSITION OF ${job.title.toUpperCase()}

Dear Hiring Committee,

I am writing to respectfully submit my application for the position of ${job.title} at ${job.company}, as officially announced. Having closely followed ${job.company}’s impact and leadership within ${job.sector || 'the sector in Rwanda'}, I am enthusiastic about the opportunity to contribute my skills and dedication to your continued success.

I hold a ${degree} and bring over ${years} years of demonstrated professional experience. My background closely aligns with the requirements outlined in your vacancy announcement${job.experience ? ` (including ${job.experience})` : ''}. In my previous responsibilities, I have developed strong proficiency in ${highlights}.

Specifically, regarding the role at ${job.company}:
- I offer proven execution capability in demanding operational environments in Rwanda.
- I am committed to upholding high standards of compliance, efficiency, and organizational excellence.
- I communicate effectively in English and Kinyarwanda${job.categories.includes('Tech & digital') ? ', paired with modern technical workflows.' : '.'}

${job.summary}

Enclosed with this letter, please find my updated Curriculum Vitae, certified copies of academic credentials, and references as requested in your application guidelines. I would welcome the opportunity to discuss in an interview how my background, work ethic, and dedication can support ${job.company}’s institutional goals.

Thank you very much for your time, consideration, and service to Rwanda.

Yours faithfully,

${name}
Applicant for ${job.title}`;
}
