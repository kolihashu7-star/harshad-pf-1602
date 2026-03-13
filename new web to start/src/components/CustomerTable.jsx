import React from 'react';
import { Eye, Edit, Trash2, FileText, MessageSquare } from 'lucide-react';
import { formatCurrency, formatDate, calculateAge } from '../utils/helpers';

const CustomerTable = ({ customers, onView, onEdit, onDelete, onGenerateReport, onWhatsApp, canDelete = true }) => {
  const getStatusBadge = (status) => {
    const statusClasses = {
      'Settled': 'badge-success',
      'Pending': 'badge-warning',
      'Not Settled': 'badge-error',
      'Verified': 'badge-success',
      'Not Verified': 'badge-error'
    };
    return statusClasses[status] || 'badge-info';
  };

  return (
    <div className="overflow-x-auto">
      <table className="table">
        <thead>
          <tr>
            <th>Customer ID</th>
            <th>Name</th>
            <th>Mobile</th>
            <th>UAN</th>
            <th>Company</th>
            <th>Balance</th>
            <th>Service Years</th>
            <th>Form 19</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr key={customer.id} className="animate-fadeIn">
              <td>
                <span className="font-medium text-accent">{customer.id}</span>
              </td>
              <td>
                <div>
                  <p className="font-medium text-white">{customer.name}</p>
                  <p className="text-xs text-text-secondary">{customer.fatherName}</p>
                </div>
              </td>
              <td className="text-text-secondary">{customer.mobile}</td>
              <td className="text-text-secondary font-mono text-sm">{customer.uan}</td>
              <td className="text-text-secondary">{customer.companyName}</td>
              <td>
                <span className="font-medium text-success">
                  {formatCurrency(customer.passbookBalance)}
                </span>
              </td>
              <td>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-accent to-success"
                      style={{ width: `${Math.min(customer.serviceYears * 6.67, 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-text-secondary">{customer.serviceYears} yrs</span>
                </div>
              </td>
              <td>
                <span className={`badge ${getStatusBadge(customer.form19Status)}`}>
                  {customer.form19Status}
                </span>
              </td>
              <td>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onView(customer)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors tooltip"
                    data-tooltip="View Details"
                  >
                    <Eye size={16} className="text-text-secondary" />
                  </button>
                  <button
                    onClick={() => onGenerateReport(customer)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors tooltip"
                    data-tooltip="Generate PDF"
                  >
                    <FileText size={16} className="text-text-secondary" />
                  </button>
                  <button
                    onClick={() => onWhatsApp(customer)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors tooltip"
                    data-tooltip="Send WhatsApp"
                  >
                    <MessageSquare size={16} className="text-text-secondary" />
                  </button>
                  <button
                    onClick={() => onEdit(customer)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors tooltip"
                    data-tooltip="Edit"
                  >
                    <Edit size={16} className="text-text-secondary" />
                  </button>
                  {canDelete && (
                    <button
                      onClick={() => onDelete(customer.id)}
                      className="p-2 rounded-lg hover:bg-error/20 transition-colors tooltip"
                      data-tooltip="Delete"
                    >
                      <Trash2 size={16} className="text-error" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {customers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-text-secondary">No customers found</p>
        </div>
      )}
    </div>
  );
};

export default CustomerTable;

