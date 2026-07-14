import React, { useState } from 'react';
import { X, LogIn, Mail, Lock, User as UserIcon, Briefcase, Phone, FileText, Sparkles, AlertTriangle, Check, ArrowRight } from 'lucide-react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  updateProfile,
  User
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db, handleFirestoreError, OperationType } from '../firebase.ts';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sign In fields
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  // Sign Up fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [role, setRole] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [bio, setBio] = useState('');

  if (!isOpen) return null;

  // Helper to save or update user profile to Firestore
  const saveUserProfileToFirestore = async (user: User, additionalData?: {
    firstName?: string;
    lastName?: string;
    role?: string;
    phoneNumber?: string;
    bio?: string;
  }) => {
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      // Default values from Auth Provider
      const email = user.email || '';
      let fName = additionalData?.firstName || '';
      let lName = additionalData?.lastName || '';
      
      // If no name supplied, split Google Display Name
      if (!fName && user.displayName) {
        const parts = user.displayName.split(' ');
        fName = parts[0] || '';
        lName = parts.slice(1).join(' ') || '';
      }

      const profileData = {
        uid: user.uid,
        firstName: fName,
        lastName: lName,
        email,
        displayName: fName && lName ? `${fName} ${lName}` : (user.displayName || email.split('@')[0]),
        photoURL: user.photoURL || '',
        role: additionalData?.role || (userDocSnap.exists() ? userDocSnap.data().role : 'Designer/Guest'),
        phoneNumber: additionalData?.phoneNumber || (userDocSnap.exists() ? userDocSnap.data().phoneNumber : ''),
        bio: additionalData?.bio || (userDocSnap.exists() ? userDocSnap.data().bio : 'ชื่นชอบงานออกแบบและสไตล์ของ StudioRef'),
        provider: user.providerData[0]?.providerId || 'email',
        updatedAt: serverTimestamp(),
      };

      // Only set createdAt if document doesn't exist
      if (!userDocSnap.exists()) {
        Object.assign(profileData, { createdAt: serverTimestamp() });
      }

      await setDoc(userDocRef, profileData, { merge: true });
    } catch (err) {
      console.error('Error saving user profile to Firestore users collection:', err);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, signInEmail, signInPassword);
      const loggedUser = userCredential.user;
      
      // Sync profile structure in Firestore database if missing
      await saveUserProfileToFirestore(loggedUser);
      
      setSuccessMsg('เข้าสู่ระบบสำเร็จแล้ว ยินดีต้อนรับกลับมา! ✨');
      setTimeout(() => {
        onSuccess(loggedUser);
        onClose();
      }, 1500);
    } catch (error: any) {
      console.error('Sign in error:', error);
      if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        setErrorMsg('อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
      } else if (error.code === 'auth/invalid-email') {
        setErrorMsg('รูปแบบอีเมลไม่ถูกต้อง');
      } else {
        setErrorMsg(error.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      setErrorMsg('กรุณากรอกชื่อและนามสกุลจริง');
      return;
    }
    if (signUpPassword.length < 6) {
      setErrorMsg('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // 1. Create the user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, signUpEmail, signUpPassword);
      const registeredUser = userCredential.user;

      // 2. Set user displayName in Authentication
      await updateProfile(registeredUser, {
        displayName: `${firstName.trim()} ${lastName.trim()}`
      });

      // 3. Save profile data to the Firestore "users" collection with uid
      await saveUserProfileToFirestore(registeredUser, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        role: role.trim() || 'Designer',
        phoneNumber: phoneNumber.trim(),
        bio: bio.trim()
      });

      setSuccessMsg('สมัครสมาชิกและบันทึกข้อมูลสำเร็จแล้ว! 🎉 ยินดีต้อนรับสู่คลับ');
      setTimeout(() => {
        onSuccess(registeredUser);
        onClose();
      }, 1800);
    } catch (error: any) {
      console.error('Sign up error:', error);
      if (error.code === 'auth/email-already-in-use') {
        setErrorMsg('อีเมลนี้ถูกใช้งานแล้วในระบบ กรุณาใช้อีเมลอื่น');
      } else if (error.code === 'auth/weak-password') {
        setErrorMsg('รหัสผ่านไม่ปลอดภัยเพียงพอ กรุณาใช้รหัสผ่านที่ยากขึ้น');
      } else {
        setErrorMsg(error.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const googleUser = userCredential.user;
      
      // Save or merge profile data in Firestore "users" collection
      await saveUserProfileToFirestore(googleUser);

      setSuccessMsg('ล็อกอินผ่าน Google สำเร็จแล้ว! 🌟');
      setTimeout(() => {
        onSuccess(googleUser);
        onClose();
      }, 1500);
    } catch (error: any) {
      console.error('Google Sign In error:', error);
      if (error.code === 'auth/unauthorized-domain' || error.message?.includes('unauthorized-domain')) {
        setErrorMsg('unauthorized-domain');
      } else {
        setErrorMsg(error.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบด้วย Google');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className="bg-[#1C3033] w-full max-w-lg rounded-3xl border border-[#3A6360]/40 shadow-2xl overflow-hidden relative text-white flex flex-col max-h-[90vh] md:max-h-[95vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 p-2 bg-[#101F21] hover:bg-[#253D41] text-[#7A938E] hover:text-white rounded-full transition-colors cursor-pointer z-10"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-[#3A6360]/20 shrink-0">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 bg-[#3A6360] rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight text-white font-serif italic">StudioRef Account</h3>
              <p className="text-[10px] text-[#7A938E] uppercase tracking-wider font-semibold">สร้างโปรไฟล์และจัดการความบันทึกไอเดียของคุณ</p>
            </div>
          </div>

          {/* Toggle Tabs */}
          <div className="flex bg-[#101F21] p-1 rounded-xl mt-4 border border-[#3A6360]/20">
            <button
              onClick={() => {
                setActiveTab('signin');
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'signin' 
                  ? 'bg-[#3A6360] text-white shadow-xs' 
                  : 'text-[#7A938E] hover:text-white'
              }`}
            >
              เข้าสู่ระบบ (Sign In)
            </button>
            <button
              onClick={() => {
                setActiveTab('signup');
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'signup' 
                  ? 'bg-[#3A6360] text-white shadow-xs' 
                  : 'text-[#7A938E] hover:text-white'
              }`}
            >
              สมัครสมาชิก (Sign Up)
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          
          {errorMsg && errorMsg !== 'unauthorized-domain' && (
            <div className="p-3.5 bg-red-950/40 border border-red-800/40 rounded-xl flex gap-3 text-rose-300 text-xs items-start">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">เกิดข้อผิดพลาด: </span>
                <span>{errorMsg}</span>
              </div>
            </div>
          )}

          {errorMsg === 'unauthorized-domain' && (
            <div className="p-4 bg-amber-950/40 border border-amber-800/40 rounded-xl flex flex-col gap-2 text-amber-300 text-xs">
              <div className="flex gap-2 items-center">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span className="font-bold">ต้องตั้งค่า Authorized Domain ใน Firebase</span>
              </div>
              <p className="text-[11px] text-[#7A938E] leading-relaxed">
                กรุณานำที่อยู่เว็บไซต์ปัจจุบันไปเพิ่มใน Firebase Console &gt; Authentication &gt; Settings &gt; Authorized domains ก่อนจึงจะใช้งาน Google Auth ได้
              </p>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-emerald-950/40 border border-emerald-800/40 rounded-xl flex gap-3 text-emerald-300 text-xs items-center">
              <Check className="w-4 h-4 shrink-0" />
              <span className="font-semibold">{successMsg}</span>
            </div>
          )}

          {/* SIGN IN VIEW */}
          {activeTab === 'signin' ? (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-[#7A938E] mb-1.5">อีเมล (Email)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#7A938E]">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    required
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    placeholder="example@domain.com"
                    className="w-full bg-[#101F21] border border-[#3A6360]/40 rounded-xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:border-[#B8CAC4] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-[#7A938E] mb-1.5">รหัสผ่าน (Password)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#7A938E]">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    required
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    placeholder="ป้อนรหัสผ่าน 6 ตัวอักษรขึ้นไป"
                    className="w-full bg-[#101F21] border border-[#3A6360]/40 rounded-xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:border-[#B8CAC4] transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#3A6360] hover:bg-[#4E8480] text-[#142325] font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer mt-2 text-white flex items-center justify-center gap-2"
              >
                {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ ✨'}
                {!loading && <ArrowRight className="w-3.5 h-3.5" />}
              </button>
            </form>
          ) : (
            /* SIGN UP VIEW */
            <form onSubmit={handleSignUp} className="space-y-3.5">
              {/* First Name & Last Name in same row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-[#7A938E] mb-1.5">ชื่อจริง *</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#7A938E]">
                      <UserIcon className="w-3.5 h-3.5" />
                    </span>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="สมชาย"
                      className="w-full bg-[#101F21] border border-[#3A6360]/40 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#B8CAC4] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-[#7A938E] mb-1.5">นามสกุล *</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#7A938E]">
                      <UserIcon className="w-3.5 h-3.5" />
                    </span>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="ใจดี"
                      className="w-full bg-[#101F21] border border-[#3A6360]/40 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#B8CAC4] transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-[#7A938E] mb-1.5">อีเมล (Email) *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#7A938E]">
                    <Mail className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="email"
                    required
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    placeholder="yourname@gmail.com"
                    className="w-full bg-[#101F21] border border-[#3A6360]/40 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#B8CAC4] transition-colors"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-[#7A938E] mb-1.5">รหัสผ่าน (Password) *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#7A938E]">
                    <Lock className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="password"
                    required
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    placeholder="อย่างน้อย 6 ตัวอักษร"
                    className="w-full bg-[#101F21] border border-[#3A6360]/40 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#B8CAC4] transition-colors"
                  />
                </div>
              </div>

              {/* Role / Job */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-[#7A938E] mb-1.5">ตำแหน่ง / อาชีพ</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#7A938E]">
                    <Briefcase className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="เช่น UI/UX Designer, นศ. สถาปัตย์"
                    className="w-full bg-[#101F21] border border-[#3A6360]/40 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#B8CAC4] transition-colors"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-[#7A938E] mb-1.5">เบอร์โทรศัพท์</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#7A938E]">
                    <Phone className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="เช่น 0891234567"
                    className="w-full bg-[#101F21] border border-[#3A6360]/40 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#B8CAC4] transition-colors"
                  />
                </div>
              </div>

              {/* Bio / Other details */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-[#7A938E] mb-1.5">รายละเอียดอื่นๆ / แนะนำตัวเอง</label>
                <div className="relative">
                  <span className="absolute top-3 left-3 text-[#7A938E]">
                    <FileText className="w-3.5 h-3.5" />
                  </span>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="ข้อมูลเพิ่มเติม เช่น สไตล์การทำงานที่ชอบ หรือเป้าหมายในการใช้งาน..."
                    rows={2.5}
                    className="w-full bg-[#101F21] border border-[#3A6360]/40 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#B8CAC4] transition-colors resize-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#3A6360] hover:bg-[#4E8480] text-[#142325] font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer mt-3 text-white flex items-center justify-center gap-2"
              >
                {loading ? 'กำลังดำเนินการ...' : 'ลงทะเบียนและสร้างบัญชี ✨'}
              </button>
            </form>
          )}

          {/* Social login divider */}
          <div className="relative py-2 shrink-0">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#3A6360]/20"></div>
            </div>
            <div className="relative flex justify-center text-[9px] uppercase tracking-wider font-bold text-[#7A938E]">
              <span className="bg-[#1C3033] px-3">หรือดำเนินการผ่าน Google</span>
            </div>
          </div>

          {/* Google Login Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-3 bg-[#101F21] hover:bg-[#253D41] text-white text-xs font-semibold rounded-xl border border-[#3A6360]/30 transition-all shadow-sm cursor-pointer shrink-0"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>ลงชื่อเข้าใช้งานด้วย Google</span>
          </button>
        </div>
      </div>
    </div>
  );
};
