import { toast } from 'react-toastify';

export const showSuccess = (message: string) => {
  toast.success(message, {
    position: 'bottom-left',
  });
};

export const showError = (message: string | Error | any) => {
  let errorMessage = 'An error occurred';
  
  if (typeof message === 'string') {
    errorMessage = message;
  } else if (message?.response?.data?.error) {
    errorMessage = message.response.data.error;
  } else if (message?.message) {
    errorMessage = message.message;
  }
  
  toast.error(errorMessage, {
    position: 'bottom-left',
  });
};

export const showInfo = (message: string) => {
  toast.info(message, {
    position: 'bottom-left',
  });
};

export const showWarning = (message: string) => {
  toast.warning(message, {
    position: 'bottom-left',
  });
};

