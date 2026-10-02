import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';

function KycVerification() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState('');

  const [photo, setPhoto] = useState(null);
  const [front, setFront] = useState(null);
  const [back, setBack] = useState(null);

  const [photoPreview, setPhotoPreview] = useState('');
  const [frontPreview, setFrontPreview] = useState('');
  const [backPreview, setBackPreview] = useState('');

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setName(user?.name || '');
  }, [user]);

  /*
   * Role-based KYC information
   */
  const isSeller = user?.role === 'seller';
  const isBuyer = user?.role === 'buyer';

  const pageDescription = isSeller
    ? 'Complete your KYC verification to become a verified seller on NILAAM.'
    : 'Complete your KYC verification to verify your identity and participate in auctions on NILAAM.';

  const photoDescription = isSeller
    ? 'This photo can be used as your verified NILAAM seller profile picture.'
    : 'This photo can be used as your verified NILAAM profile picture.';

  const privacyDescription = isSeller
    ? 'Your submitted KYC information is used for identity verification and seller verification on NILAAM.'
    : 'Your submitted KYC information is used for identity verification and secure participation in auctions on NILAAM.';

  function getSuccessMessage() {
    if (isSeller) {
      return 'KYC submitted successfully. You will be able to sell items after admin verification.';
    }

    if (isBuyer) {
      return 'KYC submitted successfully. You will be able to participate in bidding after admin verification.';
    }

    return 'KYC submitted successfully. Your application will be reviewed by an admin.';
  }

  /*
   * Create preview URL for uploaded image.
   */
  function handleFileChange(file, type) {
    if (!file) return;

    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
    ];

    const maxSize = 5 * 1024 * 1024; // 5 MB

    if (!allowedTypes.includes(file.type)) {
      alert(
        'Please upload a JPG, JPEG, PNG, or WEBP image.'
      );
      return;
    }

    if (file.size > maxSize) {
      alert('Image size must be less than 5 MB.');
      return;
    }

    const preview = URL.createObjectURL(file);

    if (type === 'photo') {
      setPhoto(file);
      setPhotoPreview(preview);
    }

    if (type === 'front') {
      setFront(file);
      setFrontPreview(preview);
    }

    if (type === 'back') {
      setBack(file);
      setBackPreview(preview);
    }
  }

  function removeFile(type) {
    if (type === 'photo') {
      setPhoto(null);
      setPhotoPreview('');
    }

    if (type === 'front') {
      setFront(null);
      setFrontPreview('');
    }

    if (type === 'back') {
      setBack(null);
      setBackPreview('');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!name.trim()) {
      alert('Please enter your full name.');
      return;
    }

    if (!phone.trim()) {
      alert('Please enter your phone number.');
      return;
    }

    if (!photo) {
      alert('Please upload your photo.');
      return;
    }

    if (!front) {
      alert('Please upload the front side of your citizenship.');
      return;
    }

    if (!back) {
      alert('Please upload the back side of your citizenship.');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      formData.append('name', name.trim());
      formData.append('phone_number', phone.trim());
      formData.append('photo', photo);
      formData.append('citizenship_front', front);
      formData.append('citizenship_back', back);

      await api.post('/kyc/submit', formData);

      alert(getSuccessMessage());

      navigate('/dashboard');
    } catch (error) {
      console.error(
        'KYC submission error:',
        error.response?.data || error
      );

      alert(
        error.response?.data?.message ||
        'Something went wrong while submitting your KYC.'
      );
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    'w-full px-4 py-3 border border-gray-300 rounded-lg ' +
    'focus:outline-none focus:ring-2 focus:ring-blue-500 ' +
    'focus:border-blue-500 text-gray-900';

  function UploadBox({
    title,
    description,
    file,
    preview,
    type,
    required = true,
  }) {
    return (
      <div className="border border-gray-200 rounded-xl p-4">
        <div className="mb-3">
          <h3 className="font-semibold text-gray-900">
            {title}
            {required && (
              <span className="text-red-500 ml-1">*</span>
            )}
          </h3>

          <p className="text-xs text-gray-500 mt-1">
            {description}
          </p>
        </div>

        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt={title}
              className="w-full h-48 object-cover rounded-lg border"
            />

            <button
              type="button"
              onClick={() => removeFile(type)}
              className="absolute top-2 right-2 px-3 py-1.5 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700"
            >
              Remove
            </button>

            <p className="text-xs text-gray-500 mt-2 truncate">
              {file?.name}
            </p>
          </div>
        ) : (
          <label className="block cursor-pointer">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 hover:bg-blue-50 transition">
              <div className="text-3xl mb-2">
                📷
              </div>

              <p className="text-sm font-medium text-gray-700">
                Click to upload
              </p>

              <p className="text-xs text-gray-400 mt-1">
                JPG, PNG, WEBP — Max 5 MB
              </p>
            </div>

            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              className="hidden"
              onChange={(e) =>
                handleFileChange(
                  e.target.files?.[0],
                  type
                )
              }
            />
          </label>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-2xl">
              🛡️
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Identity Verification
              </h1>

              <p className="text-sm text-gray-500 mt-1">
                {pageDescription}
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-sm font-semibold text-blue-900">
                1. Personal Details
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Provide your real information.
              </p>
            </div>

            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-sm font-semibold text-blue-900">
                2. Upload Documents
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Upload your citizenship images.
              </p>
            </div>

            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-sm font-semibold text-blue-900">
                3. Admin Review
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Wait for verification.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-7"
        >

          {/* Personal Information */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              Personal Information
            </h2>

            <p className="text-sm text-gray-500 mt-1 mb-4">
              Make sure these details match your citizenship.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                  <span className="text-red-500 ml-1">*</span>
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  placeholder="Enter your full name"
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                  <span className="text-red-500 ml-1">*</span>
                </label>

                <input
                  type="tel"
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value)
                  }
                  placeholder="98XXXXXXXX"
                  className={inputClass}
                  required
                />
              </div>

            </div>
          </section>

          {/* Photo */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              Profile Photo
            </h2>

            <p className="text-sm text-gray-500 mt-1 mb-4">
              {photoDescription}
            </p>

            <UploadBox
              title="Your Photo"
              description="Upload a clear photo of yourself."
              file={photo}
              preview={photoPreview}
              type="photo"
            />
          </section>

          {/* Citizenship */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              Citizenship Document
            </h2>

            <p className="text-sm text-gray-500 mt-1 mb-4">
              Upload clear images of both sides of your
              citizenship document.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <UploadBox
                title="Citizenship Front"
                description="Front side of your citizenship."
                file={front}
                preview={frontPreview}
                type="front"
              />

              <UploadBox
                title="Citizenship Back"
                description="Back side of your citizenship."
                file={back}
                preview={backPreview}
                type="back"
              />

            </div>
          </section>

          {/* Privacy Notice */}
          <div className="rounded-xl bg-gray-50 border border-gray-200 p-4">
            <div className="flex gap-3">
              <span className="text-xl">
                🔒
              </span>

              <div>
                <h3 className="font-semibold text-gray-900">
                  Your information is protected
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  {privacyDescription}
                </p>
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? 'Submitting KYC...'
              : 'Submit for Verification'}
          </button>

          <p className="text-xs text-center text-gray-400">
            By submitting, you confirm that the information
            provided is accurate.
          </p>

        </form>
      </div>
    </div>
  );
}

export default KycVerification;
