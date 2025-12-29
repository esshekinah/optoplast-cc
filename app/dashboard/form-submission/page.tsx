'use client';

import { useMemo, useState, useEffect } from 'react';
import { Search, Filter, Plus, Trash2, Pencil, Eye, X, FileText } from 'lucide-react';
import { 
  formSubmissionService, 
  FormSubmission, 
  CreateFormSubmissionData, 
  UpdateFormSubmissionData,
  TimeSlot,
  formSubmissionUtils,
  DataError
} from '../../../lib/data-service';

const TIME_SLOTS = ['08h00', '10h00', '12h00', '14h00', '16h00'];

const EMPTY_TIME_SLOT: TimeSlot = {
  time: '',
  item: '',
  opAuto: '',
  counter: '',
  goodQty: '',
  rejectsQty: '',
  comments: '',
  qcCheck: '',
};

const EMPTY_FORM: CreateFormSubmissionData = {
  date: '',
  machineNumber: '',
  startupCleared: '',
  mqrSignOff: '',
  timeSlots: TIME_SLOTS.map(time => ({ ...EMPTY_TIME_SLOT, time })),
  status: 'Active',
};

type ModalMode = 'create' | 'edit' | 'view';

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-3">
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      {subtitle ? <p className="text-sm text-gray-500">{subtitle}</p> : null}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-medium text-gray-700 mb-1">{children}</label>;
}

