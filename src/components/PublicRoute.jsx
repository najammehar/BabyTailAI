import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const PublicRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && user) {
            navigate('/milestones');
        }
    }, [user, loading, navigate]);

    // if (loading) {
    //     return (
    //         <div className="flex justify-center items-center h-screen">
    //             <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900"></div>
    //         </div>
    //     );
    // }

    return !user ? children : null;
};

export default PublicRoute;