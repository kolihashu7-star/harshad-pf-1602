import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import StatsCard from '../components/StatsCard';
import CustomerTable from '../components/CustomerTable';
import { generatePDFReport } from '../utils/pdfGenerator';
import {
  Users,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Plus,
  ArrowRight,
  FileText
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { customers, adminRules, addWhatsappMessage } = useApp();

  // Calculate stats
  const stats = useMemo(() => {
    const totalCustomers = customers.length;
    const pendingAudits = customers.filter(c => 
      c.form19Status === 'Pending' || c.form10CStatus === 'Pending'
    ).length;
    const alerts = customers.filter(c => {
      // Age 58 rule
      if (c.age >= 58 && c.epsDeducted) return true;
      // Transfer warning
      const untransferred = c.memberIds.filter(id => !c.transfers.includes(id));
      if (untransferred.length > 0) return true;
      // Missing contributions
      if (!c.doe && c.contributions.length < 6) return true;
      return false;
    }).length;
    const totalBalance = customers.reduce((sum, c) => sum + (c.passbookBalance || 0), 0);

    return {
      totalCustomers,
      pendingAudits,
      alerts,
      totalBalance
    };
  }, [customers]);

  // Get recent customers
  const recentCustomers = useMemo(() => {
    return [...customers].slice(0, 5);
  }, [customers]);

  // Handle generate report
  const handleGenerateReport = async (customer) => {
    await generatePDFReport(customer, adminRules);
  };

  // Handle WhatsApp
  const handleWhatsApp = (customer) => {
    const message = adminRules.messageTemplates.english.welcome
      .replace('{balance}', customer.passbookBalance);
    addWhatsappMessage({
      customerId: customer.id,
      customerName: customer.name,
      mobile: customer.mobile,
      message,
      type: 'welcome'
    });
    alert(`WhatsApp message prepared for ${customer.name}`);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Customers"
          value={stats.totalCustomers}
          icon={Users}
          trend="up"
          trendValue="+12% this month"
          color="accent"
        />
        <StatsCard
          title="Pending Audits"
          value={stats.pendingAudits}
          icon={AlertTriangle}
          trend="up"
          trendValue="Need attention"
          color="warning"
        />
        <StatsCard
          title="Active Alerts"
          value={stats.alerts}
          icon={CheckCircle}
          trend="down"
          trendValue="-5% from last week"
          color="error"
        />
        <StatsCard
          title="Total Balance"
          value={`₹${(stats.totalBalance / 100000).toFixed(1)}L`}
          icon={DollarSign}
          trend="up"
          trendValue="+18% this month"
          color="success"
        />
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4">
        <button
          onClick={() => navigate('/customers')}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          Add Customer
        </button>
        <button
          onClick={() => navigate('/audit')}
          className="btn btn-secondary flex items-center gap-2"
        >
          <FileText size={18} />
          Run Smart Audit
        </button>
        <button
          onClick={() => navigate('/reports')}
          className="btn btn-secondary flex items-center gap-2"
        >
          <ArrowRight size={18} />
          View All Reports
        </button>
      </div>

      {/* Recent Customers */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-semibold text-lg text-white">
            Recent Customers
          </h2>
          <button
            onClick={() => navigate('/customers')}
            className="text-accent text-sm hover:underline"
          >
            View All →
          </button>
        </div>
        <CustomerTable
          customers={recentCustomers}
          onView={(c) => navigate(`/customers?id=${c.id}`)}
          onEdit={(c) => navigate(`/customers?id=${c.id}`)}
          onDelete={() => {}}
          onGenerateReport={handleGenerateReport}
          onWhatsApp={handleWhatsApp}
        />
      </div>

      {/* Quick Tips */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-gradient-to-br from-accent/10 to-transparent border-accent/30">
          <h3 className="font-semibold text-white mb-2">💡 Quick Tip</h3>
          <p className="text-sm text-text-secondary">
            Use the "Sync" button to fetch latest data from EPFO portal via Chrome Extension.
          </p>
        </div>
        <div className="card bg-gradient-to-br from-success/10 to-transparent border-success/30">
          <h3 className="font-semibold text-white mb-2">📊 Health Score</h3>
          <p className="text-sm text-text-secondary">
            Customer health score is based on KYC, transfers, and contribution regularity.
          </p>
        </div>
        <div className="card bg-gradient-to-br from-warning/10 to-transparent border-warning/30">
          <h3 className="font-semibold text-white mb-2">⚡ Auto-Alerts</h3>
          <p className="text-sm text-text-secondary">
            WhatsApp messages are automatically sent based on customer events and rules.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

