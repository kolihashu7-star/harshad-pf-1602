import jsPDF from 'jspdf';
import { formatCurrency, formatDate, calculateHealthScore, checkTDSApplicability, getEmployerRating } from './helpers';

// Generate PDF Report
export const generatePDFReport = async (customer, rules) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPos = margin;

  // Colors
  const primaryColor = [26, 26, 46];
  const accentColor = [233, 69, 96];
  const successColor = [0, 217, 165];
  const warningColor = [255, 201, 60];
  const textSecondary = [160, 160, 176];

  // Header Background
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 45, 'F');

  // Logo placeholder
  doc.setFillColor(...accentColor);
  doc.circle(margin + 8, 22, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('CD', margin + 8, 24, { align: 'center' });

  // Company Name
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Chamunda Digital', margin + 20, 20);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Smart PF Audit & CRM System', margin + 20, 28);

  // Customer ID badge
  doc.setFillColor(...accentColor);
  doc.roundedRect(pageWidth - 60, 15, 45, 15, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.text(customer.id, pageWidth - 37.5, 24, { align: 'center' });

  yPos = 55;

  // Customer Details Section
  doc.setTextColor(...primaryColor);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Customer Details', margin, yPos);
  yPos += 8;

  // Draw line
  doc.setDrawColor(...accentColor);
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;

  // Customer info grid
  const info = [
    ['Name', customer.name],
    ['Mobile', customer.mobile],
    ['UAN', customer.uan],
    ['Member ID', customer.memberId],
    ['Father Name', customer.fatherName],
    ['Date of Birth', formatDate(customer.dob)],
    ['Date of Joining', formatDate(customer.doj)],
    ['Date of Exit', customer.doe ? formatDate(customer.doe) : 'Working'],
    ['Company', customer.companyName],
    ['Passbook Balance', formatCurrency(customer.passbookBalance)]
  ];

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  info.forEach((item, index) => {
    const x = margin + (index % 2) * 90;
    const y = yPos + Math.floor(index / 2) * 7;
    
    doc.setTextColor(...textSecondary);
    doc.text(item[0] + ':', x, y);
    doc.setTextColor(...primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text(item[1].toString(), x + 35, y);
    doc.setFont('helvetica', 'normal');
  });

  yPos += 60;

  // Service History Timeline
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('Service History (2015-2026)', margin, yPos);
  yPos += 8;

  // Timeline visualization
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 5;

  // Timeline bars (simplified)
  const years = ['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026'];
  const barWidth = (pageWidth - 2 * margin - 30) / 12;
  
  doc.setFontSize(7);
  years.forEach((year, i) => {
    const x = margin + i * barWidth;
    const employed = customer.serviceYears > (2024 - parseInt(year));
    
    // Year label
    doc.setTextColor(...textSecondary);
    doc.text(year, x + barWidth/2, yPos, { align: 'center' });
    
    // Status bar
    const barColor = employed ? successColor : [200, 200, 200];
    doc.setFillColor(barColor[0], barColor[1], barColor[2]);
    doc.rect(x + 2, yPos + 2, barWidth - 4, 6, 'F');
  });

  yPos += 20;

  // Employer Rating
  const employerRating = getEmployerRating(customer.contributions);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('Employer Rating', margin, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...(employerRating.score >= 70 ? successColor : warningColor));
  doc.text(employerRating.rating, margin, yPos);
  yPos += 5;
  doc.setTextColor(...textSecondary);
  doc.setFontSize(8);
  doc.text(employerRating.message, margin, yPos);
  yPos += 15;

  // TDS & 15G/15H Alerts
  const tdsInfo = checkTDSApplicability(customer, rules);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('TDS & Tax Alerts', margin, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  if (tdsInfo.applicable) {
    doc.setTextColor(233, 69, 96);
    doc.text('⚠️ ' + tdsInfo.message, margin, yPos);
  } else {
    doc.setTextColor(...successColor);
    doc.text('✓ ' + tdsInfo.message, margin, yPos);
  }
  yPos += 15;

  // Health Score Section
  const healthScore = calculateHealthScore(customer);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('Account Health Score', margin, yPos);
  yPos += 10;

  // Health score bar
  doc.setFillColor(240, 240, 240);
  doc.roundedRect(margin, yPos, 100, 15, 2, 2, 'F');
  
  doc.setFillColor(
    parseInt(healthScore.color.slice(1, 3), 16),
    parseInt(healthScore.color.slice(3, 5), 16),
    parseInt(healthScore.color.slice(5, 7), 16)
  );
  doc.roundedRect(margin, yPos, healthScore.score, 15, 2, 2, 'F');
  
  doc.setTextColor(...primaryColor);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`${healthScore.score}/100`, margin + 110, yPos + 11);
  
  doc.setFontSize(10);
  doc.text(`Grade: ${healthScore.grade}`, margin + 140, yPos + 11);
  yPos += 25;

  // Audit Summary
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('Audit Summary', margin, yPos);
  yPos += 8;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  
  const pensionStatus = customer.serviceYears >= 9.5 ? '✓ Eligible' : 'Not Eligible (Need 9.5 years)';
  const bankStatus = customer.bankVerified ? '✓ Verified' : '⚠️ Not Verified';
  const panStatus = customer.panLinked ? '✓ Linked' : '⚠️ Not Linked';
  const transferredStatus = customer.transfers.join(', ') || 'None';
  
  const auditItems = [
    ['Pension Eligibility', pensionStatus],
    ['Form 19 Status', customer.form19Status],
    ['Form 10C Status', customer.form10CStatus],
    ['Bank KYC', bankStatus],
    ['PAN Linked', panStatus],
    ['Member IDs', customer.memberIds.join(', ')],
    ['Transferred IDs', transferredStatus]
  ];

  auditItems.forEach((item) => {
    doc.setTextColor(...textSecondary);
    doc.text(item[0] + ':', margin, yPos);
    doc.setTextColor(...primaryColor);
    doc.text(item[1].toString(), margin + 50, yPos);
    yPos += 6;
  });

  // Footer
  const footerY = pageHeight - 20;
  doc.setFillColor(...primaryColor);
  doc.rect(0, footerY - 5, pageWidth, 25, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text('Chamunda Digital - Smart PF Audit & CRM System', pageWidth / 2, footerY + 2, { align: 'center' });
  doc.text('Generated on: ' + new Date().toLocaleDateString('en-IN'), pageWidth / 2, footerY + 8, { align: 'center' });
  doc.text('Contact: support@chamundadigital.com | www.chamundadigital.com', pageWidth / 2, footerY + 14, { align: 'center' });

  // Save the PDF
  const fileName = `PF_Audit_${customer.id}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
  
  return {
    fileName,
    blob: doc.output('blob')
  };
};

