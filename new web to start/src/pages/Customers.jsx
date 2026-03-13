import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import CustomerTable from '../components/CustomerTable';
import { generatePDFReport } from '../utils/pdfGenerator';
import { formatCurrency } from '../utils/helpers';
import { Plus, Search, Filter, X, UserPlus, Pencil } from 'lucide-react';

const Customers = () => {
  const { customers, searchQuery, setSearchQuery, adminRules, addCustomer, updateCustomer, deleteCustomer, addWhatsappMessage } = useApp();
  const { canAdd, canDelete, user } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const handleEdit = (customer) => {
    setSelectedCustomer(customer);
    setShowEditModal(true);
  };

  const filteredCustomers = useMemo(() => {
    let result = customers;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(c =>
        c.name.toLowerCase().includes(query) ||
        c.mobile.includes(searchQuery) ||
        c.uan.includes(searchQuery) ||
        c.id.toLowerCase().includes(query)
      );
    }
    if (filterStatus !== 'all') {
      result = result.filter(c => {
        if (filterStatus === 'settled') return c.form19Status === 'Settled';
        if (filterStatus === 'pending') return c.form19Status === 'Pending';
        if (filterStatus === 'working') return !c.doe;
        return true;
      });
    }
    return result;
  }, [customers, searchQuery, filterStatus]);

  const handleGenerateReport = async (customer) => {
    await generatePDFReport(customer, adminRules);
  };

  const handleWhatsApp = (customer) => {
    const message = adminRules.messageTemplates.english.welcome.replace('{balance}', formatCurrency(customer.passbookBalance));
    addWhatsappMessage({ customerId: customer.id, customerName: customer.name, mobile: customer.mobile, message, type: 'welcome' });
    alert('WhatsApp message prepared for ' + customer.name);
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this customer?')) {
      deleteCustomer(id);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
            <input type="text" placeholder="Search by Name, Mobile, UAN, ID..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="input pl-10 pr-4 py-2 w-80" />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-text-secondary" />
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input py-2">
              <option value="all">All Status</option>
              <option value="working">Currently Working</option>
              <option value="settled">Form 19 Settled</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          {(canAdd() || user?.role === 'staff') && (
            <button onClick={() => setShowAddModal(true)} className="btn btn-primary flex items-center gap-2">
              <Plus size={18} /> Add Customer
            </button>
          )}
        </div>
      </div>
      <p className="text-text-secondary text-sm">Showing {filteredCustomers.length} of {customers.length} customers</p>
      <div className="card">
        <CustomerTable customers={filteredCustomers} onView={setSelectedCustomer} onEdit={handleEdit} onDelete={handleDelete} onGenerateReport={handleGenerateReport} onWhatsApp={handleWhatsApp} canDelete={canDelete()} />
      </div>
      {showEditModal && selectedCustomer && <EditCustomerModal customer={selectedCustomer} onClose={() => { setShowEditModal(false); setSelectedCustomer(null); }} onEdit={updateCustomer} />}
      {showAddModal && <AddCustomerModal onClose={() => setShowAddModal(false)} onAdd={addCustomer} existingCustomers={customers} />}
      {selectedCustomer && <CustomerDetailModal customer={selectedCustomer} onClose={() => setSelectedCustomer(null)} onGenerateReport={handleGenerateReport} />}
    </div>
  );
};

