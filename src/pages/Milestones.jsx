import { useState, useEffect } from "react";
import { X, User, Home, Heart, Calendar, Users, Globe, BookOpen } from "lucide-react";
import { Alert, AlertDescription } from "../components/ui/Alert";
import { useNavigate } from "react-router-dom";
import { useMilestones } from "../context/MilestonesContext";

const MilestoneForm = ({ handleClose, backgroundColor = "white" }) => {
  const { milestone, createMilestone, updateMilestone } = useMilestones();
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

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

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

  return (
    <div className="p-6 bg-white dark:bg-gray-800 dark:text-white rounded-lg h-full lg:h-[522px] overflow-y-auto" style={{ backgroundColor }}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Milestones</h2>
      </div>

      {submitError && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 text-black">
          <div>
            <label className="block text-sm font-medium text-gray-700">I'm writing about?</label>
            <div className="relative">
              <Heart className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select 
                name="relation"
                value={formData.relation}
                onChange={handleChange}
                className={`mt-1 block w-full pl-10 p-2 border rounded-md shadow-sm ${
                  errors.relation 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-2 focus:ring-blue-500'
                }`}
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
              <p className="text-sm text-red-500 mt-1">{errors.relation}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Their Sex</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select 
                name="sex"
                value={formData.sex}
                onChange={handleChange}
                className={`mt-1 block w-full pl-10 p-2 border rounded-md shadow-sm ${
                  errors.sex 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-2 focus:ring-blue-500'
                }`}
                required
              >
                <option value="">Select...</option>
                <option value="boy">Boy 👦</option>
                <option value="girl">Girl 👩</option>
              </select>
            </div>
            {errors.sex && (
              <p className="text-sm text-red-500 mt-1">{errors.sex}</p>
            )}
          </div>

          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              name="name"
              placeholder="Their Name"
              value={formData.name}
              onChange={handleChange}
              className={`block w-full pl-10 p-2 border rounded-md shadow-sm ${
                errors.name 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-2 focus:ring-blue-500'
              }`}
              required
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className={`mt-1 block w-full pl-10 p-2 border rounded-md shadow-sm ${
                  errors.dateOfBirth 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-2 focus:ring-blue-500'
                }`}
                required
              />
            </div>
            {errors.dateOfBirth && (
              <p className="text-sm text-red-500 mt-1">{errors.dateOfBirth}</p>
            )}
          </div>

          <div className="relative">
            <Home className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              name="hometown"
              placeholder="Hometown"
              value={formData.hometown}
              onChange={handleChange}
              className="block w-full pl-10 p-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Ethnicity</label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select 
                name="ethnicity"
                value={formData.ethnicity}
                onChange={handleChange}
                className="mt-1 block w-full pl-10 p-2 border border-gray-300 rounded-md shadow-sm"
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

          <div className="relative">
            <Users className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <textarea
              name="familyMembers"
              placeholder="Tell us about their family members..."
              value={formData.familyMembers}
              onChange={handleChange}
              className="block w-full pl-10 p-2 border border-gray-300 rounded-md shadow-sm h-24"
            />
          </div>

          <div className="relative">
            <BookOpen className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <textarea
              name="specialTraditions"
              placeholder="Any special family traditions?"
              value={formData.specialTraditions}
              onChange={handleChange}
              className="block w-full pl-10 p-2 border border-gray-300 rounded-md shadow-sm h-24"
            />
          </div>

          <div className="relative">
            <Heart className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <textarea
              name="favoriteMemories"
              placeholder="Share your favorite memories..."
              value={formData.favoriteMemories}
              onChange={handleChange}
              className="block w-full pl-10 p-2 border border-gray-300 rounded-md shadow-sm h-24"
            />
          </div>

          <div className="relative">
            <Heart className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <textarea
              name="parentWishes"
              placeholder="Parent/Grandparent's Wishes..."
              value={formData.parentWishes}
              onChange={handleChange}
              className="block w-full pl-10 p-2 border border-gray-300 rounded-md shadow-sm h-24"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
  );
};

export default MilestoneForm;