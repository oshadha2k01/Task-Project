import Swal from 'sweetalert2';

export const showSuccessAlert = (title, text) => {
  return Swal.fire({
    icon: 'success',
    title: title,
    text: text,
    timer: 2000,
    showConfirmButton: false,
  });
};

export const showErrorAlert = (title, text) => {
  return Swal.fire({
    icon: 'error',
    title: title,
    text: text,
    confirmButtonColor: '#ef4444',
  });
};

export const showInfoAlert = (title, text) => {
  return Swal.fire({
    icon: 'info',
    title: title,
    text: text,
    confirmButtonColor: '#3b82f6',
  });
};

export const showWarningAlert = (title, text) => {
  return Swal.fire({
    icon: 'warning',
    title: title,
    text: text,
    confirmButtonColor: '#f59e0b',
  });
};

export const showConfirmAlert = (title, text, confirmText = 'Yes, delete it!') => {
  return Swal.fire({
    title: title,
    text: text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#6b7280',
    confirmButtonText: confirmText,
    cancelButtonText: 'Cancel'
  });
};

export const showLoadingAlert = (title = 'Loading...') => {
  return Swal.fire({
    title: title,
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });
};
