// Sample program content for Firebase Firestore
const programContent = {
  prevention_promotion: [
    {
      id: "early-childhood-education",
      title: "Early Childhood Education Program",
      category: "prevention-promotion",
      excerpt: "Providing quality early education to vulnerable children aged 3-6 years to build a strong foundation for their future.",
      coverImage: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9",
      objectives: [
        "Ensure access to quality early childhood education for vulnerable children",
        "Develop cognitive, social, and emotional skills through play-based learning",
        "Support school readiness and successful transition to primary education",
        "Engage parents and caregivers in children's early development"
      ],
      content: [
        {
          _type: 'block',
          children: [
            {
              _type: 'span',
              text: 'Our Early Childhood Education Program focuses on providing comprehensive early learning opportunities to children from vulnerable communities. Through a combination of structured activities and free play, we help children develop essential skills for their future academic success.'
            }
          ]
        }
      ],
      published: true,
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    {
      id: "community-awareness",
      title: "Community Awareness and Education",
      category: "prevention-promotion",
      excerpt: "Empowering communities with knowledge and resources to prevent child abuse and promote child rights.",
      coverImage: "https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8",
      objectives: [
        "Raise awareness about child rights and protection",
        "Build community capacity to prevent child abuse",
        "Promote positive parenting practices",
        "Strengthen community-based child protection mechanisms"
      ],
      content: [
        {
          _type: 'block',
          children: [
            {
              _type: 'span',
              text: 'Through our Community Awareness and Education program, we work directly with communities to build their capacity to protect children. Our approach combines educational workshops, community dialogues, and practical training sessions.'
            }
          ]
        }
      ],
      published: true,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
  ],
  protection: [
    {
      id: "emergency-response",
      title: "Emergency Response and Support",
      category: "protection",
      excerpt: "Providing immediate assistance and protection to children in crisis situations.",
      coverImage: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b",
      objectives: [
        "Provide immediate emergency response to children in crisis",
        "Ensure safe temporary shelter and basic necessities",
        "Offer psychological first aid and counseling",
        "Coordinate with authorities and service providers"
      ],
      content: [
        {
          _type: 'block',
          children: [
            {
              _type: 'span',
              text: 'Our Emergency Response and Support program provides immediate intervention for children facing crisis situations. We maintain a 24/7 response team ready to provide shelter, food, medical care, and psychological support to children in need.'
            }
          ]
        }
      ],
      published: true,
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    {
      id: "legal-support",
      title: "Legal Support and Advocacy",
      category: "protection",
      excerpt: "Providing legal assistance and advocacy for children's rights and protection.",
      coverImage: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f",
      objectives: [
        "Provide legal representation for children in need",
        "Advocate for child-friendly justice systems",
        "Support victims of abuse through legal proceedings",
        "Strengthen legal frameworks for child protection"
      ],
      content: [
        {
          _type: 'block',
          children: [
            {
              _type: 'span',
              text: 'The Legal Support and Advocacy program works to ensure that children's rights are protected through legal means. We provide direct legal representation and work to improve the legal framework for child protection.'
            }
          ]
        }
      ],
      published: true,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
  ],
  rehabilitation: [
    {
      id: "psychological-support",
      title: "Psychological Support and Counseling",
      category: "rehabilitation",
      excerpt: "Providing comprehensive mental health support to help children recover from trauma.",
      coverImage: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846",
      objectives: [
        "Provide trauma-informed counseling services",
        "Support emotional healing and resilience building",
        "Facilitate group therapy sessions",
        "Train caregivers in trauma-informed care"
      ],
      content: [
        {
          _type: 'block',
          children: [
            {
              _type: 'span',
              text: 'Our Psychological Support and Counseling program offers comprehensive mental health services to help children recover from traumatic experiences. We use evidence-based approaches to support healing and build resilience.'
            }
          ]
        }
      ],
      published: true,
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    {
      id: "skills-development",
      title: "Skills Development and Education",
      category: "rehabilitation",
      excerpt: "Empowering children with practical skills and education for a better future.",
      coverImage: "https://images.unsplash.com/photo-1509062522246-3755977927d7",
      objectives: [
        "Provide vocational training opportunities",
        "Support formal education reintegration",
        "Develop life skills and self-sufficiency",
        "Create pathways to employment"
      ],
      content: [
        {
          _type: 'block',
          children: [
            {
              _type: 'span',
              text: 'The Skills Development and Education program focuses on providing practical skills and educational opportunities to help children build a sustainable future. We combine vocational training with life skills development.'
            }
          ]
        }
      ],
      published: true,
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    {
      id: "family-reunification",
      title: "Family Reunification and Support",
      category: "rehabilitation",
      excerpt: "Helping children reconnect with their families and communities safely.",
      coverImage: "https://images.unsplash.com/photo-1511895426328-dc8714191300",
      objectives: [
        "Facilitate safe family reunification",
        "Provide family counseling and support",
        "Monitor post-reunification progress",
        "Strengthen family support systems"
      ],
      content: [
        {
          _type: 'block',
          children: [
            {
              _type: 'span',
              text: 'Our Family Reunification and Support program works to safely reunite children with their families when possible. We provide comprehensive support services to ensure successful reintegration and family strengthening.'
            }
          ]
        }
      ],
      published: true,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
  ]
};

// Export for Firebase upload
module.exports = programContent;
