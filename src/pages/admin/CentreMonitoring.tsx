import React, { useState } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  Building2,
  PlusCircle,
  Edit,
  Save,
  X,
  MapPin,
  Clock,
  Gauge,
  CheckCircle,
  AlertTriangle,
  Phone
} from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { CentreStatus, ProcurementCentre } from '../../types';

export const CentreMonitoring: React.FC = () => {
  const { centres, updateCentreCapacity, updateCentre, addCentre } = useAppState();
  const { t } = useLanguage();

  const [editingCentreId, setEditingCentreId] = useState<string | null>(null);
  const [editCapacityValue, setEditCapacityValue] = useState<number>(600);
  const [editStatusValue, setEditStatusValue] = useState<CentreStatus>('NORMAL');

  // Full Centre Edit Modal State
  const [editingCentreFull, setEditingCentreFull] = useState<ProcurementCentre | null>(null);

  // Add Centre Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCentreData, setNewCentreData] = useState({
    code: 'KMC-06',
    name: 'Khurda Regulated Mandi Complex',
    district: 'Khordha',
    block: 'Begunia',
    address: 'State Highway 1, Begunia Agro Market, Khordha',
    latitude: 20.2100,
    longitude: 85.4500,
    dailyCapacity: 500,
    avgProcessingTimeMinutes: 7,
    operatingHours: '08:00 AM - 06:00 PM',
    status: 'NORMAL' as CentreStatus,
    officerInCharge: 'Ashok Kumar Sethi (Mandi Inspector)',
    contactNumber: '+91 94375 22334'
  });

  const handleStartEdit = (centre: ProcurementCentre) => {
    setEditingCentreId(centre.id);
    setEditCapacityValue(centre.dailyCapacity);
    setEditStatusValue(centre.status);
  };

  const handleSaveEdit = (centreId: string) => {
    updateCentreCapacity(centreId, editCapacityValue, editStatusValue);
    setEditingCentreId(null);
  };

  const handleOpenFullEdit = (centre: ProcurementCentre) => {
    setEditingCentreFull({ ...centre });
  };

  const handleSaveFullEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCentreFull) return;
    updateCentre(editingCentreFull.id, {
      name: editingCentreFull.name,
      code: editingCentreFull.code,
      district: editingCentreFull.district,
      block: editingCentreFull.block,
      address: editingCentreFull.address,
      dailyCapacity: Number(editingCentreFull.dailyCapacity),
      avgProcessingTimeMinutes: Number(editingCentreFull.avgProcessingTimeMinutes),
      operatingHours: editingCentreFull.operatingHours,
      status: editingCentreFull.status,
      officerInCharge: editingCentreFull.officerInCharge,
      contactNumber: editingCentreFull.contactNumber
    });
    setEditingCentreFull(null);
  };

  const handleAddCentreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addCentre(newCentreData);
    setIsAddModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Procurement Centre Capacity & Yard Control
          </h1>
          <p className="text-sm text-slate-500">
            Real-time workload monitoring, intake quota scaling, and operational status management.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 text-xs cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Procurement Mandi</span>
        </button>
      </div>

      {/* Grid of Centre Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {centres.map((c) => {
          const isEditing = editingCentreId === c.id;
          const util = Math.round((c.currentLoad / c.dailyCapacity) * 100);

          return (
            <div
              key={c.id}
              className={`bg-white rounded-3xl border p-6 shadow-xs transition-all flex flex-col justify-between ${
                c.status === 'FULL'
                  ? 'border-rose-300 ring-2 ring-rose-100'
                  : c.status === 'NEAR CAPACITY'
                  ? 'border-orange-300 ring-2 ring-orange-100'
                  : 'border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      {c.code}
                    </span>
                    <h3 className="font-bold text-slate-900 text-base mt-1 leading-snug">
                      {c.name}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{c.district} ({c.block})</span>
                    </p>
                  </div>

                  <StatusBadge status={c.status} size="sm" />
                </div>

                {/* Metrics */}
                <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-100 my-4 space-y-2.5 text-xs">
                  <div>
                    <div className="flex justify-between items-center text-slate-600 mb-1">
                      <span>Daily Intake Load:</span>
                      <strong className="text-slate-900">{c.currentLoad} / {c.dailyCapacity} Qtl ({util}%)</strong>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${util >= 90 ? 'bg-rose-500' : util >= 75 ? 'bg-amber-500' : 'bg-emerald-600'}`}
                        style={{ width: `${Math.min(100, util)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex justify-between py-1 border-t border-slate-200/60">
                    <span className="text-slate-500">Live Yard Queue:</span>
                    <strong className="text-amber-800 font-bold">{c.queueLength} Farmers</strong>
                  </div>

                  <div className="flex justify-between py-1 border-t border-slate-200/60">
                    <span className="text-slate-500">Avg Weigh Time:</span>
                    <strong className="text-slate-800">{c.avgProcessingTimeMinutes} mins / vehicle</strong>
                  </div>

                  <div className="flex justify-between py-1 border-t border-slate-200/60">
                    <span className="text-slate-500">Superintendent:</span>
                    <strong className="text-slate-800 truncate max-w-[160px]">{c.officerInCharge.split(' ')[0]} {c.officerInCharge.split(' ')[1]}</strong>
                  </div>
                </div>

                {/* Edit inline form */}
                {isEditing && (
                  <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-300 space-y-3 mb-3 text-xs animate-in fade-in">
                    <div>
                      <label className="font-bold text-emerald-950 block mb-1">Modify Daily Capacity (Qtl)</label>
                      <input
                        type="number"
                        min="100"
                        max="3000"
                        value={editCapacityValue}
                        onChange={(e) => setEditCapacityValue(parseInt(e.target.value) || 0)}
                        className="w-full bg-white border border-emerald-400 rounded-xl px-3 py-1.5 font-bold"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-emerald-950 block mb-1">Operational Status</label>
                      <select
                        value={editStatusValue}
                        onChange={(e) => setEditStatusValue(e.target.value as CentreStatus)}
                        className="w-full bg-white border border-emerald-400 rounded-xl px-3 py-1.5 font-bold"
                      >
                        <option value="NORMAL">NORMAL</option>
                        <option value="BUSY">BUSY</option>
                        <option value="NEAR CAPACITY">NEAR CAPACITY</option>
                        <option value="FULL">FULL</option>
                        <option value="CLOSED">CLOSED</option>
                      </select>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleSaveEdit(c.id)}
                        className="flex-1 bg-emerald-700 text-white font-bold py-1.5 rounded-lg flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save</span>
                      </button>
                      <button
                        onClick={() => setEditingCentreId(null)}
                        className="bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-lg cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {!isEditing && (
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleStartEdit(c)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2 px-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Gauge className="w-3.5 h-3.5 text-slate-600" />
                    <span>Quick Status</span>
                  </button>
                  <button
                    onClick={() => handleOpenFullEdit(c)}
                    className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold py-2 px-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Edit Centre</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add New Centre Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 space-y-4 animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h2 className="text-lg font-black text-slate-900">Add New Procurement Mandi Hub</h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCentreSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Mandi Code</label>
                  <input
                    type="text"
                    required
                    value={newCentreData.code}
                    onChange={(e) => setNewCentreData({ ...newCentreData, code: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Daily Max Capacity (Qtl)</label>
                  <input
                    type="number"
                    required
                    min="100"
                    max="5000"
                    value={newCentreData.dailyCapacity}
                    onChange={(e) => setNewCentreData({ ...newCentreData, dailyCapacity: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Mandi Name</label>
                <input
                  type="text"
                  required
                  value={newCentreData.name}
                  onChange={(e) => setNewCentreData({ ...newCentreData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">District</label>
                  <input
                    type="text"
                    required
                    value={newCentreData.district}
                    onChange={(e) => setNewCentreData({ ...newCentreData, district: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Block</label>
                  <input
                    type="text"
                    required
                    value={newCentreData.block}
                    onChange={(e) => setNewCentreData({ ...newCentreData, block: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Address / Coordinates</label>
                <input
                  type="text"
                  required
                  value={newCentreData.address}
                  onChange={(e) => setNewCentreData({ ...newCentreData, address: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Officer In Charge</label>
                  <input
                    type="text"
                    required
                    value={newCentreData.officerInCharge}
                    onChange={(e) => setNewCentreData({ ...newCentreData, officerInCharge: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Contact Phone</label>
                  <input
                    type="text"
                    required
                    value={newCentreData.contactNumber}
                    onChange={(e) => setNewCentreData({ ...newCentreData, contactNumber: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono font-medium"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 px-4 rounded-xl text-sm shadow-md cursor-pointer"
                >
                  Create & Activate Mandi Node
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2.5 px-4 rounded-xl text-sm cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Centre Details Modal */}
      {editingCentreFull && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 space-y-4 animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-700" />
                <h3 className="font-bold text-lg text-slate-900">Edit Procurement Centre</h3>
              </div>
              <button
                onClick={() => setEditingCentreFull(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFullEdit} className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Mandi Code</label>
                  <input
                    type="text"
                    required
                    value={editingCentreFull.code}
                    onChange={(e) => setEditingCentreFull({ ...editingCentreFull, code: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold uppercase"
                  />
                </div>
                <div className="col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Centre Name</label>
                  <input
                    type="text"
                    required
                    value={editingCentreFull.name}
                    onChange={(e) => setEditingCentreFull({ ...editingCentreFull, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">District</label>
                  <input
                    type="text"
                    required
                    value={editingCentreFull.district}
                    onChange={(e) => setEditingCentreFull({ ...editingCentreFull, district: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Block / Taluk</label>
                  <input
                    type="text"
                    required
                    value={editingCentreFull.block}
                    onChange={(e) => setEditingCentreFull({ ...editingCentreFull, block: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Address / Landmark</label>
                <input
                  type="text"
                  required
                  value={editingCentreFull.address}
                  onChange={(e) => setEditingCentreFull({ ...editingCentreFull, address: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Daily Cap (Qtl)</label>
                  <input
                    type="number"
                    required
                    min={50}
                    value={editingCentreFull.dailyCapacity}
                    onChange={(e) => setEditingCentreFull({ ...editingCentreFull, dailyCapacity: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Proc. Time (Min)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={editingCentreFull.avgProcessingTimeMinutes}
                    onChange={(e) => setEditingCentreFull({ ...editingCentreFull, avgProcessingTimeMinutes: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Operating Status</label>
                  <select
                    value={editingCentreFull.status}
                    onChange={(e) => setEditingCentreFull({ ...editingCentreFull, status: e.target.value as CentreStatus })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold"
                  >
                    <option value="NORMAL">NORMAL</option>
                    <option value="BUSY">BUSY</option>
                    <option value="NEAR CAPACITY">NEAR CAPACITY</option>
                    <option value="FULL">FULL</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Operating Hours</label>
                <input
                  type="text"
                  required
                  value={editingCentreFull.operatingHours}
                  onChange={(e) => setEditingCentreFull({ ...editingCentreFull, operatingHours: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Officer In Charge</label>
                  <input
                    type="text"
                    required
                    value={editingCentreFull.officerInCharge}
                    onChange={(e) => setEditingCentreFull({ ...editingCentreFull, officerInCharge: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Contact Phone</label>
                  <input
                    type="text"
                    required
                    value={editingCentreFull.contactNumber}
                    onChange={(e) => setEditingCentreFull({ ...editingCentreFull, contactNumber: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono font-medium"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 px-4 rounded-xl text-sm shadow-md cursor-pointer"
                >
                  Save Centre Updates
                </button>
                <button
                  type="button"
                  onClick={() => setEditingCentreFull(null)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2.5 px-4 rounded-xl text-sm cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
