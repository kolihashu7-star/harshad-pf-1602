// Smart Audit Logic Functions

// 1. 60-Day Unemployment Rule
// Calculate 60 days gap from 'Last Contribution Month' (not just Exit Date)
export const check60DayUnemployment = (customer, rules) => {
  const { lastContributionMonth, doe, form19Status, form10CStatus } = customer;
  const gapDays = parseInt(rules.serviceGapDays) || 60;

  if (!lastContributionMonth) {
    return {
      passed: false,
      alert: 'No contribution data available',
      severity: 'error'
    };
  }

  // If already settled, no unemployment issue
  if (form19Status === 'Settled' && form10CStatus === 'Settled') {
    return {
      passed: true,
      message: 'Form 19 & 10C already settled - No unemployment concern',
      severity: 'success'
    };
  }

  // Calculate days since last contribution
  const lastDate = new Date(lastContributionMonth + '-01');
  const today = new Date();
  const daysDiff = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));

  // Add month buffer (assume last contribution was at end of that month)
  const totalGapDays = daysDiff + 30;

  if (totalGapDays > gapDays) {
    return {
      passed: false,
      alert: `${totalGapDays} days gap detected since last contribution (${lastContributionMonth})`,
      severity: 'warning',
      details: `Expected settlement: Form 19 & Form 10C within ${gapDays} days of unemployment`
    };
  }

  return {
    passed: true,
    message: `Last contribution: ${lastContributionMonth} (${totalGapDays} days ago)`,
    severity: 'success'
  };
};

// 2. Service Reset Logic
// If Form 19 AND Form 10C = "Settled" for a Member ID, previous service count = 0
export const checkServiceReset = (customer) => {
  const { form19Status, form10CStatus, serviceYears, memberIds } = customer;

  if (form19Status === 'Settled' && form10CStatus === 'Settled') {
    return {
      passed: true,
      reset: true,
      message: 'Service has been reset - Previous service years no longer counted',
      newServiceStart: 'New service period begins from next employment',
      currentServiceYears: 0,
      severity: 'info'
    };
  }

  return {
    passed: true,
    reset: false,
    message: 'Current service years continue',
    currentServiceYears: serviceYears,
    severity: 'success'
  };
};

// 3. Pension Eligibility (9.5 Years)
// Sum service from ALL transferred Member IDs
export const checkPensionEligibility = (customer, rules) => {
  const { memberIds, transfers, pensionEligible } = customer;
  const requiredYears = parseFloat(rules.pensionYears) || 9.5;

  // Check if all member IDs are transferred
  const untransferredIds = memberIds.filter(id => !transfers.includes(id));

  if (untransferredIds.length > 0) {
    return {
      eligible: false,
      message: `${untransferredIds.length} Member ID(s) not transferred`,
      severity: 'warning',
      details: `Service won't be counted for pension until all IDs are transferred`,
      untransferredIds
    };
  }

  // For demo, we use the serviceYears field
  if (pensionEligible || customer.serviceYears >= requiredYears) {
    return {
      eligible: true,
      message: `Eligible for Monthly Pension (${customer.serviceYears} years service)`,
      severity: 'success',
      action: 'Apply for Form 10D'
    };
  }

  return {
    eligible: false,
    message: `${customer.serviceYears} years service - Need ${requiredYears - customer.serviceYears} more years`,
    severity: 'info',
    progress: (customer.serviceYears / requiredYears) * 100
  };
};

// 4. Transfer Warning
// If multiple IDs exist but are NOT transferred, show "High Alert"
export const checkTransferWarning = (customer) => {
  const { memberIds, transfers } = customer;

  if (memberIds.length <= 1) {
    return {
      passed: true,
      message: 'Single Member ID - No transfer needed',
      severity: 'success'
    };
  }

  const untransferredIds = memberIds.filter(id => !transfers.includes(id));

  if (untransferredIds.length > 0) {
    return {
      passed: false,
      alert: 'HIGH ALERT: Service won\'t count for pension until transferred',
      severity: 'error',
      untransferredIds,
      details: `Transfer pending for: ${untransferredIds.join(', ')}`
    };
  }

  return {
    passed: true,
    message: 'All Member IDs transferred - Service counted for pension',
    severity: 'success'
  };
};

// 5. 58 Age Rule
// If Age = 58 AND EPS still being deducted, highlight as Error
export const check58AgeRule = (customer) => {
  const { age, epsDeducted } = customer;

  if (age >= 58 && epsDeducted) {
    return {
      passed: false,
      alert: 'ERROR: Age 58+ but EPS still being deducted',
      severity: 'error',
      details: 'EPS should be stopped at age 58. Employer needs to update.',
      action: 'Contact employer to stop EPS contribution'
    };
  }

  if (age >= 58 && !epsDeducted) {
    return {
      passed: true,
      message: 'Age 58+ - EPS correctly stopped',
      severity: 'success'
    };
  }

  return {
    passed: true,
    message: `Age ${age} - Under 58, no action needed`,
    severity: 'success'
  };
};

// 6. Missing Contribution Audit
// Detect any missing months in a year where no Exit Date is present
export const checkMissingContributions = (customer) => {
  const { contributions, doe } = customer;

  // If there's an exit date, skip this check
  if (doe) {
    return {
      passed: true,
      message: 'Customer has Exit Date - No missing contribution check needed',
      severity: 'success'
    };
  }

  if (!contributions || contributions.length === 0) {
    return {
      passed: false,
      alert: 'No contribution data available',
      severity: 'error'
    };
  }

  // Sort contributions by month
  const sorted = [...contributions].sort((a, b) => a.month.localeCompare(b.month));
  
  // Get current year and check last 12 months
  const currentYear = new Date().getFullYear();
  const yearContributions = sorted.filter(c => c.month.startsWith(currentYear.toString()));
  
  if (yearContributions.length === 0) {
    return {
      passed: false,
      alert: `No contributions found for year ${currentYear}`,
      severity: 'warning',
      details: 'Investigate gap in employment or contribution'
    };
  }

  // Expected months (up to current month)
  const currentMonth = new Date().getMonth() + 1;
  const expectedMonths = currentMonth;
  
  const missingCount = expectedMonths - yearContributions.length;
  
  if (missingCount > 0) {
    // Find missing months
    const contributedMonths = yearContributions.map(c => parseInt(c.month.split('-')[1]));
    const missingMonths = [];
    for (let i = 1; i <= currentMonth; i++) {
      if (!contributedMonths.includes(i)) {
        missingMonths.push(i);
      }
    }

    return {
      passed: false,
      alert: `${missingCount} missing contribution month(s) in ${currentYear}`,
      severity: 'warning',
      missingMonths: missingMonths.map(m => `${currentYear}-${String(m).padStart(2, '0')}`),
      details: 'Missing: ' + missingMonths.map(m => `${currentYear}-${String(m).padStart(2, '0')}`).join(', ')
    };
  }

  return {
    passed: true,
    message: `All ${yearContributions.length} months have contributions for ${currentYear}`,
    severity: 'success'
  };
};

// Run all audit checks
export const runFullAudit = (customer, rules) => {
  return {
    customerId: customer.id,
    customerName: customer.name,
    checks: {
      unemployment60Day: check60DayUnemployment(customer, rules),
      serviceReset: checkServiceReset(customer),
      pensionEligibility: checkPensionEligibility(customer, rules),
      transferWarning: checkTransferWarning(customer),
      age58Rule: check58AgeRule(customer),
      missingContributions: checkMissingContributions(customer)
    },
    timestamp: new Date().toISOString()
  };
};