const AddCustomerModal = ({ onClose, onAdd, existingCustomers }) => {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    uan: '',
    fatherName: '',
    dob: '',
    doj: '',
    doe: '',
    companyName: '',
    passbookBalance: 1,
    panLinked: false,
    bankVerified: false,
    kycComplete: false,
    form19Status: 'Not Settled',
    form10CStatus: 'Not Settled',
    // KYC Details
    bankAccountNumber: '',
    ifscCode: '',
    panCard: ''
  });
  const [memberIds, setMemberIds] = useState([{ id: '', company: '' }]);

  const addMemberId = () => setMemberIds([...memberIds, { id: '', company: '' }]);
  const removeMemberId = (index) => setMemberIds(memberIds.filter((_, i) => i !== index));
  const updateMemberId = (index, field, value) => {
    const updated = [...memberIds];
    updated[index][field] = value;
    setMemberIds(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validMemberIds = memberIds.filter(m => m.id.trim() !== '');
    const existingCustomer = existingCustomers?.find(c => c.uan === formData.uan || c.mobile === formData.mobile);

    if (existingCustomer) {
      const existingMemberIds = existingCustomer.memberIds || [];
      const newMemberIds = [...new Set([...existingMemberIds, ...validMemberIds.map(m => m.id)])];
      const mergedCustomer = {
        ...existingCustomer,
        name: formData.name || existingCustomer.name,
        mobile: formData.mobile || existingCustomer.mobile,
        uan: formData.uan || existingCustomer.uan,
        fatherName: formData.fatherName || existingCustomer.fatherName,
        dob: formData.dob || existingCustomer.dob,
        doj: formData.doj || existingCustomer.doj,
        companyName: formData.companyName || existingCustomer.companyName,
        passbookBalance: formData.passbookBalance || existingCustomer.passbookBalance,
        memberIds: newMemberIds,
        serviceYears: formData.doj ? Math.floor((new Date() - new Date(formData.doj)) / (1000 * 60 * 60 * 24 * 365)) : existingCustomer.serviceYears,
        age: formData.dob ? Math.floor((new Date() - new Date(formData.dob)) / (1000 * 60 * 60 * 24 * 365.25)) : existingCustomer.age,
        bankAccountNumber: formData.bankAccountNumber || existingCustomer.bankAccountNumber,
        ifscCode: formData.ifscCode || existingCustomer.ifscCode,
        panCard: formData.panCard || existingCustomer.panCard,
        panLinked: formData.panLinked,
        bankVerified: formData.bankVerified,
        kycComplete: formData.kycComplete,
      };
      if (confirm('Customer already exists! Merge data?')) {
        onAdd(mergedCustomer);
        onClose();
      }
      return;
    }

    const newCustomer = {
      ...formData,
      serviceYears: formData.doj ? Math.floor((new Date() - new Date(formData.doj)) / (1000 * 60 * 60 * 24 * 365)) : 0,
      memberIds: validMemberIds.map(m => m.id),
      transfers: [],
      pensionEligible: false,
      age: formData.dob ? Math.floor((new Date() - new Date(formData.dob)) / (1000 * 60 * 60 * 24 * 365.25)) : 0,
      epsDeducted: true,
      contributions: [],
      bankAccountNumber: formData.bankAccountNumber,
      ifscCode: formData.ifscCode,
      panCard: formData.panCard,
    };
    onAdd(newCustomer);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-surface rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="font-heading font-semibold text-xl text-white flex items-center gap-2">
            <UserPlus size={24} className="text-accent" />
            Add New Customer
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
            <X size={20} className="text-text-secondary" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-text-secondary mb-1">Full Name *</label>
              <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input w-full" placeholder="Enter full name" />
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">Mobile *</label>
              <input type="text" required value={formData.mobile} onChange={(e) => setFormData({ ...formData, mobile: e.target.value })} className="input w-full" placeholder="10-digit mobile" maxLength={10} />
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">UAN *</label>
              <input type="text" required value={formData.uan} onChange={(e) => setFormData({ ...formData, uan: e.target.value })} className="input w-full" placeholder="12-digit UAN" maxLength={12} />
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">Father Name</label>
              <input type="text" value={formData.fatherName} onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })} className="input w-full" />
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">Date of Birth</label>
              <input type="date" value={formData.dob} onChange={(e) => setFormData({ ...formData, dob: e.target.value })} className="input w-full" />
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">Date of Joining</label>
              <input type="date" value={formData.doj} onChange={(e) => setFormData({ ...formData, doj: e.target.value })} className="input w-full" />
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">Date of Exit</label>
              <input type="date" value={formData.doe} onChange={(e) => setFormData({ ...formData, doe: e.target.value })} className="input w-full" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm text-text-secondary mb-1">Company Name</label>
              <input type="text" value={formData.companyName} onChange={(e) => setFormData({ ...formData, companyName: e.target.value })} className="input w-full" />
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">Passbook Balance</label>
              <input type="number" value={formData.passbookBalance} onChange={(e) => setFormData({ ...formData, passbookBalance: parseInt(e.target.value) || 0 })} className="input w-full" />
            </div>
          </div>

          <div className="border-t border-white/10 pt-4 mt-4">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm text-text-secondary">Member IDs (Unlimited)</label>
              <button type="button" onClick={addMemberId} className="text-accent text-sm flex items-center gap-1 hover:underline">
                <Plus size={16} /> Add More
              </button>
            </div>
            <div className="space-y-2">
              {memberIds.map((member, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <input type="text" value={member.id} onChange={(e) => updateMemberId(index, 'id', e.target.value)} className="input flex-1" placeholder="Member ID (e.g., MH/123456)" />
                  <input type="text" value={member.company} onChange={(e) => updateMemberId(index, 'company', e.target.value)} className="input flex-1" placeholder="Company Name" />
                  {memberIds.length > 1 && (
                    <button type="button" onClick={() => removeMemberId(index)} className="p-2 text-error hover:bg-error/20 rounded-lg">
                      <X size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <p className="text-text-secondary text-xs mt-2">Add multiple Member IDs. If UAN/Mobile exists, data will be merged.</p>
          </div>

          {/* KYC Section */}
          <div className="border-t border-white/10 pt-4 mt-4">
            <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
              <span className="text-accent">*</span> KYC Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-text-secondary mb-1">Bank Account Number</label>
                <input type="text" value={formData.bankAccountNumber} onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })} className="input w-full" placeholder="Enter bank account number" />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">IFSC Code</label>
                <input type="text" value={formData.ifscCode} onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value })} className="input w-full" placeholder="Enter IFSC code" />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">PAN Card Number</label>
                <input type="text" value={formData.panCard} onChange={(e) => setFormData({ ...formData, panCard: e.target.value })} className="input w-full" placeholder="Enter PAN card number" maxLength={10} />
              </div>
              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={formData.panLinked} onChange={(e) => setFormData({ ...formData, panLinked: e.target.checked })} className="w-4 h-4" />
                  <span className="text-sm text-white">PAN Card Linked</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={formData.bankVerified} onChange={(e) => setFormData({ ...formData, bankVerified: e.target.checked })} className="w-4 h-4" />
                  <span className="text-sm text-white">Bank Verified</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={formData.kycComplete} onChange={(e) => setFormData({ ...formData, kycComplete: e.target.checked })} className="w-4 h-4" />
                  <span className="text-sm text-white">KYC Complete</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn btn-primary flex-1">Add Customer</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CustomerDetailModal = ({ customer, onClose, onGenerateReport }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-surface rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto m-4">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div>
            <h2 className="font-heading font-semibold text-xl text-white">{customer.name}</h2>
            <p className="text-text-secondary text-sm">{customer.id}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
            <X size={20} className="text-text-secondary" />
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <h3 className="font-semibold text-white mb-3">Personal Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div><p className="text-text-secondary text-xs">Mobile</p><p className="text-white">{customer.mobile}</p></div>
              <div><p className="text-text-secondary text-xs">UAN</p><p className="text-white font-mono">{customer.uan}</p></div>
              <div><p className="text-text-secondary text-xs">Father Name</p><p className="text-white">{customer.fatherName}</p></div>
              <div><p className="text-text-secondary text-xs">Date of Birth</p><p className="text-white">{customer.dob}</p></div>
              <div><p className="text-text-secondary text-xs">Age</p><p className="text-white">{customer.age} years</p></div>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-3">Employment Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div><p className="text-text-secondary text-xs">Company</p><p className="text-white">{customer.companyName}</p></div>
              <div><p className="text-text-secondary text-xs">Date of Joining</p><p className="text-white">{customer.doj}</p></div>
              <div><p className="text-text-secondary text-xs">Date of Exit</p><p className="text-white">{customer.doe || 'Working'}</p></div>
              <div><p className="text-text-secondary text-xs">Service Years</p><p className="text-white">{customer.serviceYears} years</p></div>
              <div><p className="text-text-secondary text-xs">Passbook Balance</p><p className="text-success font-semibold">{formatCurrency(customer.passbookBalance)}</p></div>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-3">PF Status</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-background p-3 rounded-xl"><p className="text-text-secondary text-xs">Form 19</p><p className={"font-semibold " + (customer.form19Status === 'Settled' ? 'text-success' : 'text-warning')}>{customer.form19Status}</p></div>
              <div className="bg-background p-3 rounded-xl"><p className="text-text-secondary text-xs">Form 10C</p><p className={"font-semibold " + (customer.form10CStatus === 'Settled' ? 'text-success' : 'text-warning')}>{customer.form10CStatus}</p></div>
              <div className="bg-background p-3 rounded-xl"><p className="text-text-secondary text-xs">Bank KYC</p><p className={"font-semibold " + (customer.bankVerified ? 'text-success' : 'text-error')}>{customer.bankVerified ? 'Verified' : 'Not Verified'}</p></div>
              <div className="bg-background p-3 rounded-xl"><p className="text-text-secondary text-xs">PAN Linked</p><p className={"font-semibold " + (customer.panLinked ? 'text-success' : 'text-error')}>{customer.panLinked ? 'Linked' : 'Not Linked'}</p></div>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-3">Member IDs ({customer.memberIds ? customer.memberIds.length : 0})</h3>
            <div className="flex flex-wrap gap-2">
              {customer.memberIds ? customer.memberIds.map(id => (<span key={id} className="badge badge-info">{id}</span>)) : null}
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-white/10 flex gap-4">
          <button onClick={onClose} className="btn btn-secondary flex-1">Close</button>
          <button onClick={() => { onGenerateReport(customer); onClose(); }} className="btn btn-primary flex-1">Generate PDF Report</button>
        </div>
      </div>
    </div>
  );
};

