import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { generatePDFReport } from '../utils/pdfGenerator';
import { formatCurrency, calculateHealthScore, getEmployerRating, checkTDSApplicability } from '../utils/helpers';
import { FileText, Download, Eye, Calendar, User, Building, Shield, Activity } from 'lucide-react';

const Reports = () => {
  const { customers, adminRules } = useApp();
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [generating, setGenerating] = useState(false);

  const handleGeneratePDF = async (customer) => {
    setGenerating(true);
    await generatePDFReport(customer, adminRules);
    setGenerating(false);
  };

  const handlePreview = (customer) => {
    setSelectedCustomer(customer);
    setPreviewMode(true);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h2 className="font-heading font-semibold text-xl text-white">Smart PDF Reports</h2>
        <p className="text-text-secondary text-sm mt-1">
          Generate comprehensive PF audit reports with service timeline, health score, and alerts
        </p>
      </div>

      <div className="card">
        <h3 className="font-semibold text-white mb-4">Select Customer</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {customers.map(customer => (
            <div
              key={customer.id}
              className="bg-background p-4 rounded-xl hover:bg-secondary/50 transition-colors cursor-pointer"
              onClick={() => handlePreview(customer)}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-medium text-white">{customer.name}</p>
                  <p className="text-text-secondary text-sm">{customer.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-success font-semibold">{formatCurrency(customer.passbookBalance)}</p>
                  <p className="text-text-secondary text-xs">{customer.serviceYears} years</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); handlePreview(customer); }}
                  className="btn btn-secondary flex-1 text-xs py-2"
                >
                  <Eye size={14} className="mr-1" /> Preview
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleGeneratePDF(customer); }}
                  className="btn btn-primary flex-1 text-xs py-2"
                >
                  <Download size={14} className="mr-1" /> PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {previewMode && selectedCustomer && (
        <ReportPreview 
          customer={selectedCustomer} 
          adminRules={adminRules}
          onClose={() => setPreviewMode(false)}
          onDownload={() => handleGeneratePDF(selectedCustomer)}
        />
      )}
    </div>
  );
};

const ReportPreview = ({ customer, adminRules, onClose, onDownload }) => {
  const healthScore = calculateHealthScore(customer);
  const employerRating = getEmployerRating(customer.contributions);
  const tdsInfo = checkTDSApplicability(customer, adminRules);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="bg-primary p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-success flex items-center justify-center">
                <span className="text-white font-bold text-xl">CD</span>
              </div>
              <div>
                <h2 className="font-heading font-bold text-xl text-white">Chamunda Digital</h2>
                <p className="text-text-secondary text-sm">Smart PF Audit & CRM System</p>
              </div>
            </div>
            <div className="text-right">
              <span className="badge badge-accent">{customer.id}</span>
              <p className="text-text-secondary text-xs mt-1">{new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
              <User size={18} className="text-accent" /> Customer Details
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-background p-3 rounded-xl">
                <p className="text-text-secondary text-xs">Name</p>
                <p className="text-white font-medium">{customer.name}</p>
              </div>
              <div className="bg-background p-3 rounded-xl">
                <p className="text-text-secondary text-xs">Mobile</p>
                <p className="text-white font-medium">{customer.mobile}</p>
              </div>
              <div className="bg-background p-3 rounded-xl">
                <p className="text-text-secondary text-xs">UAN</p>
                <p className="text-white font-mono text-sm">{customer.uan}</p>
              </div>
              <div className="bg-background p-3 rounded-xl">
                <p className="text-text-secondary text-xs">Balance</p>
                <p className="text-success font-semibold">{formatCurrency(customer.passbookBalance)}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
              <Calendar size={18} className="text-accent" /> Service History (2015-2026)
            </h3>
            <div className="bg-background p-4 rounded-xl">
              <div className="flex items-center gap-1">
                {['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026'].map((year) => {
                  const employed = customer.serviceYears > (2024 - parseInt(year));
                  return (
                    <div key={year} className="flex-1 flex flex-col items-center">
                      <div className={`w-full h-3 rounded ${employed ? 'bg-success' : 'bg-secondary'}`}></div>
                      <span className="text-[10px] text-text-secondary mt-1">{year}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
              <Building size={18} className="text-accent" /> Employer Rating
            </h3>
            <div className={`p-4 rounded-xl border ${employerRating.score >= 70 ? 'bg-success/10 border-success/30' : 'bg-warning/10 border-warning/30'}`}>
              <p className={`font-semibold ${employerRating.score >= 70 ? 'text-success' : 'text-warning'}`}>
                {employerRating.rating}
              </p>
              <p className="text-text-secondary text-sm">{employerRating.message}</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
              <Shield size={18} className="text-accent" /> TDS & Tax Alerts
            </h3>
            <div className={`p-4 rounded-xl border ${tdsInfo.applicable ? 'bg-error/10 border-error/30' : 'bg-success/10 border-success/30'}`}>
              <p className={`font-semibold ${tdsInfo.applicable ? 'text-error' : 'text-success'}`}>
                {tdsInfo.applicable ? '⚠️ ' + tdsInfo.message : '✓ ' + tdsInfo.message}
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
              <Activity size={18} className="text-accent" /> Account Health Score
            </h3>
            <div className="bg-background p-4 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="h-4 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all"
                      style={{ width: `${healthScore.score}%`, backgroundColor: healthScore.color }}
                    ></div>
                  </div>
                </div>
                <span className="text-2xl font-bold" style={{ color: healthScore.color }}>{healthScore.score}</span>
                <span className="text-text-secondary">/100</span>
                <span className="badge" style={{ backgroundColor: healthScore.color + '20', color: healthScore.color }}>
                  Grade {healthScore.grade}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-white/10 flex gap-4">
          <button onClick={onClose} className="btn btn-secondary flex-1">Close</button>
          <button onClick={onDownload} className="btn btn-primary flex-1">
            <Download size={18} className="mr-2" /> Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reports;

