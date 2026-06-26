import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../utils/api';
import { User, Phone, Mail, Shield, ShieldAlert, Heart, Trash2, Plus, AlertCircle, CheckCircle } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  
  // Profile settings state
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [password, setPassword] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Contacts state
  const [contacts, setContacts] = useState([]);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactRel, setContactRel] = useState('Parent');
  const [contactError, setContactError] = useState('');
  const [contactLoading, setContactLoading] = useState(false);

  useEffect(() => {
    loadEmergencyContacts();
  }, []);

  const loadEmergencyContacts = async () => {
    try {
      const response = await authAPI.getContacts();
      setContacts(response.data);
    } catch (e) {
      console.error("Failed to load contacts:", e);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileSuccess('');
    setProfileError('');

    const result = await updateProfile({ name, email, phone, password });
    setProfileLoading(false);

    if (result.success) {
      setProfileSuccess('Profile credentials updated successfully.');
      setPassword('');
    } else {
      setProfileError(result.error);
    }
  };

  const handleAddContact = async (e) => {
    e.preventDefault();
    if (!contactName || !contactPhone || !contactRel) {
      setContactError("Please fill in all contact fields.");
      return;
    }

    setContactLoading(true);
    setContactError('');

    try {
      await authAPI.addContact({
        name: contactName,
        phone: contactPhone,
        relationship: contactRel
      });
      
      // Reset contact inputs
      setContactName('');
      setContactPhone('');
      setContactRel('Parent');
      
      // Re-load contact lists
      loadEmergencyContacts();
    } catch (err) {
      setContactError(err.response?.data?.error || 'Failed to add emergency contact.');
    } finally {
      setContactLoading(false);
    }
  };

  const handleDeleteContact = async (contactId) => {
    if (!confirm("Are you sure you want to delete this emergency contact?")) return;

    try {
      await authAPI.deleteContact(contactId);
      loadEmergencyContacts();
    } catch (e) {
      alert("Failed to delete contact: " + e.message);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-6xl mx-auto">
      
      {/* Page Header */}
      <div>
        <h1 className="font-outfit text-2xl sm:text-3xl font-extrabold text-white">Profile & Emergency Contacts</h1>
        <p className="text-sm text-gray-400">Configure safety notification numbers and login parameters.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        
        {/* PROFILE SETTINGS FORM */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-[#14121d]/85 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center space-x-2 border-b border-white/5 pb-3">
              <User className="h-5 w-5 text-safety-400" />
              <h2 className="font-outfit text-base font-bold text-white">My Account Details</h2>
            </div>

            {profileError && (
              <div className="flex items-center space-x-2 rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-xs text-rose-400">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span>{profileError}</span>
              </div>
            )}

            {profileSuccess && (
              <div className="flex items-center space-x-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs text-emerald-400">
                <CheckCircle className="h-5 w-5 flex-shrink-0" />
                <span>{profileSuccess}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase">Full Name</label>
                <div className="relative mt-1.5">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <User className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#161420] py-3.5 pl-10 pr-4 text-xs text-white placeholder-gray-500 outline-none focus:border-safety-500/50 transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase">Email Address</label>
                <div className="relative mt-1.5">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#161420] py-3.5 pl-10 pr-4 text-xs text-white placeholder-gray-500 outline-none focus:border-safety-500/50 transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase">Phone Number</label>
                <div className="relative mt-1.5">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <Phone className="h-4 w-4" />
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#161420] py-3.5 pl-10 pr-4 text-xs text-white placeholder-gray-500 outline-none focus:border-safety-500/50 transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase">Update Password (Leave blank to keep current)</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full mt-1.5 rounded-xl border border-white/10 bg-[#161420] py-3.5 px-4 text-xs text-white placeholder-gray-500 outline-none focus:border-safety-500/50 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={profileLoading}
                className="glow-btn w-full mt-4 py-3.5 bg-gradient-to-r from-safety-500 to-rose-600 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1 cursor-pointer disabled:opacity-50"
              >
                {profileLoading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                ) : (
                  <span>Save Profile Changes</span>
                )}
              </button>

            </form>
          </div>
        </div>

        {/* EMERGENCY CONTACTS LIST & FORM */}
        <div className="space-y-6">
          
          {/* Add contact Form */}
          <div className="glass-panel p-5 rounded-2xl border border-white/5 bg-[#14121d]/85 space-y-4">
            <div className="flex items-center space-x-2 border-b border-white/5 pb-3">
              <Plus className="h-5 w-5 text-safety-400" />
              <h2 className="font-outfit text-base font-bold text-white">Add Emergency Contact</h2>
            </div>

            {contactError && (
              <div className="flex items-center space-x-2 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-400">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span>{contactError}</span>
              </div>
            )}

            <form onSubmit={handleAddContact} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] text-gray-400 font-bold uppercase">Name</label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Contact Name"
                  className="w-full mt-1 px-3 py-2 text-xs rounded-xl bg-[#161420] border border-white/10 text-white outline-none focus:border-safety-500/50"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 font-bold uppercase">Phone</label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+91 XXXXX XXXXX"
                  className="w-full mt-1 px-3 py-2 text-xs rounded-xl bg-[#161420] border border-white/10 text-white outline-none focus:border-safety-500/50"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 font-bold uppercase">Relation</label>
                <select
                  value={contactRel}
                  onChange={(e) => setContactRel(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-xs rounded-xl bg-[#161420] border border-white/10 text-white outline-none focus:border-safety-500/50"
                  required
                >
                  <option value="Parent" className="bg-[#161420]">Parent</option>
                  <option value="Spouse" className="bg-[#161420]">Spouse</option>
                  <option value="Sibling" className="bg-[#161420]">Sibling</option>
                  <option value="Friend" className="bg-[#161420]">Friend</option>
                  <option value="Guardian" className="bg-[#161420]">Guardian</option>
                  <option value="Other" className="bg-[#161420]">Other</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={contactLoading}
                className="sm:col-span-3 py-2.5 bg-safety-500 hover:bg-safety-600 text-white text-xs font-bold rounded-xl flex items-center justify-center space-x-1 cursor-pointer disabled:opacity-50 mt-2"
              >
                <span>Add Mapped Contact</span>
              </button>
            </form>
          </div>

          {/* Registered contacts lists */}
          <div className="glass-panel p-5 rounded-2xl border border-white/5 bg-[#14121d]/85 space-y-4">
            <div className="flex items-center space-x-2 border-b border-white/5 pb-3">
              <Heart className="h-5 w-5 text-safety-400" />
              <h2 className="font-outfit text-base font-bold text-white">Registered Guardians ({contacts.length})</h2>
            </div>

            {contacts.length === 0 ? (
              <p className="text-xs text-gray-500 py-6 text-center">No emergency contacts registered. Please add contacts above to authorize SOS broadcasts.</p>
            ) : (
              <div className="space-y-3">
                {contacts.map((contact) => (
                  <div key={contact.id} className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/5">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-white">{contact.name}</p>
                      <div className="flex items-center space-x-3 text-[10px] text-gray-400 font-semibold uppercase">
                        <span className="text-safety-400">{contact.relationship}</span>
                        <span>•</span>
                        <span>{contact.phone}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteContact(contact.id)}
                      className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg border border-rose-500/20 transition-all cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};

export default Profile;
