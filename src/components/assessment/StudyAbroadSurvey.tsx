"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "../ui/progress";
import { CheckCircle } from "lucide-react";

interface Question {
  id: string;
  section: string;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
}

interface UserInfo {
  name: string;
  email: string;
  mobile: string;
}

interface Response {
  questionId: string;
  answer: string;
  section: string;
}

const surveyQuestions: Question[] = [
  // Section 1: Academic Readiness (12 Questions)
  {
    id: "Q1",
    section: "Academic Readiness",
    question: "How would you describe your current academic performance?",
    options: {
      A: "Consistently high (above 85%)",
      B: "Good but with some variation (70–85%)",
      C: "Average (55–70%)",
      D: "Below average (below 55%)"
    }
  },
  {
    id: "Q2",
    section: "Academic Readiness",
    question: "Have you attempted or planned standardized tests (IELTS/TOEFL, GRE/GMAT, SAT)?",
    options: {
      A: "Already taken and scored well",
      B: "Preparing actively",
      C: "Planned but not started",
      D: "Not considered yet"
    }
  },
  {
    id: "Q3",
    section: "Academic Readiness",
    question: "Which best describes your English proficiency?",
    options: {
      A: "Fluent in speaking, writing, academic use",
      B: "Good conversational, some academic challenges",
      C: "Understandable but needs improvement",
      D: "Weak, needs strong improvement"
    }
  },
  {
    id: "Q4",
    section: "Academic Readiness",
    question: "How consistent are your academic grades across subjects?",
    options: {
      A: "Very consistent",
      B: "Mostly consistent",
      C: "Fluctuating",
      D: "Highly inconsistent"
    }
  },
  {
    id: "Q5",
    section: "Academic Readiness",
    question: "Do you have research/project experience in your intended field?",
    options: {
      A: "Strong experience (multiple projects, papers)",
      B: "Some exposure (projects, internships)",
      C: "Limited (class projects only)",
      D: "None"
    }
  },
  {
    id: "Q6",
    section: "Academic Readiness",
    question: "How confident are you in handling STEM subjects (if applicable)?",
    options: {
      A: "Very confident",
      B: "Moderately confident",
      C: "Somewhat unsure",
      D: "Not confident"
    }
  },
  {
    id: "Q7",
    section: "Academic Readiness",
    question: "How would you rate your academic writing skills?",
    options: {
      A: "Excellent",
      B: "Good",
      C: "Fair",
      D: "Weak"
    }
  },
  {
    id: "Q8",
    section: "Academic Readiness",
    question: "Have you planned your test-taking timeline (IELTS/GRE/GMAT etc.)?",
    options: {
      A: "Completed",
      B: "Planned in next 3 months",
      C: "Planned in 6–9 months",
      D: "Not yet planned"
    }
  },
  {
    id: "Q9",
    section: "Academic Readiness",
    question: "Do you actively practice problem-solving/analytical reasoning?",
    options: {
      A: "Regularly",
      B: "Sometimes",
      C: "Rarely",
      D: "Never"
    }
  },
  {
    id: "Q10",
    section: "Academic Readiness",
    question: "How comfortable are you with online/digital learning platforms?",
    options: {
      A: "Very comfortable",
      B: "Comfortable",
      C: "Somewhat comfortable",
      D: "Uncomfortable"
    }
  },
  {
    id: "Q11",
    section: "Academic Readiness",
    question: "Do you have exposure to independent research or presentations?",
    options: {
      A: "Extensive",
      B: "Moderate",
      C: "Minimal",
      D: "None"
    }
  },
  {
    id: "Q12",
    section: "Academic Readiness",
    question: "How do you usually prepare for exams?",
    options: {
      A: "Planned, consistent schedule",
      B: "Moderate preparation",
      C: "Last-minute study",
      D: "Unstructured, inconsistent"
    }
  },
  
  // Section 2: Career & Goal Alignment (10 Questions)
  {
    id: "Q13",
    section: "Career & Goal Alignment",
    question: "Do you have clear long-term career goals?",
    options: {
      A: "Very clear",
      B: "Somewhat clear",
      C: "Vague",
      D: "No clarity"
    }
  },
  {
    id: "Q14",
    section: "Career & Goal Alignment",
    question: "How much research have you done about your chosen career path?",
    options: {
      A: "Extensive",
      B: "Moderate",
      C: "Minimal",
      D: "None"
    }
  },
  {
    id: "Q15",
    section: "Career & Goal Alignment",
    question: "Is your intended course aligned with your career goals?",
    options: {
      A: "Strongly aligned",
      B: "Somewhat aligned",
      C: "Unclear",
      D: "Not aligned"
    }
  },
  {
    id: "Q16",
    section: "Career & Goal Alignment",
    question: "How much do university rankings influence your choice?",
    options: {
      A: "Very high",
      B: "Moderate",
      C: "Slight",
      D: "No influence"
    }
  },
  {
    id: "Q17",
    section: "Career & Goal Alignment",
    question: "Do you have backup course/university options?",
    options: {
      A: "Multiple backups",
      B: "One backup",
      C: "Thinking about it",
      D: "No backup"
    }
  },
  {
    id: "Q18",
    section: "Career & Goal Alignment",
    question: "What is your main motivation to study abroad?",
    options: {
      A: "Career growth/employability",
      B: "Research/academic excellence",
      C: "Lifestyle and exposure",
      D: "Migration/settlement"
    }
  },
  {
    id: "Q19",
    section: "Career & Goal Alignment",
    question: "Do you follow job market trends in your target country?",
    options: {
      A: "Actively",
      B: "Sometimes",
      C: "Rarely",
      D: "Never"
    }
  },
  {
    id: "Q20",
    section: "Career & Goal Alignment",
    question: "How important is post-study work opportunity in your decision?",
    options: {
      A: "Extremely important",
      B: "Important",
      C: "Somewhat important",
      D: "Not important"
    }
  },
  {
    id: "Q21",
    section: "Career & Goal Alignment",
    question: "Are you flexible about changing your career path based on opportunities?",
    options: {
      A: "Very flexible",
      B: "Somewhat flexible",
      C: "Slightly flexible",
      D: "Not flexible"
    }
  },
  {
    id: "Q22",
    section: "Career & Goal Alignment",
    question: "Have you networked with alumni or professionals abroad?",
    options: {
      A: "Yes, extensively",
      B: "Somewhat",
      C: "Rarely",
      D: "Not at all"
    }
  },

  // Section 3: Financial Planning (8 Questions)
  {
    id: "Q23",
    section: "Financial Planning",
    question: "How prepared are you with tuition + living cost estimation?",
    options: {
      A: "Fully calculated",
      B: "Partially calculated",
      C: "Rough idea",
      D: "No idea"
    }
  },
  {
    id: "Q24",
    section: "Financial Planning",
    question: "What is your primary funding source?",
    options: {
      A: "Family savings",
      B: "Education loan",
      C: "Scholarship/grants",
      D: "Not planned yet"
    }
  },
  {
    id: "Q25",
    section: "Financial Planning",
    question: "Have you considered exchange rate risks?",
    options: {
      A: "Yes, fully",
      B: "Somewhat",
      C: "Rarely",
      D: "Never"
    }
  },
  {
    id: "Q26",
    section: "Financial Planning",
    question: "Do you have contingency/emergency funds planned?",
    options: {
      A: "Yes",
      B: "Somewhat",
      C: "Minimal",
      D: "None"
    }
  },
  {
    id: "Q27",
    section: "Financial Planning",
    question: "How open are you to part-time work abroad?",
    options: {
      A: "Very open",
      B: "Somewhat open",
      C: "Unsure",
      D: "Not open"
    }
  },
  {
    id: "Q28",
    section: "Financial Planning",
    question: "How aware are you of scholarship opportunities?",
    options: {
      A: "Very aware",
      B: "Somewhat aware",
      C: "Slightly aware",
      D: "Not aware"
    }
  },
  {
    id: "Q29",
    section: "Financial Planning",
    question: "Would you consider education loans if required?",
    options: {
      A: "Definitely",
      B: "Maybe",
      C: "Prefer not",
      D: "No"
    }
  },
  {
    id: "Q30",
    section: "Financial Planning",
    question: "Who in your family makes financial decisions for study abroad?",
    options: {
      A: "Student self",
      B: "Parents jointly",
      C: "Extended family",
      D: "Not yet discussed"
    }
  },

  // Section 4: Personal & Cultural Readiness (10 Questions)
  {
    id: "Q31",
    section: "Personal & Cultural Readiness",
    question: "How adaptable are you to new cultures?",
    options: {
      A: "Very adaptable",
      B: "Adaptable",
      C: "Somewhat adaptable",
      D: "Struggle to adapt"
    }
  },
  {
    id: "Q32",
    section: "Personal & Cultural Readiness",
    question: "Have you traveled/lived independently outside your hometown?",
    options: {
      A: "Extensively",
      B: "Somewhat",
      C: "Limited",
      D: "Never"
    }
  },
  {
    id: "Q33",
    section: "Personal & Cultural Readiness",
    question: "How do you manage homesickness?",
    options: {
      A: "Easily overcome",
      B: "Manageable",
      C: "Struggle initially",
      D: "Very difficult"
    }
  },
  {
    id: "Q34",
    section: "Personal & Cultural Readiness",
    question: "How independent are you in daily living (cooking, laundry, budgeting)?",
    options: {
      A: "Fully independent",
      B: "Mostly independent",
      C: "Somewhat dependent",
      D: "Dependent"
    }
  },
  {
    id: "Q35",
    section: "Personal & Cultural Readiness",
    question: "How do you usually solve problems in new situations?",
    options: {
      A: "Confident, independent",
      B: "Seek help when needed",
      C: "Hesitant",
      D: "Avoid decisions"
    }
  },
  {
    id: "Q36",
    section: "Personal & Cultural Readiness",
    question: "How open are you to food/lifestyle changes abroad?",
    options: {
      A: "Very open",
      B: "Somewhat open",
      C: "Limited",
      D: "Not open"
    }
  },
  {
    id: "Q37",
    section: "Personal & Cultural Readiness",
    question: "How would you describe your networking skills?",
    options: {
      A: "Excellent",
      B: "Good",
      C: "Fair",
      D: "Weak"
    }
  },
  {
    id: "Q38",
    section: "Personal & Cultural Readiness",
    question: "How comfortable are you interacting with people from diverse cultures?",
    options: {
      A: "Very comfortable",
      B: "Comfortable",
      C: "Somewhat comfortable",
      D: "Uncomfortable"
    }
  },
  {
    id: "Q39",
    section: "Personal & Cultural Readiness",
    question: "How resilient are you in handling stress?",
    options: {
      A: "Very resilient",
      B: "Moderately resilient",
      C: "Sometimes struggle",
      D: "Easily overwhelmed"
    }
  },
  {
    id: "Q40",
    section: "Personal & Cultural Readiness",
    question: "Do you participate in extracurricular/volunteering activities?",
    options: {
      A: "Regularly",
      B: "Sometimes",
      C: "Rarely",
      D: "Never"
    }
  },

  // Section 5: Practical Readiness (6 Questions)
  {
    id: "Q41",
    section: "Practical Readiness",
    question: "How prepared are you with visa documentation?",
    options: {
      A: "Fully prepared",
      B: "Somewhat",
      C: "Minimal",
      D: "Not prepared"
    }
  },
  {
    id: "Q42",
    section: "Practical Readiness",
    question: "How comfortable are you with digital/online tools?",
    options: {
      A: "Very comfortable",
      B: "Comfortable",
      C: "Somewhat comfortable",
      D: "Uncomfortable"
    }
  },
  {
    id: "Q43",
    section: "Practical Readiness",
    question: "Do you have valid health insurance/medical coverage plans?",
    options: {
      A: "Yes",
      B: "Partially",
      C: "Exploring",
      D: "None"
    }
  },
  {
    id: "Q44",
    section: "Practical Readiness",
    question: "How good are you at meeting deadlines?",
    options: {
      A: "Excellent",
      B: "Good",
      C: "Fair",
      D: "Poor"
    }
  },
  {
    id: "Q45",
    section: "Practical Readiness",
    question: "Have you researched health & safety guidelines abroad?",
    options: {
      A: "Yes, thoroughly",
      B: "Somewhat",
      C: "Slightly",
      D: "Not at all"
    }
  },
  {
    id: "Q46",
    section: "Practical Readiness",
    question: "How ready are you to handle emergencies abroad?",
    options: {
      A: "Very ready",
      B: "Somewhat ready",
      C: "Limited",
      D: "Not ready"
    }
  },

  // Section 6: Support System (8 Questions)
  {
    id: "Q47",
    section: "Support System",
    question: "Do your parents fully support your study abroad decision?",
    options: {
      A: "Strongly support",
      B: "Support with concerns",
      C: "Unsure",
      D: "Do not support"
    }
  },
  {
    id: "Q48",
    section: "Support System",
    question: "How financially committed is your family?",
    options: {
      A: "Fully committed",
      B: "Somewhat",
      C: "Limited",
      D: "Not committed"
    }
  },
  {
    id: "Q49",
    section: "Support System",
    question: "Do you have emotional support from family/friends?",
    options: {
      A: "Strongly",
      B: "Somewhat",
      C: "Limited",
      D: "None"
    }
  },
  {
    id: "Q50",
    section: "Support System",
    question: "Do your parents expect you to return after studies?",
    options: {
      A: "Definitely",
      B: "Maybe",
      C: "Flexible",
      D: "No expectation"
    }
  },
  {
    id: "Q51",
    section: "Support System",
    question: "Have you openly discussed goals with your parents?",
    options: {
      A: "Yes, extensively",
      B: "Somewhat",
      C: "Minimal",
      D: "Not at all"
    }
  },
  {
    id: "Q52",
    section: "Support System",
    question: "How aligned are your parent's expectations with yours?",
    options: {
      A: "Strongly aligned",
      B: "Somewhat aligned",
      C: "Slightly aligned",
      D: "Not aligned"
    }
  },
  {
    id: "Q53",
    section: "Support System",
    question: "Would your family relocate/visit you abroad for support?",
    options: {
      A: "Definitely",
      B: "Possibly",
      C: "Rarely",
      D: "Never"
    }
  },
  {
    id: "Q54",
    section: "Support System",
    question: "How confident are you in balancing family expectations vs. independence?",
    options: {
      A: "Very confident",
      B: "Moderately confident",
      C: "Somewhat confident",
      D: "Not confident"
    }
  }
];

