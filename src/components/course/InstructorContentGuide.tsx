import { Link } from 'react-router-dom';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface InstructorContentGuideProps {
  courseId: string;
  hasModules: boolean;
}

const InstructorContentGuide: React.FC<InstructorContentGuideProps> = ({ courseId, hasModules }) => {
  if (hasModules) return null;

  return (
    <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <div className="text-center py-8">
        <div className="mb-6">
          <svg className="mx-auto h-16 w-16 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Add Content?</h3>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          Transform your course into an engaging learning experience by adding modules and lessons. 
          Your students are waiting to learn from you!
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-xl font-bold text-blue-600">1</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Create Modules</h4>
            <p className="text-sm text-gray-600">Organize your content into logical modules or chapters</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-xl font-bold text-blue-600">2</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Add Lessons</h4>
            <p className="text-sm text-gray-600">Upload videos and create lessons for each module</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-xl font-bold text-blue-600">3</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Publish & Share</h4>
            <p className="text-sm text-gray-600">Make your course live and start teaching students</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to={`/instructor/courses/${courseId}/content`}>
            <Button size="lg" className="px-8">
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Start Adding Content
            </Button>
          </Link>
          
          <Button variant="outline" size="lg" onClick={() => window.open('https://docs.example.com/instructor-guide', '_blank')}>
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            View Guide
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default InstructorContentGuide;
