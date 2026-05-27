import express from 'express'
import {
  createEquipment,
  searchEquipment,
  getEquipmentById,
  getOwnerEquipment,
  updateEquipment,
  deactivateEquipment,
  getEquipmentQueue,
  reviewEquipment
} from '../controllers/equipment.controller.js'
import { protect, restrictTo } from '../middlewares/auth.js'
import { upload } from '../config/multer.js'

const router = express.Router()

// Public
router.get('/', searchEquipment)
router.get('/:id', getEquipmentById)

// Owner
router.post(
  '/',
  protect,
  restrictTo('owner'),
  upload.fields([
    { name: 'photos', maxCount: 10 },
    { name: 'rc', maxCount: 1 },
    { name: 'insurance', maxCount: 1 }
  ]),
  createEquipment
)
router.get('/owner/mine', protect, restrictTo('owner'), getOwnerEquipment)
router.put('/:id', protect, restrictTo('owner'), updateEquipment)
router.delete('/:id', protect, restrictTo('owner'), deactivateEquipment)

// Admin
router.get('/admin/queue', protect, restrictTo('admin'), getEquipmentQueue)
router.put('/admin/:id', protect, restrictTo('admin'), reviewEquipment)

export default router