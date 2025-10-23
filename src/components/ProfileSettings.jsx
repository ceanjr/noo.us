import { useState } from 'react';
import { db, auth } from '../lib/firebase';
import {
  updateDoc,
  doc,
  addDoc,
  collection,
  serverTimestamp,
} from 'firebase/firestore';
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth';
import { showToast } from './Toast';
import {
  User,
  Camera,
  Lock,
  Calendar,
  Save,
  X,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Mail,
  Phone,
  Palette,
} from 'lucide-react';
import CryptoJS from 'crypto-js';
import { useTheme } from '../contexts/ThemeContext';

const SALT_KEY = 'noo_us_secure_v1';

export default function ProfileSettings({
  profile,
  userId,
  onClose,
  setModal,
}) {
  const [activeSection, setActiveSection] = useState('profile');
  const [loading, setLoading] = useState(false);
  const { currentTheme, changeTheme, themes } = useTheme();

  // Profile data
  const [name, setName] = useState(profile.name || '');
  const [photoURL, setPhotoURL] = useState(profile.photoURL || '');

  // Password data
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Date change data
  const [newRelationshipDate, setNewRelationshipDate] = useState(
    profile.relationshipStart || ''
  );
  const [dateChangeReason, setDateChangeReason] = useState('');

  const hashPassword = (password) => {
    return CryptoJS.SHA256(password + SALT_KEY).toString();
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateDoc(doc(db, 'users', userId), {
        name,
        photoURL,
      });

      showToast('Perfil atualizado com sucesso! ✨', 'success');
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      showToast('Erro ao atualizar perfil', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      showToast('A nova senha deve ter no mínimo 6 caracteres', 'error');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      showToast('As senhas não coincidem', 'error');
      return;
    }

    setLoading(true);

    try {
      const user = auth.currentUser;

      if (profile.authMethod === 'email') {
        // Para usuários de email, reautenticar primeiro
        const credential = EmailAuthProvider.credential(
          user.email,
          currentPassword
        );
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, newPassword);
      }

      // Atualizar hash da senha no Firestore
      await updateDoc(doc(db, 'users', userId), {
        passwordHash: hashPassword(newPassword),
      });

      showToast('Senha alterada com sucesso! 🔒', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      if (error.code === 'auth/wrong-password') {
        showToast('Senha atual incorreta', 'error');
      } else {
        showToast('Erro ao alterar senha', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRequestDateChange = async (e) => {
    e.preventDefault();

    if (!profile.partnerId) {
      showToast('Você precisa estar vinculado para alterar a data', 'warning');
      return;
    }

    if (newRelationshipDate === profile.relationshipStart) {
      showToast('Escolha uma data diferente da atual', 'warning');
      return;
    }

    setModal({
      isOpen: true,
      title: 'Solicitar Mudança de Data?',
      message: `Você está solicitando mudar a data de início do relacionamento para ${new Date(
        newRelationshipDate
      ).toLocaleDateString('pt-BR')}. ${
        profile.partnerName
      } receberá uma notificação para aprovar.`,
      type: 'info',
      showCancel: true,
      confirmText: 'Enviar Solicitação',
      onConfirm: async () => {
        setLoading(true);
        try {
          // Criar notificação para o parceiro
          await addDoc(collection(db, 'notifications'), {
            type: 'date_change_request',
            senderId: userId,
            senderName: profile.name,
            recipientId: profile.partnerId,
            recipientName: profile.partnerName,
            currentDate: profile.relationshipStart,
            proposedDate: newRelationshipDate,
            reason: dateChangeReason,
            status: 'pending',
            createdAt: new Date().toISOString(),
          });

          showToast(
            'Solicitação enviada! Aguarde a resposta do seu parceiro 💕',
            'success'
          );
          setDateChangeReason('');
          onClose();
        } catch (error) {
          console.error('Erro ao enviar solicitação:', error);
          showToast('Erro ao enviar solicitação', 'error');
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const sections = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'password', label: 'Senha', icon: Lock },
    { id: 'date', label: 'Data', icon: Calendar },
    { id: 'theme', label: 'Tema', icon: Palette },
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
                  onClick={() => setActiveSection(section.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                    activeSection === section.id
                      ? 'bg-theme-secondary text-primary-600 shadow-lg'
                      : 'bg-theme-secondary/20 text-white hover:bg-theme-secondary/30'
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
          {activeSection === 'profile' && (
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white text-4xl font-bold shadow-lg mb-4 mx-auto overflow-hidden">
                    {photoURL ? (
                      <img
                        src={photoURL}
                        alt={name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-16 h-16" />
                    )}
                  </div>
                  <div className="absolute bottom-4 right-0 bg-theme-secondary p-2 rounded-full shadow-lg">
                    <Camera className="w-5 h-5 text-gray-600" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-theme-secondary mb-2">
                  URL da Foto de Perfil
                </label>
                <input
                  type="url"
                  value={photoURL}
                  onChange={(e) => setPhotoURL(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-theme rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300"
                  placeholder="https://exemplo.com/foto.jpg"
                />
                <p className="mt-2 text-xs text-gray-500">
                  Cole o link de uma imagem da internet (ex: Imgur, Google
                  Photos)
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
                  {profile.authMethod === 'email' ? (
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
                  Método de autenticação:{' '}
                  {profile.authMethod === 'email'
                    ? 'Email'
                    : profile.authMethod === 'phone'
                    ? 'Telefone'
                    : 'Google'}
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-4 rounded-xl font-bold hover:from-primary-600 hover:to-secondary-600 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </form>
          )}

          {/* Password Section */}
          {activeSection === 'password' && (
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

              {profile.authMethod !== 'google' && (
                <div>
                  <label className="block text-sm font-bold text-theme-secondary mb-2">
                    Senha Atual
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
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
                    type={showNewPassword ? 'text' : 'password'}
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
                    type={showConfirmPassword ? 'text' : 'password'}
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
                {loading ? 'Alterando...' : 'Alterar Senha'}
              </button>
            </form>
          )}

          {/* Date Section */}
          {activeSection === 'date' && (
            <form onSubmit={handleRequestDateChange} className="space-y-6">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300 p-4 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="bg-purple-500 p-2 rounded-lg flex-shrink-0">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-theme-primary mb-1">
                      Data Atual
                    </p>
                    <p className="text-xl font-black text-purple-600">
                      {profile.relationshipStart
                        ? new Date(
                            profile.relationshipStart
                          ).toLocaleDateString('pt-BR')
                        : 'Não definida'}
                    </p>
                  </div>
                </div>
              </div>

              {profile.partnerId ? (
                <>
                  <div>
                    <label className="block text-sm font-bold text-theme-secondary mb-2">
                      Nova Data de Início
                    </label>
                    <input
                      type="date"
                      value={newRelationshipDate}
                      onChange={(e) => setNewRelationshipDate(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-theme rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-theme-secondary mb-2">
                      Motivo da Mudança (Opcional)
                    </label>
                    <textarea
                      value={dateChangeReason}
                      onChange={(e) => setDateChangeReason(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-theme rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 min-h-[100px]"
                      placeholder="Ex: Conversamos e achamos que essa data faz mais sentido..."
                    />
                  </div>

                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-400 p-4 rounded-xl">
                    <div className="flex items-start gap-3">
                      <div className="bg-yellow-500 p-1.5 rounded-lg flex-shrink-0">
                        <AlertCircle className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-theme-primary mb-1">
                          Atenção
                        </p>
                        <p className="text-sm font-medium text-theme-secondary">
                          {profile.partnerName} receberá uma notificação e
                          precisará aprovar a mudança. Ambos precisam concordar
                          para a data ser alterada.
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-4 rounded-xl font-bold hover:from-primary-600 hover:to-secondary-600 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-5 h-5" />
                    {loading ? 'Enviando...' : 'Solicitar Mudança'}
                  </button>
                </>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    Você precisa estar vinculado a um parceiro para alterar a
                    data do relacionamento.
                  </p>
                </div>
              )}
            </form>
          )}

          {/* Theme Section */}
          {activeSection === 'theme' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-bold text-theme-primary mb-2">
                  Aparência
                </h3>
                <p className="text-sm text-theme-secondary">
                  Escolha entre o modo claro ou escuro
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {Object.entries(themes).map(([themeId, theme]) => {
                  const isActive = currentTheme === themeId;
                  return (
                    <button
                      key={themeId}
                      onClick={() => {
                        changeTheme(themeId);
                        showToast(
                          `${theme.name} ativado! ${theme.icon}`,
                          'success'
                        );
                      }}
                      className={`relative p-6 rounded-2xl border-2 transition-all duration-300 ${
                        isActive
                          ? 'border-primary-500 bg-gradient-to-br from-primary-50 to-secondary-50 shadow-lg scale-105'
                          : 'border-theme bg-theme-secondary hover:border-primary-300 hover:shadow-md'
                      }`}
                    >
                      {isActive && (
                        <div className="absolute top-3 right-3">
                          <CheckCircle className="w-5 h-5 text-primary-600" />
                        </div>
                      )}

                      <div className="text-center">
                        <div className="text-5xl mb-3">{theme.icon}</div>
                        <h3 className="font-bold text-theme-primary mb-1">
                          {theme.name}
                        </h3>
                        <p className="text-xs text-theme-secondary">
                          {theme.description}
                        </p>
                      </div>

                      <div className="flex gap-2 mt-4 justify-center">
                        <div
                          className="w-6 h-6 rounded-full shadow-sm border-2 border-theme-secondary"
                          style={{ backgroundColor: theme.primary[500] }}
                        />
                        <div
                          className="w-6 h-6 rounded-full shadow-sm border-2 border-theme-secondary"
                          style={{ backgroundColor: theme.secondary[500] }}
                        />
                        <div
                          className="w-6 h-6 rounded-full shadow-sm border-2 border-theme-secondary"
                          style={{ backgroundColor: theme.accent[500] }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 p-4 rounded-xl mt-6">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-500 p-1.5 rounded-lg flex-shrink-0">
                    <AlertCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-theme-primary mb-1">
                      Sincronização Automática
                    </p>
                    <p className="text-sm font-medium text-theme-secondary">
                      Sua preferência será salva e sincronizada em todos os seus
                      dispositivos.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
