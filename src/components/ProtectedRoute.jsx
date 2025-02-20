import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";
import { useMilestones } from "../context/MilestonesContext";

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const { milestone } = useMilestones();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && !user) {
            navigate('/');
        }
    }, [user, loading, navigate]);

    // if (loading) {
    //     return (
    //         <div className="flex justify-center items-center h-screen">
    //                 <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900"></div>
    //         </div>
    //     )
    // }

    return user ? children : null;
};

export default ProtectedRoute;