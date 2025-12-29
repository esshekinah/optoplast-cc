'use client';

import { Users, Calendar, Activity, TrendingUp, TrendingDown } from 'lucide-react';

export default function Dashboard() {
  const stats = [
    {
      title: 'Total Patients',
      value: '3,782',
      change: '+11.01%',
      isPositive: true,
      icon: Users,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Appointments',
      value: '5,359',
      change: '-9.05%',
      isPositive: false,
      icon: Calendar,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      title: 'Consultations',
      value: '2,147',
      change: '+5.23%',
      isPositive: true,
      icon: Activity,
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
  ];

  const recentAppointments = [
    { id: 1, patient: 'John Doe', time: '09:00 AM', doctor: 'Dr. Smith', status: 'Confirmed' },
    { id: 2, patient: 'Jane Smith', time: '10:30 AM', doctor: 'Dr. Johnson', status: 'Pending' },
    { id: 3, patient: 'Bob Wilson', time: '02:00 PM', doctor: 'Dr. Brown', status: 'Confirmed' },
    { id: 4, patient: 'Alice Davis', time: '03:30 PM', doctor: 'Dr. Smith', status: 'Confirmed' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleDateString()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                <div className="flex items-center mt-2">
                  {stat.isPositive ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  )}
                  <span
                    className={`text-sm ml-1 ${
                      stat.isPositive ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {stat.change}
                  </span>
                </div>
              </div>
              <div className={`${stat.bgColor} p-3 rounded-lg`}>
                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Appointments
          </h2>
          <div className="space-y-3">
            {recentAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                    {appointment.patient.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{appointment.patient}</p>
                    <p className="text-sm text-gray-500">{appointment.doctor}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{appointment.time}</p>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      appointment.status === 'Confirmed'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {appointment.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <button className="p-4 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-left">
              <Calendar className="w-6 h-6 mb-2" />
              <p className="font-medium">New Appointment</p>
              <p className="text-xs text-blue-500 mt-1">Schedule patient visit</p>
            </button>
            <button className="p-4 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-left">
              <Users className="w-6 h-6 mb-2" />
              <p className="font-medium">Add Patient</p>
              <p className="text-xs text-green-500 mt-1">Register new patient</p>
            </button>
            <button className="p-4 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors text-left">
              <Activity className="w-6 h-6 mb-2" />
              <p className="font-medium">Start Consultation</p>
              <p className="text-xs text-purple-500 mt-1">Begin patient session</p>
            </button>
            <button className="p-4 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors text-left">
              <TrendingUp className="w-6 h-6 mb-2" />
              <p className="font-medium">View Reports</p>
              <p className="text-xs text-orange-500 mt-1">Analytics & insights</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
