import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Users, MapPin, Target, Clock, CheckCircle, Send, AlertCircle } from 'lucide-react';
import { sendEmail, formatProjectApplicationEmail, formatProjectApplicationConfirmationEmail } from '../utils/emailService';
import { db } from '../config/firebase';
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { ProjectSubmission } from '../types/submissions';

const ProjectDetail = () => {
  const { id } = useParams();
  const [showApplication, setShowApplication] = useState(false);
  const [project, setProject] = useState<ProjectSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [applicationData, setApplicationData] = useState({
    name: '',
    email: '',
    phone: '',
    experience: '',
    motivation: '',
    preferredRole: '',
    availability: '',
    skills: [] as string[],
    languageProficiency: [] as string[],
    transportAvailable: false,
    equipment: [] as string[],
    accessibilityNeeds: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    consentLiability: false,
    consentPhoto: false,
    consentBackgroundCheck: false,
  });

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const projectRef = doc(db, 'project_submissions', id);
        const projectSnap = await getDoc(projectRef);

        if (projectSnap.exists()) {
          const data = projectSnap.data();
          setProject({
            id: projectSnap.id,
            ...data
          } as ProjectSubmission);
        }
      } catch (error) {
        console.error('Error fetching project:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  const staticProjects = {
    '1': {
      title: 'Education Support Program',
      description: 'Providing educational resources and tutoring support to underprivileged students in local communities.',
      category: 'education',
      status: 'ongoing',
      participants: 45,
      location: 'Karachi',
      startDate: 'March 2024',
      endDate: 'December 2024',
      applicationDeadline: 'April 30, 2024',
      image: 'https://images.pexels.com/photos/289737/pexels-photo-289737.jpeg?auto=compress&cs=tinysrgb&w=800',
      aims: [
        'Improve literacy rates among underprivileged children',
        'Provide quality educational resources and materials',
        'Establish sustainable tutoring programs',
        'Bridge the educational gap in underserved communities'
      ],
      objectives: [
        'Reach 200+ students across 5 schools',
        'Establish 10 community learning centers',
        'Train 50 volunteer tutors',
        'Distribute 1000+ educational kits'
      ],
      overview: 'This comprehensive education support program focuses on providing quality educational opportunities to children in underserved communities. We work directly with local schools and community centers to establish tutoring programs, distribute educational materials, and create sustainable learning environments. Our volunteers work one-on-one with students, helping them with homework, reading skills, and exam preparation.',
      activities: [
        'One-on-one tutoring sessions',
        'Group study circles',
        'Educational material distribution',
        'Parent engagement workshops',
        'Teacher training programs',
        'Digital literacy classes'
      ],
      requirements: [
        'Minimum high school education',
        'Good communication skills in Urdu/English',
        'Commitment of at least 4 hours per week',
        'Patience and enthusiasm for teaching',
        'Background check clearance'
      ],
      schedule: 'Weekdays: 4:00 PM - 7:00 PM, Weekends: 10:00 AM - 2:00 PM',
      coordinator: 'Ms. Fatima Khan - Education Program Manager',
      contact: 'education@wasilah.org | +92 XXX XXXXXXX'
    },
    '2': {
      title: 'Community Health Awareness',
      description: 'Organizing health camps and awareness sessions about preventive healthcare in rural areas.',
      category: 'health',
      status: 'completed',
      participants: 120,
      location: 'Lahore',
      startDate: 'January 2024',
      endDate: 'March 2024',
      applicationDeadline: 'Completed',
      image: 'https://images.pexels.com/photos/3938023/pexels-photo-3938023.jpeg?auto=compress&cs=tinysrgb&w=800',
      aims: [
        'Increase health awareness in rural communities',
        'Provide free basic health screenings',
        'Promote preventive healthcare practices',
        'Connect communities with healthcare resources'
      ],
      objectives: [
        'Conduct health camps in 15 villages',
        'Screen 2000+ individuals for basic health issues',
        'Distribute health education materials',
        'Train 30 community health volunteers'
      ],
      overview: 'Our Community Health Awareness project successfully brought essential healthcare services to remote rural areas around Lahore. We organized mobile health camps, conducted free screenings, and educated communities about preventive healthcare measures. The project included vaccination drives, maternal health sessions, and chronic disease management workshops.',
      activities: [
        'Mobile health camps',
        'Free health screenings',
        'Vaccination drives',
        'Health education workshops',
        'Maternal health sessions',
        'Chronic disease management training'
      ],
      requirements: [
        'Medical/nursing background preferred',
        'First aid certification',
        'Ability to work in rural settings',
        'Multilingual communication skills',
        'Physical fitness for field work'
      ],
      schedule: 'Project completed successfully in March 2024',
      coordinator: 'Dr. Ahmed Hassan - Health Program Director',
      contact: 'health@wasilah.org | +92 XXX XXXXXXX',
      results: [
        'Reached 2,500+ individuals across 18 villages',
        'Conducted 1,800+ health screenings',
        'Distributed 3,000+ health education pamphlets',
        'Trained 35 community health volunteers',
        'Identified and referred 150+ cases for specialized care'
      ]
    },
    '3': {
      title: 'Clean Water Initiative',
      description: 'Installing water filtration systems and promoting water conservation practices in underserved communities.',
      category: 'environment',
      status: 'ongoing',
      participants: 78,
      location: 'Islamabad',
      startDate: 'February 2024',
      endDate: 'August 2024',
      applicationDeadline: 'May 15, 2024',
      image: 'https://images.pexels.com/photos/1139556/pexels-photo-1139556.jpeg?auto=compress&cs=tinysrgb&w=800',
      aims: [
        'Provide access to clean drinking water',
        'Install sustainable water filtration systems',
        'Educate communities about water conservation',
        'Reduce waterborne diseases'
      ],
      objectives: [
        'Install 25 water filtration systems',
        'Serve 5,000+ community members',
        'Conduct 50+ water conservation workshops',
        'Train 40 local maintenance technicians'
      ],
      overview: 'The Clean Water Initiative addresses the critical need for safe drinking water in underserved communities around Islamabad. We install advanced water filtration systems, conduct maintenance training, and educate communities about water conservation practices. The project focuses on sustainable solutions that communities can maintain independently.',
      activities: [
        'Water quality testing and assessment',
        'Installation of filtration systems',
        'Community education workshops',
        'Maintenance training programs',
        'Water conservation awareness campaigns',
        'Regular system monitoring and maintenance'
      ],
      requirements: [
        'Technical background in plumbing/engineering preferred',
        'Physical ability for installation work',
        'Community engagement skills',
        'Basic understanding of water systems',
        'Commitment to project duration'
      ],
      schedule: 'Monday-Friday: 8:00 AM - 4:00 PM, Saturdays: 9:00 AM - 1:00 PM',
      coordinator: 'Eng. Omar Sheikh - Environmental Projects Lead',
      contact: 'environment@wasilah.org | +92 XXX XXXXXXX'
    },
    '4': {
      title: 'Digital Literacy Workshop',
      description: 'Teaching basic computer and internet skills to senior citizens and helping them connect with digital services.',
      category: 'technology',
      status: 'planning',
      participants: 25,
      location: 'Faisalabad',
      startDate: 'April 2024',
      endDate: 'June 2024',
      applicationDeadline: 'April 20, 2024',
      image: 'https://images.pexels.com/photos/5905709/pexels-photo-5905709.jpeg?auto=compress&cs=tinysrgb&w=800',
      aims: [
        'Bridge the digital divide for senior citizens',
        'Teach essential computer and internet skills',
        'Enable access to digital government services',
        'Promote digital inclusion and independence'
      ],
      objectives: [
        'Train 100+ senior citizens in basic computer skills',
        'Establish 3 community digital learning centers',
        'Create multilingual training materials',
        'Develop ongoing support network'
      ],
      overview: 'Our Digital Literacy Workshop is designed specifically for senior citizens who want to learn essential computer and internet skills. The program covers basic computer operations, internet browsing, email communication, and accessing digital government services. We provide patient, one-on-one instruction in a supportive environment.',
      activities: [
        'Basic computer operation training',
        'Internet browsing and safety',
        'Email setup and communication',
        'Digital government services access',
        'Social media basics',
        'Online banking and shopping safety'
      ],
      requirements: [
        'Strong computer and internet skills',
        'Patience and excellent communication',
        'Experience working with seniors preferred',
        'Multilingual abilities (Urdu/Punjabi/English)',
        'Teaching or training background helpful'
      ],
      schedule: 'Tuesdays & Thursdays: 10:00 AM - 12:00 PM, Saturdays: 2:00 PM - 4:00 PM',
      coordinator: 'Mr. Ali Raza - Technology Training Coordinator',
      contact: 'digital@wasilah.org | +92 XXX XXXXXXX'
    },
    '5': {
      title: 'Food Distribution Drive',
      description: 'Regular food distribution to families in need, especially during Ramadan and other significant periods.',
      category: 'social',
      status: 'ongoing',
      participants: 200,
      location: 'Multiple Cities',
      startDate: 'Ongoing',
      endDate: 'Ongoing',
      applicationDeadline: 'Open Applications',
      image: 'https://images.pexels.com/photos/6646918/pexels-photo-6646918.jpeg?auto=compress&cs=tinysrgb&w=800',
      aims: [
        'Provide nutritious food to families in need',
        'Ensure food security during difficult times',
        'Support vulnerable communities year-round',
        'Promote community solidarity and care'
      ],
      objectives: [
        'Distribute 10,000+ food packages monthly',
        'Serve 500+ families regularly',
        'Establish food distribution networks in 10 cities',
        'Coordinate special drives during Ramadan and emergencies'
      ],
      overview: 'Our Food Distribution Drive is an ongoing initiative that provides essential food supplies to families facing economic hardship. We operate year-round with special emphasis during Ramadan, Eid, and emergency situations. The program includes fresh produce, staple foods, and nutritional supplements for children and elderly.',
      activities: [
        'Weekly food package preparation',
        'Door-to-door distribution',
        'Community kitchen operations',
        'Special Ramadan iftar programs',
        'Emergency food relief',
        'Nutritional education sessions'
      ],
      requirements: [
        'Physical ability to lift and carry food packages',
        'Reliable transportation preferred',
        'Compassionate and respectful attitude',
        'Ability to work in diverse communities',
        'Flexible schedule availability'
      ],
      schedule: 'Flexible - Multiple shifts available throughout the week',
      coordinator: 'Mrs. Aisha Malik - Social Services Director',
      contact: 'food@wasilah.org | +92 XXX XXXXXXX'
    },
    '6': {
      title: 'Skills Development Center',
      description: 'Vocational training programs for unemployed youth, focusing on marketable skills and entrepreneurship.',
      category: 'education',
      status: 'completed',
      participants: 85,
      location: 'Peshawar',
      startDate: 'December 2023',
      endDate: 'March 2024',
      applicationDeadline: 'Completed',
      image: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=800',
      aims: [
        'Provide marketable vocational skills to unemployed youth',
        'Promote entrepreneurship and self-employment',
        'Reduce youth unemployment rates',
        'Strengthen local economic development'
      ],
      objectives: [
        'Train 100+ youth in various vocational skills',
        'Achieve 80%+ job placement rate',
        'Establish 20+ small businesses',
        'Create sustainable income opportunities'
      ],
      overview: 'The Skills Development Center successfully provided comprehensive vocational training to unemployed youth in Peshawar. The program included technical skills training, entrepreneurship development, and job placement assistance. Participants learned trades such as tailoring, electronics repair, computer skills, and small business management.',
      activities: [
        'Technical skills training workshops',
        'Entrepreneurship development sessions',
        'Business plan development',
        'Job placement assistance',
        'Mentorship programs',
        'Microfinance connections'
      ],
      requirements: [
        'Expertise in vocational/technical skills',
        'Business or entrepreneurship experience',
        'Teaching and mentoring abilities',
        'Understanding of local job market',
        'Commitment to youth development'
      ],
      schedule: 'Project completed successfully in March 2024',
      coordinator: 'Mr. Tariq Ahmed - Skills Development Manager',
      contact: 'skills@wasilah.org | +92 XXX XXXXXXX',
      results: [
        'Trained 95 youth in various vocational skills',
        'Achieved 85% job placement rate within 3 months',
        'Supported establishment of 22 small businesses',
        'Generated average monthly income increase of 150%',
        'Created ongoing mentorship network'
      ]
    }
  };

  const staticProject = staticProjects[id as keyof typeof staticProjects];
  const displayProject = project || staticProject;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setApplicationData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleApplicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!displayProject) return;

    // Save structured application entry
    try {
      await addDoc(collection(db, 'project_applications'), {
        projectId: id,
        projectTitle: displayProject.title,
        name: applicationData.name,
        email: applicationData.email,
        phone: applicationData.phone,
        experience: applicationData.experience || '',
        motivation: applicationData.motivation || '',
        preferredRole: applicationData.preferredRole || '',
        availability: applicationData.availability || '',
        skills: applicationData.skills || [],
        languageProficiency: applicationData.languageProficiency || [],
        transportAvailable: !!applicationData.transportAvailable,
        equipment: applicationData.equipment || [],
        accessibilityNeeds: applicationData.accessibilityNeeds || '',
        emergencyContact: applicationData.emergencyContactName || applicationData.emergencyContactPhone
          ? { name: applicationData.emergencyContactName, phone: applicationData.emergencyContactPhone }
          : null,
        consents: {
          liability: !!applicationData.consentLiability,
          photo: !!applicationData.consentPhoto,
          backgroundCheck: !!applicationData.consentBackgroundCheck,
        },
        submittedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Failed to save project application:', error);
    }

    // Send email notification
    const emailData = formatProjectApplicationEmail({
      ...applicationData,
      projectTitle: displayProject.title,
      timestamp: new Date().toISOString()
    });
    
    sendEmail(emailData).then(async (success) => {
      if (success) {
        try {
          await sendEmail(
            formatProjectApplicationConfirmationEmail({
              name: applicationData.name,
              email: applicationData.email,
              projectTitle: displayProject.title,
            })
          );
        } catch {}
        alert(`Thank you for applying to ${displayProject.title}! We will contact you within 2-3 business days.`);
      } else {
        alert('There was an error with your application. Please try again or contact us directly.');
      }
    });
    
    setApplicationData({
      name: '',
      email: '',
      phone: '',
      experience: '',
      motivation: '',
      preferredRole: '',
      availability: '',
      skills: [],
      languageProficiency: [],
      transportAvailable: false,
      equipment: [],
      accessibilityNeeds: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      consentLiability: false,
      consentPhoto: false,
      consentBackgroundCheck: false,
    });
    setShowApplication(false);
  };

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vibrant-orange mx-auto mb-4"></div>
        <p className="text-xl font-luxury-heading text-black">Loading project details...</p>
      </div>
    );
  }

  if (!displayProject) {
    return (
      <div className="py-12 text-center">
        <h1 className="text-4xl font-luxury-heading text-black mb-4">Project Not Found</h1>
        <Link to="/projects" className="btn-luxury-primary inline-flex items-center">
          <ArrowLeft className="mr-2 w-5 h-5" />
          Back to Projects
        </Link>
      </div>
    );
  }

  const isFromFirestore = !!project;
  const aims = isFromFirestore ? (project.objectives || []) : (staticProject?.aims || []);
  const activities = isFromFirestore ? [] : (staticProject?.activities || []);
  const overview = !isFromFirestore && staticProject?.overview ? staticProject.overview : displayProject.description;
  const schedule = !isFromFirestore && staticProject?.schedule ? staticProject.schedule : displayProject.timeline;
  const coordinator = !isFromFirestore && staticProject?.coordinator ? staticProject.coordinator : 'Project Coordinator';
  const contact = displayProject.contactEmail || '';
  const participants = isFromFirestore ? displayProject.expectedVolunteers : (staticProject?.participants || 0);
  const startDate = displayProject.startDate || '';
  const endDate = displayProject.endDate || '';
  const applicationDeadline = 'Open Applications';

  return (
    <div className="py-12">
      {/* Header */}
      <section className="bg-cream-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/projects" className="inline-flex items-center text-vibrant-orange hover:text-vibrant-orange-dark mb-8 font-luxury-semibold">
            <ArrowLeft className="mr-2 w-5 h-5" />
            Back to Projects
          </Link>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center space-x-4 mb-6">
                <span className="px-4 py-2 bg-green-100 text-green-800 rounded-luxury font-luxury-semibold">
                  Active
                </span>
                <span className="px-4 py-2 bg-vibrant-orange/20 text-vibrant-orange-dark rounded-luxury font-luxury-semibold capitalize">
                  {displayProject.category}
                </span>
              </div>

              <h1 className="text-5xl font-luxury-display text-black mb-6">{displayProject.title}</h1>
              <p className="text-xl text-black font-luxury-body leading-relaxed mb-8">{displayProject.description}</p>

              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="flex items-center text-black">
                  <Users className="w-6 h-6 mr-3 text-vibrant-orange" />
                  <span className="font-luxury-body">{participants} volunteers</span>
                </div>
                <div className="flex items-center text-black">
                  <MapPin className="w-6 h-6 mr-3 text-vibrant-orange" />
                  <span className="font-luxury-body">{displayProject.location}</span>
                </div>
                <div className="flex items-center text-black">
                  <Calendar className="w-6 h-6 mr-3 text-vibrant-orange" />
                  <span className="font-luxury-body">{startDate} - {endDate}</span>
                </div>
                <div className="flex items-center text-black">
                  <Clock className="w-6 h-6 mr-3 text-vibrant-orange" />
                  <span className="font-luxury-body">Apply by: {applicationDeadline}</span>
                </div>
              </div>

              <button
                onClick={() => setShowApplication(true)}
                className="btn-luxury-primary text-lg px-8 py-4 inline-flex items-center"
              >
                Quick Apply Now
                <Send className="ml-3 w-6 h-6" />
              </button>
            </div>
            
            <div className="relative">
              <img
                src={displayProject.image || 'https://images.pexels.com/photos/1181533/pexels-photo-1181533.jpeg?auto=compress&cs=tinysrgb&w=800'}
                alt={displayProject.title}
                className="w-full h-96 object-cover rounded-luxury-lg shadow-luxury"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Project Details */}
      <section className="py-16 bg-cream-elegant">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-12">
              {/* Overview */}
              <div className="luxury-card bg-cream-white p-10">
                <h2 className="text-3xl font-luxury-heading text-black mb-6">Project Overview</h2>
                <p className="text-black font-luxury-body text-lg leading-relaxed">{overview}</p>
              </div>

              {/* Objectives */}
              {aims.length > 0 && (
              <div className="luxury-card bg-cream-white p-8">
                <h3 className="text-2xl font-luxury-heading text-black mb-6 flex items-center">
                  <Target className="w-6 h-6 mr-3 text-vibrant-orange" />
                  Key Objectives
                </h3>
                <ul className="space-y-3">
                  {aims.map((objective, index) => (
                    <li key={index} className="flex items-start text-black font-luxury-body">
                      <CheckCircle className="w-5 h-5 mr-3 text-vibrant-orange flex-shrink-0 mt-1" />
                      {objective}
                    </li>
                  ))}
                </ul>
              </div>
              )}

              {/* Activities */}
              {activities.length > 0 && (
              <div className="luxury-card bg-cream-white p-10">
                <h2 className="text-3xl font-luxury-heading text-black mb-6">Project Activities</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activities.map((activity, index) => (
                    <div key={index} className="flex items-center text-black font-luxury-body p-4 bg-cream-elegant rounded-luxury">
                      <CheckCircle className="w-5 h-5 mr-3 text-vibrant-orange flex-shrink-0" />
                      {activity}
                    </div>
                  ))}
                </div>
              </div>
              )}

              {/* Results (for completed projects) */}
              {!isFromFirestore && staticProject?.results && (
                <div className="luxury-card bg-logo-navy p-10 text-cream-elegant">
                  <h2 className="text-3xl font-luxury-heading text-vibrant-orange-light mb-6">Project Results</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {staticProject.results.map((result, index) => (
                      <div key={index} className="flex items-start text-cream-elegant font-luxury-body p-4 bg-logo-navy-light/60 rounded-luxury">
                        <CheckCircle className="w-5 h-5 mr-3 text-vibrant-orange-light flex-shrink-0 mt-1" />
                        {result}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Capacity & Skills */}
              {(displayProject.capacity || displayProject.requiredSkills || displayProject.preferredSkills) && (
                <div className="luxury-card bg-cream-white p-8">
                  <h3 className="text-2xl font-luxury-heading text-black mb-4">Participation & Skills</h3>
                  <div className="space-y-3 text-black">
                    {typeof displayProject.capacity === 'number' && (
                      <div>
                        <strong>Capacity:</strong> {displayProject.capacity}
                      </div>
                    )}
                    {Array.isArray(displayProject.requiredSkills) && displayProject.requiredSkills.length > 0 && (
                      <div>
                        <strong>Required Skills:</strong>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {displayProject.requiredSkills.map((s: string, i: number) => (
                            <span key={i} className="px-2 py-1 bg-vibrant-orange/10 rounded text-black">{s}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {Array.isArray(displayProject.preferredSkills) && displayProject.preferredSkills.length > 0 && (
                      <div>
                        <strong>Preferred Skills:</strong>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {displayProject.preferredSkills.map((s: string, i: number) => (
                            <span key={i} className="px-2 py-1 bg-cream-elegant rounded text-black">{s}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Roles */}
              {Array.isArray(displayProject.roles) && displayProject.roles.length > 0 && (
                <div className="luxury-card bg-cream-white p-8">
                  <h3 className="text-2xl font-luxury-heading text-black mb-4">Roles Needed</h3>
                  <div className="space-y-4">
                    {displayProject.roles.map((r: any, i: number) => (
                      <div key={i} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div className="text-black font-semibold">{r.name}</div>
                          {typeof r.capacity === 'number' && (
                            <div className="text-sm text-black/70">Spots: {r.capacity}</div>
                          )}
                        </div>
                        {Array.isArray(r.duties) && r.duties.length > 0 && (
                          <ul className="list-disc list-inside mt-2 text-black/90 text-sm">
                            {r.duties.map((d: string, idx: number) => <li key={idx}>{d}</li>)}
                          </ul>
                        )}
                        {r.minHoursPerWeek && (
                          <div className="text-xs text-black/70 mt-1">Min hours/week: {r.minHoursPerWeek}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Logistics */}
              {(displayProject.materialsList || displayProject.accessibilityInfo || displayProject.safetyNotes) && (
                <div className="luxury-card bg-cream-white p-8">
                  <h3 className="text-2xl font-luxury-heading text-black mb-4">Logistics</h3>
                  <div className="space-y-3 text-black">
                    {Array.isArray(displayProject.materialsList) && displayProject.materialsList.length > 0 && (
                      <div>
                        <strong>What to bring:</strong>
                        <ul className="list-disc list-inside mt-2">
                          {displayProject.materialsList.map((m: string, i: number) => <li key={i}>{m}</li>)}
                        </ul>
                      </div>
                    )}
                    {displayProject.accessibilityInfo && (
                      <div><strong>Accessibility:</strong> {displayProject.accessibilityInfo}</div>
                    )}
                    {displayProject.safetyNotes && (
                      <div><strong>Safety:</strong> {displayProject.safetyNotes}</div>
                    )}
                  </div>
                </div>
              )}

              {/* FAQ */}
              {Array.isArray(displayProject.faq) && displayProject.faq.length > 0 && (
                <div className="luxury-card bg-cream-white p-8">
                  <h3 className="text-2xl font-luxury-heading text-black mb-4">FAQ</h3>
                  <div className="space-y-3">
                    {displayProject.faq.map((f: any, i: number) => (
                      <div key={i}>
                        <div className="font-semibold text-black">{f.question}</div>
                        <div className="text-black/80">{f.answer}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Requirements */}
              {displayProject.requirements && displayProject.requirements.length > 0 && displayProject.requirements[0] !== '' && (
              <div className="luxury-card bg-cream-white p-8">
                <h3 className="text-2xl font-luxury-heading text-black mb-6">Requirements</h3>
                <ul className="space-y-3">
                  {displayProject.requirements.map((requirement, index) => (
                    <li key={index} className="flex items-start text-black font-luxury-body">
                      <AlertCircle className="w-5 h-5 mr-3 text-vibrant-orange flex-shrink-0 mt-1" />
                      {requirement}
                    </li>
                  ))}
                </ul>
              </div>
              )}

              {/* Schedule */}
              {schedule && (
              <div className="luxury-card bg-cream-white p-8">
                <h3 className="text-2xl font-luxury-heading text-black mb-4">Timeline</h3>
                <p className="text-black font-luxury-body">{schedule}</p>
              </div>
              )}

              {/* Contact */}
              <div className="luxury-card bg-vibrant-orange/10 p-8">
                <h3 className="text-2xl font-luxury-heading text-black mb-4">Contact Information</h3>
                <p className="text-black font-luxury-semibold mb-2">{coordinator}</p>
                <p className="text-black font-luxury-body text-sm">{contact}</p>
                {displayProject.contactPhone && (
                  <p className="text-black font-luxury-body text-sm">{displayProject.contactPhone}</p>
                )}
              </div>

              {/* Single Apply Button (kept primary above) */}
            </div>
          </div>
        </div>
      </section>

      {/* Project Heads Section */}
      {displayProject && displayProject.heads && displayProject.heads.length > 0 && (
        <section className="py-16 bg-cream-elegant">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-luxury-heading text-black mb-8 text-center">Project Heads</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayProject.heads.map((head, index) => (
                <div key={head.id || index} className="luxury-card bg-cream-white p-6 text-center">
                  {head.image && (
                    <div className="mb-4">
                      <img
                        src={head.image}
                        alt={head.name}
                        className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-vibrant-orange/20"
                      />
                    </div>
                  )}
                  <h3 className="text-xl font-luxury-heading text-black mb-2">{head.name}</h3>
                  <p className="text-vibrant-orange-dark font-luxury-semibold mb-4">{head.designation}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Application Modal */}
      {showApplication && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="luxury-card bg-cream-white max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-3xl font-luxury-heading text-black">Quick Application</h3>
              <button
                onClick={() => setShowApplication(false)}
                className="text-black hover:text-vibrant-orange text-2xl"
              >
                ×
              </button>
            </div>
            
            <p className="text-black font-luxury-body mb-6">
              Apply for: <strong>{displayProject.title}</strong>
            </p>

            <form onSubmit={handleApplicationSubmit} className="space-y-6">
              <div>
                <label className="block font-luxury-medium text-black mb-2">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={applicationData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-vibrant-orange/30 rounded-luxury focus:outline-none focus:ring-2 focus:ring-vibrant-orange focus:border-vibrant-orange font-luxury-body"
                />
              </div>

              <div>
                <label className="block font-luxury-medium text-black mb-2">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={applicationData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-vibrant-orange/30 rounded-luxury focus:outline-none focus:ring-2 focus:ring-vibrant-orange focus:border-vibrant-orange font-luxury-body"
                />
              </div>

              <div>
                <label className="block font-luxury-medium text-black mb-2">Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={applicationData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-vibrant-orange/30 rounded-luxury focus:outline-none focus:ring-2 focus:ring-vibrant-orange focus:border-vibrant-orange font-luxury-body"
                />
              </div>

              <div>
                <label className="block font-luxury-medium text-black mb-2">Relevant Experience</label>
                <textarea
                  name="experience"
                  rows={3}
                  value={applicationData.experience}
                  onChange={handleInputChange}
                  placeholder="Briefly describe any relevant experience or skills..."
                  className="w-full px-4 py-3 border-2 border-vibrant-orange/30 rounded-luxury focus:outline-none focus:ring-2 focus:ring-vibrant-orange focus:border-vibrant-orange font-luxury-body"
                />
              </div>

              {/* New Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-luxury-medium text-black mb-2">Preferred Role</label>
                  <input
                    type="text"
                    name="preferredRole"
                    value={applicationData.preferredRole}
                    onChange={handleInputChange}
                    placeholder="Coordinator, Field Volunteer, Media, etc."
                    className="w-full px-4 py-3 border-2 border-vibrant-orange/30 rounded-luxury focus:outline-none focus:ring-2 focus:ring-vibrant-orange focus:border-vibrant-orange font-luxury-body"
                  />
                </div>
                <div>
                  <label className="block font-luxury-medium text-black mb-2">Availability (hours/week)</label>
                  <input
                    type="text"
                    name="availability"
                    value={applicationData.availability}
                    onChange={handleInputChange}
                    placeholder="e.g. 6-8 hrs/week, evenings, weekends"
                    className="w-full px-4 py-3 border-2 border-vibrant-orange/30 rounded-luxury focus:outline-none focus:ring-2 focus:ring-vibrant-orange focus:border-vibrant-orange font-luxury-body"
                  />
                </div>
              </div>

              <div>
                <label className="block font-luxury-medium text-black mb-2">Skills (comma-separated)</label>
                <input
                  type="text"
                  value={applicationData.skills.join(', ')}
                  onChange={(e) => setApplicationData((p) => ({ ...p, skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))}
                  placeholder="Project mgmt, First Aid, Urdu, Photography, etc."
                  className="w-full px-4 py-3 border-2 border-vibrant-orange/30 rounded-luxury focus:outline-none focus:ring-2 focus:ring-vibrant-orange focus:border-vibrant-orange font-luxury-body"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-luxury-medium text-black mb-2">Languages (comma-separated)</label>
                  <input
                    type="text"
                    value={applicationData.languageProficiency.join(', ')}
                    onChange={(e) => setApplicationData((p) => ({ ...p, languageProficiency: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))}
                    placeholder="Urdu, English, Punjabi"
                    className="w-full px-4 py-3 border-2 border-vibrant-orange/30 rounded-luxury focus:outline-none focus:ring-2 focus:ring-vibrant-orange focus:border-vibrant-orange font-luxury-body"
                  />
                </div>
                <div className="flex items-center gap-3 mt-8">
                  <input
                    type="checkbox"
                    id="transportAvailable"
                    checked={applicationData.transportAvailable}
                    onChange={(e) => setApplicationData((p) => ({ ...p, transportAvailable: e.target.checked }))}
                  />
                  <label htmlFor="transportAvailable" className="text-black">I have my own transport</label>
                </div>
              </div>

              <div>
                <label className="block font-luxury-medium text-black mb-2">Equipment (comma-separated)</label>
                <input
                  type="text"
                  value={applicationData.equipment.join(', ')}
                  onChange={(e) => setApplicationData((p) => ({ ...p, equipment: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))}
                  placeholder="Laptop, Camera, Gloves"
                  className="w-full px-4 py-3 border-2 border-vibrant-orange/30 rounded-luxury focus:outline-none focus:ring-2 focus:ring-vibrant-orange focus:border-vibrant-orange font-luxury-body"
                />
              </div>

              <div>
                <label className="block font-luxury-medium text-black mb-2">Accessibility Needs (optional)</label>
                <input
                  type="text"
                  value={applicationData.accessibilityNeeds}
                  onChange={(e) => setApplicationData((p) => ({ ...p, accessibilityNeeds: e.target.value }))}
                  placeholder="Any accommodations required"
                  className="w-full px-4 py-3 border-2 border-vibrant-orange/30 rounded-luxury focus:outline-none focus:ring-2 focus:ring-vibrant-orange focus:border-vibrant-orange font-luxury-body"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-luxury-medium text-black mb-2">Emergency Contact Name</label>
                  <input
                    type="text"
                    value={applicationData.emergencyContactName}
                    onChange={(e) => setApplicationData((p) => ({ ...p, emergencyContactName: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-vibrant-orange/30 rounded-luxury focus:outline-none focus:ring-2 focus:ring-vibrant-orange focus:border-vibrant-orange font-luxury-body"
                  />
                </div>
                <div>
                  <label className="block font-luxury-medium text-black mb-2">Emergency Contact Phone</label>
                  <input
                    type="tel"
                    value={applicationData.emergencyContactPhone}
                    onChange={(e) => setApplicationData((p) => ({ ...p, emergencyContactPhone: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-vibrant-orange/30 rounded-luxury focus:outline-none focus:ring-2 focus:ring-vibrant-orange focus:border-vibrant-orange font-luxury-body"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={applicationData.consentLiability} onChange={(e) => setApplicationData((p) => ({ ...p, consentLiability: e.target.checked }))} />
                  <span className="text-black">Liability Waiver</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={applicationData.consentPhoto} onChange={(e) => setApplicationData((p) => ({ ...p, consentPhoto: e.target.checked }))} />
                  <span className="text-black">Photo Consent</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={applicationData.consentBackgroundCheck} onChange={(e) => setApplicationData((p) => ({ ...p, consentBackgroundCheck: e.target.checked }))} />
                  <span className="text-black">Background Check</span>
                </label>
              </div>

              <div>
                <label className="block font-luxury-medium text-black mb-2">Why do you want to join this project?</label>
                <textarea
                  name="motivation"
                  rows={3}
                  value={applicationData.motivation}
                  onChange={handleInputChange}
                  placeholder="Tell us what motivates you to participate in this project..."
                  className="w-full px-4 py-3 border-2 border-vibrant-orange/30 rounded-luxury focus:outline-none focus:ring-2 focus:ring-vibrant-orange focus:border-vibrant-orange font-luxury-body"
                />
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setShowApplication(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-luxury text-black font-luxury-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-luxury-primary py-3 px-6 flex items-center justify-center"
                >
                  Submit Application
                  <Send className="ml-2 w-5 h-5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;