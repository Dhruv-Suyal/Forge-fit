import { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../utils/axios";

export function ProfileEditModal({ isOpen, onClose }) {
  const { user, profile, setUser, setProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    displayName: profile?.displayName || "",
    bio: profile?.bio || "",
    dateOfBirth: profile?.dateOfBirth || "",
    biologicalSex: profile?.biologicalSex || "other",
    height: profile?.height || "",
    weight: profile?.weight || "",
    primaryGoal: profile?.primaryGoal || "",
    photo: user?.avatar || profile?.photo || "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError("");
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.put("/auth/profile", {
        name: formData.name,
        displayName: formData.displayName,
        bio: formData.bio,
        dateOfBirth: formData.dateOfBirth,
        biologicalSex: formData.biologicalSex,
        height: formData.height ? parseInt(formData.height) : undefined,
        weight: formData.weight ? parseInt(formData.weight) : undefined,
        primaryGoal: formData.primaryGoal,
        photo: formData.photo,
      });

      if (response.data.success) {
        setUser(response.data.user);
        setProfile(response.data.profile);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      backgroundColor: "rgba(0,0,0,0.7)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      backdropFilter: "blur(4px)",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&display=swap');

        .modal-content {
          background: linear-gradient(135deg, rgba(0,0,20,0.95) 0%, rgba(10,5,30,0.95) 100%);
          border: 1px solid rgba(0,245,212,0.15);
          border-radius: 20px;
          padding: 32px;
          max-width: 500px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 25px 50px rgba(0,0,0,0.5), 0 0 1px rgba(0,245,212,0.1);
          font-family: 'Sora', sans-serif;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 28px;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(0,245,212,0.1);
        }

        .modal-title {
          font-size: 24px;
          font-weight: 800;
          color: #e2e8f0;
          letter-spacing: -0.5px;
        }

        .modal-close {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 6px 12px;
          cursor: pointer;
          color: rgba(255,255,255,0.5);
          font-size: 20px;
          transition: all 0.2s;
          font-family: 'Sora', sans-serif;
        }

        .modal-close:hover {
          background: rgba(0,245,212,0.08);
          border-color: rgba(0,245,212,0.3);
          color: #00f5d4;
        }

        .modal-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-label {
          font-size: 13px;
          font-weight: 600;
          color: rgba(255,255,255,0.6);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .form-input {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(0,245,212,0.15);
          border-radius: 10px;
          padding: 12px 14px;
          font-size: 14px;
          color: #e2e8f0;
          font-family: 'Sora', sans-serif;
          transition: all 0.2s;
        }

        .form-input:focus {
          outline: none;
          border-color: rgba(0,245,212,0.4);
          background: rgba(0,245,212,0.03);
          box-shadow: 0 0 12px rgba(0,245,212,0.1);
        }

        .form-input::placeholder {
          color: rgba(255,255,255,0.2);
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        @media (max-width: 480px) {
          .form-row {
            grid-template-columns: 1fr;
          }
        }

        .photo-upload {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .photo-preview {
          width: 100px;
          height: 100px;
          border-radius: 12px;
          background: linear-gradient(135deg,#00f5d4,#7c3aed);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          overflow: hidden;
          border: 2px solid rgba(0,245,212,0.2);
          transition: all 0.2s;
        }

        .photo-preview:hover {
          border-color: rgba(0,245,212,0.4);
          box-shadow: 0 0 16px rgba(0,245,212,0.2);
        }

        .photo-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .photo-preview-empty {
          font-size: 32px;
        }

        .error-message {
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.3);
          border-radius: 10px;
          padding: 12px 14px;
          font-size: 13px;
          color: #f87171;
        }

        .modal-footer {
          display: flex;
          gap: 12px;
          margin-top: 28px;
          padding-top: 20px;
          border-top: 1px solid rgba(0,245,212,0.1);
        }

        .btn-cancel {
          flex: 1;
          padding: 12px 16px;
          border-radius: 10px;
          border: 1px solid rgba(0,245,212,0.2);
          background: transparent;
          color: rgba(255,255,255,0.5);
          cursor: pointer;
          font-weight: 600;
          font-size: 13px;
          font-family: 'Sora', sans-serif;
          transition: all 0.2s;
        }

        .btn-cancel:hover {
          color: #e2e8f0;
          border-color: rgba(0,245,212,0.4);
          background: rgba(0,245,212,0.05);
        }

        .btn-save {
          flex: 1;
          padding: 12px 16px;
          border-radius: 10px;
          border: none;
          background: linear-gradient(135deg,#00f5d4,#7c3aed);
          color: #000;
          cursor: pointer;
          font-weight: 700;
          font-size: 13px;
          font-family: 'Sora', sans-serif;
          transition: all 0.2s;
        }

        .btn-save:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,245,212,0.3);
        }

        .btn-save:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>

      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">Edit Profile</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form className="modal-form" onSubmit={handleSubmit}>
          {/* Photo Upload */}
          <div className="form-group">
            <label className="form-label">Profile Photo</label>
            <div className="photo-upload">
              <div className="photo-preview" onClick={handlePhotoClick}>
                {formData.photo ? (
                  <img src={formData.photo} alt="Profile" />
                ) : (
                  <span className="photo-preview-empty">📸</span>
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoChange}
                accept="image/*"
                style={{ display: "none" }}
              />
              <button
                type="button"
                onClick={handlePhotoClick}
                className="form-input"
                style={{ padding: "10px 14px", textAlign: "left", color: "rgba(255,255,255,0.45)" }}
              >
                Choose Photo
              </button>
            </div>
          </div>

          {/* Name */}
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              name="name"
              className="form-input"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Your name"
            />
          </div>

          {/* Display Name */}
          <div className="form-group">
            <label className="form-label">Display Name</label>
            <input
              type="text"
              name="displayName"
              className="form-input"
              value={formData.displayName}
              onChange={handleInputChange}
              placeholder="How you want to be known"
            />
          </div>

          {/* Bio */}
          <div className="form-group">
            <label className="form-label">Bio</label>
            <textarea
              name="bio"
              className="form-input"
              value={formData.bio}
              onChange={handleInputChange}
              placeholder="Tell us about yourself"
              rows="3"
              style={{ resize: "none", fontFamily: "'Sora', sans-serif" }}
            />
          </div>

          {/* Date of Birth */}
          <div className="form-group">
            <label className="form-label">Date of Birth</label>
            <input
              type="date"
              name="dateOfBirth"
              className="form-input"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
            />
          </div>

          {/* Health Info */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Height (cm)</label>
              <input
                type="number"
                name="height"
                className="form-input"
                value={formData.height}
                onChange={handleInputChange}
                placeholder="170"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Weight (kg)</label>
              <input
                type="number"
                name="weight"
                className="form-input"
                value={formData.weight}
                onChange={handleInputChange}
                placeholder="70"
              />
            </div>
          </div>

          {/* Biological Sex */}
          <div className="form-group">
            <label className="form-label">Biological Sex</label>
            <select
              name="biologicalSex"
              className="form-input"
              value={formData.biologicalSex}
              onChange={handleInputChange}
              style={{ cursor: "pointer" }}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Primary Goal */}
          <div className="form-group">
            <label className="form-label">Primary Goal</label>
            <select
              name="primaryGoal"
              className="form-input"
              value={formData.primaryGoal}
              onChange={handleInputChange}
              style={{ cursor: "pointer" }}
            >
              <option value="">Select a goal</option>
              <option value="weight_loss">Weight Loss</option>
              <option value="muscle_gain">Muscle Gain</option>
              <option value="maintenance">Maintenance</option>
              <option value="strength">Strength</option>
              <option value="endurance">Endurance</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-save" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
