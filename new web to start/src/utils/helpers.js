// Helper Utility Functions

// Format currency in Indian Rupees
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

// Format date to Indian format
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date);
};

// Format date to ISO format
export const formatDateISO = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

// Calculate age from DOB
export const calculateAge = (dob) => {
  if (!dob) return 0;
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

// Calculate service years from DOJ
export const calculateServiceYears = (doj, doe) => {
  if (!doj) return 0;
  const startDate = new Date(doj);
  const endDate = doe ? new Date(doe) : new Date();
  const years = (endDate - startDate) / (1000 * 60 * 60 * 24 * 365.25);
  return Math.round(years * 10) / 10;
};

// Generate customer ID
export const generateCustomerId = (counter) => {
  return `CD-${String(counter).padStart(6, '0')}`;
};

// Validate UAN (12 digits)
export const validateUAN = (uan) => {
  return /^\d{12}$/.test(uan);
};

// Validate mobile number (10 digits)
export const validateMobile = (mobile) => {
  return /^\d{10}$/.test(mobile);
};

// Calculate health score (0-100)
export const calculateHealthScore = (customer) => {
  let score = 0;
  const factors = [];

  // KYC completion (30 points)
  if (customer.kycComplete) {
    score += 30;
    factors.push({ name: 'KYC Complete', points: 30 });
  } else {
    factors.push({ name: 'KYC Incomplete', points: 0 });
  }

  // Bank verification (20 points)
  if (customer.bankVerified) {
    score += 20;
    factors.push({ name: 'Bank Verified', points: 20 });
  } else {
    factors.push({ name: 'Bank Not Verified', points: 0 });
  }

  // PAN linked (20 points)
  if (customer.panLinked) {
    score += 20;
    factors.push({ name: 'PAN Linked', points: 20 });
  } else {
    factors.push({ name: 'PAN Not Linked', points: 0 });
  }

  // Transfers done (15 points)
  const transferRatio = customer.transfers.length / customer.memberIds.length;
  const transferPoints = Math.round(transferRatio * 15);
  score += transferPoints;
  factors.push({ name: 'Transfers Complete', points: transferPoints });

  // Regular contributions (15 points)
  if (customer.contributions && customer.contributions.length >= 6) {
    score += 15;
    factors.push({ name: 'Regular Contributions', points: 15 });
  } else {
    factors.push({ name: 'Irregular Contributions', points: 0 });
  }

  return {
    score: Math.min(score, 100),
    factors,
    grade: score >= 80 ? 'A' : score >= 60 ? 'B' : score >= 40 ? 'C' : 'D',
    color: score >= 80 ? '#00d9a5' : score >= 60 ? '#ffc93c' : score >= 40 ? '#e94560' : '#ff6b6b'
  };
};

// Check TDS applicability
export const checkTDSApplicability = (customer, rules) => {
  const tdsLimit = rules.tdsLimit || 50000;
  const serviceYears = customer.serviceYears || 0;
  const withdrawAmount = customer.passbookBalance || 0;

  // If service < 5 years AND amount >= TDS limit, form 15G/H mandatory
  if (serviceYears < 5 && withdrawAmount >= tdsLimit) {
    return {
      applicable: true,
      type: '15G/15H',
      message: 'Form 15G/H Mandatory (Service < 5 years AND Amount ≥ ₹50,000)',
      tdsRate: 0
    };
  }

  // If PAN not linked, high TDS
  if (!customer.panLinked) {
    return {
      applicable: true,
      type: 'High TDS',
      message: 'High TDS Alert (34.8%) - PAN Not Linked',
      tdsRate: 34.8
    };
  }

  // Normal TDS
  return {
    applicable: false,
    type: 'Normal',
    message: 'Normal TDS applicable',
    tdsRate: 10
  };
};

// Get employer rating based on payment timing
export const getEmployerRating = (contributions) => {
  if (!contributions || contributions.length < 3) {
    return {
      rating: 'N/A',
      message: 'Insufficient data for rating',
      score: 0
    };
  }

  // Simulate payment timing analysis
  // In real scenario, this would compare salary date with PF deposit date
  const goodPaymentRatio = Math.random() > 0.3 ? 0.8 : 0.4;
  
  if (goodPaymentRatio >= 0.7) {
    return {
      rating: '✅ Good Company',
      message: 'PF deposits made before 15th of each month',
      score: 85
    };
  } else if (goodPaymentRatio >= 0.4) {
    return {
      rating: '⚠️ Delayed Payments',
      message: 'PF deposits sometimes delayed beyond 15th',
      score: 50
    };
  }

  return {
    rating: '❌ Poor Payment History',
    message: 'Frequent delays in PF deposits',
    score: 25
  };
};

// Get status color
export const getStatusColor = (status) => {
  const statusMap = {
    'Settled': 'success',
    'Pending': 'warning',
    'Not Settled': 'error',
    'Verified': 'success',
    'Not Verified': 'error'
  };
  return statusMap[status] || 'info';
};

// Get severity color
export const getSeverityColor = (severity) => {
  const colorMap = {
    'success': '#00d9a5',
    'warning': '#ffc93c',
    'error': '#ff6b6b',
    'info': '#e94560'
  };
  return colorMap[severity] || '#a0a0b0';
};

// Debounce function for search
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Generate service timeline data
export const generateServiceTimeline = (customer) => {
  const timeline = [];
  const startYear = 2015;
  const currentYear = new Date().getFullYear();
  
  // Generate timeline from 2015 to current year
  for (let year = startYear; year <= currentYear; year++) {
    timeline.push({
      year,
      employed: Math.random() > 0.2,
      company: Math.random() > 0.2 ? `Company ${year % 5 + 1}` : 'No Employment',
      contribution: Math.random() > 0.2 ? Math.floor(Math.random() * 5000) + 1000 : 0
    });
  }
  
  return timeline;
};

// Check advance eligibility
export const checkAdvanceEligibility = (customer, rules) => {
  const advanceGapDays = parseInt(rules.advanceGapDays) || 60;
  const lastForm31 = customer.form31History?.[0];
  
  if (!lastForm31) {
    return {
      eligible: true,
      message: 'No previous advance - Eligible for first advance'
    };
  }

  const lastSettlement = new Date(lastForm31.settlementDate);
  const today = new Date();
  const daysDiff = Math.floor((today - lastSettlement) / (1000 * 60 * 60 * 24));

  if (daysDiff >= advanceGapDays) {
    return {
      eligible: true,
      message: `Eligible for next advance (${advanceGapDays} days passed)`,
      daysRemaining: 0
    };
  }

  return {
    eligible: false,
    message: `Wait ${advanceGapDays - daysDiff} more days for next advance`,
    daysRemaining: advanceGapDays - daysDiff
  };
};

