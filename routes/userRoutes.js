const express = require('express');

const {
  getAllUsers,
  getUser,
  createUser,
  deleteUser,
  updateUser,
} = require(`${__dirname}/../controllers/userControllers`);

// ROUTES USERS
const router = express.Router();
router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

// app.use('/api/v1/users', userRouter);

module.exports = router;
