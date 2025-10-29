import { useState, useRef, useEffect } from "react";
import { db, auth } from "../lib/firebase";
import { updateDoc, doc } from "firebase/firestore";
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { showToast } from "./Toast";
import Avatar from "./Avatar";
import {
  User,
  Camera,
  Lock,
  Save,
  X,
  Eye,
  EyeOff,
  AlertCircle,
  Mail,
  Phone,
} from "lucide-react";
import { uploadProfilePhoto, validateImageFile } from "../lib/storage";

export default function ProfileSettings({ profile, userId, onClose }) {
  const [activeSection, setActiveSection] = useState("profile");
  const [loading, setLoading] = useState(false);
  const isPhoneAuth = profile.authMethod === "phone";

  // Profile data
  const [name, setName] = useState(profile.name || "");
  const [photoURL, setPhotoURL] = useState(profile.photoURL || "");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef(null);

  // Password data
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (isPhoneAuth && activeSection === "password") {
      setActiveSection("profile");
    }
  }, [isPhoneAuth, activeSection]);

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file, 3);
    if (!validation.valid) {
      showToast(validation.error, "error");
      return;
    }

    try {
      setUploadingPhoto(true);
      showToast("Enviando foto de perfil...", "info");

      const newPhotoURL = await uploadProfilePhoto(file, userId);

      await updateDoc(doc(db, "users", userId), {
        photoURL: newPhotoURL,
      });

      setPhotoURL(newPhotoURL);
      showToast("Foto de perfil atualizada! ✨", "success");
    } catch (error) {
      console.error("Erro ao atualizar foto:", error);
      showToast("Erro ao atualizar foto de perfil", "error");
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateDoc(doc(db, "users", userId), {
        name,
      });

      showToast("Perfil atualizado com sucesso! ✨", "success");
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      showToast("Erro ao atualizar perfil", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      showToast("A nova senha deve ter no mínimo 6 caracteres", "error");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      showToast("As senhas não coincidem", "error");
      return;
    }

    setLoading(true);

    try {
      const user = auth.currentUser;

      if (profile.authMethod === "email") {
        const credential = EmailAuthProvider.credential(
          user.email,
          currentPassword
        );
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, newPassword);
      }

      // Firebase Auth já gerencia o hash da senha de forma segura
      // Não é necessário armazenar passwordHash no Firestore

      showToast("Senha alterada com sucesso! 🔒", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (error) {
      console.error("Erro ao alterar senha:", error);
      if (error.code === "auth/wrong-password") {
        showToast("Senha atual incorreta", "error");
      } else {
        showToast("Erro ao alterar senha", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    { id: "profile", label: "Perfil", icon: User },
    { id: "password", label: "Senha", icon: Lock, disabled: isPhoneAuth },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-theme-secondary rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-scale-in flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-500 to-secondary-500 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Configurações</h2>
              <p className="text-sm text-white/80 mt-1">
                Gerencie seu perfil e preferências
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-theme-secondary/20 rounded-xl transition-all duration-300"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-6">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => {
                    if (!section.disabled) {
                      setActiveSection(section.id);
                    }
                  }}
                  disabled={section.disabled}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                    section.disabled
                      ? "bg-theme-secondary/20 text-white/60 cursor-not-allowed opacity-60"
                      : activeSection === section.id
                      ? "bg-theme-secondary text-primary-600 shadow-lg"
                      : "bg-theme-secondary/20 text-white hover:bg-theme-secondary/30"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="hidden sm:inline">{section.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Profile Section */}
          {activeSection === "profile" && (
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic"
                onChange={handleFileSelect}
                className="hidden"
              />

              <div className="text-center">
                <div className="relative inline-block">
                  <Avatar
                    photoURL={photoURL}
                    name={name}
                    avatarBg={profile.avatarBg}
                    size="2xl"
                    shape="rounded"
                    onClick={handlePhotoClick}
                    disabled={uploadingPhoto}
                    className="mb-4 hover:opacity-90 transition-opacity relative group disabled:cursor-not-allowed"
                    fallbackIcon={<User className="w-16 h-16" />}
                  />

                  {!uploadingPhoto && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl pointer-events-none">
                      <Camera className="w-8 h-8 text-white" />
                    </div>
                  )}

                  {uploadingPhoto && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-2xl">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Clique na foto para alterar
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-theme-secondary mb-2">
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-theme rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300"
                  placeholder="Seu nome"
                  required
                />
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border-2 border-blue-200 space-y-2">
                <div className="flex items-center gap-2 text-sm text-theme-primary font-medium">
                  {profile.authMethod === "email" ? (
                    <>
                      <div className="bg-blue-500 p-1.5 rounded-lg">
                        <Mail className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span>
                        <strong>Email:</strong> {profile.email}
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="bg-blue-500 p-1.5 rounded-lg">
                        <Phone className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span>
                        <strong>Telefone:</strong> {profile.phoneNumber}
                      </span>
                    </>
                  )}
                </div>
                <p className="text-xs font-medium text-theme-secondary">
                  Método de autenticação:{" "}
                  {profile.authMethod === "email"
                    ? "Email"
                    : profile.authMethod === "phone"
                    ? "Telefone"
                    : "Google"}
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-4 rounded-xl font-bold hover:from-primary-600 hover:to-secondary-600 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                {loading ? "Salvando..." : "Salvar Alterações"}
              </button>
            </form>
          )}

          {/* Password Section */}
          {activeSection === "password" && isPhoneAuth && (
            <div className="space-y-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 p-6 rounded-2xl text-center">
              <div className="flex justify-center">
                <AlertCircle className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold text-theme-primary">
                Senha indisponível
              </h3>
              <p className="text-sm text-theme-secondary">
                Contas autenticadas por telefone usam códigos SMS para login.
                Não é necessário definir uma senha.
              </p>
            </div>
          )}

          {activeSection === "password" && !isPhoneAuth && (
            <form onSubmit={handleChangePassword} className="space-y-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 p-4 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-500 p-1.5 rounded-lg flex-shrink-0">
                    <AlertCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-theme-primary mb-1">
                      Segurança da Senha
                    </p>
                    <p className="text-sm font-medium text-theme-secondary">
                      Use uma senha forte com no mínimo 6 caracteres, incluindo
                      letras e números.
                    </p>
                  </div>
                </div>
              </div>

              {profile.authMethod !== "google" && (
                <div>
                  <label className="block text-sm font-bold text-theme-secondary mb-2">
                    Senha Atual
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-12 border-2 border-theme rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300"
                      placeholder="Digite sua senha atual"
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-theme-secondary mb-2">
                  Nova Senha
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 border-2 border-theme rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300"
                    placeholder="Digite sua nova senha"
                    minLength={6}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-theme-secondary mb-2">
                  Confirmar Nova Senha
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 border-2 border-theme rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300"
                    placeholder="Digite novamente a nova senha"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-4 rounded-xl font-bold hover:from-primary-600 hover:to-secondary-600 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Lock className="w-5 h-5" />
                {loading ? "Alterando..." : "Alterar Senha"}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
