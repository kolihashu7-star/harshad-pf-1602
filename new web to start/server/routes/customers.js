import express from 'express';
import Customer from '../models/Customer.js';

const router = express.Router();

// Get all customers
router.get('/', async (req, res) => {
  try {
    const { search, limit = 50, page = 1 } = req.query;
    
    let query = {};
    
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { company: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const customers = await Customer.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Customer.countDocuments(query);

    res.json({
      success: true,
      customers,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get Customers Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get customers'
    });
  }
});

// Get single customer
router.get('/:id', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }

    res.json({
      success: true,
      customer
    });

  } catch (error) {
    console.error('Get Customer Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get customer'
    });
  }
});

// Add new customer
router.post('/', async (req, res) => {
  try {
    const { name, phone, email, company, notes, tags } = req.body;

    // Check if customer with same phone exists
    const existingCustomer = await Customer.findOne({ phone });
    if (existingCustomer) {
      return res.status(400).json({
        success: false,
        error: 'Customer with this phone number already exists'
      });
    }

    const customer = new Customer({
      name,
      phone,
      email: email || '',
      company: company || '',
      notes: notes || '',
      tags: tags || []
    });

    await customer.save();

    res.status(201).json({
      success: true,
      customer
    });

  } catch (error) {
    console.error('Add Customer Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to add customer'
    });
  }
});

// Update customer
router.put('/:id', async (req, res) => {
  try {
    const { name, phone, email, company, notes, tags } = req.body;

    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      {
        name,
        phone,
        email: email || '',
        company: company || '',
        notes: notes || '',
        tags: tags || [],
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }

    res.json({
      success: true,
      customer
    });

  } catch (error) {
    console.error('Update Customer Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update customer'
    });
  }
});

// Delete customer
router.delete('/:id', async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }

    res.json({
      success: true,
      message: 'Customer deleted successfully'
    });

  } catch (error) {
    console.error('Delete Customer Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete customer'
    });
  }
});

// Import customers (bulk)
router.post('/import', async (req, res) => {
  try {
    const { customers } = req.body;

    if (!customers || !Array.isArray(customers)) {
      return res.status(400).json({
        success: false,
        error: 'Customers array is required'
      });
    }

    const results = {
      imported: 0,
      skipped: 0,
      errors: []
    };

    for (const customerData of customers) {
      try {
        // Check if customer exists
        const existing = await Customer.findOne({ phone: customerData.phone });
        
        if (existing) {
          results.skipped++;
          continue;
        }

        const customer = new Customer({
          name: customerData.name || `Customer ${customerData.phone.slice(-4)}`,
          phone: customerData.phone,
          email: customerData.email || '',
          company: customerData.company || '',
          notes: customerData.notes || '',
          tags: customerData.tags || []
        });

        await customer.save();
        results.imported++;

      } catch (error) {
        results.errors.push({
          phone: customerData.phone,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: `Imported ${results.imported} customers, skipped ${results.skipped}`,
      results
    });

  } catch (error) {
    console.error('Import Customers Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to import customers'
    });
  }
});

export default router;