// Scoring function to calculate results
const calculateScores = (responses: Response[]) => {
  const sectionScores: { [key: string]: { correct: number; total: number } } = {};
  
  // Initialize section scores - MUST match the section names from questions
  const sections = [
    'Academic Readiness',
    'Career & Goal Alignment', 
    'Financial Planning',
    'Personal & Cultural Readiness',
    'Practical Readiness',
    'Support System'
  ];
  sections.forEach(section => {
    sectionScores[section] = { correct: 0, total: 0 };
  });
  
  // Calculate scores based on responses
  responses.forEach(response => {
    const section = response.section;
    if (sectionScores[section]) {
      sectionScores[section].total += 1;
      
      // Score based on answer choice (A=4, B=3, C=2, D=1)
      const answerScore = response.answer === 'A' ? 4 : response.answer === 'B' ? 3 : response.answer === 'C' ? 2 : 1;
      sectionScores[section].correct += answerScore;
    }
  });
  
  // Weight mapping for each section
  const weightMapping: { [key: string]: number } = {
    'Financial Planning': 25,
    'Academic Readiness': 20,
    'Career & Goal Alignment': 20,
    'Personal & Cultural Readiness': 15,
    'Practical Readiness': 10,
    'Support System': 10
  };

  // Convert to percentage scores with more realistic scoring
  const topicScores = Object.entries(sectionScores).map(([section, scores]) => {
    // Calculate percentage based on average score per question
    const averageScorePerQuestion = scores.total > 0 ? scores.correct / scores.total : 0;
    const percentage = Math.round((averageScorePerQuestion / 4) * 100); // 4 is max score per question
    const weight = weightMapping[section] || 0;
    const weighted = Math.round((percentage * weight) / 100);
    
    return {
      name: section,
      correct: Math.max(0, Math.min(100, percentage)), // Clamp between 0-100
      weighted: weighted,
      weight: weight,
      total: 100
    };
  });
  
  // Calculate overall score
  const overallScore = Math.round(topicScores.reduce((sum, topic) => sum + topic.correct, 0) / topicScores.length);
  
  return {
    overallScore,
    topicScoresArray: topicScores
  };
};

