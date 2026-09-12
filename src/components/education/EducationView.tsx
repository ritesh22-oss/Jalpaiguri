import React, { useState, useMemo } from 'react';
import { EducationHeader } from './EducationHeader';
import { EducationSearch } from './EducationSearch';
import { EducationCategoryCard } from './EducationCategoryCard';
import { EducationInstitutionModal } from './EducationInstitutionModal';
import { EDUCATIONAL_INSTITUTIONS } from '../../data/educationData';
import { EducationalInstitution } from '../../types';
import { GraduationCap, ShieldCheck, Bookmark, AlertCircle, BookOpen, Search, Calendar, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const EducationView: React.FC = () => {
  const { isBengali } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'institutions' | 'notices' | 'register' | 'courses'>('institutions');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedInstitution, setSelectedInstitution] = useState<EducationalInstitution | null>(null);

  const filteredInstitutions = useMemo(() => {
    return EDUCATIONAL_INSTITUTIONS.filter(inst => {
        const matchesQuery = inst.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             inst.locality.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             inst.overview.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = !selectedCategory || inst.category === selectedCategory;
        return matchesQuery && matchesCategory;
      });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0F1713] pb-20">
      <EducationHeader />
      <EducationSearch 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        onOpenFilters={() => {}} 
      />
      
      <div className="max-w-2xl mx-auto px-4 mt-8">
        <h2 className="text-lg font-black dark:text-white mb-4">
            {isBengali ? 'শ্রেণীসমূহ' : 'Explore Categories'}
        </h2>
        <div className="grid grid-cols-2 gap-4">
            <EducationCategoryCard 
                icon={<BookOpen className="w-5 h-5"/>}
                title={isBengali ? 'স্কুল' : 'Schools'}
                description={isBengali ? 'প্রাথমিক ও মাধ্যমিক' : 'Primary & Secondary'}
                onClick={() => { setSelectedCategory('School'); setActiveTab('institutions'); }}
            />
            <EducationCategoryCard 
                icon={<GraduationCap className="w-5 h-5"/>}
                title={isBengali ? 'কলেজ' : 'Colleges'}
                description={isBengali ? 'উচ্চ শিক্ষা' : 'Higher Education'}
                onClick={() => { setSelectedCategory('College'); setActiveTab('institutions'); }}
            />
             <EducationCategoryCard 
                icon={<Search className="w-5 h-5"/>}
                title={isBengali ? 'কোর্স' : 'Courses'}
                description={isBengali ? 'নতুন দক্ষতা' : 'Explore Skills'}
                onClick={() => { setSelectedCategory(null); setActiveTab('courses'); }}
            />
             <EducationCategoryCard 
                icon={<Calendar className="w-5 h-5"/>}
                title={isBengali ? 'ভর্তি' : 'Admissions'}
                description={isBengali ? 'গুরুত্বপূর্ণ তারিখ' : 'Important Dates'}
                onClick={() => { setSelectedCategory(null); setActiveTab('notices'); }}
            />
        </div>

        {activeTab === 'institutions' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mt-8 mb-4">
              <h2 className="text-lg font-black dark:text-white">
                  {selectedCategory ? `${selectedCategory}s (${filteredInstitutions.length})` : (isBengali ? 'প্রতিষ্ঠানসমূহ' : `All Institutions (${filteredInstitutions.length})`)}
              </h2>
              {selectedCategory && (
                <button 
                  onClick={() => setSelectedCategory(null)}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Show All
                </button>
              )}
            </div>
            <div className="space-y-3">
                {filteredInstitutions.map(inst => (
                    <div 
                      key={inst.id} 
                      onClick={() => setSelectedInstitution(inst)}
                      className="bg-white dark:bg-[#17231E] p-4 rounded-2xl border border-gray-200 dark:border-white/10 shadow-xs hover:border-blue-500 dark:hover:border-blue-400 transition-all cursor-pointer group"
                    >
                         <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2.5 rounded-xl bg-blue-50 text-[#007AFF] dark:bg-blue-950/40 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                <GraduationCap className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <h3 className="text-sm font-extrabold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{inst.name}</h3>
                                  <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0" />
                                </div>
                                <p className="text-[11px] text-gray-500 font-semibold">{inst.category} • {inst.locality} • {inst.address}</p>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                          </div>
                    </div>
                ))}
            </div>
          </div>
        )}

        {activeTab === 'notices' && (
            <div className="mt-8 space-y-4">
                <h2 className="text-lg font-black dark:text-white mb-4">
                    {isBengali ? 'ভর্তি ও নোটিশ' : 'Admissions & Notices'}
                </h2>
                {EDUCATIONAL_INSTITUTIONS.flatMap(inst => inst.notices.map(n => ({ ...n, instName: inst.name }))).map(notice => (
                    <div key={notice.id} className="bg-white dark:bg-[#17231E] p-4 rounded-2xl border border-gray-200 dark:border-white/10 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-0.5 rounded-full">
                            {notice.instName}
                          </span>
                          {notice.deadline && (
                            <span className="text-[10px] text-rose-600 font-bold">
                              Deadline: {notice.deadline}
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-black text-gray-900 dark:text-white">{notice.title}</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-300">{notice.description}</p>
                    </div>
                ))}
            </div>
        )}
        
        {activeTab === 'courses' && (
            <div className="mt-8 space-y-4">
                <h2 className="text-lg font-black dark:text-white mb-4">
                    {isBengali ? 'কোর্স' : 'Available Courses'}
                </h2>
                {EDUCATIONAL_INSTITUTIONS.flatMap(inst => inst.courses.map(c => ({ ...c, instName: inst.name }))).map(course => (
                    <div key={course.id} className="bg-white dark:bg-[#17231E] p-4 rounded-2xl border border-gray-200 dark:border-white/10 space-y-2">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white">{course.name}</h4>
                        <p className="text-xs text-gray-500">{course.instName} • {course.category}</p>
                        <div className="flex justify-between items-center pt-2">
                            <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold">{course.duration}</span>
                            <span className="text-xs font-bold text-emerald-600">{course.fees}</span>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>

      {/* Institution Detail Modal */}
      <EducationInstitutionModal
        institution={selectedInstitution}
        onClose={() => setSelectedInstitution(null)}
      />
    </div>
  );
};
