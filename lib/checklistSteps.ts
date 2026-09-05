export interface ChecklistStep {
  id: string;
  title: string;
  description: string;
  linkLabel?: string;
  linkHref?: string;
}

export const CHECKLIST_STEPS: ChecklistStep[] = [
  {
    id: "gather-details",
    title: "Gather your personal details",
    description:
      "Have your National Insurance number, full name history (including maiden names), and date of birth ready — providers and schemes need these to find you.",
  },
  {
    id: "list-employers",
    title: "List every employer you've worked for",
    description:
      "Write down each employer and roughly when you worked there. Old payslips, P60s, offer letters, or your CV can help jog your memory.",
  },
  {
    id: "check-paperwork",
    title: "Search for old pension paperwork",
    description:
      "Look for welcome packs, annual statements, or emails from pension providers at home or in old inboxes. These often name the scheme directly.",
  },
  {
    id: "trace-service",
    title: "Use the free Pension Tracing Service",
    description:
      "The UK government's free service finds contact details for workplace and personal pension schemes, using just an employer or provider name.",
    linkLabel: "Open the Pension Tracing Service",
    linkHref: "https://www.gov.uk/find-pension-contact-details",
  },
  {
    id: "contact-employers",
    title: "Contact former employers' HR teams",
    description:
      "Ask which workplace pension scheme(s) they used while you worked there, and for the scheme's contact details.",
  },
  {
    id: "contact-providers",
    title: "Contact pension providers directly",
    description:
      "Once you know a scheme or provider name, contact them with your NI number and employment dates to check for a pot in your name.",
  },
  {
    id: "moneyhelper",
    title: "Get extra help from MoneyHelper",
    description:
      "MoneyHelper is a free, government-backed guidance service that can help if you're stuck, including with very old or defined benefit schemes.",
    linkLabel: "MoneyHelper: find a lost pension",
    linkHref:
      "https://www.moneyhelper.org.uk/en/pensions-and-retirement/pension-problems/find-a-lost-pension",
  },
  {
    id: "add-to-dashboard",
    title: "Add anything you find to your dashboard",
    description:
      "Once you've confirmed a pot exists, add it to your pension dashboard so it's tracked alongside the rest.",
  },
];
