
      /*#######.
     ########",#:
   #########',##".
  ##'##'## .##',##.
   ## ## ## # ##",#.
    ## ## ## ## ##'
     ## ## ## :##
      ## ## ##*/

/**
 * Remove left padding on multiline-text
 */
export const paddedText = ([text]: TemplateStringsArray) =>
  text
    .replace(/^\n/, '')
    .replace(/\n\s+$/, '')
    .replace(/^\s+\|/gm, '');

export const cv = {
  firstName: 'Chris',
  lastName: 'Feijoo',
  job: 'Software Engineer',
  birth: {
    year: 1990,
    month: 11,
    day: 13,
    city: 'Carcassonne',
    country: 'France'
  },
  address: {
    number: 89,
    street: 'rue Andy Warhol',
    postalCode: '34000',
    city: 'Montpellier',
    country: 'France'
  },
  website: 'www.kube.io',
  mail: {
    user: 'chris',
    domain: 'kube.io'
  },
  phone: '0625970771',

  languages: ['TypeScript', 'JavaScript', 'Rust', 'C', 'Ruby', 'C++'],
  frameworks: ['Svelte', 'React', 'GraphQL', 'Electron', 'NodeJS', 'Webpack'],
  tools: ['VS Code', 'Observable', 'Sketch', 'Framer', 'Photoshop', 'Keynote'],
  hobbies: ['Guitar', 'Running', 'Graphic Design'],

  social: [
    {
      platform: 'GitHub',
      link: 'github.com/kube'
    },
    {
      platform: 'StackOverflow',
      link: 'stackoverflow.com/users/1914206/kube'
    },
    {
      platform: 'Twitter',
      link: 'twitter.com/KubeKhrm'
    }
  ],

  cursus: [
    {
      date: 2016,
      title: 'HEC',
      place: 'Paris',
      subtitle: 'Digital Entrepreneur Track',
      url: 'https://www.hec.fr/'
    },
    {
      date: '2013-2016',
      title: '42',
      place: 'Paris',
      subtitle: 'Software Engineering',
      url: 'https://www.42.fr'
    },
    {
      date: '2010-2012',
      title: 'Faculty of Science of Luminy',
      place: 'Marseille',
      subtitle: 'Computer Science and Mathematics',
      url: 'https://www.google.fr/maps/place/Faculté+des+sciences+de+Luminy/@43.2438261,5.4335531,824a,35y,150.32h,64.64t/data=!3m1!1e3!4m5!3m4!1s0x12c9b9adb8f06c67:0x909b2f1ed0fb048b!8m2!3d43.2314739!4d5.4396339'
    },
    {
      date: '2005-2009',
      title: 'Lycée Alexandra David-Neel',
      place: 'Digne',
      subtitle: 'Scientific Baccalauréat — European Mention',
      url: 'https://www.google.fr/maps/place/Lyc%C3%A9e+Mixte+Alexandra+David+Neel/@44.0923114,6.2257472,318a,35y,23.75h,75.87t/data=!3m1!1e3!4m5!3m4!1s0x12afc9370459f165:0x74d88d1bf6fd9dfd!8m2!3d44.1002528!4d6.2333813'
    }
  ],

  work: [
    {
      date: 'Since April 2015',
      title: 'kube.io',
      subtitle: 'Freelance Software Engineer',
      description: [
        'Frontend & backend web/desktop JavaScript app development.'
      ],
      stack: [
        'TypeScript',
        'React',
        'Redux',
        'NodeJS',
        'GraphQL',
        'Electron',
        'Framer X',
        'Sketch'
      ]
    },
    {
      date: 'Mar 2021 Mar 2023',
      title: 'TheFork',
      place: 'France',
      subtitle: 'Software Engineer',
      url: 'https://thefork.com',
      description: [
        'Worked in Restaurant Experience (B2B).',
        'Enhancements and maintainance of Floorplan, which allows restaurants to manage their tables and reservations.',
        'Initiated the VirtualMode project on TFM Front, allowing to run the frontend in isolation, with Virtual API, Storage and Environment, and powerful system of factories to test any state in a few lines of description.',
        'Worked on multiple purely technical projects like:',
        '- Automatic code migrations using JSCodeShift',
        '- Frontend Architecture based on React Contexts, to make it easily testable',
        '- Cleaning and Simplification of the GraphQL Schema, to make it more conventional.'
      ],
      stack: [
        'TypeScript',
        'NodeJS',
        'React',
        'Storybook',
        'GraphQL',
        'Apollo',
        'PostgreSQL'
      ]
    },
    {
      date: 'Oct-Aug 2020',
      title: 'Tinyclues',
      place: 'Paris',
      subtitle: 'Software Engineer',
      url: 'https://www.tinyclues.com',
      description: [
        'Worked in Clapps (Client Applications) Team, on the NAF (New Action Foundation) Project.',
        'We rebuilt the main application (Action) from scratch, with new UX, and using an up-to-date stack.',
        'Clean Architecture was used with NestJS on the Backend-side, React on the Frontend, and GraphQL for the API.'
      ],
      stack: [
        'TypeScript',
        'GraphQL',
        'Apollo',
        'React',
        'Node.JS',
        'NestJS',
        'PostgreSQL',
        'AWS Step Functions'
      ]
    },
    {
      date: 'Apr-Aug 2019',
      title: 'Contentsquare',
      place: 'Paris',
      subtitle: 'Software Engineer',
      url: 'https://www.contentsquare.com',
      description: [
        'Worked in U2 Team, in charge of transversal projects (Authentication, Backoffice, Public API, Integrations).',
        'Worked on new Public API: Authentication, Quota Limiter, Throttling (Concurrent Calls and Rate Limiter).',
        'Worked on Login Application, allowing internal and external services to connect using Contentsquare account.',
        'Decentralization of authentication using JWKS.'
      ],
      stack: [
        'TypeScript',
        'Node.JS',
        'NestJS',
        'Vue',
        'Angular',
        'PostgreSQL',
        'SAML'
      ]
    },
    {
      date: 'Dec-Feb 2019',
      title: 'Iziwork',
      place: 'Paris',
      subtitle: 'Backend Software Engineer',
      url: 'https://www.iziwork.com',
      description: [
        'Automation of Timesheets Upload and Extraction for Billing and Payments.',
        'Automation of CV Parsing Data Extraction, for matching workers with companies.',
        'Setup Unit/E2E Testing environment, and various refactorings.'
      ],
      stack: ['Flowtype', 'Node.JS', 'MongoDB', 'Parse', 'Jest']
    },
    {
      date: 'September 2018',
      title: 'Bazimo',
      place: 'Montpellier',
      subtitle: 'Frontend Software Engineer',
      url: 'https://www.bazimo.fr',
      description: [
        'Development of new Document Explorer Panel, which centralizes upload and view of all kind of documents in a single view.',
        'Setup TypeScript, Build Process Improvements.'
      ],
      stack: ['AngularJS', 'TypeScript', 'REST']
    },
    {
      date: 'Aug-Feb 2018',
      title: 'Teads',
      place: 'Montpellier',
      subtitle: 'Software Engineer – Format Team',
      url: 'https://www.teads.tv',
      description: [
        'Format Team develops the Ad Player.',
        'Worked on Video/Display Players, Trackings and A/B Tests.',
        'Prepared codebase migration to modular JavaScript using Webpack, and various TypeScript enhancements.'
      ],
      stack: [
        'TypeScript',
        'VAST',
        'VPAID',
        'Display',
        'Tracking',
        'Viewability',
        'Webpack',
        'A/B Testing',
        'Scala',
        'Spark',
        'Jupyter Notebooks'
      ]
    },
    {
      date: '2017',
      title: 'PandaNote',
      subtitle: 'Code/UI/UX',
      url: 'https://github.com/Pandanote/Releases',
      description: [
        'PandaNote was a minimalist desktop editor destinated to students to build synthesis note from their courses.',
        'It featured a Test mode permitting to test knowledge on a document.'
      ],
      stack: ['TypeScript', 'React', 'Redux', 'Electron', 'DraftJS']
    },
    {
      date: '2017',
      title: '42',
      place: 'Paris',
      subtitle: 'JavaScript Bootcamp Author',
      url: 'http://www.42.fr/',
      description: [
        'Piscines are two-weeks intensive courses where 42 students discover new concepts/languages with videos and exercises.',
        'First week introduced all base concepts of JavaScript and TypeScript.',
        'The second week was about web/desktop app development using React/Redux/Electron.'
      ],
      stack: [
        'JavaScript',
        'TypeScript',
        'NodeJS',
        'CommonJS',
        'ES Modules',
        'Object-Oriented Programming',
        'Functional Programming',
        'Asynchronous/Event-Driven Programming',
        'React',
        'Redux',
        'Electron',
        'Webpack',
        'Unit Testing',
        'Jest'
      ]
    },
    {
      date: 'Jan-May 2016',
      title: 'DotID',
      place: 'HEC Digital Entrepreneur, Paris',
      subtitle: 'Co-founder',
      description: [
        'DotId was a project of a mobile password-less authentication system, we worked on with two other 42 students.',
        'Our goal was to provide the easiest and most secure way to connect anywhere.',
        'We participated to the 2nd edition of the HEC/42 Startup Launchpad, which helps students create their startup during a 2 months practice-based course.'
      ],
      stack: [
        'Startup Creation',
        'Marketing',
        'Business Model',
        'C',
        'JavaScript',
        'TypeScript',
        'NodeJS',
        'Swift',
        'AES',
        'RSA',
        'PAM Modules'
      ]
    },
    {
      date: 'Sept-Dec 2014',
      title: 'PopChef',
      place: 'Paris',
      subtitle: 'Software Engineer Intern',
      url: 'https://www.eatpopchef.com',
      description: [
        'We worked as two engineers with the then-CTO to build the entire frontend & backend of the Food-Delivery application.'
      ],
      stack: ['JavaScript', 'AngularJS', 'NodeJS', 'SQL']
    },
    {
      date: 'Summer 2008',
      title: 'XSalto',
      place: 'Digne',
      subtitle: 'Graphic Designer / Integrator',
      url: 'http://www.xsalto.com/',
      description: [
        'During Summer 2008, I had the opportunity to work as a Web Designer at XSalto.',
        'I worked on websites like Vallée de la Blanche, Tignes and Pra-Loup Ski Resorts.'
      ],
      stack: ['Photoshop', 'Fireworks', 'HTML', 'CSS', 'Flash']
    }
  ]
};