function Input({
  value,
  onChange,
  placeholder,
  type = 'text',
  disabled,
  required,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: React.HTMLInputTypeAttribute;
  disabled?: boolean;
  required?: boolean;
  error?: string;
}) {
  return (
    <div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        type={type}
        disabled={disabled}
        required={required}
        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? 'border-red-300' : 'border-gray-200'
        } ${disabled ? 'bg-gray-50 text-gray-500' : 'bg-white'}`}
      />
      {error ? <p className="text-xs text-red-600 mt-1">{error}</p> : null}
    </div>
  );
}

function ModalShell({
  open,
  title,
  subtitle,
  children,
  onClose,
  footer,
}: {
  open: boolean;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onClose: () => void;
  footer?: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-6xl bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
              {subtitle ? <p className="text-sm text-gray-500 mt-1">{subtitle}</p> : null}
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-50 text-gray-600"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="px-6 py-5 max-h-[75vh] overflow-y-auto">{children}</div>

          {footer ? <div className="px-6 py-4 border-t border-gray-100">{footer}</div> : null}
        </div>
      </div>
    </div>
  );
}

export default function FormSubmission() {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Active' | 'Inactive'>('all');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>('create');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState<CreateFormSubmissionData>({ ...EMPTY_FORM });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data state
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);

  const selectedSubmission = useMemo(
    () => submissions.find((s) => s.id === selectedId) ?? null,
    [submissions, selectedId]
  );

  // Load data on component mount
  useEffect(() => {
    // Test localStorage directly
    try {
      console.log('Testing localStorage directly...');
      localStorage.setItem('direct_test', 'hello');
      const testResult = localStorage.getItem('direct_test');
      console.log('Direct localStorage test result:', testResult);
      localStorage.removeItem('direct_test');
    } catch (error) {
      console.error('Direct localStorage test failed:', error);
    }

    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await formSubmissionService.getAll();
      setSubmissions(data);
      
      // Initialize sample data if empty
      if (data.length === 0) {
        console.log('No data found, initializing sample data...');
        await formSubmissionUtils.initializeSampleData();
        const newData = await formSubmissionService.getAll();
        setSubmissions(newData);
      }
    } catch (err: any) {
      console.error('Error loading data:', err);
      if (err?.code === 'STORAGE_UNAVAILABLE') {
        setError('localStorage is not available. Please check your browser settings and ensure you\'re not in private/incognito mode.');
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to load data');
      }
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    // Apply status filter first
    let filtered = submissions;
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter((s) => s.status === statusFilter);
    }

    // Then apply search filter
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      filtered = filtered.filter((s) => {
        const haystack = [
          s.machineNumber,
          s.date,
          s.startupCleared,
          s.mqrSignOff,
          ...s.timeSlots.map(slot => slot.item),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        return haystack.includes(q);
      });
    }

    return filtered.sort((a, b) => (a.date > b.date ? -1 : 1));
  }, [submissions, query, statusFilter]);

  function openCreate() {
    setModalMode('create');
    setSelectedId(null);
    setForm({ ...EMPTY_FORM, date: new Date().toISOString().split('T')[0] });
    setErrors({});
    setModalOpen(true);
  }

  function openView(id: string) {
    const s = submissions.find((x) => x.id === id);
    if (!s) return;
    setModalMode('view');
    setSelectedId(id);
    setForm({ ...s });
    setErrors({});
    setModalOpen(true);
  }

  function openEdit(id: string) {
    const s = submissions.find((x) => x.id === id);
    if (!s) return;
    setModalMode('edit');
    setSelectedId(id);
    setForm({ ...s });
    setErrors({});
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
  }

  function validate(current: CreateFormSubmissionData) {
    const e: Record<string, string> = {};

    if (!current.date.trim()) e.date = 'Date is required.';
    if (!current.machineNumber.trim()) e.machineNumber = 'Machine number is required.';
    if (!current.startupCleared.trim()) e.startupCleared = 'Start-up cleared is required.';
    if (!current.mqrSignOff.trim()) e.mqrSignOff = 'MQR sign-off is required.';

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function onSave() {
    console.log('onSave called with form data:', form);
    const ok = validate(form);
    console.log('Validation result:', ok);
    if (!ok) {
      console.log('Validation failed, errors:', errors);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('Starting save operation...');

      if (modalMode === 'create') {
        console.log('Creating new submission...');
        const record = await formSubmissionService.create(form);
        console.log('Submission created successfully:', record);
        setSubmissions((prev) => [record, ...prev]);
        setModalOpen(false);
        return;
      }

      if (modalMode === 'edit' && selectedId) {
        console.log('Updating existing submission:', selectedId);
        const updated = await formSubmissionService.update(selectedId, form);
        console.log('Submission updated successfully:', updated);
        setSubmissions((prev) =>
          prev.map((s) => (s.id === selectedId ? updated : s))
        );
        setModalOpen(false);
      }
    } catch (err: any) {
      console.error('Error in onSave:', err);
      if (err?.code === 'STORAGE_UNAVAILABLE') {
        setError('localStorage is not available. Please check your browser settings and ensure you\'re not in private/incognito mode.');
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to save submission');
      }
    } finally {
      setLoading(false);
    }
  }

  async function onDelete(id: string) {
    const s = submissions.find((x) => x.id === id);
    if (!s) return;

    const yes = window.confirm(`Delete form submission for machine "${s.machineNumber}"? This cannot be undone.`);
    if (!yes) return;

    try {
      setLoading(true);
      setError(null);
      await formSubmissionService.delete(id);
      setSubmissions((prev) => prev.filter((x) => x.id !== id));
      
      if (selectedId === id) {
        setSelectedId(null);
        setModalOpen(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete submission');
      console.error('Error deleting submission:', err);
    } finally {
      setLoading(false);
    }
  }

  const isReadOnly = modalMode === 'view';

  function updateTimeSlot(index: number, field: keyof TimeSlot, value: string) {
    const updatedTimeSlots = [...form.timeSlots];
    updatedTimeSlots[index] = { ...updatedTimeSlots[index], [field]: value };
    setForm((prev) => ({ ...prev, timeSlots: updatedTimeSlots }));
  }

  // Refresh data function
  const refreshData = () => {
    loadData();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Form Submission</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Submission
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
                <X className="w-3 h-3 text-red-600" />
              </div>
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* List wrapper */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {/* Top controls */}
        <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search submissions..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
              />
            </div>

            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Filter className="w-4 h-4" />
              Filters
            </button>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="all">All</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            <p>Loading submissions...</p>
          </div>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Date</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Machine</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Start-up Cleared</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">MQR Sign-off</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4 text-sm text-gray-900">
                    {s.date ? new Date(s.date).toLocaleDateString() : '—'}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-900">{s.machineNumber || '—'}</td>
                  <td className="py-4 px-4 text-sm text-gray-900">{s.startupCleared || '—'}</td>
                  <td className="py-4 px-4 text-sm text-gray-900">{s.mqrSignOff || '—'}</td>
                  <td className="py-4 px-4">
                    <span
                      className={`text-sm px-3 py-1 rounded-full ${
                        s.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openView(s.id)}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        View
                      </button>
                      <button
                        onClick={() => openEdit(s.id)}
                        className="text-gray-700 hover:text-gray-900 text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(s.id)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-500">
                    {query || statusFilter !== 'all' ? 'No submissions found. Try changing your search or filters.' : 'No submissions yet. Create your first submission!'}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        )}
      </div>

      {/* Modal: Create/Edit/View */}
      <ModalShell
        open={modalOpen}
        title={
          modalMode === 'create' ? 'New Form Submission' : modalMode === 'edit' ? 'Edit Form Submission' : 'Form Submission Details'
        }
        subtitle={
          modalMode === 'view'
            ? 'View submission details (read-only)'
            : 'Fill in the machine production sheet'
        }
        onClose={closeModal}
        footer={
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs text-gray-500">
              {modalMode !== 'create' && selectedSubmission ? (
                <>
                  Created: {new Date(selectedSubmission.createdAt).toLocaleString()} • Updated:{' '}
                  {new Date(selectedSubmission.updatedAt).toLocaleString()}
                </>
              ) : (
                'Tip: You can add server saving later via API routes.'
              )}
            </div>

            <div className="flex items-center gap-2">
              {modalMode === 'view' && selectedId ? (
                <>
                  <button
                    onClick={() => openEdit(selectedId)}
                    className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-800 inline-flex items-center gap-2"
                  >
                    <Pencil className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Close
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-800"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onSave}
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        {modalMode === 'create' ? 'Creating...' : 'Saving...'}
                      </>
                    ) : (
                      <>{modalMode === 'create' ? 'Create Submission' : 'Save Changes'}</>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        }
      >
        {/* Form layout */}
        <div className="space-y-8">
          {/* Header Section */}
          <div className="rounded-lg border border-gray-200 p-5">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">OPTOPLAST CC.</h2>
              <p className="text-sm text-gray-600">F-03-01-01 • REV. 08</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <FieldLabel>DATE</FieldLabel>
                <Input
                  value={form.date}
                  onChange={(v) => setForm((s) => ({ ...s, date: v }))}
                  type="date"
                  disabled={isReadOnly}
                  required
                  error={errors.date}
                />
              </div>

              <div>
                <FieldLabel>MACHINE NUMBER</FieldLabel>
                <Input
                  value={form.machineNumber}
                  onChange={(v) => setForm((s) => ({ ...s, machineNumber: v }))}
                  placeholder="e.g. M-001"
                  disabled={isReadOnly}
                  required
                  error={errors.machineNumber}
                />
              </div>

              <div>
                <FieldLabel>By</FieldLabel>
                <Input
                  value="K. Valentyn"
                  onChange={() => {}}
                  disabled
                />
              </div>
            </div>
          </div>

          {/* Production Table */}
          <div className="rounded-lg border border-gray-200 p-5">
            <SectionTitle title="MACHINE PRODUCTION SHEET" />

            <div className="overflow-x-auto">
              <table className="w-full border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700">TIME</th>
                    <th className="border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700">ITEM</th>
                    <th className="border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700">OP/AUTO</th>
                    <th className="border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700">COUNTER</th>
                    <th className="border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700">GOOD Qty</th>
                    <th className="border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700">REJECTS Qty</th>
                    <th className="border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700">COMMENTS/MEASUREMENTS</th>
                    <th className="border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700">QC Check</th>
                  </tr>
                </thead>
                <tbody>
                  {form.timeSlots.map((slot, index) => (
                    <tr key={index}>
                      <td className="border border-gray-300 px-3 py-2">
                        <Input
                          value={slot.time}
                          onChange={() => {}}
                          disabled
                          className="border-0 bg-transparent"
                        />
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        <Input
                          value={slot.item}
                          onChange={(v) => updateTimeSlot(index, 'item', v)}
                          disabled={isReadOnly}
                          className="border-0"
                        />
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        <Input
                          value={slot.opAuto}
                          onChange={(v) => updateTimeSlot(index, 'opAuto', v)}
                          disabled={isReadOnly}
                          className="border-0"
                        />
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        <Input
                          value={slot.counter}
                          onChange={(v) => updateTimeSlot(index, 'counter', v)}
                          disabled={isReadOnly}
                          className="border-0"
                        />
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        <Input
                          value={slot.goodQty}
                          onChange={(v) => updateTimeSlot(index, 'goodQty', v)}
                          disabled={isReadOnly}
                          className="border-0"
                        />
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        <Input
                          value={slot.rejectsQty}
                          onChange={(v) => updateTimeSlot(index, 'rejectsQty', v)}
                          disabled={isReadOnly}
                          className="border-0"
                        />
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        <Input
                          value={slot.comments}
                          onChange={(v) => updateTimeSlot(index, 'comments', v)}
                          disabled={isReadOnly}
                          className="border-0"
                        />
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        <Input
                          value={slot.qcCheck}
                          onChange={(v) => updateTimeSlot(index, 'qcCheck', v)}
                          disabled={isReadOnly}
                          className="border-0"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div>
                <FieldLabel>DATE</FieldLabel>
                <Input
                  value={form.date}
                  onChange={(v) => setForm((s) => ({ ...s, date: v }))}
                  type="date"
                  disabled={isReadOnly}
                />
              </div>

              <div>
                <FieldLabel>Start-up cleared</FieldLabel>
                <Input
                  value={form.startupCleared}
                  onChange={(v) => setForm((s) => ({ ...s, startupCleared: v }))}
                  placeholder="Enter name"
                  disabled={isReadOnly}
                  required
                  error={errors.startupCleared}
                />
              </div>

              <div>
                <FieldLabel>MQR Sign-off</FieldLabel>
                <Input
                  value={form.mqrSignOff}
                  onChange={(v) => setForm((s) => ({ ...s, mqrSignOff: v }))}
                  placeholder="Enter name"
                  disabled={isReadOnly}
                  required
                  error={errors.mqrSignOff}
                />
              </div>
            </div>
          </div>
        </div>
      </ModalShell>
    </div>
  );
}
