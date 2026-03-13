import React from 'react';
import { CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';

const AuditRuleCard = ({ rule, result, isExpanded, onToggle }) => {
  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'success':
        return <CheckCircle size={20} className="text-success" />;
      case 'warning':
        return <AlertTriangle size={20} className="text-warning" />;
      case 'error':
        return <XCircle size={20} className="text-error" />;
      default:
        return <Info size={20} className="text-accent" />;
    }
  };

  const getSeverityBorder = (severity) => {
    switch (severity) {
      case 'success':
        return 'border-l-success';
      case 'warning':
        return 'border-l-warning';
      case 'error':
        return 'border-l-error';
      default:
        return 'border-l-accent';
    }
  };

  return (
    <div
      className={`card border-l-4 ${getSeverityBorder(result.severity)} cursor-pointer`}
      onClick={onToggle}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="mt-1">
            {getSeverityIcon(result.severity)}
          </div>
          <div>
            <h3 className="font-semibold text-white mb-1">{rule.title}</h3>
            <p className="text-sm text-text-secondary">
              {result.alert || result.message}
            </p>
            {result.details && isExpanded && (
              <p className="text-xs text-text-secondary mt-2 bg-background p-2 rounded-lg">
                {result.details}
              </p>
            )}
            {result.action && isExpanded && (
              <p className="text-xs text-success mt-2 font-medium">
                → {result.action}
              </p>
            )}
            {result.untransferredIds && isExpanded && (
              <div className="mt-2">
                <p className="text-xs text-warning">Untransferred IDs:</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {result.untransferredIds.map((id) => (
                    <span key={id} className="badge badge-warning text-xs">
                      {id}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {result.missingMonths && isExpanded && (
              <div className="mt-2">
                <p className="text-xs text-error">Missing Contribution Months:</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {result.missingMonths.map((month) => (
                    <span key={month} className="badge badge-error text-xs">
                      {month}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <span className={`badge badge-${result.severity === 'success' ? 'success' : result.severity === 'warning' ? 'warning' : 'error'}`}>
          {result.passed === false ? 'Failed' : result.passed === true ? 'Passed' : result.eligible === true ? 'Eligible' : 'Check'}
        </span>
      </div>
    </div>
  );
};

export default AuditRuleCard;

