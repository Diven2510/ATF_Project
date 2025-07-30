// Environment variable utility
export const getApiUrl = () => {
  try {
    return import.meta.env?.VITE_API_URL || 'http://16.170.128.111';
  } catch (error) {
    console.warn('Error accessing VITE_API_URL:', error);
    return 'http://16.170.128.111';
  }
};

export const getCompilerUrl = () => {
  try {
    return import.meta.env?.VITE_COMPILER_URL || 'http://16.170.128.111';
  } catch (error) {
    console.warn('Error accessing VITE_COMPILER_URL:', error);
    return 'http://16.170.128.111';
  }
}; 