const EditCustomerModal = ({ customer, onClose, onEdit }) => {
  const [formData, setFormData] = useState({
    name: customer.name,
    mobile: customer.mobile,
    uan: customer.uan,
    memberId: customer.memberId,
    fatherName: customer.fatherName || '',
    dob: customer.dob || '',
    doj: customer.doj || '',
    doe: customer.doe || '',
    companyName: customer.companyName || '',
    passbookBalance: customer.passbookBalance || 0,
    form19Status: customer.form19Status || 'Not Settled',
    form10CStatus: customer.form10CStatus || 'Not Settled'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedCustomer = {
      ...formData,
      serviceYears: formData.doj ? Math.floor((new Date() - new Date(formData.doj)) / (1000 * 60 * 60 * 24 * 365)) : 0,
      age: formData.dob ? Math.floor((new Date() - new Date(formData.dob)) / (1000 * 60 * 60 * 24 * 365.25)) : 0,
    };
    onEdit(customer.id, updatedCustomer);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-surface rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="font-heading font-semibold text-xl text-white flex items-center gap-2">
            <Pencil size={24} className="text-warning" />
            Edit Customer
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
            <X size={20} className="text-text-secondary" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-text-secondary mb-1">Full Name *</label>
              <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="input w-full" />
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">Mobile *</label>
              <input type="text" required value={formData.mobile} onChange={(e) => setFormData({...formData, mobile: e.target.value})} className="input w-full" maxLength={10} />
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">UAN *</label>
              <input type="text" required value={formData.uan} onChange={(e) => setFormData({...formData, uan: e.target.value})} className="input w-full" maxLength={12} />
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">Member ID *</label>
              <input type="text" required value={formData.memberId} onChange={(e) => setFormData({...formData, memberId: e.target.value})} className="input w-full" />
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">Father Name</label>
              <input type="text" value={formData.fatherName} onChange={(e) => setFormData({...formData, fatherName: e.target.value})} className="input w-full" />
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">Date of Birth</label>
              <input type="date" value={formData.dob} onChange={(e) => setFormData({...formData, dob: e.target.value})} className="input w-full" />
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">Date of Joining</label>
              <input type="date" value={formData.doj} onChange={(e) => setFormData({...formData, doj: e.target.value})} className="input w-full" />
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">Date of Exit</label>
              <input type="date" value={formData.doe} onChange={(e) => setFormData({...formData, doe: e.target.value})} className="input w-full" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm text-text-secondary mb-1">Company Name</label>
              <input type="text" value={formData.companyName} onChange={(e) => setFormData({...formData, companyName: e.target.value})} className="input w-full" />
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">Passbook Balance</label>
              <input type="number" value={formData.passbookBalance} onChange={(e) => setFormData({...formData, passbookBalance: parseInt(e.target.value) || 0})} className="input w-full" />
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">Form 19 Status</label>
              <select value={formData.form19Status} onChange={(e) => setFormData({...formData, form19Status: e.target.value})} className="input w-full">
                <option value="Not Settled">Not Settled</option>
                <option value="Pending">Pending</option>
                <option value="Settled">Settled</option>
              </select>
            </div>
          </div>
          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn btn-primary flex-1">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Customers;

