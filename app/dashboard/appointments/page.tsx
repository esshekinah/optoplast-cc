'use client';

import { Calendar, Clock, Search, Filter, Plus, Eye, Pencil, Trash2, X } from 'lucide-react';
import { useMemo, useState } from 'react';

type AppointmentStatus = 'Confirmed' | 'Pending' | 'Urgent';
type ModalMode = 'create' | 'edit' | 'view';

type Appointment = {
  id: number;
  patient: string;
  age: number;
  date: string; // yyyy-mm-dd
  time: string; // HH:mm
  doctor: string;
  type: string;
  status: AppointmentStatus;
};

const EMPTY_FORM: Appointment = {
  id: 0,
  patient: '',
  age: 0,
  date: '',
  time: '',
  doctor: '',
  type: '',
  status: 'Pending',
};

export default function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: 1,
      patient: 'John Doe',
      age: 45,
      date: '2024-01-15',
      time: '09:00',
      doctor: 'Dr. Smith',
      type: 'Checkup',
      status: 'Confirmed',
    },
    {
      id: 2,
      patient: 'Jane Smith',
      age: 32,
      date: '2024-01-15',
      time: '10:30',
      doctor: 'Dr. Johnson',
      type: 'Consultation',
      status: 'Pending',
    },
  ]);

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | AppointmentStatus>('all');

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>('create');
  const [form, setForm] = useState<Appointment>({ ...EMPTY_FORM });
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const filteredAppointments = useMemo(() => {
    return appointments.filter((a) => {
      const matchesFilter = filter === 'all' || a.status === filter;
      const matchesSearch =
        a.patient.toLowerCase().includes(search.toLowerCase()) ||
        a.doctor.toLowerCase().includes(search.toLowerCase()) ||
        a.type.toLowerCase().includes(search.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  }, [appointments, search, filter]);

  function openCreate() {
    setForm({ ...EMPTY_FORM });
    setModalMode('create');
    setSelectedId(null);
    setModalOpen(true);
  }

  function openView(id: number) {
    const appt = appointments.find((a) => a.id === id);
    if (!appt) return;
    setForm(appt);
    setSelectedId(id);
    setModalMode('view');
    setModalOpen(true);
  }

  function openEdit(id: number) {
    const appt = appointments.find((a) => a.id === id);
    if (!appt) return;
    setForm(appt);
    setSelectedId(id);
    setModalMode('edit');
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
  }

  function saveAppointment() {
    if (modalMode === 'create') {
      setAppointments((prev) => [
        ...prev,
        { ...form, id: Date.now() },
      ]);
    }

    if (modalMode === 'edit' && selectedId) {
      setAppointments((prev) =>
        prev.map((a) => (a.id === selectedId ? form : a))
      );
    }

    closeModal();
  }

  function deleteAppointment(id: number) {
    if (!confirm('Delete this appointment?')) return;
    setAppointments((prev) => prev.filter((a) => a.id !== id));
  }

  const readOnly = modalMode === 'view';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          New Appointment
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search appointments..."
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-64"
            />
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-200 rounded-lg"
          >
            <option value="all">All Status</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Pending">Pending</option>
            <option value="Urgent">Urgent</option>
          </select>

          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg">
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4">Patient</th>
              <th className="text-left py-3 px-4">Date</th>
              <th className="text-left py-3 px-4">Time</th>
              <th className="text-left py-3 px-4">Doctor</th>
              <th className="text-left py-3 px-4">Type</th>
              <th className="text-left py-3 px-4">Status</th>
              <th className="text-left py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAppointments.map((a) => (
              <tr key={a.id} className="border-b hover:bg-gray-50">
                <td className="py-4 px-4">{a.patient} (Age {a.age})</td>
                <td className="py-4 px-4">{a.date}</td>
                <td className="py-4 px-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  {a.time}
                </td>
                <td className="py-4 px-4">{a.doctor}</td>
                <td className="py-4 px-4">{a.type}</td>
                <td className="py-4 px-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      a.status === 'Confirmed'
                        ? 'bg-green-100 text-green-700'
                        : a.status === 'Pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {a.status}
                  </span>
                </td>
                <td className="py-4 px-4 flex gap-2">
                  <button onClick={() => openView(a.id)} className="text-blue-600">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button onClick={() => openEdit(a.id)} className="text-gray-700">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteAppointment(a.id)} className="text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-xl border">
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h2 className="font-semibold text-lg">
                {modalMode === 'create'
                  ? 'New Appointment'
                  : modalMode === 'edit'
                  ? 'Edit Appointment'
                  : 'View Appointment'}
              </h2>
              <button onClick={closeModal}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <input
                disabled={readOnly}
                value={form.patient}
                onChange={(e) => setForm({ ...form, patient: e.target.value })}
                placeholder="Patient Name"
                className="w-full border rounded-lg px-3 py-2"
              />
              <input
                disabled={readOnly}
                type="number"
                value={form.age}
                onChange={(e) => setForm({ ...form, age: +e.target.value })}
                placeholder="Age"
                className="w-full border rounded-lg px-3 py-2"
              />
              <input
                disabled={readOnly}
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              />
              <input
                disabled={readOnly}
                type="time"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              />
              <input
                disabled={readOnly}
                value={form.doctor}
                onChange={(e) => setForm({ ...form, doctor: e.target.value })}
                placeholder="Doctor"
                className="w-full border rounded-lg px-3 py-2"
              />
              <input
                disabled={readOnly}
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                placeholder="Type"
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

            <div className="px-6 py-4 border-t flex justify-end gap-2">
              <button onClick={closeModal} className="px-4 py-2 border rounded-lg">
                Close
              </button>
              {!readOnly && (
                <button
                  onClick={saveAppointment}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                  Save
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
