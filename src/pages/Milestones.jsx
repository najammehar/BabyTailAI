import { useState, useEffect } from "react";
import { X, User, Home, Heart, Calendar, Users, Globe, BookOpen, XCircle } from "lucide-react";
import { Alert, AlertDescription } from "../components/ui/Alert";
import { useNavigate } from "react-router-dom";
import { useMilestones } from "../context/MilestonesContext";

const MilestoneForm = ({ handleClose, backgroundColor = "white" }) => {
  const { milestone, createMilestone, updateMilestone, loading } = useMilestones();
  const [formData, setFormData] = useState({
    relation: '',
    sex: '',
    name: '',
    dateOfBirth: '',
    hometown: '',
    ethnicity: '',
    familyMembers: '',
    specialTraditions: '',
    favoriteMemories: '',
    parentWishes: ''
  });

  const getColors = (sex) => {
    switch (sex) {
      case 'boy':
        return {
          bg: 'bg-blue-200 dark:bg-blue-800',
          input: 'bg-white/80 dark:bg-slate-800/80',
          border: 'border-blue-200 dark:border-blue-800',
          focus: 'focus:border-blue-400 dark:focus:border-blue-600'
        };
      case 'girl':
        return {
          bg: 'bg-pink-200 dark:bg-pink-950',
          input: 'bg-white/80 dark:bg-slate-800/80',
          border: 'border-pink-200 dark:border-pink-800',
          focus: 'focus:border-pink-400 dark:focus:border-pink-600'
        };
      default:
        return {
          bg: 'bg-white dark:bg-slate-900',
          input: 'bg-white dark:bg-slate-800',
          border: 'border-slate-300 dark:border-slate-600',
          focus: 'focus:border-blue-500 dark:focus:border-blue-600'
        };
    }
  };

  const colors = getColors(formData.sex);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(true);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return ''; // Invalid date
      
      return date.toISOString().split('T')[0];
    } catch (error) {
      return '';
    }
  };

    // Load existing milestone data if available
    useEffect(() => {
      if (milestone) {
        setFormData({
          relation: milestone.relation || '',
          sex: milestone.sex || '',
          name: milestone.name || '',
          dateOfBirth: formatDate(milestone.dateOfBirth) || '',
          hometown: milestone.hometown || '',
          ethnicity: milestone.ethnicity || '',
          familyMembers: milestone.familyMembers || '',
          specialTraditions: milestone.specialTraditions || '',
          favoriteMemories: milestone.favoriteMemories || '',
          parentWishes: milestone.parentWishes || ''
        });
      }
    }, [milestone]);

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = ['relation', 'sex', 'name', 'dateOfBirth'];
    
    requiredFields.forEach(field => {
      if (!formData[field].trim()) {
        newErrors[field] = `This field is required`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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

    try {
      const result = milestone 
        ? await updateMilestone(formData)
        : await createMilestone(formData);

      if (result.success) {
        navigate('/chapters');
      } else {
        setSubmitError(result.error || "Failed to save milestone. Please try again.");
      }
    } catch (error) {
      setSubmitError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClassName = `block w-full pl-10 p-2 rounded-md shadow-sm
    ${colors.input} text-slate-900 dark:text-slate-200
    placeholder:text-slate-400 dark:placeholder:text-slate-500
    ${colors.border} ${colors.focus}
    transition-colors duration-200 ease-in-out`;

  const selectClassName = `mt-1 block w-full pl-10 p-2 rounded-md shadow-sm
    ${colors.input} text-slate-900 dark:text-slate-200
    ${colors.border} ${colors.focus}
    transition-colors duration-200 ease-in-out`;

  const textareaClassName = `block w-full pl-10 p-2 rounded-md shadow-sm h-24
    ${colors.input} text-slate-900 dark:text-slate-200
    placeholder:text-slate-400 dark:placeholder:text-slate-500
    ${colors.border} ${colors.focus}
    transition-colors duration-200 ease-in-out`;

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div
          class="w-10 h-10 border-4 border-t-blue-500 border-gray-300 rounded-full animate-spin"
        ></div>
      </div>
      );
  }

  return (
    <div className={`${!showModal && 'hidden'} h-full overflow-y-auto custom-scrollbar transition-colors duration-300 ${colors.bg}`}>
      <div className="p-6 dark:text-slate-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Milestones</h2>
          <button>
            <XCircle className="w-6 h-6 text-slate-500 dark:text-slate-400" onClick={() => setShowModal(false)} />
          </button>
        </div>

        {submitError && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {/* Relation Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                I'm writing about?
              </label>
              <div className="relative">
                <Heart className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-5 h-5" />
                <select 
                  name="relation"
                  value={formData.relation}
                  onChange={handleChange}
                  className={selectClassName}
                  required
                >
                  <option value="">Select...</option>
                  <option value="My child">My Child</option>
                  <option value="My grandchild">My Grandchild</option>
                  <option value="My niece">Niece</option>
                  <option value="My nephew">Nephew</option>
                  <option value="My friend">Friend</option>
                  <option value="other">Other</option>
                </select>
              </div>
              {errors.relation && (
                <p className="text-sm text-red-500 dark:text-red-400 mt-1">{errors.relation}</p>
              )}
            </div>

            {/* Sex Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Their Sex
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-5 h-5" />
                <select 
                  name="sex"
                  value={formData.sex}
                  onChange={handleChange}
                  className={selectClassName}
                  required
                >
                  <option value="">Select...</option>
                  <option value="boy">Boy 👦</option>
                  <option value="girl">Girl 👩</option>
                </select>
              </div>
              {errors.sex && (
                <p className="text-sm text-red-500 dark:text-red-400 mt-1">{errors.sex}</p>
              )}
            </div>

            {/* Name Field */}
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-5 h-5" />
              <input
                type="text"
                name="name"
                placeholder="Their Name"
                value={formData.name}
                onChange={handleChange}
                className={inputClassName}
                required
              />
              {errors.name && (
                <p className="text-sm text-red-500 dark:text-red-400 mt-1">{errors.name}</p>
              )}
            </div>

            {/* Date of Birth Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Date of Birth
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-5 h-5" />
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className={inputClassName}
                  required
                />
              </div>
              {errors.dateOfBirth && (
                <p className="text-sm text-red-500 dark:text-red-400 mt-1">{errors.dateOfBirth}</p>
              )}
            </div>

            {/* Hometown Field */}
            <div className="relative">
              <Home className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-5 h-5" />
              <input
                type="text"
                name="hometown"
                placeholder="Hometown"
                value={formData.hometown}
                onChange={handleChange}
                className={inputClassName}
              />
            </div>

            {/* Ethnicity Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Ethnicity
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-5 h-5" />
                <select 
                  name="ethnicity"
                  value={formData.ethnicity}
                  onChange={handleChange}
                  className={selectClassName}
                >
                  <option value="">Select...</option>
                  <option value="african">African</option>
                  <option value="asian">Asian</option>
                  <option value="caucasian">Caucasian</option>
                  <option value="hispanic">Hispanic/Latino</option>
                  <option value="middleEastern">Middle Eastern</option>
                  <option value="nativeAmerican">Native American</option>
                  <option value="pacificIslander">Pacific Islander</option>
                  <option value="multiracial">Multiracial</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Textarea Fields */}
            {[
              { name: 'familyMembers', icon: Users, placeholder: 'Tell us about their family members...' },
              { name: 'specialTraditions', icon: BookOpen, placeholder: 'Any special family traditions?' },
              { name: 'favoriteMemories', icon: Heart, placeholder: 'Share your favorite memories...' },
              { name: 'parentWishes', icon: Heart, placeholder: "Parent/Grandparent's Wishes..." }
            ].map((field) => (
              <div className="relative" key={field.name}>
                <field.icon className="absolute left-3 top-3 text-slate-400 dark:text-slate-500 w-5 h-5" />
                <textarea
                  name={field.name}
                  placeholder={field.placeholder}
                  value={formData[field.name]}
                  onChange={handleChange}
                  className={textareaClassName}
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md 
                hover:bg-blue-700 dark:hover:bg-blue-800 
                focus:outline-none focus:ring-2 focus:ring-blue-500 
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors"
            >
              {isSubmitting 
                ? "Saving..." 
                : milestone 
                  ? "Update Milestone" 
                  : "Save Milestone"
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MilestoneForm;