export default function StudyAbroadSurvey() {
  const [step, setStep] = useState<'info' | 'survey' | 'academicBackground' | 'processing' | 'completed'>('survey');
  const [userInfo, setUserInfo] = useState<UserInfo>({ name: '', email: '', mobile: '' });
  const [academicBackground, setAcademicBackground] = useState<string>('');
  const [otherFieldText, setOtherFieldText] = useState<string>('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Response[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState<string>('');
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const [pdfStatus, setPdfStatus] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<{ name?: string; email?: string; mobile?: string }>({});
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfProgress, setPdfProgress] = useState(0);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const isNavigatingRef = useRef(false);

  const currentQuestion = surveyQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / surveyQuestions.length) * 100;

  // Define handleDownloadPDF function that can be called from useEffect
  const handleDownloadPDF = async () => {
    if (isDownloadingPDF) return;
    
    setIsDownloadingPDF(true);
    setIsGeneratingPDF(true);
    setPdfProgress(0);
    setPdfStatus('Preparing your report...');
    try {
      const surveyData = JSON.parse(localStorage.getItem('studyAbroadSurvey') || '{}');
      if (surveyData.analysisResults) {
        setPdfStatus('Generating PDF report...');
        
        // Send request immediately - server will handle generation
        const response = await fetch('/api/generate-pdf', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...surveyData.analysisResults,
            userInfo: surveyData.userInfo,
            surveyType: 'StudyAbroad',
            testType: surveyData.testType || 'Study Abroad Readiness Assessment'
          })
        });

        if (response.ok) {
          const contentType = response.headers.get('content-type');
          
          // Check if response is JSON (S3 URL) or blob
          if (contentType?.includes('application/json')) {
            // New: S3 URL returned (faster, avoids timeout)
            const data = await response.json();
            if (data.s3Url) {
              setPdfStatus('✅ PDF ready!');
              // Store PDF URL for "See Result" button
              setPdfUrl(data.s3Url);
              setIsGeneratingPDF(false);
              setPdfProgress(100);
              setPdfStatus('');
            } else {
              throw new Error('S3 URL not found in response');
            }
          } else {
            // Fallback: blob returned (old behavior)
            setPdfStatus('Finalizing download...');
            const blob = await response.blob();
            
            // Direct download without any size checks
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `study-abroad-report-${userInfo.email.split('@')[0]}.pdf`;
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            
            // Clean up after a delay
            setTimeout(() => {
              window.URL.revokeObjectURL(url);
              document.body.removeChild(a);
            }, 1000);
            
            setPdfStatus('✅ Report downloaded successfully!');
            setIsGeneratingPDF(false);
            setPdfProgress(100);
            
            // Clear status message after 3 seconds
            setTimeout(() => setPdfStatus(''), 3000);
          }
        } else {
          const errorText = await response.text();
          setPdfStatus('❌ PDF generation failed. Please try again.');
          setIsGeneratingPDF(false);
          setPdfProgress(0);
          setTimeout(() => setPdfStatus(''), 5000);
          alert('PDF generation failed. Please try again.');
        }
      } else {
        setPdfStatus('❌ No analysis results found. Please complete the assessment again.');
        setIsGeneratingPDF(false);
        setPdfProgress(0);
        setTimeout(() => setPdfStatus(''), 5000);
        alert('No analysis results found. Please complete the assessment again.');
      }
    } catch (error: any) {
      setPdfStatus('❌ Error generating PDF. Please try again.');
      setIsGeneratingPDF(false);
      setPdfProgress(0);
      setTimeout(() => setPdfStatus(''), 5000);
      alert('Error downloading PDF. Please try again.');
    } finally {
      setIsDownloadingPDF(false);
      if (!pdfStatus) setPdfStatus('');
    }
  };

  // Auto-trigger PDF generation when analysis completes
  // Restore answer when question index changes
  useEffect(() => {
    if (step === 'survey') {
      const savedResponse = responses.find(r => r.questionId === currentQuestion.id);
      if (savedResponse) {
        setCurrentAnswer(savedResponse.answer);
      } else {
        setCurrentAnswer('');
      }
    }
  }, [currentQuestionIndex, currentQuestion.id, step, responses]);

  useEffect(() => {
    if (step === 'completed' && !pdfUrl && !isGeneratingPDF && !isDownloadingPDF) {
      // Start PDF generation automatically
      handleDownloadPDF();
    }
  }, [step, pdfUrl, isGeneratingPDF, isDownloadingPDF]);

  // Progress bar timer (30 seconds)
  useEffect(() => {
    if (isGeneratingPDF) {
      setPdfProgress(0); // Reset progress when starting
      const interval = setInterval(() => {
        setPdfProgress(prev => {
          if (prev >= 100) {
            return 100;
          }
          return prev + (100 / 30); // 30 seconds to reach 100%
        });
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setPdfProgress(0); // Reset when not generating
    }
  }, [isGeneratingPDF]);

  const validateForm = (): boolean => {
    const errors: { name?: string; email?: string; mobile?: string } = {};

    // Name validation
    if (!userInfo.name || userInfo.name.trim() === '') {
      errors.name = "Name is required";
    } else if (userInfo.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
    }

    // Email validation - strict format check
    if (!userInfo.email) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(userInfo.email)) {
      errors.email = "Please enter a valid email address";
    }

    // Mobile validation - exactly 10 digits for India
    if (!userInfo.mobile) {
      errors.mobile = "Mobile number is required";
    } else if (!/^\d{10}$/.test(userInfo.mobile.replace(/\s/g, ''))) {
      errors.mobile = "Mobile number must be exactly 10 digits";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setStep('processing');
      
      try {
        // First, send user info to create-lead API (LeadSquared)
        try {
          const leadResponse = await fetch('/api/create-lead', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: userInfo.name,
              email: userInfo.email,
              phone: userInfo.mobile,
              surveyType: 'StudyAbroad'
            })
          });
          
          if (leadResponse.ok) {
            const leadData = await leadResponse.json();
            console.log('✅ Lead created/updated in LeadSquared:', leadData);
          } else {
            console.warn('⚠️ Failed to create lead in LeadSquared, continuing with analysis');
          }
        } catch (leadError) {
          console.error('❌ Error creating lead, continuing with analysis:', leadError);
        }
        
        // Get saved responses and academic background from localStorage
        const savedSurveyData = JSON.parse(localStorage.getItem('studyAbroadSurvey') || '{}');
        const savedResponses = savedSurveyData.responses || responses;
        const academicBackground = savedSurveyData.academicBackground || 'Not specified';
        
        // Calculate scores based on responses
        const scores = calculateScores(savedResponses);
        
        // Call our analyze-results API
        const analysisResponse = await fetch('/api/analyze-results', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userName: userInfo?.name || userInfo?.email?.split('@')[0] || 'Unknown User',
            userEmail: userInfo?.email || '',
            userPhone: userInfo?.mobile || '',
            overallScore: scores.overallScore,
            topicScoresArray: scores.topicScoresArray,
            academicBackground: academicBackground
          })
        });

        if (!analysisResponse.ok) {
          throw new Error('Analysis failed');
        }

        const analysisResults = await analysisResponse.json();
        
        // Save results to localStorage for PDF generation
        const surveyData = {
          userInfo,
          responses: savedResponses,
          completedAt: new Date().toISOString(),
          testType: 'Study Abroad Readiness Assessment',
          analysisResults
        };
        
        localStorage.setItem('studyAbroadSurvey', JSON.stringify(surveyData));
        setStep('completed');
      } catch (error) {
        console.error('Error processing assessment:', error);
        // Fallback to basic completion
        const savedSurveyData = JSON.parse(localStorage.getItem('studyAbroadSurvey') || '{}');
        const savedResponses = savedSurveyData.responses || responses;
        const surveyData = {
          userInfo,
          responses: savedResponses,
          completedAt: new Date().toISOString(),
          testType: 'Study Abroad Readiness Assessment'
        };
        
        localStorage.setItem('studyAbroadSurvey', JSON.stringify(surveyData));
        setStep('completed');
      }
    }
  };

  const handleAnswerSelect = (answer: string) => {
    if (isNavigatingRef.current) return; // Prevent multiple rapid calls
    setCurrentAnswer(answer);
    isNavigatingRef.current = true;
    // Automatically move to next question after a short delay
    setTimeout(async () => {
      await handleNext(answer);
      isNavigatingRef.current = false;
    }, 300);
  };

  const handleNext = async (answerOverride?: string) => {
    const answerToUse = answerOverride || currentAnswer;
    if (answerToUse) {
      const newResponse: Response = {
        questionId: currentQuestion.id,
        answer: answerToUse,
        section: currentQuestion.section
      };

      // Remove any existing response for this question, then add the new one
      const updatedResponses = responses.filter(r => r.questionId !== currentQuestion.id);
      updatedResponses.push(newResponse);
      setResponses(updatedResponses);

      if (currentQuestionIndex < surveyQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setCurrentAnswer('');
      } else {
        // All questions answered - save responses and move to info form
        const surveyData = {
          userInfo,
          responses: updatedResponses,
          completedAt: new Date().toISOString(),
          testType: 'Study Abroad Readiness Assessment'
        };
        localStorage.setItem('studyAbroadSurvey', JSON.stringify(surveyData));
        setStep('academicBackground');
        // Scroll to academic background form
        setTimeout(() => {
          const formElement = document.querySelector('[data-test-form]');
          if (formElement) {
            const yOffset = window.innerWidth < 640 ? -120 : -100;
            const y = formElement.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
          }
        }, 150);
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      isNavigatingRef.current = false; // Reset navigation flag
      
      // Save current answer if it exists
      let updatedResponses = [...responses];
      if (currentAnswer) {
        const currentResponse: Response = {
          questionId: currentQuestion.id,
          answer: currentAnswer,
          section: currentQuestion.section
        };
        
        // Update or add the current response
        updatedResponses = updatedResponses.filter(r => r.questionId !== currentQuestion.id);
        updatedResponses.push(currentResponse);
        setResponses(updatedResponses);
      }
      
      // Navigate to previous question
      const newIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(newIndex);
      // Answer will be restored by useEffect
    }
  };

  if (step === 'academicBackground') {
    // Get the localStorage key based on survey type
    const storageKey = 'studyAbroadSurvey';
    
    return (
      <div data-test-form className="max-w-md mx-auto mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
              Academic Background
            </CardTitle>
            <CardDescription className="text-center">
              Help us personalize your recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Label className="text-base font-semibold">
                What is your current academic background/field of study?
              </Label>
              <RadioGroup
                value={academicBackground}
                onValueChange={(value) => {
                  setAcademicBackground(value);
                  if (value !== 'D') {
                    setOtherFieldText(''); // Clear text when switching away from D
                  }
                }}
              >
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="A" id="acad-A" />
                    <Label htmlFor="acad-A" className="font-normal cursor-pointer">
                      Commerce/Business (B.Com, BBA, MBA, etc.)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="B" id="acad-B" />
                    <Label htmlFor="acad-B" className="font-normal cursor-pointer">
                      Science/Engineering (B.Sc, B.Tech, M.Tech, etc.)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="C" id="acad-C" />
                    <Label htmlFor="acad-C" className="font-normal cursor-pointer">
                      Arts/Humanities (B.A, M.A, etc.)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="D" id="acad-D" />
                    <Label htmlFor="acad-D" className="font-normal cursor-pointer">
                      Other/Interdisciplinary
                    </Label>
                  </div>
                </div>
              </RadioGroup>
              
              {academicBackground === 'D' && (
                <div className="space-y-2 mt-4">
                  <Label htmlFor="other-field">Please specify your field of study</Label>
                  <Input
                    id="other-field"
                    type="text"
                    placeholder="e.g., Medicine, Law, Architecture, etc."
                    value={otherFieldText}
                    onChange={(e) => setOtherFieldText(e.target.value)}
                    className="mt-2"
                  />
                </div>
              )}
              
              <Button
                onClick={() => {
                  if (!academicBackground) {
                    alert('Please select your academic background');
                    return;
                  }
                  if (academicBackground === 'D' && !otherFieldText.trim()) {
                    alert('Please specify your field of study');
                    return;
                  }
                  // Save academic background to survey data
                  const savedSurveyData = JSON.parse(localStorage.getItem(storageKey) || '{}');
                  const updatedData = {
                    ...savedSurveyData,
                    academicBackground: academicBackground === 'D' ? otherFieldText.trim() : 
                      academicBackground === 'A' ? 'Commerce/Business' :
                      academicBackground === 'B' ? 'Science/Engineering' :
                      'Arts/Humanities'
                  };
                  localStorage.setItem(storageKey, JSON.stringify(updatedData));
                  setStep('info');
                  // Scroll to info form
                  setTimeout(() => {
                    const formElement = document.querySelector('[data-test-form]');
                    if (formElement) {
                      const yOffset = window.innerWidth < 640 ? -120 : -100;
                      const y = formElement.getBoundingClientRect().top + window.pageYOffset + yOffset;
                      window.scrollTo({ top: y, behavior: 'smooth' });
                    }
                  }, 150);
                }}
                className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
              >
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'info') {
    return (
      <div data-test-form className="max-w-md mx-auto mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
              Almost Done!
            </CardTitle>
            <CardDescription className="text-center">
              Please provide your details to receive your personalized report
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleInfoSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your Name"
                  value={userInfo.name}
                  onChange={(e) => {
                    setUserInfo({...userInfo, name: e.target.value});
                    if (validationErrors.name) {
                      setValidationErrors({...validationErrors, name: ''});
                    }
                  }}
                  className={validationErrors.name ? 'border-red-500' : ''}
                  required
                />
                {validationErrors.name && (
                  <p className="text-red-500 text-sm">{validationErrors.name}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={userInfo.email}
                  onChange={(e) => {
                    setUserInfo({...userInfo, email: e.target.value});
                    if (validationErrors.email) {
                      setValidationErrors({...validationErrors, email: ''});
                    }
                  }}
                  className={validationErrors.email ? 'border-red-500' : ''}
                  required
                />
                {validationErrors.email && (
                  <p className="text-red-500 text-sm">{validationErrors.email}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number</Label>
                <Input
                  id="mobile"
                  type="tel"
                  placeholder="9876543210"
                  value={userInfo.mobile}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    setUserInfo({...userInfo, mobile: value});
                    if (validationErrors.mobile) {
                      setValidationErrors({...validationErrors, mobile: ''});
                    }
                  }}
                  className={validationErrors.mobile ? 'border-red-500' : ''}
                  maxLength={10}
                  required
                />
                {validationErrors.mobile && (
                  <p className="text-red-500 text-sm">{validationErrors.mobile}</p>
                )}
              </div>
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
              >
                Get My Report
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'processing') {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto"></div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                Analyzing Your Responses
              </h2>
              <p className="text-lg text-muted-foreground">
                Our AI is processing your assessment and generating personalized insights...
              </p>
              <div className="bg-black dark:bg-black border border-purple-500/30 p-4 rounded-lg">
                <p className="text-sm text-white">
                  This may take a few moments. Please don&apos;t close this page.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'completed') {

    return (
      <div className="max-w-4xl mx-auto mt-8 space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                Assessment Completed!
              </h2>
              <p className="text-lg text-muted-foreground">
                Thank you for completing the Study Abroad Readiness Assessment. Your result will be available in 30 seconds. Hold tight!
              </p>
              <div className="bg-black dark:bg-black border border-purple-500/30 p-4 rounded-lg">
                <p className="text-sm text-white">
                  <strong>Total Questions:</strong> {surveyQuestions.length}<br />
                  <strong>Completed At:</strong> {new Date().toLocaleString()}<br />
                  <strong>Email:</strong> {userInfo.email}
                </p>
              </div>
              {isGeneratingPDF && (
                <div className="w-full max-w-md mx-auto space-y-2 mb-4">
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>Generating PDF...</span>
                    <span>{Math.round(pdfProgress)}%</span>
                  </div>
                  <Progress value={pdfProgress} className="h-2" />
                </div>
              )}
              {pdfStatus && !isGeneratingPDF && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mb-4">
                  <p className="text-sm text-green-700 dark:text-green-300 text-center">
                    {pdfStatus}
                  </p>
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {pdfUrl ? (
                  <Button 
                    onClick={() => window.open(pdfUrl, '_blank', 'noopener,noreferrer')}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    See Result
                  </Button>
                ) : null}
                <Button 
                  onClick={() => window.location.reload()} 
                  className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
                >
                  Take Another Assessment
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div data-question-container className="max-w-4xl mx-auto mt-8 space-y-6">
      {/* Progress Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">{currentQuestion.section}</h2>
              <span className="text-sm text-muted-foreground">
                {currentQuestionIndex + 1} of {surveyQuestions.length}
              </span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        </CardContent>
      </Card>

      {/* Question Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {currentQuestion.id}. {currentQuestion.question}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup value={currentAnswer} onValueChange={handleAnswerSelect}>
            {Object.entries(currentQuestion.options).map(([key, value]) => (
              <div 
                key={key} 
                className="flex items-center space-x-2 p-3 rounded-lg hover:bg-muted/50 cursor-pointer"
                onClick={() => {
                  // Handle re-selection: if same answer is clicked, manually trigger handleAnswerSelect
                  if (currentAnswer === key) {
                    handleAnswerSelect(key);
                  }
                }}
              >
                <RadioGroupItem value={key} id={`${currentQuestion.id}-${key}`} />
                <Label 
                  htmlFor={`${currentQuestion.id}-${key}`} 
                  className="flex-1 cursor-pointer text-sm leading-relaxed"
                >
                  <span className="font-medium">{key})</span> {value}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button 
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          variant="outline"
        >
          Previous
        </Button>
        <Button
          onClick={() => {
            if (currentAnswer && !isNavigatingRef.current) {
              handleNext();
            }
          }}
          disabled={!currentAnswer || isNavigatingRef.current}
          className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
        >
          Next
        </Button>
      </div>

    </div>
  );
}