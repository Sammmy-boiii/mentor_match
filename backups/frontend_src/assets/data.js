import Mathematics from '../assets/subjects/mathematics.png'
import Science from '../assets/subjects/science.png'
import Commerce from '../assets/subjects/commerce.png'
import Computer from '../assets/subjects/computer.png'
import Languages from '../assets/subjects/languages.png'
import Arts from '../assets/subjects/arts.png'

import tutor1 from "../assets/tutor1.png"
import tutor2 from "../assets/tutor2.png"
import tutor3 from "../assets/tutor3.png"
import tutor4 from "../assets/tutor4.png"
import tutor5 from "../assets/tutor5.png"
import tutor6 from "../assets/tutor6.png"
import tutor7 from "../assets/tutor7.png"
import tutor8 from "../assets/tutor8.png"
import tutor9 from "../assets/tutor9.png"
import tutor10 from "../assets/tutor10.png"
import tutor11 from "../assets/tutor11.png"
import tutor12 from "../assets/tutor12.png"
import tutor13 from "../assets/tutor13.png"
import tutor14 from "../assets/tutor14.png"

// Blogs
import blog1 from "../assets/blogs/blog1.jpg"
import blog2 from "../assets/blogs/blog2.jpg"
import blog3 from "../assets/blogs/blog3.jpg"
import blog4 from "../assets/blogs/blog4.jpg"
import blog5 from "../assets/blogs/blog5.jpg"
import blog6 from "../assets/blogs/blog6.jpg"
import blog7 from "../assets/blogs/blog7.jpg"
import blog8 from "../assets/blogs/blog8.jpg"



export const subjectsData = [
  { name: 'AI' },
  { name: 'Data Analysis' },
  { name: 'UI-UX' },
  { name: 'Cybersecurity' },
  { name: 'Machine Learning' },
  { name: 'Digital Marketing' },
  { name: 'Graphic Design' },
  { name: 'Web Development' },
];


