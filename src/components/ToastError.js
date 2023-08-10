import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ToastError({ message, time }) {
    // Show a toast notification when this component renders

    toast.error(message, {
        position: "top-right",
        autoClose: {time},
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
    });

    return null; // This component doesn't render any visible elements
}

export default ToastError;
