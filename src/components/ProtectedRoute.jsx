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
            navigate('/login');
        } else{
            if (milestone === null){
                navigate('/milestones');
            } else {
                navigate('/chapters');
            }
        }
    }, [user, loading, navigate]);

    if (loading) {
        return <div>Loading...</div>;
    }

    return user ? children : null;
};

export default ProtectedRoute;