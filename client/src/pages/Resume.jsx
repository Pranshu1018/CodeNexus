import React, { useState, useRef, useEffect } from "react";
import { FileText, Download, PlusCircle, XCircle, BookOpen } from "lucide-react";
import { jsPDF } from "jspdf";
import Select from 'react-select';
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import API_BASE_URL from '../config/api';

const skillsOptions = [
  { value: 'web-development', label: 'Web Development' },
  { value: 'mobile-development', label: 'Mobile App Development' },
  { value: 'data-structures-algorithms', label: 'Data Structures & Algorithms' },
  { value: 'machine-learning', label: 'Machine Learning' },
  { value: 'cloud-computing', label: 'Cloud Computing (AWS/Azure/GCP)' },
  { value: 'cybersecurity', label: 'Cybersecurity' },
  { value: 'leadership', label: 'Leadership' },
  { value: 'communication', label: 'Communication' },
  { value: 'teamwork', label: 'Teamwork' },
  { value: 'problem-solving', label: 'Problem Solving' },
  { value: 'project-management', label: 'Project Management' }
];

const languagesOptions = [
  { value: 'c++', label: 'C++' },
  { value: 'c', label: 'C' },
  { value: 'java', label: 'Java' },
  { value: 'python', label: 'Python' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'html-css', label: 'HTML/CSS' },
  { value: 'sql', label: 'SQL' }
];

