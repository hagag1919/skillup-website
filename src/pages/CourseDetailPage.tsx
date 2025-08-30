import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchCourseById, fetchCourses } from '../store/slices/coursesSlice';
import Button from '../components/ui/Button';
import Loading from '../components/ui/Loading';
import Card from '../components/ui/Card';
import InstructorContentGuide from '../components/course/InstructorContentGuide';

const CourseDetailPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { currentCourse, courses, loading, error } = useAppSelector(state => state.courses);
  const { user, isAuthenticated } = useAppSelector(state => state.auth);

  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  // Fallback: try to find course in the courses list if detailed fetch fails
  const fallbackCourse = courses.find(course => course.id === Number(courseId));
  const displayCourse = currentCourse || fallbackCourse;

  // Debug logging for development
  if (process.env.NODE_ENV === 'development') {
    console.log('CourseDetailPage Debug:', {
      courseId,
      coursesCount: courses.length,
      currentCourse: !!currentCourse,
      fallbackCourse: !!fallbackCourse,
      displayCourse: !!displayCourse,
      displayCourseModules: displayCourse?.modules?.length || 0,
      error
    });
  }

  useEffect(() => {
    if (courseId) {
      // Try to fetch the specific course details
      dispatch(fetchCourseById(Number(courseId)));
      
      // If courses list is empty, also fetch the courses list for fallback data
      if (courses.length === 0) {
        dispatch(fetchCourses({ page: 1, size: 20 }));
      }
      
      // TODO: Check if user is already enrolled
      // checkEnrollmentStatus(courseId);
    }
  }, [dispatch, courseId, courses.length]);

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!courseId) return;

    setEnrolling(true);
    try {
      // TODO: Implement enrollment API call
      // await enrollInCourse(courseId);
      setIsEnrolled(true);
      console.log('Enrolled in course:', courseId);
    } catch (error) {
      console.error('Enrollment failed:', error);
    } finally {
      setEnrolling(false);
    }
  };

  const handleUnenroll = async () => {
    if (!courseId) return;

    setEnrolling(true);
    try {
      // TODO: Implement unenrollment API call
      // await unenrollFromCourse(courseId);
      setIsEnrolled(false);
      console.log('Unenrolled from course:', courseId);
    } catch (error) {
      console.error('Unenrollment failed:', error);
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading text="Loading course details..." />
      </div>
    );
  }

  if (error || !displayCourse) {
    // Check if it's the specific Hibernate error
    const isHibernateError = error?.includes('MultipleBagFetchException');
    
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="mb-4">
            {isHibernateError ? (
              <svg className="mx-auto h-12 w-12 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833-.23 2.5 1.312 2.5z" />
              </svg>
            ) : (
              <svg className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0121 12c0-4.418-3.582-8-8-8s-8 3.582-8 8c0 2.027.754 3.877 2 5.291" />
              </svg>
            )}
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {isHibernateError ? 'Course Details Temporarily Unavailable' : 'Course not found'}
          </h2>
          
          <p className="text-gray-600 mb-6">
            {isHibernateError 
              ? 'We\'re experiencing a technical issue loading course details. Our team has been notified and is working on a fix.'
              : (error || 'The course you are looking for does not exist.')
            }
          </p>
          
          {process.env.NODE_ENV === 'development' && error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
              <p className="text-sm font-medium text-red-800 mb-2">Development Error Details:</p>
              <p className="text-xs text-red-600 font-mono break-all">{error}</p>
            </div>
          )}
          
          <div className="space-y-3">
            <Button onClick={() => navigate('/courses')} className="w-full">
              Back to Courses
            </Button>
            
            {isHibernateError && (
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()} 
                className="w-full"
              >
                Try Again
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Course Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Course Image */}
            <div className="lg:w-1/3">
              <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                {displayCourse.thumbnailUrl ? (
                  <img 
                    src={displayCourse.thumbnailUrl} 
                    alt={displayCourse.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Course Info */}
            <div className="lg:w-2/3">
              <span className="inline-block px-3 py-1 text-sm font-semibold text-primary bg-blue-100 rounded-full mb-3">
                {displayCourse.category}
              </span>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {displayCourse.title}
              </h1>
              
              <p className="text-gray-600 mb-4">
                {displayCourse.description}
              </p>

              <div className="flex items-center mb-6">
                <div className="text-sm text-gray-500">
                  Instructor: <span className="font-medium text-gray-900">{displayCourse.instructor?.name || 'Unknown'}</span>
                </div>
                {displayCourse.rating && (
                  <div className="ml-4 flex items-center">
                    <span className="text-yellow-400">★</span>
                    <span className="text-sm text-gray-600 ml-1">
                      {displayCourse.rating} ({displayCourse.reviewCount || 0} reviews)
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                {user?.role === 'INSTRUCTOR' && user.id === displayCourse.instructorId ? (
                  // Instructor management options
                  <>
                    <Button 
                      onClick={() => navigate(`/instructor/courses/${courseId}/content`)}
                      className="px-8"
                    >
                      <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      Manage Content
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => navigate(`/instructor/courses/${courseId}/edit`)}
                    >
                      <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit Course
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => navigate(`/instructor/courses/${courseId}/analytics`)}
                    >
                      <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Analytics
                    </Button>
                  </>
                ) : (
                  // Student enrollment options
                  <>
                    {isEnrolled ? (
                      <>
                        <Button 
                          onClick={() => navigate(`/courses/${courseId}/learn`)}
                          className="px-8"
                        >
                          Continue Learning
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={handleUnenroll}
                          disabled={enrolling}
                          loading={enrolling}
                        >
                          Unenroll
                        </Button>
                      </>
                    ) : (
                      <Button 
                        onClick={handleEnroll}
                        disabled={enrolling}
                        loading={enrolling}
                        className="px-8"
                      >
                        Enroll Now
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Instructor Management Section */}
        {user?.role === 'INSTRUCTOR' && user.id === displayCourse.instructorId && (
          <Card className="mb-8 bg-blue-50 border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-blue-900">Course Management</h3>
                  <p className="text-sm text-blue-700">Manage your course content, settings, and analytics</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                onClick={() => navigate(`/instructor/courses/${courseId}/content`)}
                className="bg-blue-600 hover:bg-blue-700 text-white justify-start"
              >
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012 2v2M7 7h10" />
                </svg>
                Manage Content
                <span className="ml-auto text-xs bg-blue-500 px-2 py-1 rounded">
                  {displayCourse.modules?.length || 0} modules
                </span>
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => navigate(`/instructor/courses/${courseId}/edit`)}
                className="border-blue-300 text-blue-700 hover:bg-blue-50 justify-start"
              >
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Details
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => navigate(`/instructor/courses/${courseId}/analytics`)}
                className="border-blue-300 text-blue-700 hover:bg-blue-50 justify-start"
              >
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                View Analytics
                <span className="ml-auto text-xs bg-gray-200 px-2 py-1 rounded">
                  {displayCourse.enrollmentCount || 0} students
                </span>
              </Button>
            </div>
            
            {(!displayCourse.modules || displayCourse.modules.length === 0) && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start">
                  <svg className="h-5 w-5 text-yellow-400 mt-0.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833-.23 2.5 1.312 2.5z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-yellow-800">No content added yet</p>
                    <p className="text-sm text-yellow-700 mt-1">Start adding modules and lessons to make your course available to students.</p>
                  </div>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Instructor Content Guide */}
        {user?.role === 'INSTRUCTOR' && user.id === displayCourse.instructorId && (
          <InstructorContentGuide 
            courseId={courseId!} 
            hasModules={!!(displayCourse.modules && displayCourse.modules.length > 0)} 
          />
        )}

        {/* Course Content Preview */}
        <Card className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Content</h2>
          
          {displayCourse.modules && displayCourse.modules.length > 0 ? (
            <div className="space-y-4">
              {displayCourse.modules.map((module, index) => (
                <div key={module.id} className="border border-gray-200 rounded-lg">
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900">
                      Module {index + 1}: {module.title}
                    </h3>
                  </div>
                  
                  {module.lessons && module.lessons.length > 0 && (
                    <div className="px-4 py-3">
                      <p className="text-sm text-gray-600">
                        {module.lessons.length} lesson{module.lessons.length !== 1 ? 's' : ''}
                      </p>
                      {isEnrolled && (
                        <ul className="mt-2 space-y-1">
                          {module.lessons.map((lesson) => (
                            <li key={lesson.id} className="text-sm text-gray-700">
                              • {lesson.title}
                              {lesson.durationSeconds && (
                                <span className="text-gray-500 ml-2">
                                  ({Math.ceil(lesson.durationSeconds / 60)} min)
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">Course content is being prepared. Check back soon!</p>
          )}
        </Card>

        {/* Instructor Info */}
        {displayCourse.instructor && (
          <Card>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">About the Instructor</h2>
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-xl font-semibold text-gray-600">
                  {displayCourse.instructor.name.charAt(0)}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{displayCourse.instructor.name}</h3>
                <p className="text-gray-600 text-sm">{displayCourse.instructor.role}</p>
                {displayCourse.instructor.bio && (
                  <p className="mt-2 text-gray-700">{displayCourse.instructor.bio}</p>
                )}
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CourseDetailPage;
