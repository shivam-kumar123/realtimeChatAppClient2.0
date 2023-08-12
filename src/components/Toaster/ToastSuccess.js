import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ToastSuccess({ message }) {
    // Show a toast notification when this component renders

    toast.success(message, {
      position: "top-right",
      autoClose: 3000, // Close the toast after 3 seconds
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
  });

    return null; // This component doesn't render any visible elements
}

export default ToastSuccess;
