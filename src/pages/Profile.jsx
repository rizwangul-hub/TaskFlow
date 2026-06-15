import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth.js";
import Spinner from "../components/common/Spinner.jsx";
import toast from "react-hot-toast";

const Profile = () => {
  const { user, loading, updateProfile, updateAvatar } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [avatarSubmitting, setAvatarSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error("Name and Email are required");
      return;
    }

    setSubmitting(true);
    try {
      const result = await updateProfile({ name, email });
      if (updateProfile.fulfilled.match(result)) {
        toast.success("Profile updated successfully!");
      } else {
        toast.error(result.payload || "Failed to update profile");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAvatarChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append("avatar", file);

      setAvatarSubmitting(true);
      try {
        const result = await updateAvatar(formData);
        if (updateAvatar.fulfilled.match(result)) {
          toast.success("Avatar uploaded successfully!");
        } else {
          toast.error(result.payload || "Failed to upload avatar");
        }
      } catch (err) {
        toast.error("An error occurred");
      } finally {
        setAvatarSubmitting(false);
      }
    }
  };

  const roleLabel = (role) => {
    switch (role) {
      case "admin":
        return "Administrator";
      case "project_manager":
        return "Project Manager";
      default:
        return "Team Member";
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="section-card grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left: Avatar Column */}
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className="relative group">
            {user?.avatar?.url ? (
              <img
                src={user.avatar.url}
                alt={user.name}
                className="h-28 w-28 rounded-full border-4 border-white shadow-md object-cover"
              />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-full bg-brand-100 text-3xl font-bold text-brand-700 shadow-inner">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            )}

            {avatarSubmitting && (
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-slate-900/40">
                <Spinner size="md" color="white" />
              </div>
            )}
          </div>

          <div>
            <h3 className="font-display font-bold text-slate-800">{user?.name}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{roleLabel(user?.role)}</p>
          </div>

          <div>
            <label className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm">
              Replace Photo
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                disabled={avatarSubmitting}
                className="hidden"
              />
            </label>
            <p className="text-[10px] text-slate-400 mt-2">JPG, PNG, max 2MB</p>
          </div>
        </div>

        {/* Right: Profile Form */}
        <div className="md:col-span-2 space-y-6">
          <div>
            <h4 className="font-display text-base font-bold text-slate-800">Account Details</h4>
            <p className="text-xs text-slate-400 mt-0.5">Manage your public information and email preferences</p>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label className="label">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Verification Status</label>
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-100 bg-slate-50 text-xs font-semibold text-slate-600">
                  {user?.isVerified ? (
                    <>
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      Verified Account
                    </>
                  ) : (
                    <>
                      <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                      Pending Verification
                    </>
                  )}
                </div>
              </div>

              <div>
                <label className="label">Organization Role</label>
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-100 bg-slate-50 text-xs font-semibold text-slate-600">
                  {roleLabel(user?.role)}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-50 mt-6">
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary !w-auto px-5 py-2.5 text-xs flex items-center gap-2"
              >
                {submitting && <Spinner size="sm" color="white" />}
                {submitting ? "Saving..." : "Save Profile Details"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
