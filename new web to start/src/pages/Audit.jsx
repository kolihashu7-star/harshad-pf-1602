import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import AuditRuleCard from '../components/AuditRuleCard';
import { runFullAudit } from '../utils/auditLogic';
import { formatCurrency } from '../utils/helpers';
import { Play, RefreshCw, Filter, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

const Audit = () => {
  const { customers, adminRules, auditResults, addAuditResult } = useApp();
  const [selectedCustomerId, setSelectedCustomerId] = useState('all');
  const [auditData, setAuditData] = useState(null);
  const [expandedRule, setExpandedRule] = useState(null);
  const [running, setRunning] = useState(false);

  // Run audit for selected customer
  const handleRunAudit = async (customerId = null) => {
    setRunning(true);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (customerId && customerId !== 'all') {
      const customer = customers.find(c => c.id === customerId);
      if (customer) {
        const result = runFullAudit(customer, adminRules);
        setAuditData(result);
        addAuditResult(result);
      }
    } else {
      // Run for all customers
      const allResults = customers.map(customer => runFullAudit(customer, adminRules));
      setAuditData({ allCustomers: allResults });
      allResults.forEach(result => addAuditResult(result));
    }

    setRunning(false);
  };

  // Get selected customer
  const selectedCustomer = useMemo(() => {
    if (selectedCustomerId === 'all') return null;
    return customers.find(c => c.id === selectedCustomerId);
  }, [selectedCustomerId, customers]);

  // Audit rules definition
  const auditRules = [
    { id: 'unemployment60Day', title: '60-Day Unemployment Rule' },
    { id: 'serviceReset', title: 'Service Reset Logic' },
    { id: 'pensionEligibility', title: 'Pension Eligibility (9.5 Years)' },
    { id: 'transferWarning', title: 'Transfer Warning' },
    { id: 'age58Rule', title: '58 Age Rule' },
    { id: 'missingContributions', title: 'Missing Contribution Audit' },
  ];

  // Summary stats
  const summaryStats = useMemo(() => {
    if (!auditData?.allCustomers) return null;
    
    let passed = 0, warnings = 0, errors = 0;
    
    auditData.allCustomers.forEach(result => {
      Object.values(result.checks).forEach(check => {
        if (check.severity === 'success') passed++;
        else if (check.severity === 'warning') warnings++;
        else if (check.severity === 'error') errors++;
      });
    });

    return { passed, warnings, errors, total: passed + warnings + errors };
  }, [auditData]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-semibold text-xl text-white">Smart Audit</h2>
          <p className="text-text-secondary text-sm mt-1">
            Run intelligent audits based on EPFO rules and regulations
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* Customer Select */}
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-text-secondary" />
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="input py-2"
            >
              <option value="all">All Customers</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.id})</option>
              ))}
            </select>
          </div>
          
          {/* Run Audit Button */}
          <button
            onClick={() => handleRunAudit(selectedCustomerId)}
            disabled={running}
            className="btn btn-primary flex items-center gap-2"
          >
            {running ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play size={18} />
                Run Audit
              </>
            )}
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      {auditData && summaryStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card bg-gradient-to-br from-success/10 to-transparent border-success/30">
            <div className="flex items-center gap-3">
              <CheckCircle size={24} className="text-success" />
              <div>
                <p className="text-text-secondary text-sm">Passed</p>
                <p className="text-2xl font-bold text-success">{summaryStats.passed}</p>
              </div>
            </div>
          </div>
          <div className="card bg-gradient-to-br from-warning/10 to-transparent border-warning/30">
            <div className="flex items-center gap-3">
              <AlertTriangle size={24} className="text-warning" />
              <div>
                <p className="text-text-secondary text-sm">Warnings</p>
                <p className="text-2xl font-bold text-warning">{summaryStats.warnings}</p>
              </div>
            </div>
          </div>
          <div className="card bg-gradient-to-br from-error/10 to-transparent border-error/30">
            <div className="flex items-center gap-3">
              <XCircle size={24} className="text-error" />
              <div>
                <p className="text-text-secondary text-sm">Errors</p>
                <p className="text-2xl font-bold text-error">{summaryStats.errors}</p>
              </div>
            </div>
          </div>
          <div className="card bg-gradient-to-br from-accent/10 to-transparent border-accent/30">
            <div className="flex items-center gap-3">
              <RefreshCw size={24} className="text-accent" />
              <div>
                <p className="text-text-secondary text-sm">Total Checks</p>
                <p className="text-2xl font-bold text-accent">{summaryStats.total}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Single Customer Audit Results */}
      {auditData && !auditData.allCustomers && (
        <div className="space-y-4">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-white">{auditData.customerName}</h3>
                <p className="text-text-secondary text-sm">{auditData.customerId}</p>
              </div>
              {selectedCustomer && (
                <div className="text-right">
                  <p className="text-text-secondary text-sm">Balance</p>
                  <p className="text-success font-semibold">{formatCurrency(selectedCustomer.passbookBalance)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Audit Rules */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {auditRules.map(rule => (
              <AuditRuleCard
                key={rule.id}
                rule={rule}
                result={auditData.checks[rule.id]}
                isExpanded={expandedRule === rule.id}
                onToggle={() => setExpandedRule(expandedRule === rule.id ? null : rule.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* All Customers Summary */}
      {auditData && auditData.allCustomers && (
        <div className="space-y-4">
          <div className="card">
            <h3 className="font-semibold text-white mb-4">All Customers Audit Summary</h3>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>60-Day Gap</th>
                    <th>Pension</th>
                    <th>Transfers</th>
                    <th>Age 58</th>
                    <th>Missing</th>
                  </tr>
                </thead>
                <tbody>
                  {auditData.allCustomers.map(result => (
                    <tr key={result.customerId}>
                      <td>
                        <p className="font-medium text-white">{result.customerName}</p>
                        <p className="text-xs text-text-secondary">{result.customerId}</p>
                      </td>
                      <td>
                        <span className={`badge badge-${result.checks.unemployment60Day.severity === 'success' ? 'success' : 'warning'}`}>
                          {result.checks.unemployment60Day.passed ? 'OK' : 'Alert'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-${result.checks.pensionEligibility.eligible ? 'success' : 'info'}`}>
                          {result.checks.pensionEligibility.eligible ? 'Eligible' : 'No'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-${result.checks.transferWarning.passed ? 'success' : 'error'}`}>
                          {result.checks.transferWarning.passed ? 'OK' : 'Alert'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-${result.checks.age58Rule.passed ? 'success' : 'error'}`}>
                          {result.checks.age58Rule.passed ? 'OK' : 'Error'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-${result.checks.missingContributions.passed ? 'success' : 'warning'}`}>
                          {result.checks.missingContributions.passed ? 'OK' : 'Missing'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* No Audit Run Yet */}
      {!auditData && (
        <div className="card text-center py-12">
          <div className="w-20 h-20 rounded-full bg-secondary mx-auto flex items-center justify-center mb-4">
            <Play size={32} className="text-accent" />
          </div>
          <h3 className="font-semibold text-white text-lg mb-2">Run Smart Audit</h3>
          <p className="text-text-secondary max-w-md mx-auto">
            Select a customer or run audit for all customers to check for:
          </p>
          <ul className="text-text-secondary text-sm mt-4 space-y-2">
            <li>✓ 60-Day Unemployment Rule</li>
            <li>✓ Service Reset Logic</li>
            <li>✓ Pension Eligibility (9.5 Years)</li>
            <li>✓ Transfer Warnings</li>
            <li>✓ 58 Age Rule</li>
            <li>✓ Missing Contributions</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default Audit;

