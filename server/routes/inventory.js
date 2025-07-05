const express = require('express');
const router = express.Router();
const { authMiddleware, checkPermission } = require('../src/express');
const { BranchInventory, InventoryTransaction } = require('../models');

// POST /api/inventory/adjustment - Điều chỉnh tồn kho
router.post('/adjustment', authMiddleware, checkPermission('inventory:update'), async (req, res) => {
  try {
    const { productId, branchId, newQuantity, reason } = req.body;
    const userId = req.user?.userId;
    // 1. Tìm hoặc tạo branch_inventory
    let inventory = await BranchInventory.findOne({ where: { branch_id: branchId, product_id: productId } });
    if (!inventory) {
      inventory = await BranchInventory.create({ branch_id: branchId, product_id: productId, quantity: newQuantity });
    } else {
      await inventory.update({ quantity: newQuantity, updated_at: new Date() });
    }
    // 2. Ghi log inventory_transactions
    await InventoryTransaction.create({
      product_id: productId,
      branch_id: branchId,
      user_id: userId,
      type: 'adjustment',
      quantity_change: newQuantity, // Ghi nhận số lượng mới (hoặc chênh lệch nếu muốn)
      notes: reason,
      created_at: new Date()
    });
    res.json({ success: true, message: 'Inventory adjusted', inventory });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error adjusting inventory', error: error.message });
  }
});

// POST /api/inventory/transfer - Chuyển kho nội bộ
router.post('/transfer', authMiddleware, checkPermission('inventory:transfer'), async (req, res) => {
  try {
    const { fromBranchId, toBranchId, productId, quantity } = req.body;
    const userId = req.user?.userId;
    // 1. Trừ kho fromBranch
    let fromInv = await BranchInventory.findOne({ where: { branch_id: fromBranchId, product_id: productId } });
    if (!fromInv || fromInv.quantity < quantity) {
      return res.status(400).json({ success: false, message: 'Not enough stock in fromBranch' });
    }
    await fromInv.update({ quantity: fromInv.quantity - quantity, updated_at: new Date() });
    // 2. Cộng kho toBranch
    let toInv = await BranchInventory.findOne({ where: { branch_id: toBranchId, product_id: productId } });
    if (!toInv) {
      toInv = await BranchInventory.create({ branch_id: toBranchId, product_id: productId, quantity });
    } else {
      await toInv.update({ quantity: toInv.quantity + quantity, updated_at: new Date() });
    }
    // 3. Ghi 2 log inventory_transactions
    await InventoryTransaction.create({
      product_id: productId,
      branch_id: fromBranchId,
      user_id: userId,
      type: 'transfer_out',
      quantity_change: -quantity,
      notes: `Transfer to branch ${toBranchId}`,
      created_at: new Date()
    });
    await InventoryTransaction.create({
      product_id: productId,
      branch_id: toBranchId,
      user_id: userId,
      type: 'transfer_in',
      quantity_change: quantity,
      notes: `Transfer from branch ${fromBranchId}`,
      created_at: new Date()
    });
    res.json({ success: true, message: 'Inventory transferred', from: fromInv, to: toInv });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error transferring inventory', error: error.message });
  }
});

module.exports = router; 