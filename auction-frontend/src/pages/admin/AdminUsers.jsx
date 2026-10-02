import { useEffect, useMemo, useState } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import {
  getPendingKyc,
  verifyKyc,
  rejectKyc,
} from '../../api/admin';

const STORAGE_URL = 'http://127.0.0.1:8000/storage';

function getImageUrl(path) {
  if (!path) return '';

  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('data:')
  ) {
    return path;
  }

  return `${STORAGE_URL}/${String(path).replace(/^\/+/, '')}`;
}

function getInitials(name) {
  if (!name) return 'U';

  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

function formatDate(date) {
  if (!date) return 'Not available';

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleString('en-NP', {
    timeZone: 'Asia/Kathmandu',
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  async function loadPending() {
    try {
      setLoading(true);
      setErrorMessage('');

      const response = await getPendingKyc();

      const data = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response?.data?.data)
          ? response.data.data
          : [];

      setUsers(data);
    } catch (error) {
      console.error('Failed to load pending KYC:', error);
      setUsers([]);
      setErrorMessage(
        'Unable to load pending KYC requests. Please check the Laravel API.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPending();
  }, []);

  async function handleVerify(id) {
    if (!id || processingId) return;

    try {
      setProcessingId(id);
      setErrorMessage('');

      await verifyKyc(id);

      setUsers((currentUsers) =>
        currentUsers.filter((user) => user.id !== id)
      );
    } catch (error) {
      console.error('Failed to verify KYC:', error);

      setErrorMessage(
        'Failed to verify this KYC request. Please try again.'
      );
    } finally {
      setProcessingId(null);
    }
  }

  async function handleReject(id) {
    if (!id || processingId) return;

    try {
      setProcessingId(id);
      setErrorMessage('');

      await rejectKyc(id);

      setUsers((currentUsers) =>
        currentUsers.filter((user) => user.id !== id)
      );
    } catch (error) {
      console.error('Failed to reject KYC:', error);

      setErrorMessage(
        'Failed to reject this KYC request. Please try again.'
      );
    } finally {
      setProcessingId(null);
    }
  }

  const documentCount = useMemo(() => {
    return users.filter(
      (user) =>
        user.kyc_photo ||
        user.kyc_citizenship_front ||
        user.kyc_citizenship_back
    ).length;
  }, [users]);

  return (
    <div className="min-h-screen bg-[#f8f7ff]">
      <div className="max-w-[1600px] mx-auto px-4 lg:px-6 py-5">
        <div className="flex flex-col lg:flex-row gap-5">

          {/* =====================================================
              ADMIN SIDEBAR
          ===================================================== */}

          <aside className="w-full lg:w-[250px] shrink-0">
            <AdminSidebar />
          </aside>

          {/* =====================================================
              MAIN CONTENT
          ===================================================== */}

          <main className="flex-1 min-w-0">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5 mb-6">

              <div>
                <div className="flex items-center gap-2 text-xs mb-2">
                  <span className="text-emerald-700 font-semibold uppercase tracking-wide">
                    Identity Verification
                  </span>

                  <span className="text-slate-300">
                    •
                  </span>

                  <span className="text-slate-500">
                    KYC Review Queue
                  </span>
                </div>

                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
                  KYC & Users
                </h1>

                <p className="text-sm text-slate-500 mt-2 max-w-2xl">
                  Review submitted identity documents and verify or reject
                  pending user KYC applications.
                </p>
              </div>

              <button
                type="button"
                onClick={loadPending}
                disabled={loading}
                className="self-start xl:self-auto bg-emerald-900 hover:bg-emerald-950 disabled:opacity-60 text-white px-5 py-3 rounded-xl text-sm font-semibold transition"
              >
                {loading ? 'Loading...' : '↻ Refresh'}
              </button>

            </div>

            {/* =================================================
                SUMMARY CARDS
            ================================================= */}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">

              {/* Pending */}

              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-slate-500 font-medium">
                      Pending KYC
                    </p>

                    <p className="text-3xl font-bold font-mono text-slate-900 mt-2">
                      {users.length}
                    </p>

                    <p className="text-xs text-slate-500 mt-2">
                      Applications waiting for review
                    </p>
                  </div>

                  <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center text-xl">
                    ⏳
                  </div>

                </div>
              </div>

              {/* Documents */}

              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-slate-500 font-medium">
                      Documents Submitted
                    </p>

                    <p className="text-3xl font-bold font-mono text-slate-900 mt-2">
                      {documentCount}
                    </p>

                    <p className="text-xs text-slate-500 mt-2">
                      Requests containing KYC documents
                    </p>
                  </div>

                  <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center text-xl">
                    ▣
                  </div>

                </div>
              </div>

              {/* Review */}

              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-slate-500 font-medium">
                      Review Required
                    </p>

                    <p className="text-3xl font-bold font-mono text-red-700 mt-2">
                      {users.length}
                    </p>

                    <p className="text-xs text-slate-500 mt-2">
                      Users requiring administrator action
                    </p>
                  </div>

                  <div className="w-11 h-11 rounded-xl bg-red-50 text-red-700 flex items-center justify-center text-xl">
                    !
                  </div>

                </div>
              </div>

            </div>

            {/* =================================================
                ERROR
            ================================================= */}

            {errorMessage && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">

                <p className="text-sm font-medium">
                  {errorMessage}
                </p>

                <button
                  type="button"
                  onClick={loadPending}
                  className="text-sm font-semibold underline"
                >
                  Try Again
                </button>

              </div>
            )}

            {/* =================================================
                KYC QUEUE
            ================================================= */}

            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

              {/* Section Header */}

              <div className="px-5 py-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">

                <div>
                  <h2 className="font-bold text-lg text-slate-900">
                    Pending Verification Requests
                  </h2>

                  <p className="text-xs text-slate-500 mt-1">
                    Review the user's information and submitted documents
                    before taking action.
                  </p>
                </div>

                <span className="bg-amber-50 text-amber-700 border border-amber-100 px-3 py-1.5 rounded-full text-xs font-semibold">
                  {users.length} Pending
                </span>

              </div>

              {/* =================================================
                  LOADING
              ================================================= */}

              {loading ? (

                <div className="p-8 text-center">

                  <div className="inline-flex items-center gap-3 text-sm text-slate-500">
                    <div className="w-5 h-5 border-2 border-slate-300 border-t-emerald-700 rounded-full animate-spin" />
                    Loading KYC requests...
                  </div>

                </div>

              ) : users.length === 0 ? (

                /* =================================================
                    EMPTY
                ================================================= */

                <div className="p-12 text-center">

                  <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-2xl">
                    ✓
                  </div>

                  <h3 className="font-bold text-lg text-slate-900 mt-4">
                    No Pending KYC Requests
                  </h3>

                  <p className="text-sm text-slate-500 mt-2">
                    All submitted KYC applications have been reviewed.
                  </p>

                </div>

              ) : (

                /* =================================================
                    USER CARDS
                ================================================= */

                <div className="p-5 space-y-5">

                  {users.map((user) => {

                    const photo = getImageUrl(user.kyc_photo);
                    const citizenshipFront = getImageUrl(
                      user.kyc_citizenship_front
                    );
                    const citizenshipBack = getImageUrl(
                      user.kyc_citizenship_back
                    );

                    const isProcessing =
                      processingId === user.id;

                    return (
                      <div
                        key={user.id}
                        className="border border-slate-200 rounded-2xl overflow-hidden bg-[#fafbff]"
                      >

                        {/* =================================================
                            USER HEADER
                        ================================================= */}

                        <div className="p-5 bg-white border-b border-slate-200">

                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">

                            <div className="flex items-center gap-4">

                              {/* Profile */}

                              {photo ? (
                                <img
                                  src={photo}
                                  alt={user.name || 'User'}
                                  className="w-14 h-14 rounded-xl object-cover border border-slate-200"
                                />
                              ) : (
                                <div className="w-14 h-14 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-lg">
                                  {getInitials(user.name)}
                                </div>
                              )}

                              <div>
                                <div className="flex flex-wrap items-center gap-2">

                                  <h3 className="text-xl font-bold text-slate-900">
                                    {user.name || 'Unknown User'}
                                  </h3>

                                  <span className="bg-amber-50 text-amber-700 border border-amber-100 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase">
                                    Pending
                                  </span>

                                </div>

                                <p className="text-sm text-slate-500 mt-1">
                                  {user.email || 'No email provided'}
                                </p>

                                <p className="text-sm text-slate-500">
                                  {user.phone_number || 'No phone number'}
                                </p>
                              </div>

                            </div>

                            {/* Actions */}

                            <div className="flex flex-wrap gap-2">

                              <button
                                type="button"
                                onClick={() => handleReject(user.id)}
                                disabled={isProcessing}
                                className="px-5 py-2.5 bg-red-50 hover:bg-red-100 disabled:opacity-50 text-red-700 border border-red-200 rounded-xl text-sm font-semibold transition"
                              >
                                {isProcessing ? 'Processing...' : 'Reject'}
                              </button>

                              <button
                                type="button"
                                onClick={() => handleVerify(user.id)}
                                disabled={isProcessing}
                                className="px-5 py-2.5 bg-emerald-900 hover:bg-emerald-950 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition"
                              >
                                {isProcessing ? 'Processing...' : 'Verify KYC'}
                              </button>

                            </div>

                          </div>

                        </div>

                        {/* =================================================
                            USER INFORMATION
                        ================================================= */}

                        <div className="p-5">

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">

                            <div className="bg-white rounded-xl border border-slate-200 p-4">
                              <p className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold">
                                User ID
                              </p>

                              <p className="text-sm font-semibold text-slate-800 mt-1">
                                #{user.id}
                              </p>
                            </div>

                            <div className="bg-white rounded-xl border border-slate-200 p-4">
                              <p className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold">
                                Submitted
                              </p>

                              <p className="text-sm font-semibold text-slate-800 mt-1">
                                {formatDate(
                                  user.kyc_submitted_at ||
                                  user.updated_at ||
                                  user.created_at
                                )}
                              </p>
                            </div>

                            <div className="bg-white rounded-xl border border-slate-200 p-4">
                              <p className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold">
                                KYC Status
                              </p>

                              <p className="text-sm font-semibold text-amber-700 mt-1">
                                Pending Verification
                              </p>
                            </div>

                          </div>

                          {/* =================================================
                              DOCUMENTS
                          ================================================= */}

                          <div>

                            <div className="flex items-center justify-between mb-3">

                              <div>
                                <h4 className="font-bold text-sm text-slate-900">
                                  Submitted Documents
                                </h4>

                                <p className="text-xs text-slate-500 mt-1">
                                  Check the documents before approving the
                                  account.
                                </p>
                              </div>

                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                              {/* Photo */}

                              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">

                                <div className="px-4 py-3 border-b border-slate-100">
                                  <p className="text-xs font-semibold text-slate-800">
                                    Profile / KYC Photo
                                  </p>
                                </div>

                                <div className="h-56 bg-slate-100 flex items-center justify-center">

                                  {photo ? (
                                    <img
                                      src={photo}
                                      alt={`${user.name || 'User'} KYC`}
                                      className="w-full h-full object-contain"
                                    />
                                  ) : (
                                    <div className="text-center text-slate-400">
                                      <div className="text-3xl">
                                        📷
                                      </div>

                                      <p className="text-xs mt-2">
                                        No photo uploaded
                                      </p>
                                    </div>
                                  )}

                                </div>

                              </div>

                              {/* Citizenship Front */}

                              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">

                                <div className="px-4 py-3 border-b border-slate-100">
                                  <p className="text-xs font-semibold text-slate-800">
                                    Citizenship — Front
                                  </p>
                                </div>

                                <div className="h-56 bg-slate-100 flex items-center justify-center">

                                  {citizenshipFront ? (
                                    <img
                                      src={citizenshipFront}
                                      alt="Citizenship front"
                                      className="w-full h-full object-contain"
                                    />
                                  ) : (
                                    <div className="text-center text-slate-400">
                                      <div className="text-3xl">
                                        📄
                                      </div>

                                      <p className="text-xs mt-2">
                                        No document uploaded
                                      </p>
                                    </div>
                                  )}

                                </div>

                              </div>

                              {/* Citizenship Back */}

                              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">

                                <div className="px-4 py-3 border-b border-slate-100">
                                  <p className="text-xs font-semibold text-slate-800">
                                    Citizenship — Back
                                  </p>
                                </div>

                                <div className="h-56 bg-slate-100 flex items-center justify-center">

                                  {citizenshipBack ? (
                                    <img
                                      src={citizenshipBack}
                                      alt="Citizenship back"
                                      className="w-full h-full object-contain"
                                    />
                                  ) : (
                                    <div className="text-center text-slate-400">
                                      <div className="text-3xl">
                                        📄
                                      </div>

                                      <p className="text-xs mt-2">
                                        No document uploaded
                                      </p>
                                    </div>
                                  )}

                                </div>

                              </div>

                            </div>

                          </div>

                        </div>

                      </div>
                    );
                  })}

                </div>

              )}

            </section>

          </main>
        </div>
      </div>
    </div>
  );
}

export default AdminUsers;