const ResumeBuilder = () => {
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", linkedin: "", github: "", summary: "",
    education: [], experience: [], projects: [], skills: [], languages: [],
  });
  const [generatedResume, setGeneratedResume] = useState(null);
  const [template, setTemplate] = useState('modern');
  const containerRef = useRef(null);
  const previewRef = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (containerRef.current) {
      gsap.fromTo(containerRef.current, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1, ease: "power2.out" });
    }
  }, []);

  const handleAddItem = (section) => {
    const newItem = { id: Date.now() };
    if (section === 'education') newItem.degree = '';
    if (section === 'experience') newItem.title = '';
    if (section === 'projects') newItem.name = '';
    setFormData(prev => ({ ...prev, [section]: [...prev[section], newItem] }));
  };

  const handleRemoveItem = (section, id) => {
    setFormData(prev => ({ ...prev, [section]: prev[section].filter(item => item.id !== id) }));
  };

  const handleItemChange = (section, id, e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [section]: prev[section].map(item => item.id === id ? { ...item, [name]: value } : item) }));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (selectedOptions, fieldName) => {
    setFormData({ ...formData, [fieldName]: selectedOptions });
  };

  const handleGenerate = async () => {
    const requiredFields = ['name', 'email', 'phone', 'linkedin', 'github', 'summary'];
    for (const field of requiredFields) {
      if (!formData[field] || formData[field].trim() === '') {
        alert(`Please fill out all required Personal Details. The '${field}' field is missing.`);
        return;
      }
    }
    try {
      const dataToSend = { ...formData,
        skills: formData.skills.map(skill => skill.label),
        languages: formData.languages.map(lang => lang.label),
      };
      const response = await fetch(`${API_BASE_URL}/generate-resume`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });
      if (!response.ok) {
        const errorData = await response.json();
        alert(`Server Error: ${errorData.error}`); return;
      }
      const data = await response.json();
      if (data) { setGeneratedResume(data); }
    } catch (error) {
      console.error("Error generating resume:", error);
      alert("An unexpected error occurred. Please check the console.");
    }
  };

  const downloadPDF = () => {
    if (!generatedResume) return;
    const doc = new jsPDF('p', 'pt', 'a4');
    switch (template) {
      case 'classic': generateClassicPDF(doc, generatedResume); break;
      case 'creative': generateCreativePDF(doc, generatedResume); break;
      case 'modern': default: generateModernPDF(doc, generatedResume); break;
    }
    doc.save(`${generatedResume.name.replace(' ', '_')}_Resume.pdf`);
  };

  const navigateToCourses = () => {
    window.location.href = '/Courses';
  };

  // === FULLY IMPLEMENTED MODERN TEMPLATE ===
  const generateModernPDF = (doc, data) => {
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 40; let y = 60; const linkColor = '#007bff';
    
    const drawHeader = (title) => {
        doc.setFontSize(14).setFont('helvetica', 'bold');
        doc.setTextColor('#000000');
        doc.text(title, margin, y); y += 5;
        doc.setDrawColor(50, 50, 50).line(margin, y, pageW - margin, y); y += 20;
    };

    // Header
    doc.setFontSize(28).setFont('helvetica', 'bold').text(data.name, margin, y); y += 25;
    let x = margin;
    doc.setFontSize(10).setFont('helvetica', 'normal');
    doc.setTextColor(linkColor).textWithLink(data.email, x, y, { url: `mailto:${data.email}` });
    x += doc.getTextWidth(data.email) + 10;
    doc.setTextColor('#000000').text(`|   ${data.phone}   |`, x, y);
    x += doc.getTextWidth(`|   ${data.phone}   |`) + 10;
    doc.setTextColor(linkColor).textWithLink('LinkedIn', x, y, { url: data.linkedin });
    x += doc.getTextWidth('LinkedIn') + 10;
    doc.setTextColor('#000000').text('|', x, y); x += 10;
    doc.setTextColor(linkColor).textWithLink('GitHub', x, y, { url: data.github });
    doc.setTextColor('#000000'); y += 30;

    // Summary
    drawHeader('Summary');
    doc.setFontSize(10).setFont('helvetica', 'normal');
    const summaryLines = doc.splitTextToSize(data.summary, pageW - margin * 2);
    doc.text(summaryLines, margin, y); y += summaryLines.length * 12 + 20;
    
    // Experience
    if (data.experience && data.experience.length > 0) {
      drawHeader('Work Experience');
      data.experience.forEach(exp => {
        doc.setFontSize(11).setFont('helvetica', 'bold').text(exp.title, margin, y);
        doc.setFontSize(10).setFont('helvetica', 'italic').text(`${exp.company} | ${exp.dates}`, pageW - margin, y, { align: 'right' }); y += 20;
      });
      y += 10;
    }
    // Projects
    if (data.projects && data.projects.length > 0) {
      drawHeader('Projects');
      data.projects.forEach(proj => {
        doc.setFontSize(11).setFont('helvetica', 'bold').text(proj.name, margin, y); y += 15;
        doc.setFontSize(10).setFont('helvetica', 'normal');
        const descLines = doc.splitTextToSize(proj.description, pageW - margin * 2 - 10);
        doc.text(descLines, margin + 10, y); y += descLines.length * 12 + 15;
      });
      y += 10;
    }
    // Education
    if (data.education && data.education.length > 0) {
      drawHeader('Education');
      data.education.forEach(edu => {
        doc.setFontSize(11).setFont('helvetica', 'bold').text(edu.degree, margin, y);
        doc.setFontSize(10).setFont('helvetica', 'italic').text(edu.year, pageW - margin, y, { align: 'right' }); y += 15;
        doc.setFontSize(10).setFont('helvetica', 'normal').text(edu.university, margin, y); y += 20;
      });
      y += 10;
    }
    // Skills
    if (data.skills && data.skills.length > 0) {
      drawHeader('Skills');
      doc.setFontSize(10).setFont('helvetica', 'normal');
      doc.text(data.skills.join('  •  '), margin, y, { maxWidth: pageW - margin * 2 }); y += 30;
    }
    // Languages
    if (data.languages && data.languages.length > 0) {
      drawHeader('Languages');
      doc.setFontSize(10).setFont('helvetica', 'normal');
      doc.text(data.languages.join('  •  '), margin, y, { maxWidth: pageW - margin * 2 }); y += 20;
    }
  };

  // === FULLY IMPLEMENTED CLASSIC TEMPLATE ===
  const generateClassicPDF = (doc, data) => {
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 50; let y = 60; const linkColor = '#0000EE';
    
    const drawHeader = (title) => {
        doc.setFontSize(14).setFont('times', 'bold');
        doc.setTextColor('#000000');
        doc.text(title.toUpperCase(), pageW / 2, y, { align: 'center' }); y += 10;
        doc.setDrawColor(0, 0, 0).line(margin, y, pageW - margin, y); y += 20;
    };

    // Header
    doc.setFontSize(32).setFont('times', 'bold').text(data.name, pageW / 2, y, { align: 'center' }); y += 25;
    doc.setFontSize(11).setFont('times', 'normal');
    const contactLine = `${data.email} | ${data.phone}`;
    doc.text(contactLine, pageW / 2, y, { align: 'center' }); y += 15;
    doc.setTextColor(linkColor).textWithLink('LinkedIn', pageW / 2 - 30, y, { url: data.linkedin, align: 'center' });
    doc.setTextColor('#000000').text('|', pageW / 2, y, { align: 'center' });
    doc.setTextColor(linkColor).textWithLink('GitHub', pageW / 2 + 30, y, { url: data.github, align: 'center' });
    doc.setTextColor('#000000'); y += 30;

    // Summary
    drawHeader('Professional Summary');
    doc.setFontSize(11).setFont('times', 'normal');
    const summaryLines = doc.splitTextToSize(data.summary, pageW - margin * 2);
    doc.text(summaryLines, margin, y); y += summaryLines.length * 12 + 20;

    // Experience
    if (data.experience && data.experience.length > 0) {
      drawHeader('Work Experience');
      data.experience.forEach(exp => {
        doc.setFontSize(12).setFont('times', 'bold').text(exp.title, margin, y);
        doc.setFontSize(11).setFont('times', 'italic').text(`${exp.company} | ${exp.dates}`, pageW - margin, y, { align: 'right' }); y += 20;
      });
      y += 10;
    }
    // Projects
    if (data.projects && data.projects.length > 0) {
      drawHeader('Projects');
      data.projects.forEach(proj => {
        doc.setFontSize(12).setFont('times', 'bold').text(proj.name, margin, y); y += 15;
        doc.setFontSize(11).setFont('times', 'normal');
        const descLines = doc.splitTextToSize(proj.description, pageW - margin * 2);
        doc.text(descLines, margin, y); y += descLines.length * 12 + 20;
      });
      y += 10;
    }
    // Education
    if (data.education && data.education.length > 0) {
      drawHeader('Education');
      data.education.forEach(edu => {
        doc.setFontSize(12).setFont('times', 'bold').text(edu.degree, margin, y);
        doc.setFontSize(11).setFont('times', 'italic').text(edu.year, pageW - margin, y, { align: 'right' }); y += 15;
        doc.setFontSize(11).setFont('times', 'normal').text(edu.university, margin, y); y += 20;
      });
      y += 10;
    }
    // Skills
    if (data.skills && data.skills.length > 0) {
      drawHeader('Skills');
      doc.setFontSize(11).setFont('times', 'normal');
      doc.text(data.skills.join('  •  '), margin, y, { maxWidth: pageW - margin * 2 }); y += 30;
    }
    // Languages
    if (data.languages && data.languages.length > 0) {
      drawHeader('Languages');
      doc.setFontSize(11).setFont('times', 'normal');
      doc.text(data.languages.join('  •  '), margin, y, { maxWidth: pageW - margin * 2 }); y += 20;
    }
  };
  
  // === FULLY IMPLEMENTED CREATIVE TEMPLATE ===
  const generateCreativePDF = (doc, data) => {
    const pageW = doc.internal.pageSize.getWidth();
    let y = 0;
    const sidebarWidth = 180;
    const mainX = sidebarWidth + 30;
    const mainWidth = pageW - mainX - 30;

    // Sidebar Background
    doc.setFillColor(44, 62, 80); // Dark Blue-Grey
    doc.rect(0, 0, sidebarWidth, doc.internal.pageSize.getHeight(), 'F');
    
    // --- SIDEBAR CONTENT ---
    y = 50;
    doc.setTextColor('#FFFFFF');
    // Name
    doc.setFontSize(26).setFont('helvetica', 'bold');
    const firstName = data.name.split(' ')[0];
    const lastName = data.name.split(' ').slice(1).join(' ');
    doc.text(firstName.toUpperCase(), 20, y); y += 30;
    doc.setTextColor('#3498db'); // Light blue accent
    doc.text(lastName.toUpperCase(), 20, y); y += 50;
    
    // Contact Info
    doc.setTextColor('#FFFFFF');
    doc.setFontSize(12).setFont('helvetica', 'bold').text('CONTACT', 20, y); y += 20;
    doc.setFontSize(9).setFont('helvetica', 'normal');
    
    // Email
    doc.setTextColor('#ecf0f1'); // Off-white
    doc.textWithLink(data.email, 20, y, { url: `mailto:${data.email}`, maxWidth: sidebarWidth - 30 });
    y += doc.splitTextToSize(data.email, sidebarWidth - 30).length * 12 + 10;
    // Phone
    doc.text(data.phone, 20, y); y += 20;
    // LinkedIn
    doc.setTextColor('#3498db');
    doc.textWithLink('LinkedIn Profile', 20, y, { url: data.linkedin }); y += 20;
    // GitHub
    doc.textWithLink('GitHub Profile', 20, y, { url: data.github }); y += 40;
    
    // Skills (in Sidebar)
    if (data.skills && data.skills.length > 0) {
      doc.setTextColor('#FFFFFF').setFontSize(12).setFont('helvetica', 'bold').text('SKILLS', 20, y); y += 20;
      doc.setFontSize(10).setFont('helvetica', 'normal').setTextColor('#ecf0f1');
      data.skills.forEach(skill => {
          doc.text(`• ${skill}`, 20, y); y += 15;
      });
      y += 20;
    }
    // Languages (in Sidebar)
    if (data.languages && data.languages.length > 0) {
      doc.setTextColor('#FFFFFF').setFontSize(12).setFont('helvetica', 'bold').text('LANGUAGES', 20, y); y += 20;
      doc.setFontSize(10).setFont('helvetica', 'normal').setTextColor('#ecf0f1');
      data.languages.forEach(lang => {
          doc.text(`• ${lang}`, 20, y); y += 15;
      });
    }

    // --- MAIN CONTENT ---
    y = 50;
    doc.setTextColor('#2c3e50'); // Dark grey for main text
    
    const drawMainHeader = (title) => {
        doc.setFontSize(16).setFont('helvetica', 'bold').setTextColor('#3498db');
        doc.text(title.toUpperCase(), mainX, y); y += 8;
        doc.setDrawColor(52, 152, 219).setLineWidth(2).line(mainX, y, mainX + 50, y); // Short blue underline
        y += 25;
    };

    // Summary
    drawMainHeader('Profile');
    doc.setFontSize(10).setFont('helvetica', 'normal').setTextColor('#2c3e50');
    const summaryLines = doc.splitTextToSize(data.summary, mainWidth);
    doc.text(summaryLines, mainX, y); y += summaryLines.length * 14 + 20;
    
    // Experience
    if (data.experience && data.experience.length > 0) {
        drawMainHeader('Experience');
        data.experience.forEach(exp => {
            doc.setFontSize(12).setFont('helvetica', 'bold').setTextColor('#2c3e50');
            doc.text(exp.title, mainX, y); y += 15;
            doc.setFontSize(10).setFont('helvetica', 'bold').setTextColor('#3498db');
            doc.text(exp.company, mainX, y); 
            doc.setFontSize(10).setFont('helvetica', 'italic').setTextColor('#7f8c8d'); // Grey for dates
            doc.text(exp.dates, mainX + mainWidth, y, { align: 'right' }); y += 25;
        });
        y += 10;
    }
    // Projects
    if (data.projects && data.projects.length > 0) {
        drawMainHeader('Projects');
        data.projects.forEach(proj => {
            doc.setFontSize(12).setFont('helvetica', 'bold').setTextColor('#2c3e50');
            doc.text(proj.name, mainX, y); y += 15;
            doc.setFontSize(10).setFont('helvetica', 'normal').setTextColor('#2c3e50');
            const descLines = doc.splitTextToSize(proj.description, mainWidth);
            doc.text(descLines, mainX, y); y += descLines.length * 14 + 20;
        });
    }
    // Education
    if (data.education && data.education.length > 0) {
        drawMainHeader('Education');
        data.education.forEach(edu => {
            doc.setFontSize(12).setFont('helvetica', 'bold').setTextColor('#2c3e50');
            doc.text(edu.degree, mainX, y); y += 15;
             doc.setFontSize(10).setFont('helvetica', 'bold').setTextColor('#3498db');
            doc.text(edu.university, mainX, y);
            doc.setFontSize(10).setFont('helvetica', 'italic').setTextColor('#7f8c8d');
            doc.text(edu.year, mainX + mainWidth, y, { align: 'right' }); y += 25;
        });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "", email: "", phone: "", linkedin: "", github: "", summary: "",
      education: [], experience: [], projects: [], skills: [], languages: [],
    });
    setGeneratedResume(null);
  };
  
  return (
    <div ref={containerRef} className="mt-10 min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-green-200 p-10">
      <h1 className="text-center text-4xl md:text-5xl font-extrabold text-white mb-8">AI Resume Builder</h1>
      <div className="flex flex-col md:flex-row justify-center gap-8">
        <div className="w-full md:w-1/2">
          <div className="bg-gray-800 p-6 rounded-xl shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-4">Personal Details</h2>
            <input type="text" name="name" placeholder="Name" onChange={handleChange} value={formData.name} className="w-full p-3 bg-gray-700 rounded-lg mb-4" />
            <input type="email" name="email" placeholder="Email" onChange={handleChange} value={formData.email} className="w-full p-3 bg-gray-700 rounded-lg mb-4" />
            <input type="text" name="phone" placeholder="Phone" onChange={handleChange} value={formData.phone} className="w-full p-3 bg-gray-700 rounded-lg mb-4" />
            <input type="text" name="linkedin" placeholder="LinkedIn URL" onChange={handleChange} value={formData.linkedin} className="w-full p-3 bg-gray-700 rounded-lg mb-4" />
            <input type="text" name="github" placeholder="GitHub URL" onChange={handleChange} value={formData.github} className="w-full p-3 bg-gray-700 rounded-lg mb-4" />
            <textarea name="summary" placeholder="Professional Summary" onChange={handleChange} value={formData.summary} className="w-full p-3 bg-gray-700 rounded-lg mb-4" />

            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-4">Work Experience</h2>
              {formData.experience.map((exp) => (
                <div key={exp.id} className="bg-gray-700 p-4 rounded-lg mb-4">
                  <XCircle className="float-right cursor-pointer text-red-500" onClick={() => handleRemoveItem('experience', exp.id)} />
                  <input type="text" name="title" placeholder="Job Title" value={exp.title || ''} onChange={(e) => handleItemChange('experience', exp.id, e)} className="w-full p-2 bg-gray-600 rounded mb-2" />
                  <input type="text" name="company" placeholder="Company" value={exp.company || ''} onChange={(e) => handleItemChange('experience', exp.id, e)} className="w-full p-2 bg-gray-600 rounded mb-2" />
                  <input type="text" name="dates" placeholder="Dates (e.g., Jan 2020 - Present)" value={exp.dates || ''} onChange={(e) => handleItemChange('experience', exp.id, e)} className="w-full p-2 bg-gray-600 rounded" />
                </div>
              ))}
              <button onClick={() => handleAddItem('experience')} className="flex items-center gap-2 text-green-400 font-bold py-2 px-4 rounded hover:bg-gray-700"><PlusCircle size={18} /> Add Experience</button>
            </div>

             <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-4">Education</h2>
              {formData.education.map((edu, index) => (
                <div key={edu.id} className="bg-gray-700 p-4 rounded-lg mb-4">
                  <XCircle className="float-right cursor-pointer text-red-500" onClick={() => handleRemoveItem('education', edu.id)} />
                  <input type="text" name="degree" placeholder="Type of Institution" value={edu.degree || ''} onChange={(e) => handleItemChange('education', edu.id, e)} className="w-full p-2 bg-gray-600 rounded mb-2" />
                  <input type="text" name="university" placeholder="University Name" value={edu.university || ''} onChange={(e) => handleItemChange('education', edu.id, e)} className="w-full p-2 bg-gray-600 rounded mb-2" />
                  <input type="text" name="year" placeholder="Year of Graduation" value={edu.year || ''} onChange={(e) => handleItemChange('education', edu.id, e)} className="w-full p-2 bg-gray-600 rounded" />
                </div>
              ))}
              <button onClick={() => handleAddItem('education')} className="flex items-center gap-2 text-green-400 font-bold py-2 px-4 rounded hover:bg-gray-700">
                <PlusCircle size={18} /> Add Education
              </button>
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-4">Projects</h2>
              {formData.projects.map((proj) => (
                <div key={proj.id} className="bg-gray-700 p-4 rounded-lg mb-4">
                  <XCircle className="float-right cursor-pointer text-red-500" onClick={() => handleRemoveItem('projects', proj.id)} />
                  <input type="text" name="name" placeholder="Project Name" value={proj.name || ''} onChange={(e) => handleItemChange('projects', proj.id, e)} className="w-full p-2 bg-gray-600 rounded mb-2" />
                  <textarea name="description" placeholder="Project Description" value={proj.description || ''} onChange={(e) => handleItemChange('projects', proj.id, e)} className="w-full p-2 bg-gray-600 rounded" />
                </div>
              ))}
              <button onClick={() => handleAddItem('projects')} className="flex items-center gap-2 text-green-400 font-bold py-2 px-4 rounded hover:bg-gray-700"><PlusCircle size={18} /> Add Project</button>
            </div>

            <h2 className="text-2xl font-bold text-white mb-4">Skills & Languages</h2>
            <div className="mb-4">
              <Select isMulti name="skills" options={skillsOptions} className="text-gray-900" placeholder="Select Skills..." value={formData.skills} onChange={(opts) => handleSelectChange(opts, 'skills')} />
            </div>
            <div className="mb-4">
              <Select isMulti name="languages" options={languagesOptions} className="text-gray-900" placeholder="Select Languages..." value={formData.languages} onChange={(opts) => handleSelectChange(opts, 'languages')} />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <button onClick={handleGenerate} className="w-full px-4 py-2 rounded-md bg-green-600 text-white font-medium flex items-center justify-center"><FileText size={18} className="mr-2" /> Generate Resume</button>
              <button onClick={resetForm} className="w-full px-4 py-2 rounded-md bg-red-600 text-white font-medium flex items-center justify-center">Reset</button>
            </div>
          </div>
        </div>

        <div className="w-full md:w-1/2">
          {generatedResume && (
            <div ref={previewRef} className="bg-gray-800 p-6 rounded-xl shadow-xl">
              <h2 className="text-2xl font-bold text-white mb-4">Preview & Download</h2>
              <div className="text-left bg-gray-900 p-4 rounded-lg">
                <h3 className="text-xl font-bold">{generatedResume.name}</h3>
                <p className="text-sm text-green-300">{generatedResume.email}</p>
                <p className="mt-2 text-sm">{generatedResume.summary}</p>
              </div>
              <div className="mt-6">
                <label htmlFor="template-select" className="block mb-2 text-sm font-medium text-white">Select PDF Format</label>
                <select id="template-select" value={template} onChange={(e) => setTemplate(e.target.value)} className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5">
                  <option value="modern">Modern</option>
                  <option value="classic">Classic</option>
                  <option value="creative">Creative (2-Column)</option>
                </select>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <button onClick={downloadPDF} className="w-full px-4 py-2 rounded-md bg-blue-600 text-white font-medium flex items-center justify-center hover:bg-blue-700">
                  <Download size={18} className="mr-2" /> Download PDF
                </button>
                <button 
                  onClick={navigateToCourses} 
                  className="w-full px-4 py-2 rounded-md bg-purple-600 text-white font-medium flex items-center justify-center hover:bg-purple-700"
                >
                  <BookOpen size={18} className="mr-2" /> Recommended Courses
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;