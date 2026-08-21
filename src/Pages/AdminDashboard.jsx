import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { loadUser, checkIsAdmin } from "../components/Header";
import {
  CATEGORIES,
  PRESET_IMAGES,
  DEFAULT_SYSTEM_ADMINS,
  DEFAULT_ABOUT_INFO,
  fetchSystemAdminsFromDb,
  addSystemAdminToDb,
  removeSystemAdminFromDb,
  fetchDestinationsFromDb,
  saveDestinationToDb,
  deleteDestinationFromDb,
  uploadImageToStorage,
  compressImage,
  approvePendingUserPhotoInDb,
  rejectPendingUserPhotoInDb,
  fetchTeamMembersFromDb,
  saveTeamMemberToDb,
  deleteTeamMemberFromDb,
  fetchAboutInfoFromDb,
  saveAboutInfoToDb,
  subscribeToAboutInfo,
} from "../data/adminData";
import {
  PlusIcon,
  TrashIcon,
  PencilSquareIcon,
  MagnifyingGlassIcon,
  ArrowLeftIcon,
  PhotoIcon,
  StarIcon,
  ArrowPathIcon,
  SparklesIcon,
  BuildingLibraryIcon,
  ArrowUpTrayIcon,
  EnvelopeIcon,
  UserIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  XMarkIcon,
  DocumentTextIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/solid";
import { MdLocationPin } from "react-icons/md";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");

  const [currentUser, setCurrentUser] = useState(() => loadUser());
  const [isAdmin, setIsAdmin] = useState(() => checkIsAdmin(currentUser));
  const [adminChecked, setAdminChecked] = useState(false);

  useEffect(() => {
    async function verifyAdminAccess() {
      const user = loadUser();
      setCurrentUser(user);
      if (checkIsAdmin(user)) {
        setIsAdmin(true);
        setAdminChecked(true);
        return;
      }

      // If local check failed, verify against Firestore directly
      if (user?.email) {
        const dbAdmins = await fetchSystemAdminsFromDb();
        const userEmail = user.email.toLowerCase().trim();
        if (dbAdmins.some((a) => (a || "").toLowerCase().trim() === userEmail)) {
          setIsAdmin(true);
          setAdminChecked(true);
          return;
        }
      }

      // Access denied
      setIsAdmin(false);
      setAdminChecked(true);
      window.dispatchEvent(
        new CustomEvent("showToast", {
          detail: "Access Denied: Admin privileges required."
        })
      );
      navigate("/");
    }

    verifyAdminAccess();
  }, [navigate]);

  const defaultAdminEmail = currentUser?.email || "admin@travelcambodia.com";

  // System Admin Emails State
  const [systemAdmins, setSystemAdmins] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("travel_admin_emails"));
      if (Array.isArray(saved) && saved.length > 0) return saved;
    } catch { }
    return [
      defaultAdminEmail
    ];
  });
  const [newAdminEmailInput, setNewAdminEmailInput] = useState("");
  const [showManageAdmins, setShowManageAdmins] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    cat: "plains",
    location: "",
    rating: 5,
    img: "",
    gallery: [],
    about: "",
    mapSearch: "",
    searchNames: "",
    adminEmails: defaultAdminEmail,
    showInSlideHeader: false,
    showInTopDestinations: true,
    showInExplore: true,
  });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDocId, setEditingDocId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // File Upload State & Refs
  const coverFileInputRef = useRef(null);
  const galleryFileInputRef = useRef(null);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);

  // System Admin Management Handlers (Sync with Firestore via adminData)
  const handleAddSystemAdmin = async (e) => {
    e?.preventDefault();
    const trimmed = newAdminEmailInput.trim().toLowerCase();
    if (!trimmed || !trimmed.includes("@")) {
      triggerToast("Please enter a valid email address");
      return;
    }
    if (systemAdmins.some((email) => email.toLowerCase() === trimmed)) {
      triggerToast("This email is already registered as an Admin!");
      return;
    }

    const updated = [...systemAdmins, trimmed];
    setSystemAdmins(updated);
    localStorage.setItem("travel_admin_emails", JSON.stringify(updated));
    setNewAdminEmailInput("");

    try {
      await addSystemAdminToDb(trimmed, currentUser?.email || "system");
      triggerToast(`Saved ${trimmed} to Admin database!`);
    } catch (err) {
      console.error("Error saving admin to Firestore:", err);
      triggerToast(`Added ${trimmed} locally`);
    }
  };

  const handleRemoveSystemAdmin = async (emailToRemove) => {
    if (systemAdmins.length <= 1) {
      triggerToast("System must have at least one Admin email!");
      return;
    }
    const updated = systemAdmins.filter((e) => e !== emailToRemove);
    setSystemAdmins(updated);
    localStorage.setItem("travel_admin_emails", JSON.stringify(updated));

    try {
      await removeSystemAdminFromDb(emailToRemove);
      triggerToast(`Removed ${emailToRemove} from database`);
    } catch (err) {
      console.error("Error deleting admin from Firestore:", err);
      triggerToast(`Removed ${emailToRemove} locally`);
    }
  };

  const toggleAdminEmailInForm = (emailToToggle) => {
    const currentList = formData.adminEmails
      ? formData.adminEmails.split(",").map((e) => e.trim()).filter(Boolean)
      : [];
    const index = currentList.findIndex(
      (e) => e.toLowerCase() === emailToToggle.toLowerCase()
    );
    if (index >= 0) {
      currentList.splice(index, 1);
    } else {
      currentList.push(emailToToggle);
    }
    setFormData((prev) => ({ ...prev, adminEmails: currentList.join(", ") }));
  };

  // Image Upload Handlers (Compressed FileReader + Storage fallback)
  const handleCoverFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingCover(true);
    try {
      // Compress image first to keep payload tiny (<60KB)
      const compressedDataUrl = await compressImage(file, 1000, 1000, 0.7);
      setFormData((prev) => ({ ...prev, img: compressedDataUrl }));
      triggerToast("Cover picture uploaded and compressed!");
      setIsUploadingCover(false);

      // Optional background attempt to upload to Firebase Storage if reachable
      try {
        const downloadUrl = await Promise.race([
          uploadImageToStorage(file, "destinations"),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 4000)),
        ]);
        if (downloadUrl) {
          setFormData((prev) => ({ ...prev, img: downloadUrl }));
        }
      } catch (storageErr) {
        console.warn("Storage background upload fallback to compressed Data URL:", storageErr);
      }
    } catch (err) {
      console.error("File upload error:", err);
      triggerToast("Failed to upload image");
      setIsUploadingCover(false);
    } finally {
      if (e.target) e.target.value = "";
    }
  };

  const handleGalleryFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files || files.length === 0) return;

    setIsUploadingGallery(true);
    try {
      // Compress all selected images concurrently
      const compressedUrls = await Promise.all(
        files.map((file) => compressImage(file, 1000, 1000, 0.7))
      );
      const validUrls = compressedUrls.filter(Boolean);

      setFormData((prev) => {
        const current = Array.isArray(prev.gallery) ? prev.gallery : [];
        return {
          ...prev,
          gallery: [...current, ...validUrls],
        };
      });

      triggerToast(`Uploaded & compressed ${validUrls.length} picture${validUrls.length > 1 ? "s" : ""}!`);
      setIsUploadingGallery(false);

      // Background attempt upload to Firebase Storage
      files.forEach(async (file, idx) => {
        try {
          const downloadUrl = await Promise.race([
            uploadImageToStorage(file, "destinations/gallery"),
            new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 4000)),
          ]);
          if (downloadUrl) {
            const localDataUrl = validUrls[idx];
            setFormData((prev) => {
              const current = Array.isArray(prev.gallery) ? prev.gallery : [];
              return {
                ...prev,
                gallery: current.map((u) => (u === localDataUrl ? downloadUrl : u)),
              };
            });
          }
        } catch (storageErr) {
          console.warn("Gallery Storage upload fallback to compressed Data URL:", storageErr);
        }
      });
    } catch (err) {
      console.error("Gallery upload error:", err);
      triggerToast("Failed to upload gallery images");
      setIsUploadingGallery(false);
    } finally {
      if (e.target) e.target.value = "";
    }
  };

  // Fetch System Admins from Firestore via adminData
  const fetchSystemAdmins = async () => {
    try {
      const dbAdmins = await fetchSystemAdminsFromDb();
      if (Array.isArray(dbAdmins) && dbAdmins.length > 0) {
        setSystemAdmins((prev) => {
          const combined = Array.from(new Set([...prev, ...dbAdmins]));
          localStorage.setItem("travel_admin_emails", JSON.stringify(combined));
          return combined;
        });
      }
    } catch (err) {
      console.warn("Could not fetch system admins from Firestore:", err);
    }
  };

  // Fetch Destinations from Firestore via adminData
  const fetchDestinations = async () => {
    setLoading(true);
    try {
      const list = await fetchDestinationsFromDb();
      setDestinations(list);
    } catch (error) {
      console.error("Error fetching destinations:", error);
      triggerToast("Failed to fetch destinations from database");
    } finally {
      setLoading(false);
    }
  };

  // About Page Information & Team Management State
  const [teamMembers, setTeamMembers] = useState([]);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [aboutActiveTab, setAboutActiveTab] = useState("team"); // "team" | "content"
  const [aboutPageForm, setAboutPageForm] = useState(() => {
    try {
      const cached = JSON.parse(localStorage.getItem("travel_about_info") || "null");
      if (cached) return cached;
    } catch {}
    return DEFAULT_ABOUT_INFO;
  });
  const [isSavingAboutInfo, setIsSavingAboutInfo] = useState(false);

  const [isEditMemberModalOpen, setIsEditMemberModalOpen] = useState(false);
  const [isSavingMember, setIsSavingMember] = useState(false);
  const [memberFormData, setMemberFormData] = useState({
    id: "",
    name: "",
    position: "",
    image: "",
    facebook: "https://facebook.com/",
    github: "https://github.com/",
    linkedin: "https://linkedin.com/",
  });
  const memberFileInputRef = useRef(null);

  const fetchTeamMembers = async () => {
    try {
      const list = await fetchTeamMembersFromDb();
      setTeamMembers(list);
    } catch (err) {
      console.error("Error fetching team members:", err);
    }
  };

  const fetchAboutInfo = async () => {
    try {
      const data = await fetchAboutInfoFromDb();
      setAboutPageForm(data);
    } catch (err) {
      console.error("Error fetching about page info:", err);
    }
  };

  useEffect(() => {
    fetchDestinations();
    fetchSystemAdmins();
    fetchTeamMembers();
    fetchAboutInfo();
  }, []);

  const handleSaveAboutPageContent = async (e) => {
    e?.preventDefault();
    setIsSavingAboutInfo(true);
    try {
      let keywordsArr = aboutPageForm.headerKeywords;
      if (typeof keywordsArr === "string") {
        keywordsArr = keywordsArr.split(",").map((k) => k.trim()).filter(Boolean);
      } else if (!Array.isArray(keywordsArr)) {
        keywordsArr = DEFAULT_ABOUT_INFO.headerKeywords;
      }

      const payload = {
        ...aboutPageForm,
        headerPrefix: aboutPageForm.headerPrefix?.trim() || "We’re Students",
        headerKeywords: keywordsArr.length > 0 ? keywordsArr : DEFAULT_ABOUT_INFO.headerKeywords,
        description: aboutPageForm.description?.trim() || DEFAULT_ABOUT_INFO.description,
        disclaimer: aboutPageForm.disclaimer?.trim() || DEFAULT_ABOUT_INFO.disclaimer,
      };

      await saveAboutInfoToDb(payload);
      setAboutPageForm(payload);
      triggerToast("About page content saved & synced to database!");
    } catch (err) {
      console.error("Error saving about page info:", err);
      triggerToast("Failed to save About page content.");
    } finally {
      setIsSavingAboutInfo(false);
    }
  };

  const handleOpenCreateMember = () => {
    setMemberFormData({
      id: "",
      name: "",
      position: "",
      image: "",
      facebook: "https://facebook.com/",
      github: "https://github.com/",
      linkedin: "https://linkedin.com/",
    });
    setIsEditMemberModalOpen(true);
  };

  const handleOpenEditMember = (member) => {
    setMemberFormData({
      id: member.id || "",
      name: member.name || "",
      position: member.position || "",
      image: member.image || "",
      facebook: member.facebook || "https://facebook.com/",
      github: member.github || "https://github.com/",
      linkedin: member.linkedin || "https://linkedin.com/",
    });
    setIsEditMemberModalOpen(true);
  };

  const handleMemberPhotoFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file, 600, 600, 0.75);
      setMemberFormData((prev) => ({ ...prev, image: compressed }));
      triggerToast("Profile photo loaded & compressed!");
    } catch (err) {
      console.error("Error compressing photo:", err);
      triggerToast("Failed to process photo.");
    } finally {
      if (e.target) e.target.value = "";
    }
  };

  const handleSaveTeamMember = async (e) => {
    e.preventDefault();
    if (!memberFormData.name.trim()) {
      triggerToast("Please enter member name.");
      return;
    }

    setIsSavingMember(true);
    try {
      await saveTeamMemberToDb(memberFormData);
      triggerToast(`Team member "${memberFormData.name}" updated in database!`);
      await fetchTeamMembers();
      setIsEditMemberModalOpen(false);
    } catch (err) {
      console.error("Error saving team member:", err);
      triggerToast("Failed to save team member to database.");
    } finally {
      setIsSavingMember(false);
    }
  };

  const handleDeleteTeamMember = async (memberId, memberName) => {
    if (!window.confirm(`Are you sure you want to delete ${memberName || "this team member"}?`)) return;
    try {
      await deleteTeamMemberFromDb(memberId);
      triggerToast(`Deleted ${memberName} from team.`);
      await fetchTeamMembers();
    } catch (err) {
      console.error("Error deleting member:", err);
      triggerToast("Failed to delete team member.");
    }
  };

  // Pending Photos Approval State
  const [showPendingPhotosModal, setShowPendingPhotosModal] = useState(false);
  const [processingPhotoId, setProcessingPhotoId] = useState(null);

  // Compute all pending user photo submissions across all destinations
  const allPendingPhotos = destinations.flatMap((dest) => {
    if (!Array.isArray(dest.pendingGallery) || dest.pendingGallery.length === 0) return [];
    return dest.pendingGallery.map((photo) => ({
      ...photo,
      destDocId: photo.destinationDocId || dest.docId || dest.id,
      destName: photo.destinationName || dest.name,
    }));
  });

  const handleApprovePhoto = async (destDocId, photoItem) => {
    setProcessingPhotoId(photoItem.id);
    try {
      await approvePendingUserPhotoInDb(destDocId, photoItem);
      triggerToast(`Approved photo from ${photoItem.submittedBy || "user"}! Added to ${photoItem.destinationName || "destination"} gallery.`);
      await fetchDestinations();
    } catch (err) {
      console.error("Error approving photo:", err);
      triggerToast("Failed to approve photo.");
    } finally {
      setProcessingPhotoId(null);
    }
  };

  const handleRejectPhoto = async (destDocId, photoItem) => {
    setProcessingPhotoId(photoItem.id);
    try {
      await rejectPendingUserPhotoInDb(destDocId, photoItem);
      triggerToast(`Rejected photo submission.`);
      await fetchDestinations();
    } catch (err) {
      console.error("Error rejecting photo:", err);
      triggerToast("Failed to reject photo.");
    } finally {
      setProcessingPhotoId(null);
    }
  };

  const triggerToast = (message) => {
    window.dispatchEvent(
      new CustomEvent("showToast", { detail: message })
    );
  };

  // Open modal for Create
  const handleOpenCreateModal = () => {
    setEditingDocId(null);
    setFormData({
      name: "",
      cat: "plains",
      location: "",
      rating: 5,
      img: "",
      gallery: [],
      about: "",
      mapSearch: "",
      searchNames: "",
      adminEmails: systemAdmins.join(", "),
      showInSlideHeader: false,
      showInTopDestinations: true,
      showInExplore: true,
    });
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEditModal = (dest) => {
    setEditingDocId(dest.docId);

    let existingEmails = defaultAdminEmail;
    if (Array.isArray(dest.adminEmails) && dest.adminEmails.length > 0) {
      existingEmails = dest.adminEmails.join(", ");
    } else if (dest.adminEmail) {
      existingEmails = dest.adminEmail;
    } else if (dest.createdByEmail) {
      existingEmails = dest.createdByEmail;
    }

    let parsedGallery = [];
    if (Array.isArray(dest.gallery)) {
      parsedGallery = dest.gallery.filter(Boolean);
    } else if (typeof dest.gallery === "string" && dest.gallery.trim()) {
      parsedGallery = dest.gallery.split(/,(?=\s*https?:|,\s*data:)/g).map((s) => s.trim()).filter(Boolean);
    }

    setFormData({
      name: dest.name || "",
      cat: dest.cat || "plains",
      location: dest.location || "",
      rating: dest.rating || 5,
      img: dest.img || "",
      gallery: parsedGallery,
      about: dest.about || "",
      mapSearch: dest.mapSearch || (dest.name ? `${dest.name}, ${dest.location || "Cambodia"}` : ""),
      searchNames: Array.isArray(dest.searchNames)
        ? dest.searchNames.join(", ")
        : dest.searchNames || "",
      adminEmails: existingEmails,
      showInSlideHeader: dest.showInSlideHeader ?? false,
      showInTopDestinations: dest.showInTopDestinations ?? true,
      showInExplore: dest.showInExplore ?? true,
    });
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Generate ID from name safely
  const generateSlugId = (name) => {
    const slug = (name || "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
    return slug || `dest-${Date.now()}`;
  };

  // Submit Destination (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.name.trim()) {
      triggerToast("Please enter a destination name");
      return;
    }

    setIsSubmitting(true);
    try {
      const docId = editingDocId || generateSlugId(formData.name);
      const nameClean = formData.name.trim();
      const nameLower = nameClean.toLowerCase();

      const searchArray = formData.searchNames
        ? formData.searchNames.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean)
        : [];

      if (!searchArray.includes(nameLower)) {
        searchArray.unshift(nameLower);
      }

      const galleryArray = Array.isArray(formData.gallery)
        ? formData.gallery.filter(Boolean)
        : typeof formData.gallery === "string" && formData.gallery.trim()
          ? [formData.gallery.trim()]
          : [];

      let coverImg = formData.img?.trim() || PRESET_IMAGES[0]?.url || "/assets/profile.jpg";
      if (typeof coverImg === "string" && coverImg.startsWith("data:image") && coverImg.length > 100000) {
        coverImg = await compressImage(coverImg, 900, 900, 0.65);
      }

      const finalGallery = [];
      for (const item of galleryArray) {
        if (typeof item === "string" && item.startsWith("data:image") && item.length > 100000) {
          const compressedItem = await compressImage(item, 900, 900, 0.65);
          finalGallery.push(compressedItem);
        } else {
          finalGallery.push(item);
        }
      }

      if (finalGallery.length === 0) {
        finalGallery.push(coverImg);
      }

      const activeAdminEmail = currentUser?.email || defaultAdminEmail;

      const payload = {
        id: docId,
        docId: docId,
        name: nameClean,
        cat: formData.cat || "plains",
        location: formData.location?.trim() || "Cambodia",
        rating: Number(formData.rating) || 5,
        img: coverImg,
        gallery: finalGallery,
        about: formData.about?.trim() || `Explore the beauty of ${nameClean} in Cambodia.`,
        mapSearch: formData.mapSearch?.trim() || `${nameClean}, Cambodia`,
        searchNames: searchArray,
        adminEmails: [activeAdminEmail],
        adminEmail: activeAdminEmail,
        createdByEmail: activeAdminEmail,
        createdByName: currentUser?.name || "Admin",
        showInSlideHeader: Boolean(formData.showInSlideHeader),
        showInTopDestinations: Boolean(formData.showInTopDestinations),
        showInExplore: Boolean(formData.showInExplore),
      };

      await saveDestinationToDb(docId, payload);

      triggerToast(
        editingDocId
          ? "Destination updated successfully!"
          : "New destination created and saved to database!"
      );
      setIsModalOpen(false);
      await fetchDestinations();
    } catch (err) {
      console.error("Error saving destination to Firestore:", err);
      triggerToast(`Failed to save destination: ${err.message || "Database error"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Destination
  const handleDelete = async (docId) => {
    try {
      await deleteDestinationFromDb(docId);
      triggerToast("Destination deleted successfully");
      setDeleteConfirmId(null);
      fetchDestinations();
    } catch (err) {
      console.error("Error deleting destination:", err);
      triggerToast("Failed to delete destination");
    }
  };

  // Filtered List
  const filteredDestinations = destinations.filter((item) => {
    const matchesSearch =
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategoryFilter === "all" || item.cat === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (!adminChecked) {
    return (
      <div className="min-h-screen bg-[#0F2027] flex items-center justify-center font-poppins text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-emerald-300 font-medium animate-pulse">Verifying Admin Permissions...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0F2027] via-[#1a3a29] to-[#0F2027] text-white font-poppins pb-20">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 bg-[#0F2027]/95 backdrop-blur-md border-b border-emerald-800/40 shadow-xl">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-3.5 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">

          {/* Dashboard Title & Status Row */}
          <div className="flex items-center justify-between gap-3 min-w-0">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <Link
                to="/"
                className="p-2 rounded-xl bg-emerald-900/50 hover:bg-emerald-800/70 text-white transition-all shrink-0 hover:scale-105 active:scale-95 shadow-sm"
                title="Return to Home"
              >
                <ArrowLeftIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
              <div className="p-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 shrink-0">
                <BuildingLibraryIcon className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
              </div>
              <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-white truncate">
                Admin Dashboard
              </h1>
            </div>
            <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30 shrink-0 whitespace-nowrap shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Firestore Sync
            </span>
          </div>

          {/* Action Buttons Toolbar */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 w-full lg:w-auto">
            {/* System Admins Toggle Badge */}
            <button
              onClick={() => setShowManageAdmins(!showManageAdmins)}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-xs font-mono text-emerald-300 hover:bg-emerald-900/80 transition-all shrink-0 active:scale-95 shadow-sm"
              title="Manage System Admins"
            >
              <UserGroupIcon className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="whitespace-nowrap font-medium">Admins ({systemAdmins.length})</span>
            </button>

            {/* Manage About Us Page & Team Button */}
            <button
              onClick={() => setShowTeamModal(true)}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-xs font-mono text-emerald-300 hover:bg-emerald-900/80 transition-all shrink-0 active:scale-95 shadow-sm"
              title="Manage About Page Content & Team Members"
            >
              <UserIcon className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="whitespace-nowrap font-medium">About & Team ({teamMembers.length})</span>
            </button>

            {/* Pending User Photos Moderation Badge */}
            <button
              onClick={() => setShowPendingPhotosModal(true)}
              className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-mono transition-all shrink-0 active:scale-95 shadow-sm ${
                allPendingPhotos.length > 0
                  ? "bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold animate-pulse shadow-lg"
                  : "bg-emerald-950/80 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/80"
              }`}
              title="Moderate User Submitted Gallery Photos"
            >
              <PhotoIcon className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="whitespace-nowrap font-medium">Pending ({allPendingPhotos.length})</span>
            </button>

            <button
              onClick={fetchDestinations}
              disabled={loading}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs sm:text-sm font-medium transition-all disabled:opacity-50 shrink-0 active:scale-95"
              title="Refresh Destinations"
            >
              <ArrowPathIcon className={`w-4 h-4 shrink-0 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden xs:inline sm:inline whitespace-nowrap">Refresh</span>
            </button>

            {/* Add Destination */}
            <button
              onClick={handleOpenCreateModal}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-emerald-900/40 transition-all shrink-0 hover:scale-[1.02] active:scale-95"
            >
              <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
              <span className="whitespace-nowrap">Add Destination</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-8 space-y-6 sm:space-y-8">
        {/* Banner Card */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-emerald-900/80 via-[#28623a] to-emerald-950 p-5 sm:p-7 md:p-8 border border-emerald-500/30 shadow-2xl">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 text-xs font-semibold uppercase tracking-wider mb-3">
              <SparklesIcon className="w-4 h-4 text-emerald-400 shrink-0" /> Multi-Admin Destination Control
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white leading-tight">
              Manage & Assign Multiple Admin Emails
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-emerald-100/80 mt-2 leading-relaxed">
              Add multiple authorized admin emails to your system. Destinations created or updated can have multiple admin owners stored directly in Firebase Firestore.
            </p>
          </div>
          <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-emerald-400 to-transparent" />
        </div>

        {/* System Admins Manager Panel */}
        <div className="bg-white/5 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-white/10 p-4 sm:p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ShieldCheckIcon className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400 shrink-0" />
              <h3 className="text-sm sm:text-lg font-bold text-white">
                Authorized System Admin Emails ({systemAdmins.length})
              </h3>
            </div>
            <span className="text-[11px] text-emerald-300/80 font-mono">
              Stored in System & Firestore
            </span>
          </div>

          {/* Add New System Admin Email Form */}
          <form onSubmit={handleAddSystemAdmin} className="flex flex-col sm:flex-row gap-2.5 w-full max-w-xl">
            <div className="relative flex-1 min-w-0">
              <EnvelopeIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 shrink-0 pointer-events-none" />
              <input
                type="email"
                value={newAdminEmailInput}
                onChange={(e) => setNewAdminEmailInput(e.target.value)}
                placeholder="Add new admin email (e.g. sophea@gmail.com)..."
                className="w-full bg-black/40 border border-white/20 rounded-xl pl-9 pr-3 py-2.5 text-xs sm:text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-mono"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 shrink-0 whitespace-nowrap active:scale-95"
            >
              <PlusIcon className="w-4 h-4 shrink-0" />
              <span>Add Admin</span>
            </button>
          </form>

          {/* System Admins List Pills */}
          <div className="flex flex-wrap gap-2 pt-2 items-center">
            {systemAdmins.map((email) => (
              <div
                key={email}
                className="inline-flex items-center gap-2 bg-emerald-950/90 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-xs font-mono text-emerald-200 shadow-sm max-w-full hover:border-emerald-400/50 transition-all"
              >
                <UserIcon className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate whitespace-nowrap leading-normal max-w-[200px] sm:max-w-xs md:max-w-sm" title={email}>
                  {email}
                </span>
                {systemAdmins.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveSystemAdmin(email)}
                    className="p-0.5 rounded-full hover:bg-red-600/40 text-gray-400 hover:text-red-300 transition-colors ml-0.5 shrink-0"
                    title={`Remove ${email}`}
                  >
                    <XMarkIcon className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col justify-between">
            <p className="text-[11px] sm:text-xs text-gray-400 font-semibold uppercase tracking-wider">
              Total Destinations
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              {destinations.length}
            </p>
          </div>
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col justify-between">
            <p className="text-[11px] sm:text-xs text-gray-400 font-semibold uppercase tracking-wider">
              System Admin Emails
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400 mt-1">
              {systemAdmins.length}
            </p>
          </div>
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col justify-between">
            <p className="text-[11px] sm:text-xs text-gray-400 font-semibold uppercase tracking-wider">
              Plains & Coastal
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-teal-400 mt-1">
              {destinations.filter((d) => d.cat === "plains" || d.cat === "coastal").length}
            </p>
          </div>
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col justify-between">
            <p className="text-[11px] sm:text-xs text-gray-400 font-semibold uppercase tracking-wider">
              Mountain & Tonle Sap
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-amber-400 mt-1">
              {destinations.filter((d) => d.cat === "mountain" || d.cat === "tonle").length}
            </p>
          </div>
        </div>

        {/* Controls: Search and Filter */}
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 items-stretch lg:items-center justify-between bg-white/5 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-white/10 shadow-lg">
          <div className="relative w-full lg:w-80 shrink-0 min-w-0">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search destination name or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/40 border border-white/20 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          {/* Category Filter Pills with smooth horizontal scrolling */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto w-full lg:w-auto py-1 px-0.5 no-scrollbar scroll-smooth">
            <button
              onClick={() => setSelectedCategoryFilter("all")}
              className={`shrink-0 px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all active:scale-95 ${
                selectedCategoryFilter === "all"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/50"
                  : "bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white"
              }`}
            >
              All ({destinations.length})
            </button>
            {CATEGORIES.map((cat) => {
              const count = destinations.filter((d) => d.cat === cat.value).length;
              return (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategoryFilter(cat.value)}
                  className={`shrink-0 px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all active:scale-95 ${
                    selectedCategoryFilter === cat.value
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/50"
                      : "bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white"
                  }`}
                >
                  {cat.label} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Destinations Table / Cards */}
        {loading ? (
          <div className="w-full py-20 flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-4" />
            <p className="text-emerald-200 text-sm animate-pulse">Loading destinations from Firestore...</p>
          </div>
        ) : filteredDestinations.length === 0 ? (
          <div className="text-center py-16 bg-white/5 rounded-3xl border border-white/10">
            <BuildingLibraryIcon className="w-16 h-16 text-gray-500 mx-auto mb-3 opacity-40" />
            <h3 className="text-lg font-semibold text-gray-300">No destinations found</h3>
            <p className="text-sm text-gray-400 mt-1 max-w-md mx-auto">
              {searchQuery
                ? `No destinations match "${searchQuery}". Try a different term or clear filters.`
                : "No destinations exist in the collection. Click 'Add Destination' above to create your first item."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredDestinations.map((dest) => {
              const creatorEmail =
                dest.createdByEmail ||
                dest.adminEmail ||
                (Array.isArray(dest.adminEmails) ? dest.adminEmails[0] : dest.adminEmails) ||
                defaultAdminEmail;

              return (
                <motion.div
                  key={dest.docId}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white/5 backdrop-blur-md rounded-2xl overflow-hidden border border-white/10 shadow-xl flex flex-col hover:border-emerald-500/40 transition-all group"
                >
                  {/* Image Preview */}
                  <div className="relative aspect-[16/9] bg-black/40 overflow-hidden">
                    <img
                      src={dest.img || PRESET_IMAGES[0].url}
                      alt={dest.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src = PRESET_IMAGES[0].url;
                      }}
                    />
                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-semibold text-amber-300 flex items-center gap-1 border border-white/10">
                      <StarIcon className="w-3.5 h-3.5 text-amber-400" />
                      <span>{dest.rating || 5}</span>
                    </div>

                    <div className="absolute top-3 left-3 bg-emerald-950/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-medium text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
                      {dest.cat || "Plains"}
                    </div>
                  </div>

                  {/* Info Content */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-1">
                        {dest.name}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-gray-300 mt-1">
                        <MdLocationPin className="text-emerald-400 text-sm shrink-0" />
                        <span className="truncate">{dest.location || "Cambodia"}</span>
                      </div>

                      {/* Single Creator Admin Email Tag */}
                      <div className="inline-flex items-center gap-1.5 text-[11px] text-emerald-300 font-mono bg-emerald-950/70 border border-emerald-500/30 px-2.5 py-1 rounded-lg max-w-full mt-2.5 shadow-sm">
                        <EnvelopeIcon className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="truncate whitespace-nowrap leading-normal max-w-[180px] sm:max-w-[220px]" title={`Added by ${creatorEmail}`}>
                          {creatorEmail}
                        </span>
                      </div>

                      {/* Section Placement Badges */}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {dest.showInSlideHeader && (
                          <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-medium">
                            Header Slider
                          </span>
                        )}
                        {dest.showInTopDestinations !== false && (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-medium">
                            Top Destination
                          </span>
                        )}
                        {dest.showInExplore !== false && (
                          <span className="text-[10px] bg-teal-500/20 text-teal-300 border border-teal-500/30 px-2 py-0.5 rounded-full font-medium">
                            Explore Section
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-gray-400 mt-2.5 line-clamp-2 leading-relaxed">
                        {dest.about || "No description provided."}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                      <Link
                        to={`/explore/${encodeURIComponent(dest.name)}`}
                        className="text-xs font-medium text-emerald-400 hover:text-emerald-300 underline"
                      >
                        View details
                      </Link>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEditModal(dest)}
                          className="p-2 rounded-xl bg-white/10 hover:bg-emerald-600/30 text-gray-200 hover:text-white transition-colors active:scale-95"
                          title="Edit Destination"
                        >
                          <PencilSquareIcon className="w-4 h-4 text-emerald-400" />
                        </button>

                        {deleteConfirmId === dest.docId ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(dest.docId)}
                              className="px-2 py-1 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="px-2 py-1 rounded-lg bg-gray-700 text-gray-200 text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirmId(dest.docId)}
                            className="p-2 rounded-xl bg-white/10 hover:bg-red-600/30 text-gray-200 hover:text-red-400 transition-colors active:scale-95"
                            title="Delete Destination"
                          >
                            <TrashIcon className="w-4 h-4 text-red-400" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      {/* Add / Edit Destination Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSubmitting && setIsModalOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />

            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-[#142820] border border-emerald-500/30 rounded-3xl shadow-2xl p-6 sm:p-8 z-10 max-h-[90vh] overflow-y-auto text-white"
            >
              <div className="flex items-center justify-between pb-4 border-b border-emerald-800/40 mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                    <BuildingLibraryIcon className="w-6 h-6 text-emerald-400" />
                    {editingDocId ? "Edit Destination" : "Add New Destination"}
                  </h2>
                  <p className="text-xs text-emerald-200/70 mt-0.5">
                    {editingDocId
                      ? `Updating details for doc: ${editingDocId}`
                      : "Create a new Cambodia travel destination directly in Firestore."}
                  </p>
                </div>

                <button
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">


                {/* Section Visibility & Placements */}
                <div className="bg-[#0b1812] border border-emerald-500/30 rounded-2xl p-4 space-y-3">
                  <label className="block text-xs font-bold text-emerald-300 uppercase tracking-wider">
                    Website Section Placements *
                  </label>
                  <p className="text-[11px] text-gray-300/80">
                    Check which sections on the website this destination will feature in:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    {/* SlideHeader */}
                    <label className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all cursor-pointer ${formData.showInSlideHeader ? "bg-emerald-900/70 border-emerald-400 text-white font-medium" : "bg-black/40 border-white/10 text-gray-300 hover:border-gray-500"
                      }`}>
                      <input
                        type="checkbox"
                        name="showInSlideHeader"
                        checked={formData.showInSlideHeader}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                      />
                      <span className="text-xs font-semibold">Header Slider</span>
                    </label>

                    {/* Top Destinations */}
                    <label className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all cursor-pointer ${formData.showInTopDestinations ? "bg-emerald-900/70 border-emerald-400 text-white font-medium" : "bg-black/40 border-white/10 text-gray-300 hover:border-gray-500"
                      }`}>
                      <input
                        type="checkbox"
                        name="showInTopDestinations"
                        checked={formData.showInTopDestinations}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                      />
                      <span className="text-xs font-semibold">Top Destinations</span>
                    </label>

                    {/* Explore in Cambodia */}
                    <label className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all cursor-pointer ${formData.showInExplore ? "bg-emerald-900/70 border-emerald-400 text-white font-medium" : "bg-black/40 border-white/10 text-gray-300 hover:border-gray-500"
                      }`}>
                      <input
                        type="checkbox"
                        name="showInExplore"
                        checked={formData.showInExplore}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                      />
                      <span className="text-xs font-semibold">Explore Section</span>
                    </label>
                  </div>
                </div>

                {/* Destination Name */}
                <div>
                  <label className="block text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-2">
                    Destination Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Bokor National Park"
                    required
                    className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>

                {/* Region Category & Rating */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-2">
                      Region / Category *
                    </label>
                    <select
                      name="cat"
                      value={formData.cat}
                      onChange={handleInputChange}
                      className="w-full bg-[#0d1c16] border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-2">
                      Rating (1 to 5 Stars)
                    </label>
                    <select
                      name="rating"
                      value={formData.rating}
                      onChange={handleInputChange}
                      className="w-full bg-[#0d1c16] border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    >
                      {[5, 4, 3, 2, 1].map((num) => (
                        <option key={num} value={num}>
                          {num} Star{num > 1 ? "s" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-2">
                    Location String *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="e.g. Kampot, Cambodia"
                    required
                    className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>

                {/* Location Map Section */}
                <div className="bg-[#0b1812] border border-emerald-500/30 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                      <MdLocationPin className="w-4 h-4 text-emerald-400" />
                      <span>Google Map Location Query *</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const autoLoc = [formData.name, formData.location, "Cambodia"]
                          .filter(Boolean)
                          .join(", ");
                        setFormData((prev) => ({ ...prev, mapSearch: autoLoc }));
                        triggerToast("Auto-filled map search query!");
                      }}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border border-emerald-500/30 transition-colors font-medium flex items-center gap-1"
                    >
                      <span> Auto-fill Query</span>
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      name="mapSearch"
                      value={formData.mapSearch}
                      onChange={handleInputChange}
                      placeholder="e.g. Angkor Wat, Siem Reap, Cambodia"
                      className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-mono"
                    />
                  </div>

                  {/* Map Search Query Quick Suggestions */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    <span className="text-[10px] text-gray-400 font-medium">Quick region suggestions:</span>
                    {["Siem Reap, Cambodia", "Phnom Penh, Cambodia", "Kampot, Cambodia", "Koh Rong, Sihanoukville", "Mondulkiri, Cambodia"].map((loc) => (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => {
                          const query = formData.name ? `${formData.name}, ${loc}` : loc;
                          setFormData((prev) => ({ ...prev, mapSearch: query }));
                        }}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-black/40 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-colors font-mono"
                      >
                        + {loc}
                      </button>
                    ))}
                  </div>

                  {/* Embedded Live Interactive Google Map Preview */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex items-center justify-between text-[11px] text-emerald-300 font-medium">
                      <span>Live Map Preview on Website:</span>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          formData.mapSearch || `${formData.name || "Cambodia"}, ${formData.location || "Cambodia"}`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-400 hover:text-emerald-300 underline font-mono text-[10px]"
                      >
                        Open in Google Maps ↗
                      </a>
                    </div>

                    <div className="w-full h-52 rounded-xl overflow-hidden border border-emerald-500/40 bg-black/60 shadow-lg relative">
                      <iframe
                        title="admin-location-map-preview"
                        className="w-full h-full border-0"
                        src={`https://maps.google.com/maps?q=${encodeURIComponent(
                          formData.mapSearch || `${formData.name || "Cambodia"}, ${formData.location || "Cambodia"}`
                        )}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                        allowFullScreen
                        loading="lazy"
                      />
                    </div>
                  </div>
                </div>

                {/* Cover Image URL */}
                <div>
                  <label className="block text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-2">
                    Cover Image
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      name="img"
                      value={formData.img}
                      onChange={handleInputChange}
                      placeholder="Upload local picture or paste image URL..."
                      className="flex-1 w-full bg-black/40 border border-white/20 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    />

                    {/* Hidden File Input */}
                    <input
                      type="file"
                      ref={coverFileInputRef}
                      onChange={handleCoverFileUpload}
                      accept="image/*"
                      className="hidden"
                    />

                    <button
                      type="button"
                      onClick={() => coverFileInputRef.current?.click()}
                      disabled={isUploadingCover}
                      className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium text-xs flex items-center justify-center gap-1.5 shrink-0 transition-all shadow-md shadow-emerald-900/40 disabled:opacity-50"
                    >
                      {isUploadingCover ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <ArrowUpTrayIcon className="w-4 h-4" />
                          <span>Upload Pic</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Preset Image Quick Selector */}
                  <div className="mt-3">
                    <p className="text-[11px] text-gray-400 mb-1.5 font-medium">
                      Or pick a preset sample photo:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {PRESET_IMAGES.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, img: preset.url }))}
                          className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${formData.img === preset.url
                              ? "bg-emerald-600 text-white border-emerald-400 font-bold"
                              : "bg-black/30 border-white/10 text-gray-300 hover:bg-white/10"
                            }`}
                        >
                          {preset.label || preset.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Live Cover Uploaded Picture Preview */}
                  {formData.img ? (
                    <div className="mt-3 relative aspect-[16/9] rounded-2xl overflow-hidden border-2 border-emerald-500/50 shadow-xl bg-black/60 group">
                      <img
                        src={formData.img}
                        alt="Cover Live Preview"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = PRESET_IMAGES[0].url;
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                      {/* Live Badge Overlay */}
                      <div className="absolute top-3 left-3 flex items-center gap-2">
                        <span className="bg-emerald-600/90 backdrop-blur-md text-white font-bold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md border border-emerald-400/40">
                          {formData.cat || "Plains"}
                        </span>
                        <span className="bg-black/70 backdrop-blur-md text-emerald-300 font-mono text-[10px] px-2.5 py-1 rounded-full border border-emerald-500/40">
                          📸 Live Cover Preview
                        </span>
                      </div>

                      <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md text-amber-300 font-bold text-xs px-2.5 py-1 rounded-full border border-amber-400/30 flex items-center gap-1">
                        <StarIcon className="w-3.5 h-3.5 text-amber-400" />
                        <span>{formData.rating || 5}.0</span>
                      </div>

                      <div className="absolute bottom-3 left-3 right-16 text-white pointer-events-none">
                        <h4 className="font-bold text-sm sm:text-base line-clamp-1 text-emerald-100">
                          {formData.name || "Destination Name"}
                        </h4>
                        <div className="flex items-center gap-1 text-xs text-gray-300 mt-0.5">
                          <MdLocationPin className="text-emerald-400 text-sm shrink-0" />
                          <span className="truncate">{formData.location || "Cambodia"}</span>
                        </div>
                      </div>

                      {/* Remove Cover Pic Button */}
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, img: "" }))}
                        className="absolute bottom-3 right-3 bg-red-600/80 hover:bg-red-600 text-white p-1.5 rounded-xl text-xs font-bold transition-all shadow-md hover:scale-110"
                        title="Remove uploaded cover picture"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="mt-3 p-5 border-2 border-dashed border-white/20 rounded-2xl text-center bg-black/20">
                      <PhotoIcon className="w-8 h-8 text-gray-500 mx-auto mb-1.5 opacity-50" />
                      <p className="text-xs text-gray-400">No cover picture uploaded yet. Click "Upload Pic" above.</p>
                    </div>
                  )}
                </div>

                {/* Gallery Photos */}
                <div>
                  <label className="block text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-2">
                    Gallery Image URLs & Photos ({Array.isArray(formData.gallery) ? formData.gallery.length : 0})
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="flex items-center gap-2 flex-1 w-full">
                      <input
                        type="text"
                        id="newGalleryUrlInput"
                        placeholder="Paste image URL here..."
                        className="flex-1 w-full bg-black/40 border border-white/20 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            const val = e.target.value.trim();
                            if (val) {
                              setFormData((prev) => ({
                                ...prev,
                                gallery: [...(Array.isArray(prev.gallery) ? prev.gallery : []), val],
                              }));
                              e.target.value = "";
                              triggerToast("Added image URL to gallery!");
                            }
                          }
                        }}
                      />

                      <button
                        type="button"
                        onClick={() => {
                          const inputEl = document.getElementById("newGalleryUrlInput");
                          const val = inputEl?.value?.trim();
                          if (val) {
                            setFormData((prev) => ({
                              ...prev,
                              gallery: [...(Array.isArray(prev.gallery) ? prev.gallery : []), val],
                            }));
                            inputEl.value = "";
                            triggerToast("Added image URL to gallery!");
                          }
                        }}
                        className="px-3 py-2.5 bg-white/10 hover:bg-white/20 text-gray-200 hover:text-white rounded-xl font-medium text-xs shrink-0 transition-all border border-white/20 whitespace-nowrap"
                      >
                        + Add URL
                      </button>
                    </div>

                    {/* Hidden File Input for Gallery (Supports Multiple Selection) */}
                    <input
                      type="file"
                      ref={galleryFileInputRef}
                      onChange={handleGalleryFileUpload}
                      accept="image/*"
                      multiple
                      className="hidden"
                    />

                    <button
                      type="button"
                      onClick={() => galleryFileInputRef.current?.click()}
                      disabled={isUploadingGallery}
                      className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium text-xs flex items-center justify-center gap-1.5 shrink-0 transition-all disabled:opacity-50 shadow-md shadow-emerald-900/40"
                    >
                      {isUploadingGallery ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <PhotoIcon className="w-4 h-4 text-white" />
                          <span>Upload Photos</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Live Gallery Uploaded Pictures Grid */}
                  {Array.isArray(formData.gallery) && formData.gallery.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1">
                          <span> Live Uploaded Gallery Grid ({formData.gallery.length})</span>
                        </p>
                        <span className="text-[10px] text-gray-400">Hover photo & click ✕ to delete</span>
                      </div>

                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                        {formData.gallery.map((url, idx) => (
                          <div
                            key={idx}
                            className="relative aspect-square rounded-xl overflow-hidden border border-emerald-500/40 bg-black/40 group shadow-md"
                          >
                            <img
                              src={url}
                              alt={`Gallery picture ${idx + 1}`}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button
                                type="button"
                                onClick={() => {
                                  setFormData((prev) => ({
                                    ...prev,
                                    gallery: prev.gallery.filter((_, i) => i !== idx),
                                  }));
                                  triggerToast("Removed picture from gallery preview");
                                }}
                                className="p-1.5 rounded-full bg-red-600 text-white hover:scale-110 transition-transform shadow-lg"
                                title="Delete picture"
                              >
                                <XMarkIcon className="w-4 h-4" />
                              </button>
                            </div>
                            <span className="absolute bottom-1 left-1 text-[9px] bg-black/80 text-emerald-300 px-1.5 py-0.5 rounded font-mono border border-white/10">
                              #{idx + 1}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* About / Description */}
                <div>
                  <label className="block text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-2">
                    About / Description
                  </label>
                  <textarea
                    name="about"
                    rows={4}
                    value={formData.about}
                    onChange={handleInputChange}
                    placeholder="Detailed description of the destination..."
                    className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>

                {/* Search Names / Keywords */}
                <div>
                  <label className="block text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-2">
                    Search Keywords / Tags (Comma Separated)
                  </label>
                  <input
                    type="text"
                    name="searchNames"
                    value={formData.searchNames}
                    onChange={handleInputChange}
                    placeholder="e.g. bokor, kampot, mountain, national park"
                    className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>

                {/* Submit Actions */}
                <div className="pt-4 border-t border-emerald-800/40 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    disabled={isSubmitting}
                    className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 text-sm font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-lg shadow-emerald-900/50 flex items-center gap-2 transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>{editingDocId ? "Save Changes" : "Create Destination"}</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Pending User Photos Moderation Modal */}
      <AnimatePresence>
        {showPendingPhotosModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPendingPhotosModal(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl bg-[#142820] border border-emerald-500/30 rounded-3xl shadow-2xl p-6 sm:p-8 z-10 max-h-[90vh] overflow-y-auto text-white space-y-6"
            >
              <div className="flex items-center justify-between pb-4 border-b border-emerald-800/40">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                    <PhotoIcon className="w-6 h-6 text-amber-400" />
                    User Photo Submissions ({allPendingPhotos.length})
                  </h2>
                  <p className="text-xs text-emerald-200/70 mt-0.5">
                    Review photos uploaded by users. Click Accept to publish them directly to the destination photo gallery.
                  </p>
                </div>

                <button
                  onClick={() => setShowPendingPhotosModal(false)}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              {allPendingPhotos.length === 0 ? (
                <div className="text-center py-12 bg-black/20 rounded-2xl border border-white/10">
                  <PhotoIcon className="w-12 h-12 text-gray-500 mx-auto mb-2 opacity-50" />
                  <h4 className="text-base font-semibold text-gray-300">No pending photo submissions</h4>
                  <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
                    When users upload gallery photos on destination detail pages, they will appear here for your admin approval.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {allPendingPhotos.map((photo) => (
                    <div
                      key={photo.id}
                      className="bg-black/40 border border-white/10 rounded-2xl overflow-hidden p-4 flex flex-col justify-between space-y-3 hover:border-emerald-500/40 transition-all shadow-lg"
                    >
                      <div className="relative aspect-[16/10] bg-black rounded-xl overflow-hidden border border-white/10">
                        <img
                          src={photo.url}
                          alt="Submitted user photo"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-2 left-2 bg-emerald-950/90 text-emerald-300 text-[10px] font-mono px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                          {photo.destName || "Destination"}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs text-gray-300 font-mono">
                          <span>Submitted by: <span className="text-emerald-300 font-bold">{photo.submittedBy || "User"}</span></span>
                        </div>
                        {photo.submittedAt && (
                          <span className="text-[10px] text-gray-500 block">
                            Date: {new Date(photo.submittedAt).toLocaleDateString()} {new Date(photo.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>

                      <div className="pt-2 border-t border-white/10 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleApprovePhoto(photo.destDocId, photo)}
                          disabled={processingPhotoId === photo.id}
                          className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-1 shadow-md shadow-emerald-900/40"
                        >
                          {processingPhotoId === photo.id ? (
                            <span>Approving...</span>
                          ) : (
                            <span>✓ Accept & Add to Gallery</span>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRejectPhoto(photo.destDocId, photo)}
                          disabled={processingPhotoId === photo.id}
                          className="px-3.5 py-2.5 bg-red-600/80 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                          title="Reject and delete photo"
                        >
                          ✕ Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* About Page & Team Management Modal */}
      <AnimatePresence>
        {showTeamModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTeamModal(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-[#142820] border border-emerald-500/30 rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-8 z-10 max-h-[90vh] overflow-y-auto text-white space-y-6"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-emerald-800/40">
                <div className="w-full sm:w-auto">
                  <div className="flex items-center justify-between w-full sm:w-auto">
                    <h2 className="text-base sm:text-2xl font-bold text-white flex items-center gap-2 truncate">
                      <BuildingLibraryIcon className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400 shrink-0" />
                      <span className="truncate">About Page & Team Management</span>
                    </h2>
                    <button
                      onClick={() => setShowTeamModal(false)}
                      className="sm:hidden p-1.5 rounded-full bg-white/10 text-gray-300 hover:text-white shrink-0 ml-2"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="text-xs text-emerald-200/70 mt-1">
                    Manage the About page headline, rotating keywords, description text, and team members stored in Firestore.
                  </p>
                </div>

                <button
                  onClick={() => setShowTeamModal(false)}
                  className="hidden sm:flex p-2 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-colors shrink-0"
                >
                  ✕
                </button>
              </div>

              {/* Tab Navigation */}
              <div className="flex items-center gap-2 p-1 bg-black/40 rounded-2xl border border-emerald-500/20 w-fit">
                <button
                  onClick={() => setAboutActiveTab("team")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                    aboutActiveTab === "team"
                      ? "bg-emerald-600 text-white shadow-md"
                      : "text-emerald-200/70 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <UserIcon className="w-4 h-4" />
                  <span>Team Members ({teamMembers.length})</span>
                </button>
                <button
                  onClick={() => setAboutActiveTab("content")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                    aboutActiveTab === "content"
                      ? "bg-emerald-600 text-white shadow-md"
                      : "text-emerald-200/70 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <DocumentTextIcon className="w-4 h-4" />
                  <span>About Page Content</span>
                </button>
              </div>

              {/* TAB 1: TEAM MEMBERS */}
              {aboutActiveTab === "team" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">
                      Current Team Members
                    </span>
                    <button
                      onClick={handleOpenCreateMember}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 shrink-0"
                    >
                      <PlusIcon className="w-4 h-4" />
                      <span>Add Member</span>
                    </button>
                  </div>

                  {teamMembers.length === 0 ? (
                    <div className="p-8 text-center bg-black/30 rounded-2xl border border-white/5">
                      <p className="text-sm text-gray-400">No team members currently configured.</p>
                      <button
                        onClick={handleOpenCreateMember}
                        className="mt-3 px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold"
                      >
                        Add First Member
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {teamMembers.map((member) => (
                        <div
                          key={member.id || member.name}
                          className="bg-black/40 border border-white/10 rounded-2xl p-4 flex flex-col items-center text-center justify-between space-y-3 hover:border-emerald-500/40 transition-all shadow-lg"
                        >
                          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-emerald-400/40 bg-gray-800 shadow-md shrink-0">
                            <img
                              src={member.image || "/assets/Profile/Ratna.jpg"}
                              alt={member.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop";
                              }}
                            />
                          </div>

                          <div>
                            <h4 className="font-bold text-sm text-white line-clamp-1">{member.name}</h4>
                            <span className="text-xs text-emerald-300 font-medium block mt-0.5">{member.position}</span>
                          </div>

                          <div className="flex items-center justify-center gap-2 pt-2 border-t border-white/10 w-full">
                            <button
                              onClick={() => handleOpenEditMember(member)}
                              className="flex-1 py-1.5 bg-emerald-700/80 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1"
                            >
                              <PencilSquareIcon className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteTeamMember(member.id, member.name)}
                              className="p-1.5 bg-red-600/80 hover:bg-red-600 text-white rounded-lg transition-all"
                              title="Delete Member"
                            >
                              <TrashIcon className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: ABOUT PAGE CONTENT */}
              {aboutActiveTab === "content" && (
                <form onSubmit={handleSaveAboutPageContent} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Header Prefix */}
                    <div>
                      <label className="block text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-2">
                        Header Prefix
                      </label>
                      <input
                        type="text"
                        value={aboutPageForm.headerPrefix || ""}
                        onChange={(e) => setAboutPageForm((prev) => ({ ...prev, headerPrefix: e.target.value }))}
                        placeholder="e.g. We’re Students"
                        className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      />
                    </div>

                    {/* Rotating Keywords */}
                    <div>
                      <label className="block text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-2">
                        Rotating Keywords (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={
                          Array.isArray(aboutPageForm.headerKeywords)
                            ? aboutPageForm.headerKeywords.join(", ")
                            : aboutPageForm.headerKeywords || ""
                        }
                        onChange={(e) =>
                          setAboutPageForm((prev) => ({
                            ...prev,
                            headerKeywords: e.target.value.split(",").map((k) => k.trim()),
                          }))
                        }
                        placeholder="e.g. of RUPP, ITE, Engineering"
                        className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      />
                    </div>
                  </div>

                  {/* Main Description */}
                  <div>
                    <label className="block text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-2">
                      Main Story / About Description
                    </label>
                    <textarea
                      rows={4}
                      value={aboutPageForm.description || ""}
                      onChange={(e) => setAboutPageForm((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Write the main description for the About page..."
                      className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 leading-relaxed"
                    />
                  </div>

                  {/* Disclaimer */}
                  <div>
                    <label className="block text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-2">
                      Learning & Legal Disclaimer
                    </label>
                    <textarea
                      rows={3}
                      value={aboutPageForm.disclaimer || ""}
                      onChange={(e) => setAboutPageForm((prev) => ({ ...prev, disclaimer: e.target.value }))}
                      placeholder="Enter legal / educational disclaimer..."
                      className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 leading-relaxed"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-emerald-800/40">
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm("Reset About page content to initial defaults?")) {
                          setAboutPageForm(DEFAULT_ABOUT_INFO);
                        }
                      }}
                      className="px-4 py-2 rounded-xl text-xs text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      Reset to Default Text
                    </button>

                    <button
                      type="submit"
                      disabled={isSavingAboutInfo}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-900/40 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      {isSavingAboutInfo ? (
                        <>
                          <ArrowPathIcon className="w-4 h-4 animate-spin" />
                          <span>Saving to Firestore...</span>
                        </>
                      ) : (
                        <>
                          <SparklesIcon className="w-4 h-4" />
                          <span>Save About Page Content</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit / Add Team Member Modal */}
      <AnimatePresence>
        {isEditMemberModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditMemberModalOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-[#142820] border border-emerald-500/30 rounded-3xl shadow-2xl p-6 sm:p-8 z-10 max-h-[90vh] overflow-y-auto text-white space-y-6"
            >
              <div className="flex items-center justify-between pb-4 border-b border-emerald-800/40">
                <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  <UserIcon className="w-5 h-5 text-emerald-400" />
                  <span>{memberFormData.id ? "Edit Team Member" : "Add Team Member"}</span>
                </h3>
                <button
                  onClick={() => setIsEditMemberModalOpen(false)}
                  className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveTeamMember} className="space-y-4">
                {/* Profile Picture Input */}
                <div>
                  <label className="block text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-2">
                    Profile Picture *
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-full overflow-hidden border border-emerald-500/40 bg-black/40 shrink-0">
                      {memberFormData.image ? (
                        <img
                          src={memberFormData.image}
                          alt="Profile Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <UserIcon className="w-8 h-8 text-gray-500 m-4" />
                      )}
                    </div>

                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={memberFormData.image}
                        onChange={(e) => setMemberFormData((prev) => ({ ...prev, image: e.target.value }))}
                        placeholder="Image URL or choose file..."
                        className="w-full bg-black/40 border border-white/20 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      />
                      <input
                        type="file"
                        ref={memberFileInputRef}
                        onChange={handleMemberPhotoFileSelect}
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => memberFileInputRef.current?.click()}
                        className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
                      >
                        Upload Photo
                      </button>
                    </div>
                  </div>
                </div>

                {/* Member Name */}
                <div>
                  <label className="block text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-1">
                    Member Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={memberFormData.name}
                    onChange={(e) => setMemberFormData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Thuon Ratna"
                    className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>

                {/* Position / Role */}
                <div>
                  <label className="block text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-1">
                    Position / Role *
                  </label>
                  <input
                    type="text"
                    required
                    value={memberFormData.position}
                    onChange={(e) => setMemberFormData((prev) => ({ ...prev, position: e.target.value }))}
                    placeholder="e.g. Leader / Full-Stack Developer"
                    className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>

                {/* Social Media Links */}
                <div className="space-y-3 pt-2 border-t border-white/10">
                  <span className="block text-xs font-bold text-emerald-300 uppercase tracking-wider">
                    Social Media Links
                  </span>

                  <div>
                    <label className="block text-[11px] text-gray-300 mb-1">Facebook URL</label>
                    <input
                      type="text"
                      value={memberFormData.facebook}
                      onChange={(e) => setMemberFormData((prev) => ({ ...prev, facebook: e.target.value }))}
                      placeholder="https://facebook.com/username"
                      className="w-full bg-black/40 border border-white/20 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-gray-300 mb-1">GitHub URL</label>
                    <input
                      type="text"
                      value={memberFormData.github}
                      onChange={(e) => setMemberFormData((prev) => ({ ...prev, github: e.target.value }))}
                      placeholder="https://github.com/username"
                      className="w-full bg-black/40 border border-white/20 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-gray-300 mb-1">LinkedIn URL</label>
                    <input
                      type="text"
                      value={memberFormData.linkedin}
                      onChange={(e) => setMemberFormData((prev) => ({ ...prev, linkedin: e.target.value }))}
                      placeholder="https://linkedin.com/in/username"
                      className="w-full bg-black/40 border border-white/20 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditMemberModalOpen(false)}
                    disabled={isSavingMember}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 text-xs font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingMember}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-md shadow-emerald-900/40"
                  >
                    {isSavingMember ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Save Team Member</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
