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

    return user ? children : null;
};

export default ProtectedRoute;