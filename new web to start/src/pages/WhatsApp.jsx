import React, { useState } from 'react';
import { useWhatsApp } from '../context/WhatsAppContext';
import { useAuth } from '../context/AuthContext';
import { Send, Users, MessageSquare, FileText, Upload, Search, Plus, X, Check, AlertCircle, Loader2, RefreshCw } from 'lucide-react';

const WhatsApp = () => {
  const { customers, messages, templates, stats, loading, error, fetchCustomers, addCustomer, deleteCustomer, importCustomers, sendMessage, sendBulkMessages, fetchMessages, fetchStats, setError } = useWhatsApp();
  const { canAdd, canDelete } = useAuth();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sendForm, setSendForm] = useState({ phone: '', message: '', customerName: '' });
  const [bulkMessages, setBulkMessages] = useState([]);
  const [importData, setImportData] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const filteredCustomers = customers.filter(c => c.name?.toLowerCase().includes(searchQuery.toLowerCase()) || c.phone?.includes(searchQuery) || c.mobile?.includes(searchQuery));

  const showSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const result = await sendMessage(sendForm.phone, sendForm.message, sendForm.customerName);
    if (result.success) {
      showSuccess('Message sent successfully!');
      setSendForm({ phone: '', message: '', customerName: '' });
    } else {
      setError(result.error);
    }
  };

  const handleSendBulk = async () => {
    if (bulkMessages.length === 0) return;
    const result = await sendBulkMessages(bulkMessages);
    if (result.success) {
      showSuccess(`Sent ${result.results.length} messages!`);
      setBulkMessages([]);
    }
  };

  const addBulkMessage = (customer, template) => {
    const msg = template ? template.message : 'Enter your message';
    setBulkMessages([...bulkMessages, { phone: customer?.phone || customer?.mobile || '', customerName: customer?.name || '', message: msg }]);
  };

  const handleImport = async () => {
    try {
      const lines = importData.trim().split('\n');
      const custData = lines.map(line => {
        const parts = line.split(',').map(p => p.trim());
        return { name: parts[0] || `Customer ${parts[1]?.slice(-4)}`, phone: parts[1] || '', email: parts[2] || '' };
      }).filter(c => c.phone);
      const result = await importCustomers(custData);
      if (result.success) {
        showSuccess(`Imported ${result.results.imported} customers!`);
      }
    } catch (err) {
      setError('Failed to import');
    }
  };

  const formatDate = (date) => new Date(date).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="space-y-6 animate-fadeIn">
      {successMessage && (
        <div className="bg-green-500/20 border border-green-500 text-green-400 px-4 py-3 rounded-lg flex items-center gap-2">
          <Check size={20} /> {successMessage}
        </div>
      )}
      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} /> {error}
          <button onClick={() => setError('')} className="ml-auto"><X size={20} /></button>
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setActiveTab('dashboard')} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${activeTab === 'dashboard' ? 'bg-accent text-white' : 'bg-surface text-text-secondary hover:text-white'}`}>
          <MessageSquare size={18} /> Dashboard
        </button>
        <button onClick={() => setActiveTab('customers')} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${activeTab === 'customers' ? 'bg-accent text-white' : 'bg-surface text-text-secondary hover:text-white'}`}>
          <Users size={18} /> Customers
        </button>
        <button onClick={() => setActiveTab('send')} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${activeTab === 'send' ? 'bg-accent text-white' : 'bg-surface text-text-secondary hover:text-white'}`}>
          <Send size={18} /> Send
        </button>
        <button onClick={() => setActiveTab('bulk')} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${activeTab === 'bulk' ? 'bg-accent text-white' : 'bg-surface text-text-secondary hover:text-white'}`}>
          <Send size={18} /> Bulk
        </button>
        <button onClick={() => setActiveTab('history')} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${activeTab === 'history' ? 'bg-accent text-white' : 'bg-surface text-text-secondary hover:text-white'}`}>
          <FileText size={18} /> History
        </button>
      </div>

      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-surface rounded-xl p-6 border border-white/10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center"><Users className="text-blue-400" size={24} /></div>
                <div><p className="text-text-secondary text-sm">Total Customers</p><p className="text-2xl font-bold text-white">{stats.totalCustomers}</p></div>
              </div>
            </div>
            <div className="bg-surface rounded-xl p-6 border border-white/10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center"><MessageSquare className="text-green-400" size={24} /></div>
                <div><p className="text-text-secondary text-sm">Today</p><p className="text-2xl font-bold text-white">{stats.messagesToday}</p></div>
              </div>
            </div>
            <div className="bg-surface rounded-xl p-6 border border-white/10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center"><Send className="text-purple-400" size={24} /></div>
                <div><p className="text-text-secondary text-sm">This Week</p><p className="text-2xl font-bold text-white">{stats.messagesThisWeek}</p></div>
              </div>
            </div>
            <div className="bg-surface rounded-xl p-6 border border-white/10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center"><FileText className="text-orange-400" size={24} /></div>
                <div><p className="text-text-secondary text-sm">Total Sent</p><p className="text-2xl font-bold text-white">{stats.totalMessages}</p></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'customers' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4 justify-between">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
              <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="input pl-10 w-full" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => { fetchCustomers(); fetchStats(); }} className="btn btn-secondary"><RefreshCw size={18} /></button>
              {canAdd() && <button onClick={() => setShowAddModal(true)} className="btn btn-primary"><Plus size={18} /> Add</button>}
            </div>
          </div>
          <div className="bg-surface rounded-xl border border-white/10 overflow-hidden">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr><th className="text-left p-4 text-text-secondary font-medium">Name</th><th className="text-left p-4 text-text-secondary font-medium">Phone</th><th className="text-left p-4 text-text-secondary font-medium">Actions</th></tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer, idx) => (
                  <tr key={idx} className="border-t border-white/5 hover:bg-white/5">
                    <td className="p-4 text-white">{customer.name}</td>
                    <td className="p-4 text-white">{customer.phone || customer.mobile}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button onClick={() => setSendForm({ phone: customer.phone || customer.mobile, message: '', customerName: customer.name })} className="p-2 hover:bg-accent/20 rounded-lg text-accent"><Send size={16} /></button>
                        {canDelete() && <button onClick={() => { if (confirm('Delete?')) deleteCustomer(customer._id || customer.id); }} className="p-2 hover:bg-red-500/20 rounded-lg text-red-400"><X size={16} /></button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'send' && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-surface rounded-xl border border-white/10 p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Send WhatsApp Message</h2>
            <form onSubmit={handleSendMessage} className="space-y-4">
              <div><label className="block text-sm text-text-secondary mb-2">Phone</label><input type="text" value={sendForm.phone} onChange={(e) => setSendForm({...sendForm, phone: e.target.value})} placeholder="919876543210" className="input w-full" required /></div>
              <div><label className="block text-sm text-text-secondary mb-2">Name</label><input type="text" value={sendForm.customerName} onChange={(e) => setSendForm({...sendForm, customerName: e.target.value})} className="input w-full" /></div>
              <div><label className="block text-sm text-text-secondary mb-2">Message</label><textarea value={sendForm.message} onChange={(e) => setSendForm({...sendForm, message: e.target.value})} rows={6} className="input w-full" required /></div>
              <div className="flex flex-wrap gap-2">
                {templates.slice(0, 4).map(t => (<button key={t.id} type="button" onClick={() => setSendForm({...sendForm, message: t.message})} className="px-3 py-1 bg-white/10 rounded-lg text-sm text-text-secondary hover:text-white">{t.name}</button>))}
              </div>
              <button type="submit" disabled={loading} className="btn btn-primary w-full">{loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />} Send</button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'bulk' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">Bulk Messages ({bulkMessages.length})</h2>
            <div className="flex gap-2">
              <button onClick={() => { const t = templates[0]; customers.slice(0, 5).forEach(c => addBulkMessage(c, t)); }} className="btn btn-secondary" disabled={customers.length === 0}>Add All</button>
              <button onClick={handleSendBulk} disabled={loading || bulkMessages.length === 0} className="btn btn-primary">{loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />} Send All</button>
            </div>
          </div>
          {customers.length > 0 && (
            <div className="bg-surface rounded-xl border border-white/10 p-4">
              <p className="text-text-secondary text-sm mb-3">Add from customers:</p>
              <div className="flex flex-wrap gap-2">
                {customers.slice(0, 10).map(c => (<button key={c._id || c.id} onClick={() => addBulkMessage(c)} className="px-3 py-1 bg-white/10 rounded-lg text-sm text-text-secondary hover:text-white">+ {c.name}</button>))}
              </div>
            </div>
          )}
          <div className="space-y-2">
            {bulkMessages.map((msg, idx) => (
              <div key={idx} className="bg-surface rounded-xl border border-white/10 p-4 flex items-start gap-4">
                <div className="flex-1"><p className="text-white font-medium">{msg.customerName}</p><p className="text-text-secondary text-sm">{msg.phone}</p><p className="text-text-secondary mt-2">{msg.message}</p></div>
                <button onClick={() => setBulkMessages(bulkMessages.filter((_, i) => i !== idx))} className="p-2 hover:bg-red-500/20 rounded-lg text-red-400"><X size={18} /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">Message History</h2>
            <button onClick={() => fetchMessages()} className="btn btn-secondary"><RefreshCw size={18} /></button>
          </div>
          <div className="bg-surface rounded-xl border border-white/10 overflow-hidden">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr><th className="text-left p-4 text-text-secondary font-medium">Type</th><th className="text-left p-4 text-text-secondary font-medium">Phone</th><th className="text-left p-4 text-text-secondary font-medium">Message</th><th className="text-left p-4 text-text-secondary font-medium">Time</th></tr>
              </thead>
              <tbody>
                {messages.map((msg, idx) => (
                  <tr key={idx} className="border-t border-white/5 hover:bg-white/5">
                    <td className="p-4"><span className={`px-2 py-1 rounded text-xs ${msg.type === 'sent' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>{msg.type}</span></td>
                    <td className="p-4 text-white">{msg.customerPhone}</td>
                    <td className="p-4 text-text-secondary max-w-xs truncate">{msg.message}</td>
                    <td className="p-4 text-text-secondary text-sm">{formatDate(msg.timestamp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showAddModal && (
        <AddCustomerModal onClose={() => setShowAddModal(false)} onAdd={async (data) => { const r = await addCustomer(data); if (r.success) { showSuccess('Added!'); setShowAddModal(false); } }} />
      )}

      {showImportModal && (
        <ImportModal onClose={() => setShowImportModal(false)} importData={importData} setImportData={setImportData} handleImport={handleImport} />
      )}
    </div>
  );
};

