// Reset admin endpoint - add this to your API
import express from 'express';
import { resetAdmin } from './reset-admin.js';

const router = express.Router();

// Reset admin endpoint - BE CAREFUL WITH THIS IN PRODUCTION!
router.post('/reset-admin', async (req, res) => {
  try {
    console.log('🔐 Admin reset requested via API...');

    const result = await resetAdmin();

    if (result.success) {
      res.json({
        success: true,
        message: `Admin ${result.action} successfully`,
        admin: result.admin,
        password: 'Black123', // Only for this reset
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
      });
    }
  } catch (error) {
    console.error('❌ Error in reset admin endpoint:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
