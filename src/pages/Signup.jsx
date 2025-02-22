import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, Mail, Lock, User, XCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Alert, AlertDescription } from "../components/ui/Alert";

const Signup = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", name: "" });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    // Name validation
    if (!form.name) {
      newErrors.name = "Name is required";
    } else if (form.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters long";
    }
    
    // Email validation
    if (!form.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    // Password validation
    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) {
      newErrors.password = "Password must contain at least one uppercase letter, one lowercase letter, and one number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
    setSubmitError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setSubmitError("");

    const result = await signUp(form.email, form.password, form.name);
    
    if (!result.success) {
      setSubmitError(result.error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div>
        <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-center text-slate-800 dark:text-slate-200">
              Create Account
            </h2>
            <button>
              <XCircle className="w-6 h-6 text-slate-500 dark:text-slate-400" onClick={() => setShowModal(false)} />
            </button>
            </div>

          {submitError && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <div className="relative">
                <User className="absolute left-3 top-4 text-slate-400 dark:text-slate-500 w-5 h-5" />
                <input
                  type="text"
                  name="name"
                  placeholder="Your name"
                  value={form.name}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg outline-none transition-all
                    bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-200
                    placeholder:text-slate-400 dark:placeholder:text-slate-500 border border-slate-300 dark:border-slate-600
                    ${errors.name 
                      ? 'border-red-500 dark:border-red-600 focus:ring-red-500' 
                      : 'border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                />
              </div>
              {errors.name && (
                <p className="text-sm text-red-500 dark:text-red-400">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-4 text-slate-400 dark:text-slate-500 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  placeholder="Email address"
                  value={form.email}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg outline-none transition-all
                    bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-200
                    placeholder:text-slate-400 dark:placeholder:text-slate-500 border border-slate-300 dark:border-slate-600
                    ${errors.email 
                      ? 'border-red-500 dark:border-red-600 focus:ring-red-500' 
                      : 'border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-500 dark:text-red-400">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-4 text-slate-400 dark:text-slate-500 w-5 h-5" />
                <input
                  type="password"
                  name="password"
                  placeholder="Create password"
                  value={form.password}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg outline-none transition-all
                    bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-200
                    placeholder:text-slate-400 dark:placeholder:text-slate-500 border border-slate-300 dark:border-slate-600
                    ${errors.password 
                      ? 'border-red-500 dark:border-red-600 focus:ring-red-500' 
                      : 'border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                />
              </div>
              {errors.password && (
                <p className="text-sm text-red-500 dark:text-red-400">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-blue-600 dark:bg-blue-700 text-white 
                rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 
                transition-colors font-medium 
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          <p className="mt-8 text-center text-slate-600 dark:text-slate-400">
            Already have an account?{" "}
            <span
              onClick={() => navigate("/login")}
              className="text-blue-600 dark:text-blue-500 hover:text-blue-700 
                dark:hover:text-blue-400 cursor-pointer font-medium"
            >
              Log in
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;