const AddCustomerModal = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', company: '' });
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e) => { e.preventDefault(); setLoading(true); await onAdd(formData); setLoading(false); };
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-2xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-semibold text-white">Add Customer</h2><button onClick={onClose}><X size={20} /></button></div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm text-text-secondary mb-2">Name</label><input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="input w-full" required /></div>
          <div><label className="block text-sm text-text-secondary mb-2">Phone</label><input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="input w-full" required /></div>
          <div><label className="block text-sm text-text-secondary mb-2">Email</label><input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="input w-full" /></div>
          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn btn-primary flex-1">{loading ? <Loader2 className="animate-spin" size={18} /> : 'Add'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ImportModal = ({ onClose, importData, setImportData, handleImport }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-2xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-semibold text-white">Import</h2><button onClick={onClose}><X size={20} /></button></div>
        <div className="space-y-4">
          <div><label className="block text-sm text-text-secondary mb-2">CSV: name,phone,email</label><textarea value={importData} onChange={(e) => setImportData(e.target.value)} placeholder="John,919876543210,john@email.com" className="input w-full" rows={6} /></div>
          <button onClick={handleImport} className="btn btn-primary w-full"><Upload size={18} /> Import</button>
        </div>
      </div>
    </div>
  );
};

export default WhatsApp;

