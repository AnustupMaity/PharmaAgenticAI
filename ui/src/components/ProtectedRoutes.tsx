import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
    const user = localStorage.getItem("user");
    const location = useLocation();

    if (!user) {
        return <Navigate to="/auth" replace state={{ from: location }} />;
    }

    return children;
};

export default ProtectedRoute;