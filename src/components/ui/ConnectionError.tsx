import Button from '../ui/Button';
import Card from '../ui/Card';

interface ConnectionErrorProps {
  error: string;
  onRetry?: () => void;
  showTechnicalDetails?: boolean;
}

const ConnectionError: React.FC<ConnectionErrorProps> = ({ 
  error, 
  onRetry, 
  showTechnicalDetails = false 
}) => {
  const isCorsError = error.includes('CORS') || error.includes('Unable to connect to server');
  const isNetworkError = error.includes('Network') || error.includes('ERR_NETWORK');

  const getErrorIcon = () => {
    if (isCorsError) {
      return (
        <svg className="h-16 w-16 text-yellow-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833-.23 2.5 1.312 2.5z" />
        </svg>
      );
    }
    
    return (
      <svg className="h-16 w-16 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  };

  const getErrorTitle = () => {
    if (isCorsError) return 'Server Connection Issue';
    if (isNetworkError) return 'Network Connection Problem';
    return 'Connection Error';
  };

  const getErrorMessage = () => {
    if (isCorsError) {
      return 'We\'re having trouble connecting to our servers. This usually resolves itself within a few minutes.';
    }
    if (isNetworkError) {
      return 'Please check your internet connection and try again.';
    }
    return 'An unexpected error occurred while connecting to our services.';
  };

  const getTroubleshootingSteps = () => {
    if (isCorsError) {
      return [
        'Wait a moment and try again',
        'Refresh the page',
        'Check if our status page reports any issues',
        'Try again in a few minutes'
      ];
    }
    
    if (isNetworkError) {
      return [
        'Check your internet connection',
        'Try refreshing the page',
        'Disable VPN if you\'re using one',
        'Contact support if the issue persists'
      ];
    }
    
    return [
      'Refresh the page',
      'Check your internet connection',
      'Try again in a few minutes',
      'Contact support if the issue continues'
    ];
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <div className="p-8">
          {getErrorIcon()}
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {getErrorTitle()}
          </h2>
          
          <p className="text-gray-600 mb-6">
            {getErrorMessage()}
          </p>
          
          <div className="text-left mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">What you can try:</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              {getTroubleshootingSteps().map((step, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="space-y-3">
            {onRetry && (
              <Button onClick={onRetry} className="w-full">
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Try Again
              </Button>
            )}
            
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()} 
              className="w-full"
            >
              Refresh Page
            </Button>
          </div>
          
          {showTechnicalDetails && (
            <details className="mt-6 text-left">
              <summary className="text-sm font-medium text-gray-500 cursor-pointer hover:text-gray-700">
                Technical Details
              </summary>
              <div className="mt-2 p-3 bg-gray-50 rounded border text-xs font-mono text-gray-600 break-all">
                {error}
              </div>
            </details>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ConnectionError;
