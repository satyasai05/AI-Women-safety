import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { userApi, contactsApi } from "../api/api";

const Settings = () => {
  const [profile, setProfile] = useState({ username: "", email: "" });
  const [contacts, setContacts] = useState([]);
  const [contactForm, setContactForm] = useState({ name: "", phone: "" });
  const [passwordForm, setPasswordForm] = useState({ old_password: "", new_password: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchContacts();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await userApi.profile();
      setProfile(response.data.user);
    } catch (error) {
      toast.error("Unable to load profile.");
    }
  };

  const fetchContacts = async () => {
    try {
      const response = await contactsApi.fetch();
      setContacts(response.data.contacts);
    } catch (error) {
      toast.error("Unable to load contacts.");
    }
  };

  const updateProfile = async () => {
    setLoading(true);
    try {
      await userApi.updateProfile({ username: profile.username, email: profile.email });
      toast.success("Profile updated.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed.");
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async () => {
    if (!passwordForm.old_password || !passwordForm.new_password) {
      toast.error("Both password fields are required.");
      return;
    }
    setLoading(true);
    try {
      await userApi.changePassword(passwordForm);
      toast.success("Password changed successfully.");
      setPasswordForm({ old_password: "", new_password: "" });
    } catch (error) {
      toast.error(error.response?.data?.message || "Password change failed.");
    } finally {
      setLoading(false);
    }
  };

  const addContact = async () => {
    if (!contactForm.name || !contactForm.phone) {
      toast.error("Provide contact name and phone.");
      return;
    }
    setLoading(true);
    try {
      await contactsApi.create(contactForm);
      toast.success("Contact added.");
      setContactForm({ name: "", phone: "" });
      fetchContacts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not add contact.");
    } finally {
      setLoading(false);
    }
  };

  const deleteContact = async (id) => {
    try {
      await contactsApi.remove(id);
      toast.success("Contact deleted.");
      setContacts((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      toast.error(error.response?.data?.message || "Delete failed.");
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="rounded-[32px] bg-white/80 p-8 shadow-glass backdrop-blur">
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-semibold text-slate-900">Settings</h2>
            <p className="mt-2 text-slate-600">Manage your profile, emergency contacts, and account security.</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-[32px] bg-slate-50 p-6 shadow-inner">
              <h3 className="text-xl font-semibold text-slate-900">Profile</h3>
              <div className="mt-5 space-y-4">
                <input
                  value={profile.username}
                  onChange={(e) => setProfile((prev) => ({ ...prev, username: e.target.value }))}
                  placeholder="Username"
                  className="w-full rounded-3xl border border-slate-200 bg-white px-5 py-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
                <input
                  value={profile.email}
                  onChange={(e) => setProfile((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="Email"
                  className="w-full rounded-3xl border border-slate-200 bg-white px-5 py-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
                <button onClick={updateProfile} disabled={loading} className="inline-flex w-full items-center justify-center rounded-3xl bg-primary px-6 py-4 text-sm font-semibold text-white transition hover:bg-[#5b21c0] disabled:opacity-60">
                  Update Profile
                </button>
              </div>
            </div>

            <div className="rounded-[32px] bg-slate-50 p-6 shadow-inner">
              <h3 className="text-xl font-semibold text-slate-900">Change Password</h3>
              <div className="mt-5 space-y-4">
                <input
                  type="password"
                  value={passwordForm.old_password}
                  onChange={(e) => setPasswordForm((prev) => ({ ...prev, old_password: e.target.value }))}
                  placeholder="Current Password"
                  className="w-full rounded-3xl border border-slate-200 bg-white px-5 py-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
                <input
                  type="password"
                  value={passwordForm.new_password}
                  onChange={(e) => setPasswordForm((prev) => ({ ...prev, new_password: e.target.value }))}
                  placeholder="New Password"
                  className="w-full rounded-3xl border border-slate-200 bg-white px-5 py-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
                <button onClick={changePassword} disabled={loading} className="inline-flex w-full items-center justify-center rounded-3xl bg-secondary px-6 py-4 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60">
                  Change Password
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-[32px] bg-slate-50 p-6 shadow-inner">
            <h3 className="text-xl font-semibold text-slate-900">Emergency Contacts</h3>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <input
                value={contactForm.name}
                onChange={(e) => setContactForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Contact Name"
                className="w-full rounded-3xl border border-slate-200 bg-white px-5 py-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
              <input
                value={contactForm.phone}
                onChange={(e) => setContactForm((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="Phone Number"
                className="w-full rounded-3xl border border-slate-200 bg-white px-5 py-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </div>
            <button onClick={addContact} disabled={loading} className="mt-5 inline-flex w-full items-center justify-center rounded-3xl bg-primary px-6 py-4 text-sm font-semibold text-white transition hover:bg-[#5b21c0] disabled:opacity-60">
              Add Emergency Contact
            </button>
            <div className="mt-6 space-y-4">
              {contacts.map((contact) => (
                <div key={contact.id} className="flex items-center justify-between rounded-3xl bg-white p-4 shadow-sm">
                  <div>
                    <p className="font-semibold text-slate-900">{contact.name}</p>
                    <p className="text-sm text-slate-600">{contact.phone}</p>
                  </div>
                  <button onClick={() => deleteContact(contact.id)} className="rounded-3xl bg-danger px-4 py-2 text-xs font-semibold text-white transition hover:bg-red-600">
                    Delete
                  </button>
                </div>
              ))}
              {contacts.length === 0 && <p className="text-sm text-slate-500">No emergency contacts added yet.</p>}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Settings;