// Tutors data
  export const tutors = [
  {
    _id: 'tut1',
    name: 'Rahul Shah',
    image: tutor1,
    subject: 'AI',
    qualification: 'MSc Artificial Intelligence',
    experience: '5 Years',
    about:
      'Rahul specializes in Artificial Intelligence, focusing on deep learning and natural language processing. He teaches students how to build and train AI models, and emphasizes hands-on project development with real-world datasets.',
    fees: 200,
    location: {
      city: 'Kathmandu',
      country: 'Nepal',
    }
  },
  {
    _id: 'tut2',
    name: 'Adhit Upadhyay',
    image: tutor2,
    subject: 'Data Analysis',
    qualification: 'MSc Data Science',
    experience: '7 Years',
    about:
      'Adhit helps students master data analysis tools like Python, R, and SQL. His teaching focuses on data visualization, statistical analysis, and applying data-driven decision-making in real-world scenarios.',
    fees: 100,
    location: {
      city: 'Pokhara',
      country: 'Nepal'
    }
  },
  {
    _id: 'tut3',
    name: 'Saugat KC',
    image: tutor3,
    subject: 'UI-UX',
    qualification: 'BDes in Interaction Design',
    experience: '6 Years',
    about:
      'Saugat trains students in user-centered design, wireframing, and prototyping. His sessions include Figma and Adobe XD projects, emphasizing usability testing and creating designs that improve user experience.',
    fees: 150,
    location: {
      city: 'Butwal',
      country: 'Nepal'
    }
  },
  {
    _id: 'tut4',
    name: 'Bijay Shrestha',
    image: tutor4,
    subject: 'Cybersecurity',
    qualification: 'MSc Cybersecurity',
    experience: '8 Years',
    about:
      'Bijay covers network security, ethical hacking, and penetration testing. His lessons include practical labs where students learn to secure systems, prevent cyber attacks, and analyze vulnerabilities.',
    fees: 100,
    location: {
      city: 'Jhapa',
      country: 'Nepal'
    }
  },
  {
    _id: 'tut5',
    name: 'Rachit Regmi',
    image: tutor5,
    subject: 'Machine Learning',
    qualification: 'PhD in Machine Learning',
    experience: '10 Years',
    about:
      'Rachit teaches core machine learning algorithms and advanced concepts like reinforcement learning. He guides students in building predictive models and applying ML in fields like healthcare and finance.',
    fees: 100,
    location: {
      city: 'Butwal',
      country: 'Nepal'
    }
  },
  {
    _id: 'tut6',
    name: 'Kritish Chapagain',
    image: tutor6,
    subject: 'Digital Marketing',
    qualification: 'MBA in Digital Marketing',
    experience: '5 Years',
    about:
      'Kritish specializes in SEO, social media marketing, and Google Ads. His approach combines analytics with creativity, teaching students how to design and run impactful digital campaigns.',
    fees: 100,
    location: {
      city: 'Bhaktapur',
      country: 'Nepal'
    }
  },
  {
    _id: 'tut7',
    name: 'Bipin Bartaula',
    image: tutor7,
    subject: 'Graphic Design',
    qualification: 'BA Graphic Design',
    experience: '6 Years',
    about:
      'Bipin helps students master tools like Photoshop, Illustrator, and InDesign. He focuses on branding, typography, and visual storytelling to create professional designs for print and digital media.',
    fees: 150,
    location: {
      city: 'Chitwan',
      country: 'Nepal'
    }
  },  
  {
    _id: 'tut8',
    name: 'Sameer Nepal',
    image: tutor8,
    subject: 'Web Development',
    qualification: 'BSc Computer Science',
    experience: '6 Years',
    about:
      'Sameer teaches full-stack web development with React, Node.js, and MongoDB. His sessions focus on building real-world applications, API integration, and deployment best practices.',
    fees: 200,
    location: {
      city: 'Chautara',
      country: 'Nepal'
    }
  },
  {
    _id: 'tut9',
    name: 'William Walker',
    image: tutor9,
    subject: 'Data Analysis',
    qualification: 'BSc Statistics',
    experience: '5 Years',
    about:
      'William trains students to analyze and interpret data using tools like Excel and Power BI. He emphasizes real-life applications of data in business, economics, and research.',
    fees: 100,
    location: {
      city: 'Janakpur',
      country: 'Nepal'
    }
  },
  {
    _id: 'tut10',
    name: 'Jennifer Lewis',
    image: tutor10,
    subject: 'UI-UX',
    qualification: 'MSc Human-Computer Interaction',
    experience: '9 Years',
    about:
      'Jennifer teaches design thinking, accessibility, and advanced prototyping. She has guided students in creating portfolio-ready projects that combine creativity with usability.',
    fees: 200,
    location: {
      city: 'Dhangadhi',
      country: 'Nepal'
    }
  },
  {
    _id: 'tut11',
    name: 'Christopher Allen',
    image: tutor11,
    subject: 'AI',
    qualification: 'PhD in Artificial Intelligence',
    experience: '12 Years',
    about:
      'Christopher is an expert in computer vision and robotics. He helps students understand advanced AI techniques and prepares them for research and industry projects.',
    fees: 300,
    location: {
      city: 'Nepalgunj',
      country: 'Nepal'
    }
  },
  {
    _id: 'tut12',
    name: 'Barbara Hall',
    image: tutor12,
    subject: 'Graphic Design',
    qualification: 'MDes Graphic Communication',
    experience: '7 Years',
    about:
      'Barbara teaches creative design and branding. She focuses on combining aesthetics with functionality, encouraging students to develop their unique design style.',
    fees: 180,
    location: {
      city: 'Lalitpur',
      country: 'Nepal'
    }
  },
  {
    _id: 'tut13',
    name: 'Thomas Hernandez',
    image: tutor13,
    subject: 'Cybersecurity',
    qualification: 'BSc Information Security',
    experience: '6 Years',
    about:
      'Thomas trains students in risk assessment, cryptography, and secure coding. His lessons emphasize practical defense techniques to safeguard systems against cyber threats.',
    fees: 200,
    location: {
      city: 'Birgunj',
      country: 'Nepal'
    }
  },
  {
    _id: 'tut14',
    name: 'Elizabeth Young',
    image: tutor14,
    subject: 'Web Development',
    qualification: 'MSc Software Engineering',
    experience: '8 Years',
    about:
      'Elizabeth focuses on front-end and back-end web technologies. She teaches students how to build scalable applications with React, Node.js, and cloud hosting platforms.',
    fees: 250,
    location: {
      city: 'Ilam',
      country: 'Nepal'
    }
  },
];




export const blogs = [
  { title: "Top Study Tips for Online Learners", category: "Productivity", image: blog1 },
  { title: "Latest Trends in Online Education 2025", category: "E-Learning", image: blog2 },
  { title: "How to Find the Right Online Tutor", category: "Tutoring", image: blog3 },
  { title: "Why Online Tutoring is the Future of Learning", category: "EdTech", image: blog4 },
  { title: "Smart Learning Strategies for Students", category: "Study Skills", image: blog5 },
  { title: "Emerging Innovations in Digital Classrooms 2025", category: "Technology", image: blog6 },
  { title: "Best Online Learning Platforms in 2025", category: "Resources", image: blog7 },
  { title: "How Virtual Tutoring is Transforming Education", category: "Online Learning", image: blog8 }
];

